# Change Log

## [1.0.0] - 2025-07-09
**Initial Release of `v1.0.0`**

🚀 **MAJOR Release:** `0.8.1` → `1.0.0`

### ✨ Added
- Full Old English collection of words

### 🔄 Changed
- Storing data externally in https://github.com/johnnyphilology/vscode-scribe-data

### 🔧 Fixed
- Semantic filters had issues for special characters
- Bugs and defects in web views

## [0.8.1] - 2025-07-08
**Adding several OE words**

🚀 **PATCH Release:** `0.8.0` → `0.8.1`

### ✨ Added
- A dozen or so OE words

## [0.8.0] - 2025-06-30
**Wynn mode improvements and DEV mode fixes**

🚀 **MINOR Release:** `0.7.3` → `0.8.0`

### ✨ Added
- Ability to auto reload development window when toggling wynn mode

### 🔧 Fixed
- Autocomplete now will do a correct search for wynn instead of 'w'
- When selecting a word it will use a semantic token with wynn vs. regular 'w'

## [0.7.3] - 2025-06-29
**Very small patch to escape Release notes.**

🚀 **PATCH Release:** `0.7.2` → `0.7.3`

### 🔧 Fixed
- Release notes weren't escaping backticks so information wasn't properly handled in Github

## [0.7.2] - 2025-06-29
**Resolving small issue with Auto-Merge**

🚀 **PATCH Release:** `0.7.1` → `0.7.2`

### 🔧 Fixed
- Small `gh` CLI issue (This only impacts Developer Mode)

## [0.7.1] - 2025-06-29
**Fixing Auto-Merge**

🚀 **PATCH Release:** `0.7.0` → `0.7.1`

### 🔧 Fixed
- Issues solved for `gh` commands for Auto Merge (Developer Mode)

## [0.7.0] - 2025-06-29
**Adding Gothic words from Wright's Gothic Primer (1910) & Adding Changelog Automation**

🚀 **MINOR Release:** `0.6.1` → `0.7.0`

### ✨ Added
- Gothic now has `2368` new words.
- Changelog fields now inside Webview for Developer mode.

### 🔄 Changed
- Removed `100` basic Gothic words for much improved glossary words with definitions and documentation.

## [0.6.1] - 2025-06-28

### Fixed
- **🛠️ Auto Release Webview** - Fixed for developer mode

## [0.6.0] - 2025-06-28
**🎉 Minor Release: Developer Tools & Modular Architecture**

This release introduces comprehensive developer tooling, modular architecture improvements, and enhanced testing infrastructure. The extension now features interactive webviews for common development tasks, configurable settings, and a robust testing framework ready for CI/CD.

### Added
- **🛠️ Developer Mode** - New `scribe.developerMode` setting enabling advanced features for extension development
- **📝 Add Word Webview** - Interactive interface for adding new words to medieval language dictionaries
- **🔄 Auto-Merge Webview** - Developer tool for automating GitHub pull request merges with configurable settings
- **🚀 Auto-Release Webview** - Comprehensive release management interface with status checking, prerequisites validation, and full automated workflow (PR creation → CI wait → auto-merge → GitHub release). Accessible via `Alt+Shift+R` or 🚀 toolbar button.
- **📈 Version Bump Webview** - Streamlined semantic versioning interface with patch/minor/major options and auto-confirmation
- **⚙️ Workspace Settings Generator** - Command to create pre-configured VS Code workspace settings for medieval language projects
- **🎨 Theme Manager** - Modular theme activation and management system
- **📊 Configuration Manager** - Centralized configuration handling for all extension settings
- **🔧 Enhanced Developer Tooling** - Improved Makefile with colorful help, Zsh autocomplete, and organized dev scripts

### Changed  
- **🏗️ Modularized Extension Architecture** - Refactored `extension.ts` into specialized provider modules for better maintainability
- **📂 Configurable Data Paths** - Dictionary data path now configurable via `scribe.dataPath` setting (default: "data")
- **🎛️ Command Visibility** - Developer commands now properly gated behind developer mode setting
- **📜 Enhanced Scripts** - Version bump script now accepts command-line arguments for non-interactive automation
- **🧪 Comprehensive Testing** - Complete rewrite of test infrastructure with unit and integration test separation

