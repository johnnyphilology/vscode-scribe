/**
 * Classical Latin text transformation
 * Converts modern Latin text to classical Roman inscription style
 * Includes Roman numeral conversion for Arabic numerals
 */

/**
 * Convert Arabic numerals to Roman numerals
 * Supports numbers 1-3999 (standard Roman numeral range)
 */
function toRomanNumerals(num: number): string {
    if (num <= 0 || num >= 4000) {
        return num.toString(); // Return original if out of range
    }
    
    const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    const numerals = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
    
    let result = '';
    
    for (let i = 0; i < values.length; i++) {
        while (num >= values[i]) {
            result += numerals[i];
            num -= values[i];
        }
    }
    
    return result;
}

/**
 * Convert Arabic numerals in text to Roman numerals
 * Handles standalone numbers and numbers with common suffixes
 */
function convertArabicToRoman(text: string): string {
    // Match standalone numbers (with word boundaries)
    return text.replace(/\b(\d+)\b/g, (match, numStr) => {
        const num = parseInt(numStr, 10);
        return toRomanNumerals(num);
    });
}

/**
 * Transform text to classical Latin style:
 * - Convert to uppercase (Roman inscriptions were in capitals)
 * - Replace U with V (Classical Latin used V for both sounds)
 * - Replace J with I (J was a later medieval invention)
 * - Remove most punctuation (Classical inscriptions had minimal punctuation)
 * - Normalize spacing
 */
export function toClassicalLatin(text: string): string {
    return text
        // Convert Arabic numerals to Roman numerals first (before case conversion)
        .replace(/\b(\d+)\b/g, (match, numStr) => {
            const num = parseInt(numStr, 10);
            return toRomanNumerals(num);
        })
        // Convert to uppercase
        .toUpperCase()
        // Replace U with V (classical Latin orthography)
        .replace(/U/g, 'V')
        // Replace J with I (J is a medieval invention)
        .replace(/J/g, 'I')
        // Remove common punctuation marks (keep basic spacing)
        .replace(/[.,;:!?'"()\[\]{}]/g, '')
        // Replace multiple spaces with single space
        .replace(/\s+/g, ' ')
        // Trim leading/trailing whitespace
        .trim();
}

/**
 * Additional classical transformations that might be useful:
 * - Convert common medieval abbreviations
 * - Handle diphthongs consistently
 */
export function toClassicalLatinExtended(text: string): string {
    let result = toClassicalLatin(text);
    
    // Handle common medieval abbreviations and modernizations
    result = result
        // Convert common diphthongs to classical forms
        .replace(/AE/g, 'AE')  // Keep AE as is (already classical)
        .replace(/OE/g, 'OE')  // Keep OE as is
        // Handle word boundaries and common classical patterns
        .replace(/QU/g, 'QV')  // Classical QV instead of QU in some contexts
        // Remove hyphens and dashes
        .replace(/[-–—]/g, ' ')
        // Final cleanup
        .replace(/\s+/g, ' ')
        .trim();
    
    return result;
}

// Export the main function as default
export default toClassicalLatin;
