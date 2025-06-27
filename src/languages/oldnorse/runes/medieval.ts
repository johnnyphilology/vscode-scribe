import { convertToRunes } from "../../../utils/pureHelpers";

const medievalMap: { [key: string]: string } = {
    "a": "ᛆ", // medieval a
    "b": "ᛒ",
    "c": "ᛍ", // Not standard, but sometimes used
    "d": "ᛑ",
    "e": "ᛂ",
    "f": "ᚠ",
    "g": "ᚵ",
    "h": "ᚼ",
    "i": "ᛁ",
    "j": "ᛃ",
    "k": "ᚴ",
    "l": "ᛚ",
    "m": "ᛘ",
    "n": "ᚿ",
    "o": "ᚮ",
    "p": "ᛔ",
    "q": "ᛩ", // Rare, used for Latin "q"
    "r": "ᚱ",
    "s": "ᛋ",
    "t": "ᛐ",
    "u": "ᚢ",
    "v": "ᚡ", // sometimes "w" also
    "w": "ᚥ",
    "x": "ᛪ",
    "y": "ᚤ",
    "z": "ᛎ",
    "æ": "ᛅ",
    "ø": "ᚯ",
    "þ": "ᚦ",
    "ð": "ᚦ", // eth maps to thorn in medieval runes
    // Add digraphs if you like, e.g. ng, or for dialectal purposes.
};

export function toMedievalRunes(text: string): string {
    return convertToRunes(text, medievalMap);
}
