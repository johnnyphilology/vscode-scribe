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

export function activate(context: vscode.ExtensionContext) {
    registerHandleSubstitutions(context, oldEnglishSubs, 'oldenglish');
    registerCompletion(context, 'oldenglish', oldEnglishWords);
    registerMarkerCompletion(context, 'oldenglish', allMarkers);

    registerHandleSubstitutions(context, oldNorseSubs, 'oldnorse');
    registerCompletion(context, 'oldnorse', oldNorseWords);
    registerMarkerCompletion(context, 'oldnorse', allMarkers);

    registerHandleSubstitutions(context, gothicSubs, 'gothic');
    registerCompletion(context, 'gothic', gothicWords);
    registerMarkerCompletion(context, 'gothic', allMarkers);

    registerMacroLauncher(context); // Macro for @runes lines, user chooses script

    registerCompletionHover(context, 'oldenglish', oldEnglishWords);
    registerCompletionHover(context, 'oldnorse', oldNorseWords);

    registerWordEntrySemanticTokens(context, 'oldenglish', extractWordList(oldEnglishWords));
    registerWordEntrySemanticTokens(context, 'oldnorse', extractWordList(oldNorseWords));

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
