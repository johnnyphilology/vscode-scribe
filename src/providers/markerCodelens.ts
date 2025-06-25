import * as vscode from 'vscode';

import { toFuthorc } from '../languages/oldenglish/runes/futhorc';
import { toElderFuthark } from '../languages/oldnorse/runes/elderFuthark';
import { toYoungerFuthark } from '../languages/oldnorse/runes/youngerFuthark';
import { toMedievalRunes } from '../languages/oldnorse/runes/medieval';
import { toGothic } from '../languages/gothic/runes/gothicScript';

// --- CodeLens options per language ---
const RUNIC_COMMANDS_BY_LANG: { [lang: string]: { label: string, marker: string }[] } = {
    oldenglish: [
        { label: 'Convert to Futhorc', marker: '@futhorc' },
        { label: 'Convert (Pick)', marker: '@runes' }
    ],
    oldnorse: [
        { label: 'Convert to Elder Futhark', marker: '@elder' },
        { label: 'Convert to Younger Futhark', marker: '@younger' },
        { label: 'Convert to Medieval', marker: '@medieval' },
        { label: 'Convert (Pick)', marker: '@runes' }
    ],
    gothic: [
        { label: 'Convert to Gothic', marker: '@gothic' },
        { label: 'Convert (Pick)', marker: '@runes' }
    ]
};

const SUPPORTED_LANGUAGES = [
    'oldenglish',
    'oldnorse',
    'gothic'
];

// --- Conversion functions by marker ---
const runeFnMap: { [marker: string]: (txt: string) => string } = {
    '@futhorc': toFuthorc,
    '@elder': toElderFuthark,
    '@younger': toYoungerFuthark,
    '@medieval': toMedievalRunes,
    '@gothic': toGothic
};

// --- Register all Codelens providers per language ---
export function registerMarkerCodelens(context: vscode.ExtensionContext) {
    for (const lang of SUPPORTED_LANGUAGES) {
        context.subscriptions.push(
            vscode.languages.registerCodeLensProvider(lang, new MarkerCodeLensProvider(lang))
        );
    }
}

// --- Register the actual command (runs on CodeLens click) ---
export function registerCodelensCommand(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.convertRunesCodelens', async (uri: vscode.Uri, lineNum: number, marker: string) => {
            const editor = vscode.window.activeTextEditor;
            if (!editor || editor.document.uri.toString() !== uri.toString()) { return; }
            const line = editor.document.lineAt(lineNum);

            // For @runes, prompt the user for script choice
            let runeText: string;
            if (marker === '@runes') {
                const pick = await vscode.window.showQuickPick(
                    [
                        { label: 'Futhorc (Anglo-Saxon)', fn: toFuthorc },
                        { label: 'Elder Futhark (Old Norse)', fn: toElderFuthark },
                        { label: 'Younger Futhark (Old Norse)', fn: toYoungerFuthark },
                        { label: 'Medieval Nordic Runes', fn: toMedievalRunes },
                        { label: 'Gothic Alphabet', fn: toGothic }
                    ].map(c => c.label),
                    { placeHolder: 'Choose runic script...' }
                );
                if (!pick) { return; }
                const fn = {
                    'Futhorc (Anglo-Saxon)': toFuthorc,
                    'Elder Futhark (Old Norse)': toElderFuthark,
                    'Younger Futhark (Old Norse)': toYoungerFuthark,
                    'Medieval Nordic Runes': toMedievalRunes,
                    'Gothic Alphabet': toGothic
                }[pick];
                runeText = fn ? fn(line.text.replace(/^@\w+\s+/, '')) : '';
            } else {
                const fn = runeFnMap[marker];
                runeText = fn ? fn(line.text.replace(/^@\w+\s+/, '')) : '';
            }

            if (runeText) {
                await editor.edit(editBuilder => {
                    editBuilder.replace(line.range, runeText);
                });
            }
        })
    );
}

// --- The CodeLens provider: Only shows relevant conversions for this language ---
class MarkerCodeLensProvider implements vscode.CodeLensProvider {
    private lang: string;
    constructor(lang: string) { this.lang = lang; }

    provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
        const lenses: vscode.CodeLens[] = [];
        const commands = RUNIC_COMMANDS_BY_LANG[this.lang] || [];
        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            if (/^@(\w+)\b/.test(line.text)) {
                for (const cmd of commands) {
                    lenses.push(
                        new vscode.CodeLens(
                            new vscode.Range(i, 0, i, 0),
                            {
                                title: cmd.label,
                                command: 'extension.convertRunesCodelens',
                                arguments: [document.uri, i, cmd.marker]
                            }
                        )
                    );
                }
            }
        }
        return lenses;
    }
}
