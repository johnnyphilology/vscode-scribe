import * as vscode from 'vscode';

import { registerCompletion } from './providers/completion';
import { registerMacroLauncher } from './providers/macroLauncher';
import { handleGutters } from './providers/handleGutters';
import { registerMarkerCompletion } from './providers/markerCompletion';
import { registerHandleSubstitutions } from './providers/handleSubstitutions';
import { registerCompletionHover } from './providers/completionHover';
import { registerWordEntrySemanticTokens } from './providers/semanticTokens';
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
    registerHandleSubstitutions(context, config.substitutions, config.id);
    registerCompletion(context, config.id, config.words);
    registerMarkerCompletion(context, config.id, allMarkers);
    
    // Only register hover and semantic tokens for languages with words
    if (config.words.length > 0) {
        registerCompletionHover(context, config.id, config.words);
        registerWordEntrySemanticTokens(context, config.id, extractWordList(config.words));
    }
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

        const settingsTemplate = `{
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
          "foreground": "#FFD700"
        },
        "wordentry.definition": {
          "foreground": "#FFD700",
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

        const snippet = new vscode.SnippetString(settingsTemplate);
        editor.insertSnippet(snippet);
        
        vscode.window.showInformationMessage('📋 Scribe settings template inserted! Copy this to your VS Code settings.json');
    });

    context.subscriptions.push(disposable);
}

export function activate(context: vscode.ExtensionContext) {
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
}

export function deactivate() {}
