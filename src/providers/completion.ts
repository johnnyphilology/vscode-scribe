import * as vscode from 'vscode';
import { WordEntry } from '../types/word-entry';
import { applyCasing } from '../utils/helpers';

/**
 * Convert w/W to wynn characters if Wynn mode is enabled
 */
function applyWynnConversion(text: string, languageId: string): string {
    if (languageId !== 'oldenglish') {
        return text;
    }
    
    const config = vscode.workspace.getConfiguration('scribe');
    const enableWynn = config.get<boolean>('oldenglish.enableWynn', false);
    
    if (enableWynn) {
        return text.replace(/w/g, 'ƿ').replace(/W/g, 'Ƿ');
    }
    
    return text;
}

/**
 * Check if typed text matches word entry, considering wynn conversion
 */
function matchesTyped(typed: string, word: string, languageId: string): boolean {
    if (!typed) {
        return true;
    }
    
    // Convert the word to wynn if needed for matching
    const convertedWord = applyWynnConversion(word, languageId);
    
    // Check if typed text matches the beginning of the word (case-insensitive)
    return convertedWord.toLowerCase().startsWith(typed.toLowerCase()) ||
           word.toLowerCase().startsWith(typed.toLowerCase());
}

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
                    // Match all Unicode letters plus special characters (works universally for all languages)
                    const regex = /([\p{L}•()]+)$/u;
                    const wordMatch = regex.exec(line.slice(0, position.character));
                    const typed = wordMatch ? wordMatch[1] : '';

                    return words
                        .filter(entry => matchesTyped(typed, entry.word, languageId))
                        .map(entry => {
                            // Convert word to wynn if needed
                            const displayWord = applyWynnConversion(entry.word, languageId);
                            
                            const item = new vscode.CompletionItem(displayWord, vscode.CompletionItemKind.Text);
                            if (entry.detail) {
                                item.detail = entry.detail;
                            }
                            if (entry.documentation) {
                                item.documentation = new vscode.MarkdownString(entry.documentation);
                            }
                            
                            // Set both the original and wynn-converted versions for filtering
                            item.label = displayWord;
                            item.filterText = displayWord;
                            
                            if (typed) {
                                // Apply casing to the wynn-converted word
                                item.insertText = applyCasing(typed, displayWord);
                                const startPos = position.translate(0, -typed.length);
                                item.range = new vscode.Range(startPos, position);
                            } else {
                                item.insertText = displayWord;
                            }
                            
                            return item;
                        });
                }
            }
        )
    );
}