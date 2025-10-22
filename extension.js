/**
 * Extension principale jaiccv1 - Affichage des erreurs de compilation avec des mèmes
 * 
 * Cette extension parse les erreurs de compilation GCC et les affiche
 * avec des mèmes appropriés dans une webview VS Code.
 */

const vscode = require('vscode');
const { MESSAGES } = require('./src/constants');
const { parseGccOutput } = require('./src/gccParser');
const WebviewManager = require('./src/webviewManager');
const { CompilationManager } = require('./src/compilationManager');

/**
 * Méthode appelée lors de l'activation de l'extension
 * @param {vscode.ExtensionContext} context - Contexte de l'extension
 */
function activate(context) {
	console.log(MESSAGES.EXTENSION_ACTIVATED);

	// Initialiser le gestionnaire de webview
	const webviewManager = new WebviewManager(context);

	// Commande Hello World
	const helloWorldCommand = vscode.commands.registerCommand('jaiccv1.helloWorld', () => {
		vscode.window.showInformationMessage(MESSAGES.HELLO_WORLD);
	});

	// Commande principale GCC
	const gccCommand = vscode.commands.registerCommand("jaiccv1.gcc", async () => {
		try {
			// Initialiser le gestionnaire de compilation
			const compilationManager = new CompilationManager();
			
			// Exécuter la compilation avec gestion d'erreurs améliorée
			await compilationManager.compile();
			
			// Obtenir le chemin du fichier de sortie GCC
			const filePath = compilationManager.getErrorOutputPath();
			
			// Parser les erreurs GCC
			const matches = parseGccOutput(filePath);
			
			// Créer le panel webview
			const panel = webviewManager.createWebviewPanel();
			
			// Afficher le contenu
			await webviewManager.displayContent(panel, matches);
			
		} catch (error) {
			vscode.window.showErrorMessage(`Erreur lors de la compilation: ${error.message}`);
			console.error('Erreur dans la commande GCC:', error);
		}
	});

	// Enregistrer les commandes
	context.subscriptions.push(helloWorldCommand, gccCommand);
}

/**
 * Méthode appelée lors de la désactivation de l'extension
 */
function deactivate() {
	// Nettoyage si nécessaire
}

module.exports = {
	activate,
	deactivate
};
