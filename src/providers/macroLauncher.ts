import * as vscode from 'vscode';
import { toFuthorc } from '../languages/oldenglish/runes/futhorc';
import { toElderFuthark } from '../languages/oldnorse/runes/elderFuthark';
import { toYoungerFuthark } from '../languages/oldnorse/runes/youngerFuthark';
import { toMedievalRunes } from '../languages/oldnorse/runes/medieval';
import { toGothic } from '../languages/gothic/runes/gothicScript';

const runeConverters = [
    { label: "Futhorc (Anglo-Saxon)", fn: toFuthorc },
    { label: "Elder Futhark (Old Norse)", fn: toElderFuthark },
    { label: "Younger Futhark (Old Norse)", fn: toYoungerFuthark },
    { label: "Medieval Nordic Runes", fn: toMedievalRunes },
    { label: "Gothic Alphabet", fn: toGothic }
];

const markerMap: { [key: string]: (txt: string) => string } = {
    'futhorc': toFuthorc,
    'elder': toElderFuthark,
    'younger': toYoungerFuthark,
    'medieval': toMedievalRunes,
    'gothic': toGothic
};

export function registerMacroLauncher(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerTextEditorCommand('extension.convertRunesBlocks', async (editor) => {
            const doc = editor.document;
            const edits: { range: vscode.Range; runes: string }[] = [];

            for (let i = 0; i < doc.lineCount; i++) {
                const line = doc.lineAt(i);
                const cmdMatch = line.text.match(/^@(runes|futhorc|elder|younger|medieval|gothic)\s+(.+)/i);
                if (cmdMatch) {
                    const marker = cmdMatch[1].toLowerCase();
                    const content = cmdMatch[2];
                    if (marker === 'runes') {
                        // Prompt for which converter to use
                        const pick = await vscode.window.showQuickPick(
                            runeConverters.map(c => c.label),
                            { placeHolder: 'Choose runic script for: ' + content.substring(0, 20) + '...' }
                        );
                        if (!pick) {continue;}
                        const converter = runeConverters.find(c => c.label === pick);
                        if (!converter) {continue;}
                        edits.push({ range: line.range, runes: converter.fn(content) });
                    } else {
                        const fn = markerMap[marker];
                        if (!fn) {continue;}
                        edits.push({ range: line.range, runes: fn(content) });
                    }
                }
            }

            if (edits.length) {
                editor.edit(editBuilder => {
                    for (const edit of edits) {
                        editBuilder.replace(edit.range, edit.runes);
                    }
                });
            }
        })
    );
}
