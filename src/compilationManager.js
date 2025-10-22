/**
 * Module pour la gestion de la compilation GCC
 * 
 * Ce module encapsule toute la logique de compilation, incluant :
 * - Détection des systèmes de build (Makefile, CMake, ou compilation directe)
 * - Construction des commandes de compilation appropriées
 * - Gestion des erreurs et validation des fichiers
 * - Exécution sécurisée des commandes
 */

const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

// Convertir exec en promesse pour une meilleure gestion asynchrone
const execAsync = promisify(exec);

/**
 * Types de systèmes de build supportés
 */
const BUILD_SYSTEMS = {
    MAKEFILE: 'makefile',
    CMAKE: 'cmake',
    DIRECT: 'direct'
};

/**
 * Configuration par défaut pour la compilation
 */
const COMPILATION_CONFIG = {
    DEFAULT_MAIN_FILE: 'main.c',
    DEFAULT_OUTPUT_FILE: 'main.exe',
    ERROR_OUTPUT_FILE: 'compte_rendu.txt',
    GCC_FLAGS: ['-Wall', '-Wextra'] // Flags GCC recommandés
};

/**
 * Messages d'erreur personnalisés
 */
const ERROR_MESSAGES = {
    NO_WORKSPACE: 'Aucun workspace ouvert. Veuillez ouvrir un dossier.',
    MAIN_FILE_NOT_FOUND: 'Fichier main.c non trouvé dans le workspace',
    COMPILATION_FAILED: 'Erreur lors de la compilation',
    INVALID_WORKSPACE: 'Workspace invalide ou inaccessible',
    COMMAND_EXECUTION_FAILED: 'Échec de l\'exécution de la commande de compilation'
};

/**
 * Gestionnaire de compilation pour l'extension jaiccv1
 */
class CompilationManager {
    constructor() {
        this.workspacePath = null;
        this.buildSystem = null;
    }

    /**
     * Valide que le workspace est accessible et configuré correctement
     * @returns {boolean} True si le workspace est valide
     */
    validateWorkspace() {
        if (!vscode.workspace.rootPath) {
            vscode.window.showErrorMessage(ERROR_MESSAGES.NO_WORKSPACE);
            return false;
        }

        this.workspacePath = vscode.workspace.rootPath;
        
        // Vérifier que le workspace est accessible
        if (!fs.existsSync(this.workspacePath)) {
            vscode.window.showErrorMessage(ERROR_MESSAGES.INVALID_WORKSPACE);
            return false;
        }

        return true;
    }

    /**
     * Détecte le système de build utilisé dans le workspace
     * @returns {string} Type de système de build détecté
     */
    detectBuildSystem() {
        const makefilePath = path.join(this.workspacePath, 'Makefile');
        const cmakePath = path.join(this.workspacePath, 'CMakeLists.txt');

        if (fs.existsSync(makefilePath)) {
            this.buildSystem = BUILD_SYSTEMS.MAKEFILE;
        } else if (fs.existsSync(cmakePath)) {
            this.buildSystem = BUILD_SYSTEMS.CMAKE;
        } else {
            this.buildSystem = BUILD_SYSTEMS.DIRECT;
        }

        return this.buildSystem;
    }

    /**
     * Valide que le fichier main.c existe pour la compilation directe
     * @returns {boolean} True si le fichier main.c est valide
     */
    validateMainFile() {
        if (this.buildSystem !== BUILD_SYSTEMS.DIRECT) {
            return true; // Pas nécessaire pour makefile/cmake
        }

        const mainFilePath = path.join(this.workspacePath, COMPILATION_CONFIG.DEFAULT_MAIN_FILE);
        
        if (!fs.existsSync(mainFilePath)) {
            vscode.window.showErrorMessage(
                `${ERROR_MESSAGES.MAIN_FILE_NOT_FOUND} ${this.workspacePath}`
            );
            return false;
        }

        return true;
    }

