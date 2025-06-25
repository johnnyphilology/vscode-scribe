import * as vscode from 'vscode';
import { WordEntry } from '../types/word-entry';
import { applyCasing } from '../utils/helpers';

export function registerCompletion(
    context: vscode.ExtensionContext,
    languageId: string,
    words: WordEntry[]
) {
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            languageId,
            {
                provideCompletionItems(document, position) {
                    const line = document.lineAt(position.line).text;
                    // Unicode-aware match for any letter, including capitals/accents
                    const wordMatch = line.slice(0, position.character).match(/([\p{L}]+)$/u);
                    const typed = wordMatch ? wordMatch[1] : '';

                    return words.map(entry => {
                        const item = new vscode.CompletionItem(entry.word, vscode.CompletionItemKind.Text);
                        if (entry.detail) {item.detail = entry.detail;}
                        if (entry.documentation) {
                            item.documentation = new vscode.MarkdownString(entry.documentation);
                        }
                        // Always set filterText to ensure case-insensitive matching
                        item.label = entry.word;
                        item.filterText = entry.word;
                        if (typed) {
                            item.insertText = applyCasing(typed, entry.word);
                            const startPos = position.translate(0, -typed.length);
                            item.range = new vscode.Range(startPos, position);
                        }
                        return item;
                    });
                }
            }
        )
    );
}