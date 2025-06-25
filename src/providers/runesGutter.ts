import * as vscode from 'vscode';

let decorationType: vscode.TextEditorDecorationType | undefined;

export function updateRunesGutter(editor: vscode.TextEditor, context: vscode.ExtensionContext) {
    if (!editor) {return;}

    // Lazy init the gutter icon
    if (!decorationType) {
        const iconPath = vscode.Uri.joinPath(
            context.extensionUri,
            'media', 'rune.svg'
        );
        decorationType = vscode.window.createTextEditorDecorationType({
            gutterIconPath: iconPath,
            gutterIconSize: 'contain'
        });
    }

    const runeRegex = /^@runes\b.*/i; // Matches any line starting with @runes (case-insensitive)
    const decorations: vscode.DecorationOptions[] = [];

    for (let i = 0; i < editor.document.lineCount; i++) {
        const line = editor.document.lineAt(i);
        if (runeRegex.test(line.text)) {
            decorations.push({
                range: line.range,
                hoverMessage: 'Convert this @runes line to runes'
            });
        }
    }
    editor.setDecorations(decorationType, decorations);
}
