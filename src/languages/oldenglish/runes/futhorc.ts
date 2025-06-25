import { stripDiacritics } from "../../../utils/helpers";

const futhorcMap: { [key: string]: string } = {
    "th": "ᚦ", "ng": "ᛝ", "ae": "ᚫ", "eo": "ᛇ",
    "a": "ᚪ", "b": "ᛒ", "c": "ᚳ", "d": "ᛞ", "e": "ᛖ", "f": "ᚠ", "g": "ᚷ",
    "h": "ᚻ", "i": "ᛁ", "l": "ᛚ", "m": "ᛗ", "n": "ᚾ", "o": "ᚩ", "p": "ᛈ",
    "r": "ᚱ", "s": "ᛋ", "t": "ᛏ", "u": "ᚢ", "w": "ᚹ", "x": "ᛉ", "y": "ᚣ",
    "þ": "ᚦ", "ð": "ᚦ"
};

export function toFuthorc(text: string): string {
    let out = "";
    let i = 0;
    text = stripDiacritics(text.toLowerCase());
    while (i < text.length) {
        let match = null;
        for (const dg of ["th", "ng", "ae", "eo"]) {
            if (text.startsWith(dg, i)) {
                match = dg;
                break;
            }
        }
        if (match) {
            out += futhorcMap[match];
            i += match.length;
            continue;
        }
        const ch = text[i];
        if (futhorcMap[ch]) {
            out += futhorcMap[ch];
        } else {
            out += ch;
        }
        i++;
    }
    return out;
}
