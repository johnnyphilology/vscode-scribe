import * as vscode from 'vscode';
import TAGS from '../../external/scribe-data/data/markers.json';

// Map tagName -> decorationType
const decorationTypes = new Map<string, vscode.TextEditorDecorationType>();

export function initRuneGutterIcons(context: vscode.ExtensionContext) {
    for (const tag of TAGS) {
        const iconPath = vscode.Uri.joinPath(
            context.extensionUri,
            'media',
            `${tag}.svg`
        );
        const decorationType = vscode.window.createTextEditorDecorationType({
            gutterIconPath: iconPath,
            gutterIconSize: 'contain'
        });
        decorationTypes.set(tag, decorationType);
    }
}

export function handleGutters(editor: vscode.TextEditor, context: vscode.ExtensionContext) {
    if (!editor) { return; }

    if (decorationTypes.size === 0) {
        initRuneGutterIcons(context);
    }

    const decorations = new Map<string, vscode.DecorationOptions[]>();
    TAGS.forEach(tag => decorations.set(tag, []));

    const doc = editor.document;

    for (const tag of TAGS) {
        const openTag = `<${tag}>`;
        const closeTag = `</${tag}>`;

        let insideBlock = false;
        let startLine = -1;

        for (let i = 0; i < doc.lineCount; i++) {
            const line = doc.lineAt(i);

            if (!insideBlock && line.text.includes(openTag)) {
                insideBlock = true;
                startLine = i;
            }

            if (insideBlock) {
                decorations.get(tag)!.push({
                    range: line.range,
                    hoverMessage: `Inside <${tag}> block`
                });
                if (line.text.includes(closeTag)) {
                    insideBlock = false;
                    startLine = -1;
                }
            }
        }
    }

    for (const tag of TAGS) {
        const decType = decorationTypes.get(tag)!;
        editor.setDecorations(decType, decorations.get(tag)!);
    }
}
