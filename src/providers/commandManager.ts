import * as vscode from 'vscode';
import { AddWordWebviewPanel } from './addWordWebviewPanel';
import { VersionBumpWebviewPanel } from './versionBumpWebviewPanel';
import { generateSettingsTemplate } from './settingsTemplate';

/**
 * Register the open settings command
 */
function registerOpenSettings(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('extension.openScribeSettings', () => {
        // Open VS Code settings UI directly to Scribe settings
        vscode.commands.executeCommand('workbench.action.openSettings', 'scribe');
    });

    context.subscriptions.push(disposable);
}

/**
 * Register auto-merge command (developer mode only)
 */
function registerAutoMergeCommand(context: vscode.ExtensionContext) {
    const autoMergeCommand = vscode.commands.registerCommand('scribe.autoMerge', async () => {
        const config = vscode.workspace.getConfiguration('scribe');
        const developerMode = config.get<boolean>('developerMode', false);
        
        if (!developerMode) {
            vscode.window.showWarningMessage('Auto-merge feature is only available in Developer Mode. Enable it in Scribe settings.');
            return;
        }

        // Check if we're in a git repository
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder found.');
            return;
        }

        const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
        
        try {
            // Show confirmation dialog
            const proceed = await vscode.window.showWarningMessage(
                'This will create a PR and auto-merge the current branch. Continue?',
                { modal: true },
                'Yes, Auto-Merge',
                'Cancel'
            );

            if (proceed !== 'Yes, Auto-Merge') {
                return;
            }

            // Show progress
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Auto-merging current branch...',
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 0, message: 'Running auto-merge script...' });
                
                // Run the auto-merge script
                const terminal = vscode.window.createTerminal({
                    name: 'Scribe Auto-Merge',
                    cwd: workspaceRoot
                });
                
                terminal.sendText('npm run auto-merge');
                terminal.show();
                
                progress.report({ increment: 100, message: 'Auto-merge script started' });
                
                vscode.window.showInformationMessage(
                    'Auto-merge script is running in the terminal. Check the output for progress.'
                );
            });

        } catch (error) {
            vscode.window.showErrorMessage(`Auto-merge failed: ${error}`);
        }
    });
    context.subscriptions.push(autoMergeCommand);
}

/**
 * Register version bump command (developer mode only)
 */
function registerVersionBumpCommand(context: vscode.ExtensionContext) {
    const versionBumpCommand = vscode.commands.registerCommand('scribe.versionBump', () => {
        const config = vscode.workspace.getConfiguration('scribe');
        const developerMode = config.get<boolean>('developerMode', false);
        
        if (!developerMode) {
            vscode.window.showWarningMessage('Version bump feature is only available in Developer Mode. Enable it in Scribe settings.');
            return;
        }

        VersionBumpWebviewPanel.createOrShow(context.extensionUri);
    });
    context.subscriptions.push(versionBumpCommand);
}

/**
 * Register workspace settings command
 */
function registerWorkspaceSettingsCommand(context: vscode.ExtensionContext) {
    const setupWorkspaceSettingsCommand = vscode.commands.registerCommand('scribe.setupWorkspaceSettings', async () => {
        const editor = vscode.window.activeTextEditor;
        
        // If we're in a JSON file, offer to insert template directly
        if (editor && editor.document.languageId === 'json') {
            const options = await vscode.window.showQuickPick([
                {
                    label: '📋 Insert Settings Template',
                    description: 'Insert Scribe settings template at cursor position',
                    action: 'insert'
                },
                {
                    label: '⚙️ Setup Workspace Settings',
                    description: 'Create/update .vscode/settings.json file',
                    action: 'workspace'
                }
            ], {
                placeHolder: 'Choose how to apply Scribe settings'
            });

            if (!options) {
                return;
            }

            if (options.action === 'insert') {
                // Insert template at cursor (old insertScribeSettings behavior)
                const settingsTemplate = generateSettingsTemplate();
                const snippet = new vscode.SnippetString(settingsTemplate);
                editor.insertSnippet(snippet);
                
                vscode.window.showInformationMessage('📋 Scribe settings template inserted!');
                return;
            }
        }

        // Setup workspace settings (new behavior)
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder found. Please open a folder or workspace first.');
            return;
        }

        const workspaceRoot = vscode.workspace.workspaceFolders[0].uri;
        const vscodeDir = vscode.Uri.joinPath(workspaceRoot, '.vscode');
        const settingsFile = vscode.Uri.joinPath(vscodeDir, 'settings.json');

        try {
            // Check if .vscode directory exists, create if it doesn't
            try {
                await vscode.workspace.fs.stat(vscodeDir);
            } catch {
                await vscode.workspace.fs.createDirectory(vscodeDir);
            }

            // Parse the full settings template to extract relevant workspace settings
            const fullTemplate = JSON.parse(generateSettingsTemplate());
            
            // Default Scribe workspace settings (extracted from template + scribe-specific)
            const defaultSettings = {
                ...fullTemplate,
                "scribe.theme.autoActivate": true,
                "scribe.completion.highlightColor": "#FFD700",
                "scribe.oldenglish.enableWynn": false,
                "scribe.dataPath": "data",
                "scribe.developerMode": false,
                "files.associations": {
                    "*.oe": "oldenglish",
                    "*.on": "oldnorse",
                    "*.got": "gothic"
                }
            };

            let existingSettings = {};
            
            // Try to read existing settings
            try {
                const existingContent = await vscode.workspace.fs.readFile(settingsFile);
                const existingText = Buffer.from(existingContent).toString('utf8');
                existingSettings = JSON.parse(existingText);
            } catch {
                // File doesn't exist or is invalid JSON, start fresh
            }

            // Merge settings (existing settings take precedence)
            const mergedSettings = { ...defaultSettings, ...existingSettings };

            // Write the settings file
            const settingsContent = JSON.stringify(mergedSettings, null, 2);
            await vscode.workspace.fs.writeFile(settingsFile, Buffer.from(settingsContent, 'utf8'));

            // Show success message with options
            const result = await vscode.window.showInformationMessage(
                'Workspace Scribe settings have been configured in .vscode/settings.json',
                'Open Settings File',
                'View Settings'
            );

            if (result === 'Open Settings File') {
                const document = await vscode.workspace.openTextDocument(settingsFile);
                await vscode.window.showTextDocument(document);
            } else if (result === 'View Settings') {
                vscode.commands.executeCommand('workbench.action.openWorkspaceSettings');
            }

        } catch (error) {
            vscode.window.showErrorMessage(`Failed to setup workspace settings: ${error}`);
        }
    });
    context.subscriptions.push(setupWorkspaceSettingsCommand);
}

/**
 * Register Add Word commands
 */
function registerAddWordCommands(context: vscode.ExtensionContext) {
    // Register Add Word commands
    const addWordCommand = vscode.commands.registerCommand('scribe.addWord', () => {
        vscode.commands.executeCommand('workbench.view.explorer');
        vscode.commands.executeCommand('scribe.addWordView.focus');
    });
    context.subscriptions.push(addWordCommand);

    // Register Add Word Panel command (opens in new tab)
    const addWordPanelCommand = vscode.commands.registerCommand('scribe.addWordPanel', () => {
        AddWordWebviewPanel.createOrShow(context.extensionUri);
    });
    context.subscriptions.push(addWordPanelCommand);
}

/**
 * Register all extension commands
 */
export function registerCommands(context: vscode.ExtensionContext) {
    registerOpenSettings(context);
    registerAutoMergeCommand(context);
    registerVersionBumpCommand(context);
    registerWorkspaceSettingsCommand(context);
    registerAddWordCommands(context);
}
