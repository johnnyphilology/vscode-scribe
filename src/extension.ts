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
 * Auto-activate Scribe theme if setting is enabled
 */
function autoActivateTheme() {
    const config = vscode.workspace.getConfiguration('scribe');
    const autoActivate = config.get<boolean>('theme.autoActivate', true);
    
    if (autoActivate) {
        const currentTheme = vscode.workspace.getConfiguration('workbench').get<string>('colorTheme');
        if (currentTheme !== 'Scribe') {
            vscode.workspace.getConfiguration('workbench').update('colorTheme', 'Scribe', vscode.ConfigurationTarget.Global);
            console.log('[Scribe] Auto-activated Scribe theme');
        }
    }
}

/**
 * Get dynamic Old English substitutions based on wynn setting
 */
function getOldEnglishSubstitutions(): { [key: string]: string } {
    const config = vscode.workspace.getConfiguration('scribe');
    const enableWynn = config.get<boolean>('oldenglish.enableWynn', false);
    
    const baseSubstitutions: { [key: string]: string } = { ...oldEnglishSubs };
    
    if (enableWynn) {
        // Add w -> ƿ substitution
        baseSubstitutions['w'] = 'ƿ';
        baseSubstitutions['W'] = 'Ƿ';
    }
    
    return baseSubstitutions;
}

/**
 * Register all providers for a medieval language
 * @param context - VS Code extension context
 * @param config - Language configuration
 */
function registerLanguage(context: vscode.ExtensionContext, config: LanguageConfig) {
    // Use dynamic substitutions for Old English
    const substitutions = config.id === 'oldenglish' 
        ? getOldEnglishSubstitutions() 
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
 * Get the custom highlight color from settings
 */
function getHighlightColor(): string {
    const config = vscode.workspace.getConfiguration('scribe');
    return config.get<string>('completion.highlightColor', '#FFD700');
}

/**
 * Generate settings template with current configuration values
 */
function generateSettingsTemplate(): string {
    const highlightColor = getHighlightColor();
    
    return `{
  "editor.fontFamily": "Noto Serif",
  "editor.fontSize": 16,
  "editor.fontLigatures": true,
  "editor.semanticHighlighting.enabled": true,
  "workbench.colorTheme": "Scribe",
  "[oldenglish]": {
    "editor.fontFamily": "Noto Serif"
  },
  "[oldnorse]": {
    "editor.fontFamily": "Noto Serif"
  },
  "[gothic]": {
    "editor.fontFamily": "Noto Serif"
  },
  "editor.semanticTokenColorCustomizations": {
    "[Scribe]": {
      "rules": {
        "wordentry": {
          "foreground": "${highlightColor}"
        },
        "wordentry.definition": {
          "foreground": "${highlightColor}",
          "fontStyle": "bold"
        }
      }
    }
  },
  "editor.tokenColorCustomizations": {
    "[Scribe]": {
      "textMateRules": [
        {
          "scope": "constant.language.runes.scribe",
          "settings": {
            "foreground": "#07d00b",
            "fontStyle": "bold"
          }
        },
        {
          "scope": "constant.language.gothic.scribe",
          "settings": {
            "foreground": "#2087e7",
            "fontStyle": "bold"
          }
        },
        {
          "scope": "constant.language.medieval.scribe",
          "settings": {
            "foreground": "#9d4edd",
            "fontStyle": "bold"
          }
        },
        {
          "scope": "entity.name.tag.futhorc.scribe",
          "settings": {
            "foreground": "#FFD700"
          }
        },
        {
          "scope": "entity.name.tag.elderfuthark.scribe",
          "settings": {
            "foreground": "#D32F2F"
          }
        },
        {
          "scope": "entity.name.tag.youngerfuthark.scribe",
          "settings": {
            "foreground": "#19c819"
          }
        },
        {
          "scope": "entity.name.tag.medievalfuthark.scribe",
          "settings": {
            "foreground": "#8e24aa"
          }
        },
        {
          "scope": "entity.name.tag.gothic.scribe",
          "settings": {
            "foreground": "#2087e7"
          }
        },
        {
          "scope": "entity.name.tag.scribe",
          "settings": {
            "foreground": "#01ad29"
          }
        },
        {
          "scope": [
            "punctuation.definition.tag.begin.scribe",
            "punctuation.definition.tag.end.scribe"
          ],
          "settings": {
            "foreground": "#808080"
          }
        }
      ]
    }
  }
}`;
}

/**
 * Register the settings insertion command
 * @param context - VS Code extension context
 */
function registerSettingsInsertion(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('extension.insertScribeSettings', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const settingsTemplate = generateSettingsTemplate();
        const snippet = new vscode.SnippetString(settingsTemplate);
        editor.insertSnippet(snippet);
        
        vscode.window.showInformationMessage('📋 Scribe settings template inserted! Copy this to your VS Code settings.json');
    });

    context.subscriptions.push(disposable);
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

    registerMacroLauncher(context); // Macro for @runes lines, user chooses script

    // Register settings insertion command
    registerSettingsInsertion(context);
    registerOpenSettings(context);

    // Register Add Word webview provider (sidebar)
    const addWordProvider = new AddWordWebviewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(AddWordWebviewProvider.viewType, addWordProvider)
    );

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

    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {handleGutters(editor, context);}
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(event => {
        const editor = vscode.window.activeTextEditor;
        if (editor && event.document === editor.document) {
           handleGutters(editor, context);
        }
    }, null, context.subscriptions);

    // Initialize when extension starts
    if (vscode.window.activeTextEditor) {
        handleGutters(vscode.window.activeTextEditor, context);
    }

    // Listen for configuration changes
    vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('scribe')) {
            // Handle theme auto-activation setting change
            if (event.affectsConfiguration('scribe.theme.autoActivate')) {
                autoActivateTheme();
            }
            
            // Handle Old English wynn conversion setting change
            if (event.affectsConfiguration('scribe.oldenglish.enableWynn')) {
                vscode.window.showInformationMessage(
                    '🔄 Old English wynn conversion setting changed. Reload the window for changes to take effect.',
                    'Reload'
                ).then(selection => {
                    if (selection === 'Reload') {
                        vscode.commands.executeCommand('workbench.action.reloadWindow');
                    }
                });
            }
            
            // Handle data path setting change
            if (event.affectsConfiguration('scribe.dataPath')) {
                vscode.window.showInformationMessage(
                    '📁 Data path setting changed. Reload the window for changes to take effect.',
                    'Reload'
                ).then(selection => {
                    if (selection === 'Reload') {
                        vscode.commands.executeCommand('workbench.action.reloadWindow');
                    }
                });
            }
            
            // Handle highlight color setting change
            if (event.affectsConfiguration('scribe.completion.highlightColor')) {
                vscode.window.showInformationMessage(
                    '🎨 Word entry highlight color changed. Update your settings.json with the new template to see changes.',
                    'Generate Template'
                ).then(selection => {
                    if (selection === 'Generate Template') {
                        vscode.commands.executeCommand('extension.insertScribeSettings');
                    }
                });
            }
        }
    }, null, context.subscriptions);
}
