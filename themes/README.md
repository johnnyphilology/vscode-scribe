# Scribe Theme

The Scribe theme is specifically designed for medieval language scholars and enthusiasts working with Old English, Old Norse, and Gothic texts.

## Features

### 🎨 **Color Scheme**
- **Dark background** optimized for long reading sessions
- **Warm, scholarly colors** that reduce eye strain
- **High contrast** for excellent readability

### 📜 **Medieval Text Highlighting**
- **Runic text** (Elder/Younger Futhark, Futhorc, Medieval) - Bright green (`#07d00b`)
- **Gothic script** - Blue (`#2087e7`) 
- **Medieval letters** (æ, þ, ð, ƿ, ȝ, etc.) - Purple (`#9d4edd`)
- **Word entries** - Gold (`#FFD700`) with semantic highlighting
- **Script-specific tags** (colors match SVG icons):
  - **`<Futhorc>`** - Gold (`#FFD700`)
  - **`<ElderFuthark>`** - Red (`#D32F2F`)
  - **`<YoungerFuthark>`** - Green (`#19c819`)
  - **`<MedievalFuthark>`** - Purple (`#8e24aa`)
  - **`<Gothic>`** - Blue (`#2087e7`)
  - **Other tags** - Default green (`#01ad29`)

### 📁 **Custom File Icons**
- **`.oe` files** - Futhorc rune icon (ᚫ) in gold
- **`.on` files** - Elder Futhark rune icon (ᚠ) in red  
- **`.got` files** - Gothic script icon (𐌸) in blue

### 🔧 **Setup Instructions**

#### Step 1: Activate the Theme & Icons
1. Install the Scribe extension
2. Open VS Code settings (Ctrl/Cmd + ,)
3. Go to **Appearance** → **Color Theme** → Select **"Scribe"**
4. Go to **Appearance** → **File Icon Theme** → Select **"Scribe Icons"**
4. Select **"Scribe"** from the list

#### Step 2: Enable Semantic Token Colors (Required for word highlighting)
Add this to your VS Code `settings.json`:

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

#### Step 3: Optional Font Recommendation
For the best scholarly experience:
```json
{
  "editor.fontFamily": "Noto Serif",
  "editor.fontSize": 16,
  "editor.fontLigatures": true
}
```

> **Note:** Font ligatures help display certain character combinations more naturally, which can be beneficial when working with medieval texts that use special character combinations.

### 📝 **Perfect for:**
- Old English manuscripts and texts
- Old Norse sagas and poetry  
- Gothic biblical translations
- Runic inscriptions and transliterations
- Medieval language research and study

### 💡 **Pro Tip**
See `themes/scribe-settings.json` in the extension folder for a complete settings template you can copy to your VS Code settings.
