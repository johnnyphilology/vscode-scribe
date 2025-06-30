import * as vscode from 'vscode';

import { registerCompletion } from './providers/completion';
import { registerMacroLauncher } from './providers/macroLauncher';
import { handleGutters } from './providers/handleGutters';
import { registerMarkerCompletion } from './providers/markerCompletion';
import { registerHandleSubstitutions } from './providers/handleSubstitutions';
import { registerCompletionHover } from './providers/completionHover';
import { registerWordEntrySemanticTokens } from './providers/semanticTokens';
import { AddWordWebviewProvider } from './providers/addWordWebview';
import { AddWordWebviewPanel } from './providers/addWordWebviewPanel';
import { VersionBumpWebviewPanel } from './providers/versionBumpWebviewPanel';
import { AutoReleaseWebviewPanel } from './providers/autoReleaseWebviewPanel';
import { autoActivateTheme } from './providers/themeManager';
import { getOldEnglishSubstitutions as getDynamicOldEnglishSubs, registerConfigurationHandlers } from './providers/configurationManager';
import { generateSettingsTemplate } from './providers/settingsTemplate';
import { extractWordList, bracketMarkers } from './utils/helpers';

import oldEnglishSubs from '../data/oldenglish/substitutions.json';
import oldNorseSubs from '../data/oldnorse/substitutions.json';
import gothicSubs from '../data/gothic/substitutions.json';
import gothicWords from '../data/gothic/completionWords.json';
import oldEnglishWords from '../data/oldenglish/completionWords.json';
import oldNorseWordsRaw from '../data/oldnorse/completionWords.json';
import markers from '../data/markers.json';

const oldNorseWords: any[] = Array.isArray(oldNorseWordsRaw) ? oldNorseWordsRaw : Object.values(oldNorseWordsRaw);

const allMarkers = bracketMarkers(markers);

interface LanguageConfig {
    id: string;
    substitutions: { [key: string]: string };
    words: any[];
}

/**
 * Register all providers for a medieval language
 * @param context - VS Code extension context
 * @param config - Language configuration
 */
function registerLanguage(context: vscode.ExtensionContext, config: LanguageConfig) {
    // Use dynamic substitutions for Old English
    const substitutions = config.id === 'oldenglish' 
        ? getDynamicOldEnglishSubs() 
        : config.substitutions;
        
    registerHandleSubstitutions(context, substitutions, config.id);
    registerCompletion(context, config.id, config.words);
    registerMarkerCompletion(context, config.id, allMarkers);
    
    // Only register hover and semantic tokens for languages with words
    if (config.words.length > 0) {
        registerCompletionHover(context, config.id, config.words);
        registerWordEntrySemanticTokens(context, config.id, extractWordList(config.words));
    }
}

/**
 * Register the open settings command
 * @param context - VS Code extension context
 */
function registerOpenSettings(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('extension.openScribeSettings', () => {
        // Open VS Code settings UI directly to Scribe settings
        vscode.commands.executeCommand('workbench.action.openSettings', 'scribe');
    });

    context.subscriptions.push(disposable);
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
 * Register developer mode commands
 */
function registerDevCommands(context: vscode.ExtensionContext) {
    // Register Auto-Merge command (developer mode only)
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

    // Register Version Bump command (developer mode only)
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

    // Register Auto-Release command (developer mode only)
    const autoReleaseCommand = vscode.commands.registerCommand('scribe.autoRelease', () => {
        const config = vscode.workspace.getConfiguration('scribe');
        const developerMode = config.get<boolean>('developerMode', false);
        
        if (!developerMode) {
            vscode.window.showWarningMessage('Auto-release feature is only available in Developer Mode. Enable it in Scribe settings.');
            return;
        }

        AutoReleaseWebviewPanel.createOrShow(context.extensionUri);
    });
    context.subscriptions.push(autoReleaseCommand);

    // Register Wynn Mode Toggle command (developer mode only)
    const toggleWynnCommand = vscode.commands.registerCommand('scribe.toggleWynn', async () => {
        const config = vscode.workspace.getConfiguration('scribe');
        const developerMode = config.get<boolean>('developerMode', false);
        
        if (!developerMode) {
            vscode.window.showWarningMessage('Wynn toggle is only available in Developer Mode. Enable it in Scribe settings.');
            return;
        }

        const currentWynn = config.get<boolean>('oldenglish.enableWynn', false);
        await config.update('oldenglish.enableWynn', !currentWynn, vscode.ConfigurationTarget.Workspace);
        
        const mode = !currentWynn ? 'enabled' : 'disabled';
        
        // For developer command, always auto-reload for quick testing
        vscode.window.showInformationMessage(
            `ƿ Wynn mode ${mode}! Reloading window...`,
            { modal: false }
        );
        
        // Small delay to let user see the message
        setTimeout(() => {
            vscode.commands.executeCommand('workbench.action.reloadWindow');
        }, 800);
    });
    context.subscriptions.push(toggleWynnCommand);
}

/**
 * Register Add Word commands
 */
function registerAddWordCommands(context: vscode.ExtensionContext) {
    const addWordCommand = vscode.commands.registerCommand('scribe.addWord', () => {
        vscode.commands.executeCommand('workbench.view.explorer');
        vscode.commands.executeCommand('scribe.addWordView.focus');
    });
    context.subscriptions.push(addWordCommand);

    const addWordPanelCommand = vscode.commands.registerCommand('scribe.addWordPanel', () => {
        AddWordWebviewPanel.createOrShow(context.extensionUri);
    });
    context.subscriptions.push(addWordPanelCommand);
}

/**
 * Register event handlers
 */
function registerEventHandlers(context: vscode.ExtensionContext) {
    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            handleGutters(editor, context);
        }
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(event => {
        const editor = vscode.window.activeTextEditor;
        if (editor && event.document === editor.document) {
           handleGutters(editor, context);
        }
    }, null, context.subscriptions);
}

export function activate(context: vscode.ExtensionContext) {
    // Auto-activate theme if setting enabled
    autoActivateTheme();

    // Register all medieval languages
    const languages: LanguageConfig[] = [
        { id: 'oldenglish', substitutions: oldEnglishSubs, words: oldEnglishWords },
        { id: 'oldnorse', substitutions: oldNorseSubs, words: oldNorseWords },
        { id: 'gothic', substitutions: gothicSubs, words: gothicWords }
    ];

    languages.forEach(lang => registerLanguage(context, lang));

    registerMacroLauncher(context);

    // Register settings commands
    registerOpenSettings(context);
    registerWorkspaceSettingsCommand(context);

    // Register developer mode commands
    registerDevCommands(context);

    // Register Add Word webview provider (sidebar)
    const addWordProvider = new AddWordWebviewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(AddWordWebviewProvider.viewType, addWordProvider)
    );

    // Register Add Word commands
    registerAddWordCommands(context);

    // Register event handlers
    registerEventHandlers(context);

    // Register configuration change handlers
    registerConfigurationHandlers(context);

    // Initialize when extension starts
    if (vscode.window.activeTextEditor) {
        handleGutters(vscode.window.activeTextEditor, context);
    }
}
