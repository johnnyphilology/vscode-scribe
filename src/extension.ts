import * as vscode from 'vscode';

import { registerCompletion } from './providers/completion';
import { registerMacroLauncher } from './providers/macroLauncher';
import { updateRunesGutter } from './providers/runesGutter';
import { registerMarkerCompletion } from './providers/markerCompletion';
import { registerMarkerCodelens } from './providers/markerCodelens';
import { registerCodelensCommand } from './providers/markerCodelens';
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

import oldEnglishMarkers from '../data/oldenglish/markerCompletion.json';
import oldNorseMarkers from '../data/oldnorse/markerCompletion.json';
import gothicMarkers from '../data/gothic/markerCompletion.json';

const fullOldEnglishMarkers = [oldEnglishMarkers, bracketMarkers(['futhorc', 'gothic'])].flat();

export function activate(context: vscode.ExtensionContext) {
    registerHandleSubstitutions(context, oldEnglishSubs, 'oldenglish');
    registerCompletion(context, 'oldenglish', oldEnglishWords);
    registerMarkerCompletion(context, 'oldenglish', fullOldEnglishMarkers);

    registerHandleSubstitutions(context, oldNorseSubs, 'oldnorse');
    registerCompletion(context, 'oldnorse', oldNorseWords);
    registerMarkerCompletion(context, 'oldnorse', oldNorseMarkers);

    registerHandleSubstitutions(context, gothicSubs, 'gothic');
    registerCompletion(context, 'gothic', gothicWords);
    registerMarkerCompletion(context, 'gothic', gothicMarkers);

    registerMarkerCodelens(context);
    registerCodelensCommand(context);
    registerMacroLauncher(context); // Macro for @runes lines, user chooses script

    registerCompletionHover(context, 'oldenglish', oldEnglishWords);
    registerCompletionHover(context, 'oldnorse', oldNorseWords);

    registerWordEntrySemanticTokens(context, 'oldenglish', extractWordList(oldEnglishWords));
    registerWordEntrySemanticTokens(context, 'oldnorse', extractWordList(oldNorseWords));

    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {updateRunesGutter(editor, context);}
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(event => {
        const editor = vscode.window.activeTextEditor;
        if (editor && event.document === editor.document) {
           updateRunesGutter(editor, context);
        }
    }, null, context.subscriptions);

    // Initialize when extension starts
    if (vscode.window.activeTextEditor) {
        updateRunesGutter(vscode.window.activeTextEditor, context);
    }
}

export function deactivate() {}