    /**
     * Construit la commande de compilation appropriée selon le système de build
     * @returns {string} Commande de compilation à exécuter
     */
    buildCompilationCommand() {
        const errorOutputPath = path.join(this.workspacePath, COMPILATION_CONFIG.ERROR_OUTPUT_FILE);

        switch (this.buildSystem) {
            case BUILD_SYSTEMS.MAKEFILE:
                // Pour Make, on exécute la commande make avec la redirection de stderr vers le fichier compte_rendu.txt ssi je suis sous Linux
                if (process.platform === 'linux') {
                    return `make 2>${errorOutputPath}`;
                }
            
            case BUILD_SYSTEMS.CMAKE:
                // Pour CMake, on pourrait d'abord configurer puis compiler
                if (process.platform === "windows") {
                    return `cmake -G "MinGW Makefiles" . 2>${errorOutputPath}`;
                } else {
                    return `cmake . 2>${errorOutputPath}`;
                }
            
            case BUILD_SYSTEMS.DIRECT:
            default:
                const mainFilePath = path.join(this.workspacePath, COMPILATION_CONFIG.DEFAULT_MAIN_FILE);
                const outputFilePath = path.join(this.workspacePath, COMPILATION_CONFIG.DEFAULT_OUTPUT_FILE);
                const gccFlags = COMPILATION_CONFIG.GCC_FLAGS.join(' ');
                
                return `gcc ${gccFlags} "${mainFilePath}" -o "${outputFilePath}" 2>${errorOutputPath}`;
        }
    }

    /**
     * Exécute la compilation avec gestion d'erreurs robuste
     * @returns {Promise<boolean>} True si la compilation s'est bien déroulée
     */
    async executeCompilation() {
        try {
            const command = this.buildCompilationCommand();
            console.log(`Exécution de la commande: ${command}`);
            
            await execAsync(command);
            
            // Vérifier si des erreurs ont été capturées
            const errorOutputPath = path.join(this.workspacePath, COMPILATION_CONFIG.ERROR_OUTPUT_FILE);
            if (fs.existsSync(errorOutputPath)) {
                const errorContent = fs.readFileSync(errorOutputPath, 'utf8');
                if (errorContent.trim().length > 0) {
                    console.log('Erreurs de compilation détectées et capturées');
                }
            }
            
            return true;
            
        } catch (error) {
            console.error('Erreur lors de l\'exécution de la compilation:', error);
            
            // Afficher un message d'erreur plus informatif
            const errorMessage = error.stderr 
                ? `Erreur de compilation: ${error.stderr.substring(0, 200)}...`
                : ERROR_MESSAGES.COMMAND_EXECUTION_FAILED;
            
            vscode.window.showErrorMessage(errorMessage);
            return false;
        }
    }

    /**
     * Méthode principale pour lancer la compilation complète
     * @returns {Promise<boolean>} True si la compilation s'est bien déroulée
     */
    async compile() {
        try {
            // 1. Valider le workspace
            if (!this.validateWorkspace()) {
                return false;
            }

            // 2. Détecter le système de build
            this.detectBuildSystem();
            console.log(`Système de build détecté: ${this.buildSystem}`);

            // 3. Valider les fichiers nécessaires
            if (!this.validateMainFile()) {
                return false;
            }

            // 4. Exécuter la compilation
            const success = await this.executeCompilation();
            
            if (success) {
                console.log('Compilation terminée avec succès');
            }
            
            return success;

        } catch (error) {
            vscode.window.showErrorMessage(
                `${ERROR_MESSAGES.COMPILATION_FAILED}: ${error.message}`
            );
            return false;
        }
    }

    /**
     * Obtient le chemin vers le fichier de sortie des erreurs
     * @returns {string} Chemin vers le fichier compte_rendu.txt
     */
    getErrorOutputPath() {
        return path.join(this.workspacePath, COMPILATION_CONFIG.ERROR_OUTPUT_FILE);
    }

    /**
     * Obtient le système de build actuellement détecté
     * @returns {string} Type de système de build
     */
    getBuildSystem() {
        return this.buildSystem;
    }
}

module.exports = {
    CompilationManager,
    BUILD_SYSTEMS,
    COMPILATION_CONFIG,
    ERROR_MESSAGES
};
