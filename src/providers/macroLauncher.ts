import * as vscode from 'vscode';
import { toFuthorc } from '../languages/oldenglish/runes/futhorc';
import { toElderFuthark } from '../languages/oldnorse/runes/elderFuthark';
import { toYoungerFuthark } from '../languages/oldnorse/runes/youngerFuthark';
import { toMedievalRunes } from '../languages/oldnorse/runes/medieval';
import { toGothic } from '../languages/gothic/runes/gothicScript';
import MARKERS from '../../data/markers.json';

const markerMap: { [key: string]: (txt: string) => string } = {
    'Futhorc': toFuthorc,
    'ElderFuthark': toElderFuthark,
    'YoungerFuthark': toYoungerFuthark,
    'MedievalFuthark': toMedievalRunes,
    'Gothic': toGothic
};

export function registerMacroLauncher(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerTextEditorCommand('extension.convertLanguageBlocks', async (editor) => {
            const doc = editor.document;
            const fullText = doc.getText();
            const edits: { range: vscode.Range; runes: string }[] = [];

            // Build a regex that matches only PascalCase markers from your marker list
            const markerPattern = MARKERS.join('|');
            // Named backreference for tag pairing; no case-insensitive flag!
            const blockRegex = new RegExp(
                `<(?<marker>${markerPattern})>(?<content>[\\s\\S]*?)</\\k<marker>>`,
                'g'
            );

            let match: RegExpExecArray | null;

            while ((match = blockRegex.exec(fullText)) !== null) {
                const marker = match.groups!.marker; // PascalCase
                const content = match.groups!.content.trim();

                let runeOutput = "";

                // Use PascalCase marker for lookup
                const fn = markerMap[marker];
                if (!fn) { continue; }
                runeOutput = fn(content);

                // Get start and end offsets
                const startOffset = match.index;
                const endOffset = startOffset + match[0].length;

                const startPos = doc.positionAt(startOffset);
                const endPos = doc.positionAt(endOffset);
                const range = new vscode.Range(startPos, endPos);

                edits.push({ range, runes: runeOutput });
            }

            if (edits.length) {
                editor.edit(editBuilder => {
                    for (const edit of edits) {
                        editBuilder.replace(edit.range, edit.runes);
                    }
                });
            } else {
                vscode.window.showInformationMessage("No transliteration blocks found.");
            }
        })
    );
}
