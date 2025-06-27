import { convertToRunes } from "../../../utils/pureHelpers";

const youngerMap: { [key: string]: string } = {
    "f": "ᚠ",  // fé
    "u": "ᚢ",  // úr
    "þ": "ᚦ",  // þurs
    "ð": "ᚦ",  // eth maps to þurs (same phonetic family)
    "o": "ᚬ",  // óss (sometimes also a)
    "a": "ᛅ",  // áss
    "r": "ᚱ",  // reið
    "k": "ᚴ",  // kaun
    "h": "ᚼ",  // hagall
    "n": "ᚾ",  // nauðr
    "i": "ᛁ",  // íss
    "s": "ᛋ",  // sól
    "t": "ᛏ",  // týr
    "b": "ᛒ",  // bjarkan
    "m": "ᛘ",  // maðr
    "l": "ᛚ",  // lögr
    "y": "ᛦ",  // ýr
    // Non-standard or manuscript variants (optional)
    "e": "ᛅ",  // Often mapped to áss
    "d": "ᚦ",  // Sometimes þurs (þ), as d was not originally distinct
    "g": "ᚴ",  // Often k/kaun, or use "g" as "k"
    "w": "ᚢ",  // úr (same as u)
    "æ": "ᛅ",  // áss (or sometimes ᚬ/ᛅ for vowel ligatures)
    "ø": "ᚬ",  // óss
    "j": "ᛁ",  // íss (same as i)
    // Scholar extensions for rare cases:
    "p": "ᛒ",  // no unique Younger Futhark rune for p, often bjarkan/b
    "q": "ᚴ",  // kaun (same as k)
    "c": "ᚴ",  // kaun (same as k)
    "x": "ᚴᛋ",// k+s, not a unique rune
    "z": "ᛋ",  // sól
    "ng": "ᛘ", // sometimes used for nasal m
};

const youngerDigraphs = ["ng"];

export function toYoungerFuthark(text: string): string {
    return convertToRunes(text, youngerMap, youngerDigraphs);
}