### Fixed
- **🐛 Test Interface Compatibility** - Resolved BDD vs TDD test syntax conflicts in integration tests
- **🔧 VS Code API Safety** - Added proper API availability checks for CI/CD environments  
- **🧹 Sinon Stubbing Issues** - Fixed test cleanup and mocking conflicts in webview tests
- **⚡ TypeScript Compilation** - Resolved all compilation errors and improved type safety
- **🚀 CI/CD Robustness** - Enhanced test runner with proper error handling and environment detection
- **🌐 Web Extension Compatibility** - Replaced Node.js `child_process` usage with VS Code Git extension API for cross-platform support

## [0.5.1] - 2025-06-28
### Testing Auto Release
- **Testing auto-release workflow** - This is a test release to verify the automated release process
- **Updated Makefile** to include `release` target for automated releases

## [0.5.0] - 2025-06-27
### ⚙️ **New Configuration Settings**
- **Theme auto-activation** - `scribe.theme.autoActivate` setting to automatically enable Scribe theme on extension load (enabled by default)
- **Custom highlight colors** - `scribe.completion.highlightColor` setting to customize word entry highlighting color (default: `#FFD700`)
- **Old English wynn conversion** - `scribe.oldenglish.enableWynn` setting to automatically convert all "w" letters to wynn (ƿ) in Old English text (disabled by default)

### ⚙️ **Enhanced Settings Access**
- **Editor toolbar button** - Added **⚙️ gear icon** in editor toolbar for medieval language files (`.oe`, `.on`, `.got`) that opens Scribe settings directly
- **Command palette integration** - Added "⚙️ Scribe Settings" command for quick access to configuration
- **Contextual availability** - Settings button only appears when working with medieval language files

### 🔄 **Dynamic Configuration**
- **Real-time settings updates** - Configuration changes are detected and applied automatically
- **Smart reload prompts** - Extension prompts for window reload when needed for settings that require restart
- **Settings template integration** - Settings insertion command now uses current configuration values
- **Configuration validation** - Proper TypeScript typing and validation for all settings

### 📚 **Enhanced Documentation**
- **Comprehensive settings guide** - Added detailed configuration section to README.md
- **Settings UI integration** - All settings now accessible through VS Code's standard settings interface
- **Setting descriptions** - Clear descriptions and default values for all configuration options

### 🛠️ **Technical Improvements**
- **Type safety** - Fixed TypeScript compilation errors in dynamic substitution handling
- **Configuration listeners** - Added workspace configuration change detection for real-time updates
- **Better error handling** - Improved error messages and user feedback for configuration changes
- **Command refactoring** - Renamed `convertRunesBlocks` to `convertLanguageBlocks` for better clarity

### 🚀 **Developer Automation**
- **Auto-release script** - Complete automated workflow: PR creation → CI wait → auto-merge → GitHub release
- **Auto-merge script** - Simple PR creation with auto-merge for feature branches
- **GitHub CLI integration** - Full `gh` command integration for streamlined workflows
- **CI monitoring** - Intelligent waiting for SonarQube and test checks to pass
- **Release automation** - Automatic GitHub releases with changelog-based release notes

### Added
- **Developer automation scripts**:
  - **Version bump script** (`npm run version-bump`) - Interactive semantic versioning with package.json, README.md, and CHANGELOG.md updates
  - **Word addition script** (`npm run add-word`) - Interactive tool for adding new dictionary entries with duplicate detection and merge capabilities

## [0.4.0] 
### 🎨 **New Scribe Theme & Styling**
- **Script-specific tag colors** - Each rune script now has its own distinctive color matching SVG icons:
  - **`<Futhorc>`** - Gold (`#FFD700`)
  - **`<ElderFuthark>`** - Red (`#D32F2F`)
  - **`<YoungerFuthark>`** - Green (`#19c819`)
  - **`<MedievalFuthark>`** - Purple (`#8e24aa`)
  - **`<Gothic>`** - Blue (`#2087e7`)
- **Refined typography** - Removed bold styling from tag names and italic styling from word entries for cleaner appearance
- **Consistent color scheme** - Gothic script characters now match Gothic tag colors (both blue)
- **Custom file icon theme** - "Scribe Icons" theme with medieval language file icons:
  - **`.oe` files** - Futhorc rune icon (ᚫ) in gold
  - **`.on` files** - Elder Futhark rune icon (ᚠ) in red
  - **`.got` files** - Gothic script icon (𐌸) in blue

### ⚙️ **New Settings Management**
- **Settings insertion command** - New `📋 Insert Scribe Settings Template` command for easy setup
- **Keyboard shortcut** - `Alt+Shift+S` to quickly insert complete settings template
- **Language-specific font settings** - Added font family configuration for medieval language files (`.oe`, `.on`, `.got`)
- **Complete settings template** - Includes all current colors, semantic highlighting, and font recommendations

