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
                        this._handleBumpVersion(message);
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

    private async _handleBumpVersion(message: { bumpType: 'major' | 'minor' | 'patch'; summary?: string; added?: string; changed?: string; fixed?: string; }) {
        try {
            if (!vscode.workspace.workspaceFolders) {
                vscode.window.showErrorMessage('No workspace folder found.');
                return;
            }

            const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
            const currentVersion = this._getCurrentVersion();
            const newVersion = this._bumpVersion(currentVersion, message.bumpType);

            // Build the command with changelog content
            let command = `npm run version-bump -- ${message.bumpType} --yes`;
            
            // Add changelog sections if provided - use double quotes and escape properly
            if (message.summary) {
                const summaryWithVersion = `**${message.summary.trim()}**\n\n🚀 **${message.bumpType.toUpperCase()} Release:** \`${currentVersion}\` → \`${newVersion}\``;
                command += ` --summary="${summaryWithVersion.replace(/"/g, '\\"').replace(/`/g, '\\`')}"`;
            }
            if (message.added) {
                command += ` --added="${message.added.replace(/"/g, '\\"').replace(/`/g, '\\`')}"`;
            }
            if (message.changed) {
                command += ` --changed="${message.changed.replace(/"/g, '\\"').replace(/`/g, '\\`')}"`;
            }
            if (message.fixed) {
                command += ` --fixed="${message.fixed.replace(/"/g, '\\"').replace(/`/g, '\\`')}"`;
            }

            const terminal = vscode.window.createTerminal({
                name: 'Version Bump',
                cwd: workspaceRoot
            });

            terminal.sendText(command);
            terminal.show();

            vscode.window.showInformationMessage(
                `Version bump (${message.bumpType}) script is running in the terminal.`
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
            margin: 0;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 1px solid var(--vscode-panel-border);
            padding-bottom: 20px;
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
        
        .form-section {
            background: var(--vscode-editor-inactiveSelectionBackground);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 25px;
            margin: 20px 0;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
            color: var(--vscode-input-foreground);
            font-size: 14px;
        }
        
        textarea {
            width: 100%;
            min-height: 100px;
            padding: 12px;
            border: 1px solid var(--vscode-input-border);
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 4px;
            box-sizing: border-box;
            font-family: var(--vscode-font-family);
            font-size: 14px;
            resize: vertical;
            line-height: 1.5;
        }
        
        textarea:focus {
            outline: 1px solid var(--vscode-focusBorder);
            outline-offset: -1px;
        }
        
        .bump-options {
            display: grid;
            gap: 15px;
            margin: 30px 0;
        }
        
        .bump-button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 6px;
            padding: 20px;
            margin-bottom: 10px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.2s;
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            box-sizing: border-box;
        }
        
        .bump-button:hover {
            background: var(--vscode-button-hoverBackground);
        }
        
        .bump-button:disabled {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            cursor: not-allowed;
        }
        
        .bump-info {
            flex: 1;
            text-align: left;
        }
        
        .bump-type {
            font-weight: bold;
            margin-bottom: 6px;
            font-size: 18px;
        }
        
        .bump-description {
            font-size: 14px;
            opacity: 0.9;
            line-height: 1.4;
        }
        
        .version-preview {
            font-family: var(--vscode-editor-font-family);
            color: var(--vscode-textLink-foreground);
            font-size: 18px;
            font-weight: bold;
            min-width: 100px;
            text-align: right;
        }
        
        .info-section {
            background: var(--vscode-textBlockQuote-background);
            border-left: 4px solid var(--vscode-textBlockQuote-border);
            padding: 20px;
            margin: 30px 0;
            border-radius: 0 6px 6px 0;
        }
        
        .info-section h3 {
            margin-top: 0;
            color: var(--vscode-textPreformat-foreground);
        }
        
        .loading {
            text-align: center;
            padding: 20px;
            color: var(--vscode-descriptionForeground);
        }
        
        .help-text {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            margin-top: 5px;
            font-style: italic;
        }
        
        h2 {
            color: var(--vscode-textPreformat-foreground);
            margin-bottom: 15px;
            font-size: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📈 Version Bump</h1>
            <p>Manage semantic versioning and changelog for the Scribe extension</p>
        </div>

        <div class="version-display">
            <div>Current Version</div>
            <div class="version-number" id="currentVersion">Loading...</div>
        </div>

        <div class="form-section" id="changelogForm" style="display: none;">
            <h2>📝 Changelog Information</h2>
            <p>Fill in the sections below to automatically generate your changelog entry. Only non-empty fields will be included.</p>
            
            <div class="form-group">
                <label for="summary">Summary</label>
                <textarea id="summary" placeholder="Brief description of this release (the semantic version will be automatically added)..."></textarea>
                <div class="help-text">A high-level overview of what this version includes</div>
            </div>
            
            <div class="form-group">
                <label for="added">✨ Added</label>
                <textarea id="added" placeholder="- New feature 1&#10;- New feature 2&#10;- New capability..."></textarea>
                <div class="help-text">New features, capabilities, or enhancements</div>
            </div>
            
            <div class="form-group">
                <label for="changed">🔄 Changed</label>
                <textarea id="changed" placeholder="- Updated feature 1&#10;- Modified behavior 2&#10;- Improved performance..."></textarea>
                <div class="help-text">Changes to existing functionality</div>
            </div>
            
            <div class="form-group">
                <label for="fixed">🔧 Fixed</label>
                <textarea id="fixed" placeholder="- Fixed bug 1&#10;- Resolved issue 2&#10;- Corrected behavior..."></textarea>
                <div class="help-text">Bug fixes and problem resolutions</div>
            </div>
        </div>

        <div class="bump-options" id="bumpOptions" style="display: none;">
            <button class="bump-button" onclick="bumpVersion('patch')">
                <div class="bump-info">
                    <div class="bump-type">🐛 Patch Release</div>
                    <div class="bump-description">Bug fixes and small improvements</div>
                </div>
                <div class="version-preview" id="patchPreview"></div>
            </button>
            
            <button class="bump-button" onclick="bumpVersion('minor')">
                <div class="bump-info">
                    <div class="bump-type">✨ Minor Release</div>
                    <div class="bump-description">New features and enhancements</div>
                </div>
                <div class="version-preview" id="minorPreview"></div>
            </button>
            
            <button class="bump-button" onclick="bumpVersion('major')">
                <div class="bump-info">
                    <div class="bump-type">💥 Major Release</div>
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
            const summary = document.getElementById('summary').value.trim();
            const added = document.getElementById('added').value.trim();
            const changed = document.getElementById('changed').value.trim();
            const fixed = document.getElementById('fixed').value.trim();
            
            vscode.postMessage({
                command: 'bumpVersion',
                bumpType: type,
                summary: summary,
                added: added,
                changed: changed,
                fixed: fixed
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
                    document.getElementById('changelogForm').style.display = 'block';
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
