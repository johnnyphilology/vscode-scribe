import * as vscode from "vscode";
import { MarkerCommand } from "../types/marker-command";

export function registerMarkerCompletion(
    context: vscode.ExtensionContext,
    languageId: string,
    commands: MarkerCommand[]
) {
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            languageId,
            {
                provideCompletionItems(document, position) {
                    const line = document.lineAt(position.line).text;
                    const beforeCursor = line.slice(0, position.character);

                    // Trigger only at line start or after whitespace + @ + any word chars
                    if (/^\s*[@<]?\w*$/.test(beforeCursor)) {
                        return commands.map(cmd => {
                            const item = new vscode.CompletionItem(cmd.label, vscode.CompletionItemKind.Keyword);
                            item.detail = cmd.detail;
                            item.insertText = cmd.insertText ?? cmd.label + ' ';
                            // Optionally, set the replacement range
                            item.range = new vscode.Range(position.line, 0, position.line, position.character);
                            return item;
                        });
                    }
                    return undefined;
                }
            },
            '@', '<'
        )
    );
}