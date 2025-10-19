// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const pattern = /^(?<fichier>[^\s:]+\.c):(?<ligne>\d+):(?<colonne>\d+):\s+(?<type>error|warning):\s*(?<message>[^\r\n]*)(?:\r?\n(?<contexte>(?: {2,}.*\r?\n?)+))?/gm;

// function to create the HTML code to display any image

function getWebviewContent(imageUri,regex_match) {
	const g = regex_match.groups ?? {};
	return `<div style="
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		padding: 24px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 16px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		max-width: 600px;
		margin: 20px auto;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	">
	<div style="
		background: white;
		border-radius: 12px;
		padding: 16px;
		margin-bottom: 20px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	">
		<img src="${imageUri}" style="
			max-width: 100%;
			height: auto;
			border-radius: 8px;
			max-height: 200px;
		" />
	</div>
	
	<div style="
		width: 100%;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		border-radius: 12px;
		padding: 20px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
	">
		<div style="
			display: grid;
			gap: 12px;
		">
			<div style="
				display: flex;
				align-items: center;
				padding: 10px;
				background: #f8f9fa;
				border-radius: 8px;
				border-left: 4px solid #667eea;
				width: 10vw;
				height: 20vh;
			">
				<span style="
					font-weight: 600;
					color: #4a5568;
					min-width: 80px;
					font-size: 14px;
				">Type</span>
				<span style="
					color: #2d3748;
					font-size: 14px;
					font-weight: 500;
				">${g.type}</span>
			</div>
			
			<div style="
				display: flex;
				align-items: center;
				padding: 10px;
				background: #f8f9fa;
				border-radius: 8px;
				border-left: 4px solid #f093fb;
			">
				<span style="
					font-weight: 600;
					color: #4a5568;
					min-width: 80px;
					font-size: 14px;
				">Ligne</span>
				<span style="
					color: #2d3748;
					font-size: 14px;
					font-family: 'Courier New', monospace;
					font-weight: 500;
				">${g.ligne}</span>
			</div>
			
			<div style="
				display: flex;
				align-items: center;
				padding: 10px;
				background: #f8f9fa;
				border-radius: 8px;
				border-left: 4px solid #4facfe;
			">
				<span style="
					font-weight: 600;
					color: #4a5568;
					min-width: 80px;
					font-size: 14px;
				">Colonne</span>
				<span style="
					color: #2d3748;
					font-size: 14px;
					font-family: 'Courier New', monospace;
					font-weight: 500;
				">${g.colonne}</span>
			</div>
			
			<div style="
				display: flex;
				flex-direction: column;
				padding: 12px;
				background: #fff5f5;
				border-radius: 8px;
				border-left: 4px solid #fc5c7d;
			">
				<span style="
					font-weight: 600;
					color: #4a5568;
					font-size: 14px;
					margin-bottom: 6px;
				">Message</span>
				<span style="
					color: #c53030;
					font-size: 13px;
					line-height: 1.6;
					font-family: 'Courier New', monospace;
				">${(g.message ?? "").trim()}</span>
			</div>
		</div>
	</div>
</div>`;
}

function getDefaultHTML(){
	return `<!DOCTYPE html>
  	<html lang="en">
  	<head>
    	<meta charset="UTF-8">
    	<meta name="viewport" content="width=device‑width,initial‑scale=1.0">
    	<title>Image Viewer</title>
  	</head>
  	<body>
		<div style="display: flex; align-items: stretch">`
}

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
		

		// matchAll + flag g pour itérer sur toutes les occurrences
		const matches = Array.from(gcc_output.matchAll(pattern));

		/*test display image*/

		const panel = vscode.window.createWebviewPanel(
		'imageView',             // viewType
		'Image Viewer',          // title
		vscode.ViewColumn.One,   // show in first column
		{
			// Allow local resource root(s) so we can load images from extension assets/memes folder
			localResourceRoots: [ vscode.Uri.joinPath(context.extensionUri, `assets/memes`) ],
			enableScripts: false     // no script needed for simple image
		}
		);

		// Set the HTML content
		panel.webview.html = getDefaultHTML();

		if (matches.length === 0) {
			console.log("Aucun diagnostic trouvé.");
			panel.webview.html += "<p>Aucune erreur ou warning détecté.</p></div></body></html>";
		} else {
			// Utilise des promesses pour traiter tous les diagnostics
			Promise.all(matches.map(async (m) => {
				const g = m.groups ?? {};
				const directoryPath = path.join(extensionPath, 'assets/memes', g.type);

				try {
					const files = await fs.promises.readdir(directoryPath);
					if (files.length === 0) {
						console.warn(`Aucune image trouvée dans ${directoryPath}`);
						return ""; // Rien à afficher
					}

					const randomImage = files[Math.floor(Math.random() * files.length)];

					const imageOnDisk = vscode.Uri.joinPath(
						context.extensionUri,
						'assets',
						'memes',
						g.type,
						randomImage
					);

					const imageSrc = panel.webview.asWebviewUri(imageOnDisk);

					return getWebviewContent(imageSrc, m);
				} catch (err) {
					console.error('Erreur lors de la lecture du dossier :', err);
					return `<p>Erreur lors de la lecture des images pour ${g.type}</p>`;
				}
			})).then((htmlParts) => {
				panel.webview.html = getDefaultHTML() + htmlParts.join('\n') + `</div></body></html>`;
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
