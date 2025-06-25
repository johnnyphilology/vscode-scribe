import * as vscode from 'vscode';
import { isInAtMarker, applyCasing } from '../utils/helpers';

export function registerHandleSubstitutions(
    context: vscode.ExtensionContext,
    substitutions: { [key: string]: string },
    languageId: string
) {
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((event) => {
            const document = event.document;
            if (document.languageId !== languageId) { return; }

            for (const change of event.contentChanges) {
                if (!change || change.text.length === 0) { continue; }

                const lineNum = change.range.start.line;
                const line = document.lineAt(lineNum).text;
                const cursorPos = change.range.start.character + change.text.length;

                if (isInAtMarker(line)) {continue;}

                const maxDigraphLength = Math.max(...Object.keys(substitutions).map(s => s.length));
                const beforeCursor = line.substring(Math.max(0, cursorPos - maxDigraphLength), cursorPos);

                for (const digraph of Object.keys(substitutions)) {
                    // Escape regex chars
                    const escapedDigraph = digraph.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const regex = new RegExp(`${escapedDigraph}$`, 'i');
                    const match = beforeCursor.match(regex);
                    if (match) {
                        const typed = match[0];
                        const replacement = applyCasing(typed, substitutions[digraph]);
                        const edit = new vscode.WorkspaceEdit();
                        const start = new vscode.Position(lineNum, cursorPos - typed.length);
                        const end = new vscode.Position(lineNum, cursorPos);

                        edit.replace(document.uri, new vscode.Range(start, end), replacement);

                        vscode.workspace.applyEdit(edit).then(() => {
                            const activeEditor = vscode.window.activeTextEditor;
                            if (activeEditor && activeEditor.document.uri.toString() === document.uri.toString()) {
                                const pos = new vscode.Position(start.line, start.character + replacement.length);
                                activeEditor.selection = new vscode.Selection(pos, pos);
                            }
                        });
                        break;
                    }
                }
            }
        })
    );
}