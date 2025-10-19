/**
 * Extension principale jaiccv1 - Affichage des erreurs de compilation avec des mèmes
 * 
 * Cette extension parse les erreurs de compilation GCC et les affiche
 * avec des mèmes appropriés dans une webview VS Code.
 */

const vscode = require('vscode');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const { MESSAGES } = require('./src/constants');
const { parseGccOutput, getGccOutputPath } = require('./src/gccParser');
const WebviewManager = require('./src/webviewManager');

// Convertir exec en promesse pour une meilleure gestion asynchrone
const execAsync = promisify(exec);

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
			// Vérifier qu'un workspace est ouvert
			if (!vscode.workspace.rootPath) {
				vscode.window.showErrorMessage('Aucun workspace ouvert. Veuillez ouvrir un dossier.');
				return;
			}

			// Chemin vers le fichier main.c
			const mainFile = path.join(vscode.workspace.rootPath, 'main.c');
			
			// Vérifier que le fichier main.c existe
			if (!fs.existsSync(mainFile)) {
				vscode.window.showErrorMessage(`Fichier main.c non trouvé dans ${vscode.workspace.rootPath}`);
				return;
			}

			// Compiler le fichier avec GCC et capturer stderr
			const outputFile = path.join(vscode.workspace.rootPath, 'main.exe');
			const command = `gcc "${mainFile}" -o "${outputFile}" 2>${vscode.workspace.rootPath}/compte_rendu.txt`;
			
			console.log('Exécution de la commande:', command);
			
			try {
				 await execAsync(command);

			} catch (e) {
				vscode.window.showErrorMessage("tkt j'ai eu mon erreur de compilation");
			}

			// Obtenir le chemin du fichier de sortie GCC
			const filePath = getGccOutputPath(vscode.workspace.rootPath, "compte_rendu.txt");
			
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
