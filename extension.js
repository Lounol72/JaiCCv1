// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "jaiccv1" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('jaiccv1.helloWorld', function () {
		// The code you place here will be executed every time your command is executed
		
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from jaiccv1!');
	});
	const gcc = vscode.commands.registerCommand("jaiccv1.gcc", function(){
		// parse-gcc.js
		const fs = require("fs");
		const path = require("path");

		// Get the extension's directory and construct the absolute path to compte_rendu.txt
		const extensionPath = context.extensionPath;
		const filePath = path.join(extensionPath, "compte_rendu.txt");

		// Check if the file exists before trying to read it
		if (!fs.existsSync(filePath)) {
			vscode.window.showErrorMessage(`File not found: ${filePath}`);
			return;
		}

		// Lis le fichier (assure-toi que l'encodage est bien utf8)
		const gcc_output = fs.readFileSync(filePath, "utf8");

		// Regex équivalente à ta version Python, avec groupes nommés
		// - ^ et flag m : ancrage début de ligne
		// - message : [^\r\n]* pour s'arrêter à la fin de ligne, même sous Windows
		// - contexte : lignes qui commencent par >= 2 espaces
		const pattern = /^(?<fichier>[^\s:]+\.c):(?<ligne>\d+):(?<colonne>\d+):\s+(?<type>error|warning):\s*(?<message>[^\r\n]*)(?:\r?\n(?<contexte>(?: {2,}.*\r?\n?)+))?/gm;

		// matchAll + flag g pour itérer sur toutes les occurrences
		const matches = Array.from(gcc_output.matchAll(pattern));

		if (matches.length === 0) {
		console.log("Aucun diagnostic trouvé.");
		} else {
		matches.forEach((m, idx) => {
			const g = m.groups ?? {};
			console.log(`--- Erreur ${idx + 1} ---`);
			console.log(`Message brut capturé : '${g.message ?? ""}'`); // DEBUG
			console.log(`Fichier  : ${g.fichier}`);
			console.log(`Ligne    : ${g.ligne}`);
			console.log(`Colonne  : ${g.colonne}`);
			vscode.window.showInformationMessage(`Type     : ${g.type}`);
			console.log(`Message  : ${(g.message ?? "").trim()}`);
			console.log(`Contexte :\n${m[0].trim()}\n`);
		});
		}

	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(gcc);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
