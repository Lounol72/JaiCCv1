/**
 * Module pour le parsing des erreurs GCC
 */

const fs = require('fs');
const path = require('path');
const { GCC_ERROR_PATTERN, MESSAGES } = require('./constants');

/**
 * Parse le fichier de sortie GCC et retourne les erreurs trouvées
 * @param {string} filePath - Chemin vers le fichier de sortie GCC
 * @returns {Array} Array des erreurs trouvées
 */
function parseGccOutput(filePath) {
    try {
        // Vérifier que le fichier existe
        if (!fs.existsSync(filePath)) {
            throw new Error(`${MESSAGES.FILE_NOT_FOUND} ${filePath}`);
        }

        // Lire le contenu du fichier
        const gccOutput = fs.readFileSync(filePath, 'utf8');
        
        // Parser les erreurs avec la regex
        const matches = Array.from(gccOutput.matchAll(GCC_ERROR_PATTERN));
        
        return matches;
    } catch (error) {
        console.error('Erreur lors du parsing GCC:', error);
        throw error;
    }
}

/**
 * Valide qu'un fichier existe et est accessible
 * @param {string} filePath - Chemin vers le fichier
 * @returns {boolean} True si le fichier existe
 */
function validateFile(filePath) {
    return fs.existsSync(filePath);
}

/**
 * Obtient le chemin complet vers le fichier de sortie GCC
 * @param {string} extensionPath - Chemin de l'extension
 * @param {string} fileName - Nom du fichier (compte_rendu.txt ou compte_rendu_empty.txt)
 * @returns {string} Chemin complet
 */
function getGccOutputPath(extensionPath, fileName = 'compte_rendu.txt') {
    return path.join(extensionPath, fileName);
}

module.exports = {
    parseGccOutput,
    validateFile,
    getGccOutputPath
};
