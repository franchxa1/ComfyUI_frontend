import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "comfyui-frontend" is now active!');

    let disposable = vscode.commands.registerCommand('comfyui-frontend.openComfyUI', () => {
        const panel = vscode.window.createWebviewPanel(
            'comfyuiFrontend',
            'ComfyUI Frontend',
            vscode.ViewColumn.One,
            {
                enableScripts: true
            }
        );

        const htmlPath = path.join(context.extensionPath, 'dist', 'index.html');
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');

        const basePath = vscode.Uri.file(path.join(context.extensionPath, 'dist')).with({ scheme: 'vscode-resource' });
        htmlContent = htmlContent.replace(/(src|href)="([^"]*)"/g, `$1="${basePath}/$2"`);

        panel.webview.html = htmlContent;
    });

    context.subscriptions.push(disposable);

    let refreshDisposable = vscode.commands.registerCommand('comfyui-frontend.refreshNodeDefinitions', () => {
        vscode.window.showInformationMessage('Refreshing node definitions...');
        // Implement the logic to refresh node definitions here
    });

    context.subscriptions.push(refreshDisposable);
}

export function deactivate() {}
