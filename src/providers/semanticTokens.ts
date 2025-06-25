import * as vscode from 'vscode';

export function registerWordEntrySemanticTokens(
    context: vscode.ExtensionContext,
    languageId: string,
    words: string[]
) {
    const legend = new vscode.SemanticTokensLegend(['wordentry']);

    context.subscriptions.push(
        vscode.languages.registerDocumentSemanticTokensProvider(
            { language: languageId },
            new class implements vscode.DocumentSemanticTokensProvider {
                provideDocumentSemanticTokens(document: vscode.TextDocument) {
                    const builder = new vscode.SemanticTokensBuilder(legend);

                    // Preprocess words for fast lookup, case-insensitive
                    const wordSet = new Set(words.map(w => w.toLowerCase()));

                    for (let lineNum = 0; lineNum < document.lineCount; ++lineNum) {
                        const line = document.lineAt(lineNum).text;
                        // Unicode-aware split (matches words only)
                        const wordRegex = /[\p{L}]+/gu;
                        let match;
                        while ((match = wordRegex.exec(line))) {
                            const raw = match[0];
                            // Normalize for lookup (add your own rules as needed)
                            const normalized = raw.toLowerCase();
                            if (wordSet.has(normalized)) {
                                builder.push(
                                    lineNum,
                                    match.index,
                                    raw.length,
                                    legend.tokenTypes.indexOf('wordentry'),
                                    0 // no modifiers
                                );
                            }
                        }
                    }

                    return builder.build();
                }
            },
            legend
        )
    );
}
