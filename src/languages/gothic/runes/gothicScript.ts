import { stripDiacritics } from "../../../utils/helpers";

const gothicMap: { [key: string]: string } = {
    "a": "𐌰", "b": "𐌱", "g": "𐌲", "d": "𐌳", "e": "𐌴", "q": "𐌵", "z": "𐌶",
    "h": "𐌷", "þ": "𐌸", "th": "𐌸", 
    "i": "𐌹", "k": "𐌺", "l": "𐌻", "m": "𐌼", "n": "𐌽",
    "j": "𐌾", "u": "𐌿", "p": "𐍀", "r": "𐍂", "s": "𐍃", "t": "𐍄", "w": "𐍅",
    "f": "𐍆", "x": "𐍇", "o": "𐍉", "hv": "𐍈", "ƕ": "𐍈"
};


export function toGothic(text: string): string {
    let out = "";
    text = stripDiacritics(text.toLowerCase());
    for (const char of text) {
        out += gothicMap[char] || char;
    }
    return out;
}
