import { convertToRunes } from "../../../utils/pureHelpers";

const futhorcMap: { [key: string]: string } = {
    "th": "ᚦ", "ng": "ᛝ", "ae": "ᚫ", "eo": "ᛇ",
    "a": "ᚪ", "b": "ᛒ", "c": "ᚳ", "d": "ᛞ", "e": "ᛖ", "f": "ᚠ", "g": "ᚷ",
    "h": "ᚻ", "i": "ᛁ", "l": "ᛚ", "m": "ᛗ", "n": "ᚾ", "o": "ᚩ", "p": "ᛈ",
    "r": "ᚱ", "s": "ᛋ", "t": "ᛏ", "u": "ᚢ", "w": "ᚹ", "x": "ᛉ", "y": "ᚣ",
    "þ": "ᚦ", "ð": "ᚦ"
};

const futhorcDigraphs = ["th", "ng", "ae", "eo"];

export function toFuthorc(text: string): string {
    return convertToRunes(text, futhorcMap, futhorcDigraphs);
}
