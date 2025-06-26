// Pure functions extracted from providers for unit testing
// These functions don't depend on VS Code APIs

import { WordEntry } from '../types/word-entry';

/**
 * Extracts the typed word from a line of text at a given position
 * Used by completion provider
 */
export function extractTypedWord(line: string, position: number): string {
    const beforeCursor = line.slice(0, position);
    const wordMatch = beforeCursor.match(/([\p{L}]+)$/u);
    return wordMatch ? wordMatch[1] : '';
}

/**
 * Normalizes text for hover provider matching
 * Converts special characters to their common equivalents
 */
export function normalizeTextForHover(str: string): string {
    return str
        .toLowerCase()
        .replace(/æ/g, "ae")
        .replace(/ǣ/g, "ae-") 
        .replace(/þ/g, "th")
        .replace(/ð/g, "dh");
}

/**
 * Finds a word entry by normalized text matching
 */
export function findWordEntry(word: string, words: WordEntry[]): WordEntry | undefined {
    const normWord = normalizeTextForHover(word);
    return words.find(w => normalizeTextForHover(w.word) === normWord);
}

/**
 * Checks if a line should trigger marker completion
 * Tests if the text before cursor matches the marker pattern
 */
export function shouldTriggerMarkerCompletion(beforeCursor: string): boolean {
    return /^\s*[<]?\w*$/.test(beforeCursor);
}

/**
 * Finds digraph matches in text for substitution
 * Returns the matched text and its position
 */
export function findDigraphMatch(
    beforeCursor: string, 
    substitutions: { [key: string]: string }
): { match: string; digraph: string } | null {
    const maxDigraphLength = Math.max(...Object.keys(substitutions).map(s => s.length));
    const searchText = beforeCursor.substring(Math.max(0, beforeCursor.length - maxDigraphLength));
    
    // Sort digraphs by length (longest first) to find longest match
    const sortedDigraphs = Object.keys(substitutions).sort((a, b) => b.length - a.length);
    
    for (const digraph of sortedDigraphs) {
        // Escape regex chars
        const escapedDigraph = digraph.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`${escapedDigraph}$`, 'i');
        const match = searchText.match(regex);
        
        if (match) {
            return { match: match[0], digraph };
        }
    }
    
    return null;
}

/**
 * Parses rune blocks from text content
 * Returns array of found blocks with their positions and content
 */
export function parseRuneBlocks(
    text: string, 
    markers: string[]
): Array<{ marker: string; content: string; startIndex: number; endIndex: number; fullMatch: string }> {
    const blocks: Array<{ marker: string; content: string; startIndex: number; endIndex: number; fullMatch: string }> = [];
    
    // Build a regex that matches only markers from the list
    const markerPattern = markers.join('|');
    const blockRegex = new RegExp(
        `<(?<marker>${markerPattern})>(?<content>[\\s\\S]*?)</\\k<marker>>`,
        'g'
    );

    let match: RegExpExecArray | null;
    while ((match = blockRegex.exec(text)) !== null) {
        const marker = match.groups!.marker;
        const content = match.groups!.content.trim();
        const startIndex = match.index;
        const endIndex = startIndex + match[0].length;
        const fullMatch = match[0];

        blocks.push({ marker, content, startIndex, endIndex, fullMatch });
    }

    return blocks;
}

/**
 * Finds lines that should have gutter decorations
 * Returns map of tag names to line numbers
 */
export function findGutterDecorationLines(
    documentLines: string[], 
    tags: string[]
): Map<string, number[]> {
    const decorationLines = new Map<string, number[]>();
    
    // Initialize empty arrays for each tag
    tags.forEach(tag => decorationLines.set(tag, []));

    for (const tag of tags) {
        const openTag = `<${tag}>`;
        const closeTag = `</${tag}>`;
        const tagLines: number[] = [];

        let insideBlock = false;

        for (let i = 0; i < documentLines.length; i++) {
            const line = documentLines[i];

            if (!insideBlock && line.includes(openTag)) {
                insideBlock = true;
            }

            if (insideBlock) {
                tagLines.push(i);
                if (line.includes(closeTag)) {
                    insideBlock = false;
                }
            }
        }

        decorationLines.set(tag, tagLines);
    }

    return decorationLines;
}

/**
 * Creates word set for semantic token matching
 * Normalizes words to lowercase for case-insensitive matching
 */
export function createWordSet(words: string[]): Set<string> {
    return new Set(words.map(w => w.toLowerCase()));
}

/**
 * Finds semantic token positions in a line
 * Returns array of matches with their positions
 */
export function findSemanticTokens(
    line: string, 
    wordSet: Set<string>
): Array<{ word: string; start: number; length: number }> {
    const tokens: Array<{ word: string; start: number; length: number }> = [];
    const wordRegex = /[\p{L}]+/gu;
    let match;

    while ((match = wordRegex.exec(line))) {
        const raw = match[0];
        const normalized = raw.toLowerCase();
        
        if (wordSet.has(normalized)) {
            tokens.push({
                word: raw,
                start: match.index,
                length: raw.length
            });
        }
    }

    return tokens;
}
