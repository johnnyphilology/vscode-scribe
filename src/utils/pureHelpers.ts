// Pure utility functions that don't depend on VS Code
// These can be unit tested without the VS Code extension host

export function extractWordList(wordEntries: { word: string }[]) {
    return wordEntries.map(w => w.word);
}

export function stripDiacritics(text: string): string {
    // Normalize to decomposed form to separate base and diacritic marks
    let stripped = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Replace special Old English letters (dotted, wynn, thorn, etc.)
    // AFTER normalization, so both composed and decomposed characters are caught
    return stripped
        .replace(/[ǣǢ]/g, 'ae')
        .replace(/[æ]/g, 'ae')
        .replace(/[āă]/g, 'a')
        .replace(/[ēĕ]/g, 'e')
        .replace(/[īĭ]/g, 'i')
        .replace(/[ōŏ]/g, 'o')
        .replace(/[ūŭ]/g, 'u')
        .replace(/[ȳ]/g, 'y')
        .replace(/[ċ]/g, 'c')
        .replace(/[ġ]/g, 'g')
        .replace(/[ƿ]/g, 'w')
        .replace(/[þð]/g, 'th');
}

export function applyCasing(input: string, suggestion: string): string {
    if (input.length === 0) {return suggestion;}
    // If the entire input is uppercase, make the suggestion all uppercase
    if (input === input.toUpperCase() && input.length > 1) {return suggestion.toUpperCase();}
    // If just the first character is uppercase, capitalize only the first character of suggestion
    if (input[0] === input[0].toUpperCase()) {
        return suggestion[0].toUpperCase() + suggestion.slice(1);
    }
    // Otherwise, use the suggestion as is (lowercase)
    return suggestion;
}
