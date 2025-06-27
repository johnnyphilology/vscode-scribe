# Scribe
A scholarly Visual Studio Code extension that aids in writing medieval languages.

<img src="https://raw.githubusercontent.com/johnnyphilology/scribe/refs/heads/main/doc/scribe.png" width="400"/>

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/johnnyphilology/scribe/ci.yml?branch=main&style=for-the-badge)
![Sonar Quality Gate](https://img.shields.io/sonar/quality_gate/johnnyphilology_scribe?server=https%3A%2F%2Fsonarcloud.io&style=for-the-badge&logo=sonarqubecloud)
![Visual Studio Code](https://img.shields.io/badge/Visual%20Studio%20Code-0078d7.svg?style=for-the-badge&logo=visual-studio-code&logoColor=white)
![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/johnnyphilology.scribe?include_prereleases&style=for-the-badge)


## Status
_Scribe_ is currently **pre-release** at version `0.3.0`, but you are free to evalute it and give feedback!

## 🎨 Scribe Theme

Scribe includes a beautiful custom theme specifically designed for medieval language work:

- **Dark scholarly theme** optimized for reading medieval texts
- **Enhanced syntax highlighting** for runic text, Gothic script, and medieval letters
- **Semantic token support** for word definitions and glossaries
- **Reduced eye strain** with warm, professional colors

### Quick Setup:
1. **Install Scribe extension**
2. **Set theme**: Preferences → Color Theme → "Scribe"
3. **Get settings template**: 
   - **Command Palette** (`Ctrl/Cmd+Shift+P`) → "📋 Insert Scribe Settings Template"
   - **Or keyboard shortcut**: `Alt+Shift+S` (in JSON files)
   - **Or manually add** to settings.json:
```json
{
  "editor.semanticHighlighting.enabled": true,
  "workbench.colorTheme": "Scribe",
  "editor.semanticTokenColorCustomizations": {
    "[Scribe]": {
      "rules": {
        "wordentry": {
          "foreground": "#FFD700",
          "fontStyle": "italic"
        }
      }
    }
  }
}
```

## Language Features

## ⌨️ Autocomplete

Added basic functionality for autocomplete while typing.  Popups include definition and documentation.

- **Old English:** 772 common words
- **Old Norse:** 36,847 words
- **Gothic:** 110 common words

## Languages

### Old English (Anglo-Saxon)

#### Anglo-Saxon Letter Substitution Guide

To make it easy to type Old English (Anglo-Saxon) text using a modern keyboard, this project automatically converts certain letter sequences into their correct historical characters and diacritics.

#### How It Works

When you type the following combinations, they are automatically replaced with the correct Old English letters:

| Input     | Output | Description                                 |
|-----------|--------|---------------------------------------------|
| `th`      | þ      | **Thorn**: Represents "th" as in *thin*     |
| `dh`      | ð      | **Eth**: Represents "th" as in *this*       |
| `ae`, `æ` | æ      | **Ash**: Single-letter vowel                |
| `ae-`, `æ-` | ǣ    | **Long Ash**: "æ" with macron (long vowel)  |
| `oe`, `œ` | œ      | **Oe Ligature**: Used in some loanwords     |
| `c'`, `cʼ` | ċ      | **Dot C**: Palatalized "c"                  |
| `g'`, `gʼ` | ġ      | **Dot G**: Palatalized "g"                  |
| `ge-`     | ġe-    | **Palatal "ge-"**: Used for palatalized "ge-"|
| `wynn`    | ƿ      | **Wynn**: Early "w" character               |
| `a-`      | ā      | **Long A**: "a" with macron (long vowel)    |
| `e-`      | ē      | **Long E**: "e" with macron                 |
| `i-`      | ī      | **Long I**: "i" with macron                 |
| `o-`      | ō      | **Long O**: "o" with macron                 |
| `u-`      | ū      | **Long U**: "u" with macron                 |
| `y-`      | ȳ      | **Long Y**: "y" with macron                 |

#### Example Usage
Typing this:

```text
Thaet c'ild bearn waes aefter wynnfullum daegum.
```

Becomes:

```text
Þæt ċild bearn wæs æfter ƿynnfullum dægum.
```

### Old Norse

#### Old Norse Letter Substitution Guide

This project allows you to type Old Norse using a modern keyboard. The following substitutions are performed automatically to produce the correct Old Norse characters and diacritics:

| Input     | Output | Description                                           |
|-----------|--------|-------------------------------------------------------|
| `th`      | þ      | **Thorn**: "th" as in *thin* (voiceless)             |
| `dh`      | ð      | **Eth**: "th" as in *this* (voiced)                   |
| `a'`      | á      | **A with acute**: long "a"                            |
| `e'`      | é      | **E with acute**: long "e"                            |
| `i'`      | í      | **I with acute**: long "i"                            |
| `o'`      | ó      | **O with acute**: long "o"                            |
| `u'`      | ú      | **U with acute**: long "u"                            |
| `y'`      | ý      | **Y with acute**: long "y"                            |
| `ae`      | æ      | **Ash**: front vowel "ae"                             |
| `oe`      | œ      | **Oe ligature**: front rounded vowel                  |
| `o/`      | ø      | **O with stroke**: front rounded vowel                |
| `o_`      | ǫ      | **O with ogonek**: "open o" or rounded "a"           |
| `c'`      | ç      | **C with cedilla**: rare, but occurs in loanwords     |
| `g'`      | ǥ      | **G with stroke**: archaic/phonetic in some dialects  |
| `k'`      | ǩ      | **K with caron**: used in some reconstructions        |
| `ae-`     | ǣ      | **Long Ash**: "æ" with macron (long vowel)           |
| `oe-`     | œ̄     | **Long Oe**: "œ" with macron (long vowel)             |
| `ss`      | ß      | **Eszett**: "ss" ligature, mostly in loanwords        |

#### Example Usage

Typing this:

```text
thae k'ona var a' mikill maðr ok o_ll e'ygð
```

Becomes:

```text
þæ ǩona var á mikill maðr ok ǫll éygð
```

### Gothic

#### Gothic Letter Substitution Guide

This project enables easy typing of the Gothic alphabet using a modern keyboard. The following substitutions are automatically performed:

| Input | Output | Description                               |
|-------|--------|-------------------------------------------|
| `th`  | þ      | **Thorn**: Represents the Gothic "þ" sound|
| `hv`  | ƕ      | **Hwair**: Represents the Gothic "ƕ" sound|

#### Example Usage

Typing this:

```text
Jah hvaiwa is thatei hvam thamma
```

Becomes:

```text
Jah ƕaiwa is þatei ƕam þamma
```

## Ancient Writing System Support

### Runes
The following runic writing systems are fully supported:
- Elder Futhark (Proto Germanic)
- Younger Futhark (Old Norse)
- Medieval Futhark (Old Norse & Old Scandinavian languages)
- Futhorc (Old English aka. Anglo-Saxon, Old Frisian)

### Gothic Script
- Wulifia's Gothic writing system for the Gothic Bible.

### Transliteration Tags
These tags work similar to XML where anything inside of `<Tag></Tag>` gets transliterated into the desired writing sysytem.  The following tags are available:

- `<Futhorc>`
- `<YoungerFuthark>`
- `<ElderFuthark>`
- `<MedievalFuthark>`
- `<Gothic>`

#### Opening to Bēowulf

```xml
<Futhorc>
Hwæt! Wē Gār-Dena in ġēardagum,
þēodcyninga, þrym ġefrūnon,
hū þā æþelingas ellen fremedon.
Oft Scyld Scēfing sceaþena þrēatum,
monegum mægþum, meodosetla oftēah,
egsode eorlas syððan ǣrest wearð
fēasceaft funden; hē þæs frōfre ġebād,
wēox under wolcnum, weorðmyndum þāh,
oþþæt him ǣghwylc þāra ymbsittendra
ofer hronrāde hyran scolde,
gomban gyldan; þæt wæs gōd cyning!
</Futhorc>
```

ALT+R →

```
ᚻᚹᚫᛏ! ᚹᛖ ᚷᚪᚱ-ᛞᛖᚾᚪ ᛁᚾ ᚷᛖᚪᚱᛞᚪᚷᚢᛗ,
ᚦᛇᛞᚳᚣᚾᛁᛝᚪ, ᚦᚱᚣᛗ ᚷᛖᚠᚱᚢᚾᚩᚾ,
ᚻᚢ ᚦᚪ ᚫᚦᛖᛚᛁᛝᚪᛋ ᛖᛚᛚᛖᚾ ᚠᚱᛖᛗᛖᛞᚩᚾ.
ᚩᚠᛏ ᛋᚳᚣᛚᛞ ᛋᚳᛖᚠᛁᛝ ᛋᚳᛖᚪᚦᛖᚾᚪ ᚦᚱᛖᚪᛏᚢᛗ,
ᛗᚩᚾᛖᚷᚢᛗ ᛗᚫᚷᚦᚢᛗ, ᛗᛇᛞᚩᛋᛖᛏᛚᚪ ᚩᚠᛏᛖᚪᚻ,
ᛖᚷᛋᚩᛞᛖ ᛇᚱᛚᚪᛋ ᛋᚣᚦᚦᚪᚾ ᚫᚱᛖᛋᛏ ᚹᛖᚪᚱᚦ
ᚠᛖᚪᛋᚳᛖᚪᚠᛏ ᚠᚢᚾᛞᛖᚾ; ᚻᛖ ᚦᚫᛋ ᚠᚱᚩᚠᚱᛖ ᚷᛖᛒᚪᛞ,
ᚹᛇᛉ ᚢᚾᛞᛖᚱ ᚹᚩᛚᚳᚾᚢᛗ, ᚹᛇᚱᚦᛗᚣᚾᛞᚢᛗ ᚦᚪᚻ,
ᚩᚦᚦᚫᛏ ᚻᛁᛗ ᚫᚷᚻᚹᚣᛚᚳ ᚦᚪᚱᚪ ᚣᛗᛒᛋᛁᛏᛏᛖᚾᛞᚱᚪ
ᚩᚠᛖᚱ ᚻᚱᚩᚾᚱᚪᛞᛖ ᚻᚣᚱᚪᚾ ᛋᚳᚩᛚᛞᛖ,
ᚷᚩᛗᛒᚪᚾ ᚷᚣᛚᛞᚪᚾ; ᚦᚫᛏ ᚹᚫᛋ ᚷᚩᛞ ᚳᚣᚾᛁᛝ!
```

#### The Lord's Prayer in Gothic

```xml
<Gothic>
Atta unsar, þu in himinam,
weihnai namo þein.
qimai þiudinassus þeins.
wairþai wilja þeins,
swe in himina jah ana airþai.
hlaif unsarana þana sinteinan gif uns himma daga.
jah aflet uns þatei skulans sijaima,
swaswe jah weis afletam þaim skulam unsaraim.
jah ni briggais uns in fraistubnjai,
ak lausei uns af þamma ubilin.
unte þeina ist þiudangardi jah mahts jah wulþus in aiwins.
Amen.
</Gothic>
```

ALT+R →

```
𐌰𐍄𐍄𐌰 𐌿𐌽𐍃𐌰𐍂, 𐌸𐌿 𐌹𐌽 𐌷𐌹𐌼𐌹𐌽𐌰𐌼,
𐍅𐌴𐌹𐌷𐌽𐌰𐌹 𐌽𐌰𐌼𐍉 𐌸𐌴𐌹𐌽.
𐌵𐌹𐌼𐌰𐌹 𐌸𐌹𐌿𐌳𐌹𐌽𐌰𐍃𐍃𐌿𐍃 𐌸𐌴𐌹𐌽𐍃.
𐍅𐌰𐌹𐍂𐌸𐌰𐌹 𐍅𐌹𐌻𐌾𐌰 𐌸𐌴𐌹𐌽𐍃,
𐍃𐍅𐌴 𐌹𐌽 𐌷𐌹𐌼𐌹𐌽𐌰 𐌾𐌰𐌷 𐌰𐌽𐌰 𐌰𐌹𐍂𐌸𐌰𐌹.
𐌷𐌻𐌰𐌹𐍆 𐌿𐌽𐍃𐌰𐍂𐌰𐌽𐌰 𐌸𐌰𐌽𐌰 𐍃𐌹𐌽𐍄𐌴𐌹𐌽𐌰𐌽 𐌲𐌹𐍆 𐌿𐌽𐍃 𐌷𐌹𐌼𐌼𐌰 𐌳𐌰𐌲𐌰.
𐌾𐌰𐌷 𐌰𐍆𐌻𐌴𐍄 𐌿𐌽𐍃 𐌸𐌰𐍄𐌴𐌹 𐍃𐌺𐌿𐌻𐌰𐌽𐍃 𐍃𐌹𐌾𐌰𐌹𐌼𐌰,
𐍃𐍅𐌰𐍃𐍅𐌴 𐌾𐌰𐌷 𐍅𐌴𐌹𐍃 𐌰𐍆𐌻𐌴𐍄𐌰𐌼 𐌸𐌰𐌹𐌼 𐍃𐌺𐌿𐌻𐌰𐌼 𐌿𐌽𐍃𐌰𐍂𐌰𐌹𐌼.
𐌾𐌰𐌷 𐌽𐌹 𐌱𐍂𐌹𐌲𐌲𐌰𐌹𐍃 𐌿𐌽𐍃 𐌹𐌽 𐍆𐍂𐌰𐌹𐍃𐍄𐌿𐌱𐌽𐌾𐌰𐌹,
𐌰𐌺 𐌻𐌰𐌿𐍃𐌴𐌹 𐌿𐌽𐍃 𐌰𐍆 𐌸𐌰𐌼𐌼𐌰 𐌿𐌱𐌹𐌻𐌹𐌽.
𐌿𐌽𐍄𐌴 𐌸𐌴𐌹𐌽𐌰 𐌹𐍃𐍄 𐌸𐌹𐌿𐌳𐌰𐌽𐌲𐌰𐍂𐌳𐌹 𐌾𐌰𐌷 𐌼𐌰𐌷𐍄𐍃 𐌾𐌰𐌷 𐍅𐌿𐌻𐌸𐌿𐍃 𐌹𐌽 𐌰𐌹𐍅𐌹𐌽𐍃.
𐌰𐌼𐌴𐌽.
```

## [AGPLv3 License](./LICENSE)
