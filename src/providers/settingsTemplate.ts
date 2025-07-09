import * as vscode from 'vscode';

/**
 * Get the custom highlight color from settings
 */
export function getHighlightColor(): string {
    const config = vscode.workspace.getConfiguration('scribe');
    return config.get<string>('completion.highlightColor', '#FFD700');
}

/**
 * Generate settings template with current configuration values
 */
export function generateSettingsTemplate(): string {
    const highlightColor = getHighlightColor();
    
    return `{
  "editor.fontFamily": "Noto Serif",
  "editor.fontSize": 16,
  "editor.fontLigatures": true,
  "editor.semanticHighlighting.enabled": true,
  "workbench.colorTheme": "Scribe Medieval Theme",
  "workbench.iconTheme": "scribe-icon-theme",
  "files.associations": {
    "*.oe": "oldenglish",
    "*.on": "oldnorse",
    "*.got": "gothic"
  },
  "scribe.enableSemanticTokens": true,
  "scribe.enableDeveloperMode": false,
  "scribe.dictionaryDataPath": "external/scribe-data/data/",
  "[oldenglish]": {
    "editor.fontFamily": "Noto Serif"
  },
  "[oldnorse]": {
    "editor.fontFamily": "Noto Serif"
  },
  "[gothic]": {
    "editor.fontFamily": "Noto Serif"
  },
  "editor.semanticTokenColorCustomizations": {
    "[Scribe Medieval Theme]": {
      "rules": {
        "wordentry": {
          "foreground": "${highlightColor}"
        },
        "wordentry.definition": {
          "foreground": "${highlightColor}",
          "fontStyle": "bold"
        }
      }
    }
  },
  "editor.tokenColorCustomizations": {
    "[Scribe Medieval Theme]": {
      "textMateRules": [
        {
          "scope": "constant.language.runes.scribe",
          "settings": {
            "foreground": "#07d00b",
            "fontStyle": "bold"
          }
        },
        {
          "scope": "constant.language.gothic.scribe",
          "settings": {
            "foreground": "#2087e7",
            "fontStyle": "bold"
          }
        },
        {
          "scope": "constant.language.medieval.scribe",
          "settings": {
            "foreground": "#9d4edd",
            "fontStyle": "bold"
          }
        },
        {
          "scope": "entity.name.tag.futhorc.scribe",
          "settings": {
            "foreground": "#FFD700"
          }
        },
        {
          "scope": "entity.name.tag.elderfuthark.scribe",
          "settings": {
            "foreground": "#D32F2F"
          }
        },
        {
          "scope": "entity.name.tag.youngerfuthark.scribe",
          "settings": {
            "foreground": "#19c819"
          }
        },
        {
          "scope": "entity.name.tag.medievalfuthark.scribe",
          "settings": {
            "foreground": "#8e24aa"
          }
        },
        {
          "scope": "entity.name.tag.gothic.scribe",
          "settings": {
            "foreground": "#2087e7"
          }
        },
        {
          "scope": "entity.name.tag.scribe",
          "settings": {
            "foreground": "#01ad29"
          }
        },
        {
          "scope": [
            "punctuation.definition.tag.begin.scribe",
            "punctuation.definition.tag.end.scribe"
          ],
          "settings": {
            "foreground": "#808080"
          }
        }
      ]
    }
  }
}`;
}
