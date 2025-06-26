import { convertToRunes } from "../../../utils/pureHelpers";

const elderMap: { [key: string]: string } = {
    "f": "ᚠ",  // fehu
    "u": "ᚢ",  // uruz
    "þ": "ᚦ",  // thurisaz
    "th": "ᚦ", // allow Latin digraph for thorn
    "a": "ᚨ",  // ansuz
    "r": "ᚱ",  // raido
    "k": "ᚲ",  // kaunan
    "g": "ᚷ",  // gebo
    "w": "ᚹ",  // wunjo
    "h": "ᚺ",  // hagalaz
    "n": "ᚾ",  // naudiz
    "i": "ᛁ",  // isa
    "j": "ᛃ",  // jera
    "eo": "ᛇ", // eihwaz (or "ïwaz")
    "p": "ᛈ",  // pertho
    "z": "ᛉ",  // algiz (or sometimes "x")
    "s": "ᛊ",  // sowilo
    "t": "ᛏ",  // tiwaz
    "b": "ᛒ",  // berkanan
    "e": "ᛖ",  // ehwaz
    "m": "ᛗ",  // mannaz
    "l": "ᛚ",  // laguz
    "ng": "ᛝ", // ingwaz
    "d": "ᛞ",  // dagaz
    "o": "ᛟ",  // othala
    // Common Latin overlap/extensions for input:
    "c": "ᚲ",  // same as k
    "q": "ᚲ",  // same as k
    "v": "ᚹ",  // same as w
    "y": "ᛇ",  // often mapped to eihwaz
    "æ": "ᚨ",  // closest: ansuz (or custom)
    "ä": "ᚨ",  // ansuz
    "ö": "ᛟ",  // othala
    "ø": "ᛟ",  // othala
    "x": "ᛉ",  // algiz
    // Add more for your preferences
};

const elderDigraphs = ["ng", "th", "eo"];

export function toElderFuthark(text: string): string {
    return convertToRunes(text, elderMap, elderDigraphs);
}
