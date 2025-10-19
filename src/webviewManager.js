/**
 * Module pour la gestion des webviews et du contenu
 */

const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { ASSET_FOLDERS, WEBVIEW_CONFIG, MESSAGES } = require('./constants');
const { generateErrorContent, generateSuccessContent, generateBaseHTML, generateClosingHTML } = require('./htmlGenerator');

/**
 * Gestionnaire de webview pour l'affichage des erreurs de compilation
 */
class WebviewManager {
    constructor(context) {
        this.context = context;
    }

    /**
     * Crée un nouveau panel webview
     * @returns {vscode.WebviewPanel} Panel créé
     */
    createWebviewPanel() {
        return vscode.window.createWebviewPanel(
            WEBVIEW_CONFIG.VIEW_TYPE,
            WEBVIEW_CONFIG.TITLE,
            vscode.ViewColumn.One,
            {
                localResourceRoots: [
                    vscode.Uri.joinPath(this.context.extensionUri, ASSET_FOLDERS.MEMES),
                    vscode.Uri.joinPath(this.context.extensionUri, ASSET_FOLDERS.CSS)
                ],
                enableScripts: WEBVIEW_CONFIG.ENABLE_SCRIPTS
            }
        );
    }

    /**
     * Obtient l'URI du fichier CSS
     * @returns {vscode.Uri} URI du fichier CSS
     */
    getCssUri() {
        return vscode.Uri.joinPath(this.context.extensionUri, ASSET_FOLDERS.CSS, 'style.css');
    }

    /**
     * Construit le contenu webview pour une erreur spécifique
     * @param {string} folderName - Nom du dossier d'images
     * @param {vscode.WebviewPanel} panel - Panel webview
     * @param {Object} regexMatch - Match de la regex (optionnel)
     * @returns {Promise<string>} Contenu HTML généré
     */
    async buildWebviewContent(folderName, panel, regexMatch = null) {
        const directoryPath = path.join(this.context.extensionPath, ASSET_FOLDERS.MEMES, folderName);

        try {
            const files = await fs.promises.readdir(directoryPath);
            
            if (files.length === 0) {
                console.warn(`${MESSAGES.NO_IMAGES_FOUND} ${directoryPath}`);
                return "";
            }

            const randomImage = files[Math.floor(Math.random() * files.length)];
            const imageOnDisk = vscode.Uri.joinPath(
                this.context.extensionUri, 
                ASSET_FOLDERS.MEMES, 
                folderName, 
                randomImage
            );
            const imageSrc = panel.webview.asWebviewUri(imageOnDisk);

            if (regexMatch !== null) {
                return generateErrorContent(imageSrc, regexMatch);
            }
            return generateSuccessContent(imageSrc);

        } catch (err) {
            console.error(`${MESSAGES.ERROR_READING_FOLDER}`, err);
            return `<p>${MESSAGES.ERROR_READING_IMAGES} ${folderName}</p>`;
        }
    }

    /**
     * Affiche le contenu dans le webview
     * @param {vscode.WebviewPanel} panel - Panel webview
     * @param {Array} matches - Array des erreurs trouvées
     */
    async displayContent(panel, matches) {
        const cssUri = this.getCssUri();
        const styleWebviewUri = panel.webview.asWebviewUri(cssUri);
        
        console.log('CSS URI:', cssUri.toString());
        console.log('CSS Webview URI:', styleWebviewUri.toString());

        // Contenu HTML de base
        panel.webview.html = generateBaseHTML(styleWebviewUri);

        if (matches.length === 0) {
            console.log(MESSAGES.NO_DIAGNOSTICS);
            
            const html = await this.buildWebviewContent("compiled", panel, null);
            panel.webview.html = generateBaseHTML(styleWebviewUri) + 
                html + 
                `<p>${MESSAGES.NO_ERRORS_DETECTED}</p>` + 
                generateClosingHTML();
        } else {
            // Traiter toutes les erreurs trouvées
            const htmlParts = await Promise.all(
                matches.map(async (match) => {
                    const groups = match.groups ?? {};
                    console.log(groups.type);
                    return await this.buildWebviewContent(groups.type, panel, match); //split.last is a bandage for "Fatal error" type
                })
            );
            
            panel.webview.html = generateBaseHTML(styleWebviewUri) + 
                htmlParts.join('\n') + 
                generateClosingHTML();
        }
    }
}

module.exports = WebviewManager;
