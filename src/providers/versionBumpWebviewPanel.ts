import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class VersionBumpWebviewPanel {
    public static currentPanel: VersionBumpWebviewPanel | undefined;
    public static readonly viewType = 'scribe.versionBump';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor?.viewColumn;

        // If we already have a panel, show it
        if (VersionBumpWebviewPanel.currentPanel) {
            VersionBumpWebviewPanel.currentPanel._panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel
        const panel = vscode.window.createWebviewPanel(
            VersionBumpWebviewPanel.viewType,
            'Version Bump',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, 'media'),
                    vscode.Uri.joinPath(extensionUri, 'out', 'src')
                ]
            }
        );

        VersionBumpWebviewPanel.currentPanel = new VersionBumpWebviewPanel(panel, extensionUri);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        // Set the webview's initial html content
        this._update();

        // Listen for when the panel is disposed
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'getCurrentVersion':
                        this._handleGetCurrentVersion();
                        return;
                    case 'bumpVersion':
                        this._handleBumpVersion(message.bumpType);
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    public dispose() {
        VersionBumpWebviewPanel.currentPanel = undefined;

        // Clean up our resources
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _getCurrentVersion(): string {
        try {
            if (!vscode.workspace.workspaceFolders) {
                return '0.0.0';
            }
            const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
            const packageJsonPath = path.join(workspaceRoot, 'package.json');
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            return packageJson.version || '0.0.0';
        } catch (error) {
            return '0.0.0';
        }
    }

    private _parseVersion(version: string): { major: number; minor: number; patch: number } {
        const [major, minor, patch] = version.split('.').map(Number);
        return { major, minor, patch };
    }

    private _bumpVersion(currentVersion: string, bumpType: 'major' | 'minor' | 'patch'): string {
        const { major, minor, patch } = this._parseVersion(currentVersion);
        
        switch (bumpType) {
            case 'major':
                return `${major + 1}.0.0`;
            case 'minor':
                return `${major}.${minor + 1}.0`;
            case 'patch':
                return `${major}.${minor}.${patch + 1}`;
            default:
                throw new Error('Invalid bump type');
        }
    }

    private _handleGetCurrentVersion() {
        const currentVersion = this._getCurrentVersion();
        this._panel.webview.postMessage({
            command: 'updateCurrentVersion',
            version: currentVersion
        });
    }

    private async _handleBumpVersion(bumpType: 'major' | 'minor' | 'patch') {
        try {
            if (!vscode.workspace.workspaceFolders) {
                vscode.window.showErrorMessage('No workspace folder found.');
                return;
            }

            const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
            const currentVersion = this._getCurrentVersion();
            const newVersion = this._bumpVersion(currentVersion, bumpType);

            // The webview already collected user confirmation, so we pass the bump type
            // and auto-confirm to avoid duplicate prompts
            const terminal = vscode.window.createTerminal({
                name: 'Version Bump',
                cwd: workspaceRoot
            });

            terminal.sendText(`npm run version-bump -- ${bumpType} --yes`);
            terminal.show();

            vscode.window.showInformationMessage(
                `Version bump (${bumpType}) script is running in the terminal.`
            );

            // Update the webview with new version
            this._panel.webview.postMessage({
                command: 'updateCurrentVersion',
                version: newVersion
            });

        } catch (error) {
            vscode.window.showErrorMessage(`Version bump failed: ${error}`);
        }
    }

    private _update() {
        const webview = this._panel.webview;
        this._panel.title = 'Version Bump';
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Version Bump</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            padding: 20px;
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .version-display {
            background: var(--vscode-editor-selectionBackground);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .version-number {
            font-size: 2em;
            font-weight: bold;
            color: var(--vscode-textLink-foreground);
            margin: 10px 0;
        }
        .bump-options {
            display: grid;
            gap: 30px;
            margin: 20px 0;
        }
        .bump-button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 6px;
            padding: 15px 20px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.2s;
            display: flex;
            justify-content: space-between;
            align-items: center;
            min-height: 60px;
            width: 100%;
            box-sizing: border-box;
            margin-bottom: 15px;
        }
        .bump-button:last-child {
            margin-bottom: 0;
        }
        .bump-button:hover {
            background: var(--vscode-button-hoverBackground);
        }
        .bump-info {
            flex: 1;
            text-align: left;
        }
        .bump-type {
            font-weight: bold;
            margin-bottom: 4px;
        }
        .bump-description {
            font-size: 14px;
            opacity: 0.8;
            line-height: 1.3;
        }
        .version-preview {
            font-family: monospace;
            color: var(--vscode-textLink-foreground);
            font-size: 16px;
            font-weight: bold;
            min-width: 80px;
            text-align: right;
        }
        .info-section {
            background: var(--vscode-textBlockQuote-background);
            border-left: 4px solid var(--vscode-textBlockQuote-border);
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 6px 6px 0;
        }
        .loading {
            text-align: center;
            padding: 20px;
            color: var(--vscode-descriptionForeground);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📈 Version Bump</h1>
            <p>Manage semantic versioning for the Scribe extension</p>
        </div>

        <div class="version-display">
            <div>Current Version</div>
            <div class="version-number" id="currentVersion">Loading...</div>
        </div>

        <div class="bump-options" id="bumpOptions" style="display: none;">
            <button class="bump-button" onclick="bumpVersion('patch')">
                <div class="bump-info">
                    <div class="bump-type">🐛 Patch</div>
                    <div class="bump-description">Bug fixes and small improvements</div>
                </div>
                <div class="version-preview" id="patchPreview"></div>
            </button>
            
            <button class="bump-button" onclick="bumpVersion('minor')">
                <div class="bump-info">
                    <div class="bump-type">✨ Minor</div>
                    <div class="bump-description">New features and enhancements</div>
                </div>
                <div class="version-preview" id="minorPreview"></div>
            </button>
            
            <button class="bump-button" onclick="bumpVersion('major')">
                <div class="bump-info">
                    <div class="bump-type">💥 Major</div>
                    <div class="bump-description">Breaking changes</div>
                </div>
                <div class="version-preview" id="majorPreview"></div>
            </button>
        </div>

        <div class="info-section">
            <h3>ℹ️ About Semantic Versioning</h3>
            <ul>
                <li><strong>Patch (X.X.1):</strong> Backwards-compatible bug fixes</li>
                <li><strong>Minor (X.1.X):</strong> New functionality that's backwards-compatible</li>
                <li><strong>Major (1.X.X):</strong> Changes that break backwards compatibility</li>
            </ul>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let currentVersion = '0.0.0';

        function parseVersion(version) {
            const [major, minor, patch] = version.split('.').map(Number);
            return { major, minor, patch };
        }

        function bumpVersion(type) {
            vscode.postMessage({
                command: 'bumpVersion',
                bumpType: type
            });
        }

        function updatePreviews() {
            const { major, minor, patch } = parseVersion(currentVersion);
            
            document.getElementById('patchPreview').textContent = \`\${major}.\${minor}.\${patch + 1}\`;
            document.getElementById('minorPreview').textContent = \`\${major}.\${minor + 1}.0\`;
            document.getElementById('majorPreview').textContent = \`\${major + 1}.0.0\`;
        }

        // Listen for messages from the extension
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'updateCurrentVersion':
                    currentVersion = message.version;
                    document.getElementById('currentVersion').textContent = currentVersion;
                    document.getElementById('bumpOptions').style.display = 'block';
                    updatePreviews();
                    break;
            }
        });

        // Request current version when page loads
        vscode.postMessage({ command: 'getCurrentVersion' });
    </script>
</body>
</html>`;
    }
}
