/**
 * Module pour la génération de contenu HTML
 */

/**
 * Génère le contenu HTML pour afficher une erreur de compilation
 * @param {string} imageUri - URI de l'image à afficher
 * @param {Object} regexMatch - Objet contenant les groupes de la regex
 * @returns {string} HTML généré
 */
function generateErrorContent(imageUri, regexMatch) {
    const groups = regexMatch.groups ?? {};
    
    return `<div class="error-container">
    <div class="image-container">
        <img src="${imageUri}" class="error-image" />
    </div>
    
    <div class="info-container">
        <div class="info-grid">
            <div class="info-item type">
                <span class="info-label">Type</span>
                <span class="info-value">${groups.type}</span>
            </div>
            
            <div class="info-item line">
                <span class="info-label">Ligne</span>
                <span class="info-value monospace">${groups.ligne}</span>
            </div>
            
            <div class="info-item column">
                <span class="info-label">Colonne</span>
                <span class="info-value monospace">${groups.colonne}</span>
            </div>
            
            <div class="info-item message">
                <span class="message-label">Message</span>
                <span class="message-content">${(groups.message ?? "").trim()}</span>
            </div>
        </div>
    </div>
</div>`;
}

/**
 * Génère le contenu HTML pour une compilation réussie
 * @param {string} imageUri - URI de l'image à afficher
 * @returns {string} HTML généré
 */
function generateSuccessContent(imageUri) {
    return `<div class="error-container">
    <div class="image-container">
        <img src="${imageUri}" class="error-image" />
    </div>
    
    <div class="info-container">
        <div class="info-grid">
            <div class="info-item success">
                <span class="success-message">Le code à été compilé sans erreurs mon chef !!!</span>
            </div>
        </div>
    </div>
</div>`;
}

/**
 * Génère le HTML de base avec les balises head et body
 * @param {string} cssUri - URI du fichier CSS
 * @returns {string} HTML de base
 */
function generateBaseHTML(cssUri) {
    return `<!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device‑width,initial‑scale=1.0">
        <link href="${cssUri}" rel="stylesheet">
        <title>Image Viewer</title>
    </head>
    <body>
        <div class="default-container">`;
}

/**
 * Génère le HTML de fermeture
 * @returns {string} HTML de fermeture
 */
function generateClosingHTML() {
    return `</div></body></html>`;
}

module.exports = {
    generateErrorContent,
    generateSuccessContent,
    generateBaseHTML,
    generateClosingHTML
};
