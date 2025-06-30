import * as vscode from 'vscode';

export class AutoReleaseWebviewPanel {
    public static currentPanel: AutoReleaseWebviewPanel | undefined;
    public static readonly viewType = 'scribe.autoRelease';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor?.viewColumn;

        // If we already have a panel, show it
        if (AutoReleaseWebviewPanel.currentPanel) {
            AutoReleaseWebviewPanel.currentPanel._panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel
        const panel = vscode.window.createWebviewPanel(
            AutoReleaseWebviewPanel.viewType,
            'Auto Release',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, 'media'),
                    vscode.Uri.joinPath(extensionUri, 'out', 'src')
                ]
            }
        );

        AutoReleaseWebviewPanel.currentPanel = new AutoReleaseWebviewPanel(panel, extensionUri);
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
            async message => {
                switch (message.command) {
                    case 'getStatus':
                        await this._handleGetStatus();
                        return;
                    case 'refreshStatus':
                        await this._handleRefreshStatus();
                        return;
                    case 'createRelease':
                        await this._handleCreateRelease();
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    public dispose() {
        AutoReleaseWebviewPanel.currentPanel = undefined;

        // Clean up our resources
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private async _getCurrentVersion(): Promise<string> {
        try {
            if (!vscode.workspace.workspaceFolders) {
                return '0.0.0';
            }
            const workspaceRoot = vscode.workspace.workspaceFolders[0].uri;
            const packageJsonUri = vscode.Uri.joinPath(workspaceRoot, 'package.json');
            const packageJsonContent = await vscode.workspace.fs.readFile(packageJsonUri);
            const packageJson = JSON.parse(packageJsonContent.toString());
            return packageJson.version || '0.0.0';
        } catch (error) {
            return '0.0.0';
        }
    }

    private async _getCurrentBranch(): Promise<string> {
        try {
            // First try VS Code's built-in git extension
            const gitExtension = vscode.extensions.getExtension('vscode.git');
            if (gitExtension) {
                if (!gitExtension.isActive) {
                    await gitExtension.activate();
                }
                const git = gitExtension.exports;
                const api = git.getAPI(1);
                
                console.log('Git API available, repositories:', api.repositories.length);
                
                // Wait a bit for repositories to be discovered
                await new Promise(resolve => setTimeout(resolve, 100));
                
                if (api.repositories.length > 0) {
                    const repo = api.repositories[0];
                    console.log('Repository state:', repo.state);
                    console.log('HEAD:', repo.state.HEAD);
                    
                    // Try to refresh the repository state
                    try {
                        await repo.status();
                    } catch (statusError) {
                        console.warn('Failed to refresh repo status:', statusError);
                    }
                    
                    if (repo.state.HEAD && repo.state.HEAD.name) {
                        return repo.state.HEAD.name;
                    }
                    
                    // Try alternative: check if there's a ref
                    if (repo.state.HEAD && repo.state.HEAD.name === undefined) {
                        // Try to get branch from refs
                        const refs = repo.state.refs || [];
                        const headRef = refs.find((ref: any) => ref.type === 0); // HEAD type
                        if (headRef) {
                            const branchName = headRef.name?.replace('refs/heads/', '');
                            if (branchName) {
                                return branchName;
                            }
                        }
                    }
                } else {
                    console.log('No repositories found, trying to discover...');
                    // Try to trigger repository discovery
                    try {
                        await vscode.commands.executeCommand('git.refresh');
                        // Wait a bit and try again
                        await new Promise(resolve => setTimeout(resolve, 500));
                        if (api.repositories.length > 0) {
                            const repo = api.repositories[0];
                            if (repo.state.HEAD && repo.state.HEAD.name) {
                                return repo.state.HEAD.name;
                            }
                        }
                    } catch (refreshError) {
                        console.warn('Failed to refresh git repositories:', refreshError);
                    }
                }
            } else {
                console.log('Git extension not found');
            }

            return 'unknown';
        } catch (error) {
            console.warn('Failed to get current branch:', error);
            return 'unknown';
        }
    }

    private async _hasUncommittedChanges(): Promise<boolean> {
        try {
            // First try VS Code's built-in git extension
            const gitExtension = vscode.extensions.getExtension('vscode.git');
            if (gitExtension) {
                if (!gitExtension.isActive) {
                    await gitExtension.activate();
                }
                const git = gitExtension.exports;
                const api = git.getAPI(1);
                
                if (api.repositories.length > 0) {
                    const repo = api.repositories[0];
                    console.log('Checking changes - workingTreeChanges:', repo.state.workingTreeChanges?.length);
                    console.log('Checking changes - indexChanges:', repo.state.indexChanges?.length);
                    
                    const workingTreeChanges = repo.state.workingTreeChanges || [];
                    const indexChanges = repo.state.indexChanges || [];
                    return workingTreeChanges.length > 0 || indexChanges.length > 0;
                }
            }

            return false;
        } catch (error) {
            console.warn('Failed to check uncommitted changes:', error);
            return false;
        }
    }

    private async _getLatestCommitMessage(): Promise<string> {
        try {
            // First try VS Code's built-in git extension
            const gitExtension = vscode.extensions.getExtension('vscode.git');
            if (gitExtension) {
                if (!gitExtension.isActive) {
                    await gitExtension.activate();
                }
                const git = gitExtension.exports;
                const api = git.getAPI(1);
                
                // Wait a bit for repositories to be discovered and state to be loaded
                await new Promise(resolve => setTimeout(resolve, 200));
                
                if (api.repositories.length > 0) {
                    const repo = api.repositories[0];
                    
                    try {
                        // Force a status refresh to ensure we have the latest state
                        await repo.status();
                        // Small delay to let the state update
                        await new Promise(resolve => setTimeout(resolve, 100));
                    } catch (statusError) {
                        console.warn('Failed to refresh repo status:', statusError);
                    }
                    
                    console.log('Checking commit - HEAD:', repo.state.HEAD);
                    console.log('Checking commit - commit:', repo.state.HEAD?.commit);
                    
                    // Check if we have commit information
                    const commitMessage = repo.state.HEAD?.commit?.message;
                    if (commitMessage && commitMessage.trim().length > 0) {
                        // Get just the first line (summary) if it's a multi-line commit
                        const firstLine = commitMessage.split('\n')[0].trim();
                        return firstLine ?? 'No commit message';
                    }
                    
                    // Alternative: try to get from log
                    try {
                        const log = await repo.log({ maxEntries: 1 });
                        if (log.length > 0) {
                            const latestCommit = log[0];
                            const message = latestCommit.message?.split('\n')[0]?.trim();
                            return message ?? 'No commit message';
                        }
                    } catch (logError) {
                        console.warn('Failed to get commit from log:', logError);
                    }
                }
            }

            return 'No commit found';
        } catch (error) {
            console.warn('Failed to get latest commit message:', error);
            return 'No commit found';
        }
    }

    private async _handleGetStatus() {
        const status = {
            currentVersion: await this._getCurrentVersion(),
            currentBranch: await this._getCurrentBranch(),
            hasUncommittedChanges: await this._hasUncommittedChanges(),
            latestCommit: await this._getLatestCommitMessage()
        };

        this._panel.webview.postMessage({
            command: 'statusUpdate',
            status: status
        });
    }

    private async _handleRefreshStatus() {
        // Force a git refresh first
        try {
            await vscode.commands.executeCommand('git.refresh');
            // Wait a bit for the refresh to complete
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.warn('Failed to refresh git state:', error);
        }
        
        // Then get the status as normal
        await this._handleGetStatus();
    }

    private async _handleCreateRelease() {
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder found.');
            return;
        }

        const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
        const currentBranch = await this._getCurrentBranch();
        const hasUncommitted = await this._hasUncommittedChanges();

        // Check prerequisites
        if (hasUncommitted) {
            vscode.window.showErrorMessage('You have uncommitted changes. Please commit or stash them before creating a release.');
            return;
        }

        if (currentBranch === 'main') {
            vscode.window.showErrorMessage('You are on the main branch. Please create a feature branch first.');
            return;
        }

        // Show confirmation dialog
        const version = await this._getCurrentVersion();
        const proceed = await vscode.window.showWarningMessage(
            `This will create a PR from "${currentBranch}" to main, wait for CI checks, auto-merge, and create release v${version}. Continue?`,
            { modal: true },
            'Yes, Create Release',
            'Cancel'
        );

        if (proceed !== 'Yes, Create Release') {
            return;
        }

        // Show progress and run the auto-release script
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Creating release v${version}...`,
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 0, message: 'Running auto-release script...' });
            
            // Run the auto-release script
            const terminal = vscode.window.createTerminal({
                name: 'Scribe Auto-Release',
                cwd: workspaceRoot
            });
            
            terminal.sendText('npm run auto-release');
            terminal.show();
            
            progress.report({ increment: 100, message: 'Auto-release script started' });
            
            vscode.window.showInformationMessage(
                `Auto-release script is running in the terminal. This will create PR, wait for CI, merge, and create release v${version}.`
            );
        });

        // Close the webview after starting the process
        this.dispose();
    }

    private _update() {
        const webview = this._panel.webview;
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Auto Release</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            font-weight: var(--vscode-font-weight);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
        }
        
        h1 {
            color: var(--vscode-textPreformat-foreground);
            margin-bottom: 20px;
            border-bottom: 1px solid var(--vscode-textSeparator-foreground);
            padding-bottom: 10px;
        }
        
        .status-section {
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            border: 1px solid var(--vscode-textSeparator-foreground);
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .status-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid var(--vscode-textSeparator-foreground);
        }
        
        .status-item:last-child {
            border-bottom: none;
        }
        
        .status-label {
            font-weight: 600;
            color: var(--vscode-textPreformat-foreground);
        }
        
        .status-value {
            font-family: var(--vscode-editor-font-family);
            color: var(--vscode-textLink-foreground);
        }
        
        .warning {
            background-color: var(--vscode-inputValidation-warningBackground);
            border: 1px solid var(--vscode-inputValidation-warningBorder);
            color: var(--vscode-inputValidation-warningForeground);
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }
        
        .info {
            background-color: var(--vscode-inputValidation-infoBackground);
            border: 1px solid var(--vscode-inputValidation-infoBorder);
            color: var(--vscode-inputValidation-infoForeground);
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }
        
        .button-container {
            display: flex;
            gap: 10px;
            margin-top: 30px;
            justify-content: center;
        }
        
        button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 12px 24px;
            font-size: var(--vscode-font-size);
            border-radius: 4px;
            cursor: pointer;
            font-family: var(--vscode-font-family);
            transition: background-color 0.2s;
        }
        
        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        
        button:disabled {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            cursor: not-allowed;
        }
        
        .primary-button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
        }
        
        .primary-button:hover:not(:disabled) {
            background-color: var(--vscode-button-hoverBackground);
        }
        
        .secondary-button {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        
        .secondary-button:hover:not(:disabled) {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }
        
        .loading {
            display: none;
            text-align: center;
            color: var(--vscode-textPreformat-foreground);
            margin: 20px 0;
        }
        
        ul {
            padding-left: 20px;
            margin: 10px 0;
        }
        
        li {
            margin: 5px 0;
        }
        
        code {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 2px 6px;
            border-radius: 3px;
            font-family: var(--vscode-editor-font-family);
            font-size: 90%;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Auto Release</h1>
        
        <div class="info">
            <strong>Auto Release Process:</strong>
            <ul>
                <li>Creates a pull request from current branch to main</li>
                <li>Waits for CI checks (tests + SonarQube) to pass</li>
                <li>Auto-merges the PR if all checks pass</li>
                <li>Creates a new release with tag matching package.json version</li>
            </ul>
        </div>
        
        <div class="status-section">
            <h3>Current Status</h3>
            <div class="status-item">
                <span class="status-label">Version:</span>
                <span class="status-value" id="current-version">Loading...</span>
            </div>
            <div class="status-item">
                <span class="status-label">Branch:</span>
                <span class="status-value" id="current-branch">Loading...</span>
            </div>
            <div class="status-item">
                <span class="status-label">Uncommitted Changes:</span>
                <span class="status-value" id="uncommitted-changes">Loading...</span>
            </div>
            <div class="status-item">
                <span class="status-label">Latest Commit:</span>
                <span class="status-value" id="latest-commit">Loading...</span>
            </div>
        </div>
        
        <div id="warning-message" class="warning" style="display: none;">
            <strong>Warning:</strong> <span id="warning-text"></span>
        </div>
        
        <div class="button-container">
            <button id="refresh-btn" class="secondary-button">🔄 Refresh Status</button>
            <button id="create-release-btn" class="primary-button" disabled>🚀 Create Release</button>
        </div>
        
        <div class="loading" id="loading">
            <p>⏳ Processing...</p>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        let currentStatus = null;
        
        // DOM elements
        const currentVersionEl = document.getElementById('current-version');
        const currentBranchEl = document.getElementById('current-branch');
        const uncommittedChangesEl = document.getElementById('uncommitted-changes');
        const latestCommitEl = document.getElementById('latest-commit');
        const warningMessageEl = document.getElementById('warning-message');
        const warningTextEl = document.getElementById('warning-text');
        const refreshBtn = document.getElementById('refresh-btn');
        const createReleaseBtn = document.getElementById('create-release-btn');
        const loadingEl = document.getElementById('loading');
        
        // Event listeners
        refreshBtn.addEventListener('click', () => {
            refreshStatus();
        });
        
        createReleaseBtn.addEventListener('click', () => {
            createRelease();
        });
        
        // Message handling
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.command) {
                case 'statusUpdate':
                    updateStatus(message.status);
                    break;
            }
        });
        
        function refreshStatus() {
            setLoading(true);
            vscode.postMessage({ command: 'refreshStatus' });
        }
        
        function createRelease() {
            setLoading(true);
            vscode.postMessage({ command: 'createRelease' });
        }
        
        function updateStatus(status) {
            currentStatus = status;
            
            currentVersionEl.textContent = status.currentVersion;
            currentBranchEl.textContent = status.currentBranch;
            uncommittedChangesEl.textContent = status.hasUncommittedChanges ? 'Yes' : 'No';
            latestCommitEl.textContent = status.latestCommit.length > 50 
                ? status.latestCommit.substring(0, 50) + '...' 
                : status.latestCommit;
            
            // Check for warnings and enable/disable button
            let canCreateRelease = true;
            let warnings = [];
            
            if (status.hasUncommittedChanges) {
                warnings.push('You have uncommitted changes');
                canCreateRelease = false;
            }
            
            if (status.currentBranch === 'main') {
                warnings.push('You are on the main branch');
                canCreateRelease = false;
            }
            
            if (warnings.length > 0) {
                warningTextEl.textContent = warnings.join('. ');
                warningMessageEl.style.display = 'block';
            } else {
                warningMessageEl.style.display = 'none';
            }
            
            createReleaseBtn.disabled = !canCreateRelease;
            
            setLoading(false);
        }
        
        function setLoading(loading) {
            if (loading) {
                loadingEl.style.display = 'block';
                refreshBtn.disabled = true;
                createReleaseBtn.disabled = true;
            } else {
                loadingEl.style.display = 'none';
                refreshBtn.disabled = false;
                // createReleaseBtn enabled state is controlled by status check
                if (currentStatus) {
                    updateStatus(currentStatus);
                }
            }
        }
        
        // Initial load
        refreshStatus();
    </script>
</body>
</html>`;
    }

    /**
     * Execute a git command using VS Code's integrated terminal (fallback method)
     * This avoids using Node.js child_process directly for web extension compatibility
     */
    private async _executeGitCommand(command: string, cwd: string): Promise<string | null> {
        return new Promise((resolve) => {
            try {
                // For now, we'll return null to gracefully fall back
                // In a future version, we could implement terminal-based execution
                // but this would require more complex communication patterns
                resolve(null);
            } catch (error) {
                console.warn('Git command execution failed:', error);
                resolve(null);
            }
        });
    }
}