### 🔧 **Improved User Experience**
- **Contextual commands** - Settings insertion only available when editing files (prevents errors)
- **Better command organization** - Improved command titles and descriptions in Command Palette
- **Enhanced visual feedback** - Clear success messages when inserting settings

### 🛠️ **Technical Enhancements**
- **Cleaner code organization** - Separated settings template generation into dedicated function
- **Improved error handling** - Better validation and user feedback for edge cases
- **Performance optimization** - More efficient settings template generation and insertion

## [0.3.0]
### ⭐ **New Language Support**
- **Gothic Language** - Full support for Gothic script with dedicated `.got` file extension
- **Gothic completions** - Auto-complete suggestions for common Gothic words and phrases
- **Gothic rune conversion** - Convert Latin text to Gothic script using `<Gothic>` tags
- **Gothic syntax highlighting** - Proper highlighting for Gothic language constructs

### 🔧 **Enhanced Rune Features**
- **Medieval Futhark support** - Added `<MedievalFuthark>` conversion for medieval runic inscriptions
- **Extended rune mappings** - Improved character mappings for all runic scripts
- **Better rune display** - Enhanced rendering and font support for runic characters

### 📝 **Completion Improvements**
- **Cross-language completions** - Shared completions for common medieval terms
- **Context-aware suggestions** - Smarter completion triggers based on file content
- **Performance optimization** - Faster completion loading and processing

### 🎨 **Visual Enhancements**
- **Improved syntax highlighting** - Better color schemes for medieval language constructs
- **Enhanced word entry styling** - More distinctive highlighting for dictionary entries
- **Gothic script styling** - Specialized styling for Gothic language elements

## [0.2.0]
### 🌍 **Multi-Language Foundation**
- **Old Norse language support** - Full language support with `.on` file extension
- **Old Norse completions** - Auto-complete for Old Norse vocabulary and phrases
- **Old Norse rune conversion** - Support for `<ElderFuthark>` and `<YoungerFuthark>` tags
- **Dual language architecture** - Framework supporting multiple medieval languages

### 🔤 **Advanced Rune Systems**
- **Elder Futhark runes** - Complete Elder Futhark alphabet conversion
- **Younger Futhark runes** - Viking Age runic alphabet support
- **Intelligent rune mapping** - Context-sensitive character conversion
- **Multi-script support** - Seamless switching between different runic alphabets

### 📖 **Enhanced Dictionary Features**
- **Expanded vocabulary** - Larger dictionary with more medieval terms
- **Cross-references** - Links between related terms across languages
- **Etymology support** - Word origins and historical context
- **Advanced search** - Better completion matching and fuzzy search

### 🎛️ **Improved Language Processing**
- **Smart text conversion** - Better handling of modern vs. medieval spellings
- **Diacritic support** - Proper handling of accented characters
- **Case preservation** - Intelligent case handling in conversions
- **Word boundary detection** - More accurate text processing

## [0.1.0] - Initial Release
### 🎉 **Core Features**
- **Old English language support** - Complete language definition with `.oe` file extension
- **Futhorc rune conversion** - Convert Latin text to Anglo-Saxon runes using `<Futhorc>` tags
- **Auto-completion** - Intelligent suggestions for Old English vocabulary
- **Syntax highlighting** - Medieval language syntax highlighting with custom grammar
- **Word entry highlighting** - Visual highlighting for dictionary word entries
- **Hover information** - Contextual information on hover for word entries

### 📚 **Dictionary System**
- **Comprehensive Old English dictionary** - Extensive vocabulary with definitions
- **Smart completion matching** - Fuzzy search and intelligent suggestion ranking
- **Word entry format** - Structured entries with pronunciation and definitions
- **Completion customization** - Configurable completion behavior

### 🔤 **Text Conversion**
- **Futhorc alphabet** - Complete Anglo-Saxon runic alphabet
- **Batch conversion** - Convert entire text blocks to runes
- **Special character handling** - Proper conversion of digraphs (th, ng, etc.)
- **Markup preservation** - Maintains text formatting during conversion

### ⚡ **Editor Integration**
- **Language-specific features** - Tailored experience for medieval language files
- **Command palette integration** - Easy access to conversion commands
- **Keyboard shortcuts** - Quick access to frequently used features
- **File association** - Automatic language detection for `.oe` files