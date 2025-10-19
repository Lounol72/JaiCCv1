/**
 * Constantes et configurations pour l'extension jaiccv1
 */

// Regex pour parser les erreurs GCC
//const GCC_ERROR_PATTERN = /^(?<fichier>[^\.c:]+\.c):(?<ligne>\d+):(?<colonne>\d+):\s+(?<type>fatal\serror|error|warning):\s*(?<message>[^\r\n]*)(?:\r?\n(?<contexte>(?: {2,}.*\r?\n?)+))?/gm;
const GCC_ERROR_PATTERN = /^(?<fichier>.*?\.c):(?<ligne>\d+):(?<colonne>\d+):\s+(?<type>fatal\serror|error|warning):\s*(?<message>[^\r\n]*)(?:\r?\n(?<contexte>(?: {2,}.*\r?\n?)+))?/gm;




// Messages de l'extension
const MESSAGES = {
    EXTENSION_ACTIVATED: 'Congratulations, your extension "jaiccv1" is now active!',
    HELLO_WORLD: 'Hello World from jaiccv1!',
    NO_DIAGNOSTICS: 'Aucun diagnostic trouvé.',
    NO_ERRORS_DETECTED: 'Aucune erreur ou warning détecté.',
    COMPILATION_SUCCESS: 'Le code à été compilé sans erreurs mon chef !!!',
    FILE_NOT_FOUND: 'File not found:',
    NO_IMAGES_FOUND: 'Aucune image trouvée dans',
    ERROR_READING_FOLDER: 'Erreur lors de la lecture du dossier :',
    ERROR_READING_IMAGES: 'Erreur lors de la lecture des images pour'
};

// Types d'erreurs supportés
const ERROR_TYPES = {
    ERROR: 'error',
    WARNING: 'warning',
    COMPILED: 'compiled'
};

// Dossiers de ressources
const ASSET_FOLDERS = {
    MEMES: 'assets/memes',
    CSS: 'css'
};

// Configuration des webviews
const WEBVIEW_CONFIG = {
    VIEW_TYPE: 'imageView',
    TITLE: 'Image Viewer',
    ENABLE_SCRIPTS: false
};

module.exports = {
    GCC_ERROR_PATTERN,
    MESSAGES,
    ERROR_TYPES,
    ASSET_FOLDERS,
    WEBVIEW_CONFIG
};
