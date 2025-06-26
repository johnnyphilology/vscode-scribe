import * as vscode from 'vscode';

import { registerCompletion } from './providers/completion';
import { registerMacroLauncher } from './providers/macroLauncher';
import { handleGutters } from './providers/handleGutters';
import { registerMarkerCompletion } from './providers/markerCompletion';
import { registerHandleSubstitutions } from './providers/handleSubstitutions';
import { registerCompletionHover } from './providers/completionHover';
import { registerWordEntrySemanticTokens } from './providers/semanticTokens';
import { extractWordList } from './utils/helpers';
import { bracketMarkers } from './utils/helpers';

import oldEnglishSubs from '../data/oldenglish/substitutions.json';
import oldNorseSubs from '../data/oldnorse/substitutions.json';
import gothicSubs from '../data/gothic/substitutions.json';
import gothicWords from '../data/gothic/completionWords.json';
import oldEnglishWords from '../data/oldenglish/completionWords.json';
import oldNorseWords from '../data/oldnorse/completionWords.json';
import markers from '../data/markers.json';

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

export function activate(context: vscode.ExtensionContext) {
    // Register all medieval languages
    const languages: LanguageConfig[] = [
        { id: 'oldenglish', substitutions: oldEnglishSubs, words: oldEnglishWords },
        { id: 'oldnorse', substitutions: oldNorseSubs, words: oldNorseWords },
        { id: 'gothic', substitutions: gothicSubs, words: gothicWords }
    ];

    languages.forEach(lang => registerLanguage(context, lang));

    registerMacroLauncher(context); // Macro for @runes lines, user chooses script

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
