import { stripDiacritics } from "../../../utils/pureHelpers";

const gothicMap: { [key: string]: string } = {
    "þ": "𐌸", "th": "𐌸", "a": "𐌰", "b": "𐌱", "g": "𐌲", "d": "𐌳", 
    "e": "𐌴", "q": "𐌵", "z": "𐌶", "h": "𐌷", "i": "𐌹", "k": "𐌺", 
    "l": "𐌻", "m": "𐌼", "n": "𐌽", "j": "𐌾", "u": "𐌿", "p": "𐍀",
    "r": "𐍂", "s": "𐍃", "t": "𐍄", "w": "𐍅", "f": "𐍆", "x": "𐍇", 
    "o": "𐍉", "hv": "𐍈", "ƕ": "𐍈"
};

export function toGothic(text: string): string {
    text = stripDiacritics(text.toLowerCase());
    let out = "";
    let i = 0;
    while (i < text.length) {
        // Try to match the longest possible sequence first (digraphs like "hv", "th", "ƕ")
        let twoChar = text.substring(i, i + 2);
        if (gothicMap[twoChar]) {
            out += gothicMap[twoChar];
            i += 2;
            continue;
        }
        let oneChar = text[i];
        out += gothicMap[oneChar] || oneChar;
        i += 1;
    }
    return out;
}

