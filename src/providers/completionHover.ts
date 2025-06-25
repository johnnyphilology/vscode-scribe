import * as vscode from 'vscode';
import { WordEntry } from '../types/word-entry';

export function registerCompletionHover(
    context: vscode.ExtensionContext,
    languageId: string,
    words: WordEntry[]
) {
    context.subscriptions.push(
        vscode.languages.registerHoverProvider(languageId, {
            provideHover(document, position, token) {
                const range = document.getWordRangeAtPosition(position, /[\p{L}]+/u);
                if (!range) {return undefined;}

                const word = document.getText(range);

                // Normalize for case and substitutions
                const normalize = (str: string) =>
                    str
                      .toLowerCase()
                      .replace(/æ/g, "ae")
                      .replace(/ǣ/g, "ae-")
                      .replace(/þ/g, "th")
                      .replace(/ð/g, "dh");
                const normWord = normalize(word);

                let entry = words.find(
                    w => normalize(w.word) === normWord
                );

                if (!entry) {return undefined;}

                let markdown = new vscode.MarkdownString();
                if (entry.detail) {markdown.appendMarkdown(`**${entry.detail}**  \n`);}
                if (entry.documentation) {markdown.appendMarkdown(entry.documentation);}
                if (markdown.value.trim() === '') {return undefined;}

                return new vscode.Hover(markdown, range);
            }
        })
    );
}
