// Pure utility functions that don't depend on VS Code
// These can be unit tested without the VS Code extension host

export function extractWordList(wordEntries: { word: string }[]) {
    return wordEntries.map(w => w.word);
}

export function stripDiacritics(text: string): string {
    // Normalize to decomposed form to separate base and diacritic marks
    let stripped = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Only handle specific diacritical combinations that need special treatment
    // Convert macron-marked ash to regular ash, but preserve all other medieval letters
    return stripped
        .replace(/[ǣǢ]/g, 'æ'); // macron ash to regular ash
        // Note: All other medieval letters (æ, þ, ð, ƿ, ƕ, ċ, ġ) are preserved
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

/**
 * Generic rune conversion function that handles the common pattern of:
 * 1. Text preprocessing (stripDiacritics, toLowerCase)
 * 2. Longest-match-first digraph/character mapping
 * 3. Fallback to original character if no mapping exists
 * 
 * @param text - The input text to convert
 * @param runeMap - Mapping of characters/digraphs to runes
 * @param digraphs - Optional array of digraphs to prioritize (sorted by length desc)
 * @returns The converted text with runes
 */
export function convertToRunes(
    text: string, 
    runeMap: { [key: string]: string }, 
    digraphs: string[] = []
): string {
    text = stripDiacritics(text.toLowerCase());
    let out = "";
    let i = 0;
    
    // Sort digraphs by length descending to ensure longest match first
    const sortedDigraphs = digraphs.sort((a, b) => b.length - a.length);
    
    while (i < text.length) {
        let matched = false;
        
        // Check digraphs first (longest to shortest)
        for (const digraph of sortedDigraphs) {
            if (text.startsWith(digraph, i)) {
                out += runeMap[digraph];
                i += digraph.length;
                matched = true;
                break;
            }
        }
        
        if (!matched) {
            const ch = text[i];
            out += runeMap[ch] || ch;
            i++;
        }
    }
    
    return out;
}
