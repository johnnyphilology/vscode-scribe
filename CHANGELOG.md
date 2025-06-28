# Change Log


## [0.6.0] - 2025-06-28
**🎉 Major Release: Developer Tools & Modular Architecture**

This release introduces comprehensive developer tooling, modular architecture improvements, and enhanced testing infrastructure. The extension now features interactive webviews for common development tasks, configurable settings, and a robust testing framework ready for CI/CD.

### Added
- **🛠️ Developer Mode** - New `scribe.developerMode` setting enabling advanced features for extension development
- **📝 Add Word Webview** - Interactive interface for adding new words to medieval language dictionaries
- **🔄 Auto-Merge Webview** - Developer tool for automating GitHub pull request merges with configurable settings
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
- **Semantic highlighting setup** - Added required `"editor.semanticHighlighting.enabled": true` to documentation and templates
- **Font ligatures support** - Added `"editor.fontLigatures": true` for better medieval character rendering
- **Updated documentation** - Clear setup instructions with multiple access methods for settings template

### 🐛 **Bug Fixes & Polish**
- **Fixed semantic token highlighting** - Resolved issue where word entries weren't highlighting due to missing global setting
- **Enhanced grammar definitions** - Updated all language grammars to support script-specific tag highlighting
- **Debugging improvements** - Added console logging to semantic tokens provider for troubleshooting

### 📚 **Documentation Updates**
- **Updated README** - New quick setup section with settings command instructions
- **Enhanced theme documentation** - Complete color reference with SVG-matched values
- **Setup troubleshooting** - Added diagnostic information for semantic highlighting issues

## [0.3.0] 
### Added Web Compatibility for vscode.dev
- **Web Extension Support** - Extension now works on vscode.dev and github.dev
- **Dual Build Configuration** - Builds for both desktop and web environments
- **Browser Polyfills** - Added necessary polyfills for web compatibility
- **Virtual Workspaces** - Full support for virtual workspaces and untrusted workspaces
- **Web Testing** - Added web-specific testing capabilities

### 🛠️ **Technical Improvements**
- **Updated webpack configuration** for dual targeting (Node.js + WebWorker)
- **Added browser polyfills** (assert, path-browserify) for web compatibility
- **Enhanced build scripts** with separate web compilation commands
- **CI/CD updates** to test web compatibility
- **Package.json updates** with browser field and web capabilities

### 📦 **New Build Commands**
- `npm run compile:web` - Compile for web environment
- `npm run package:web` - Package for web deployment
- `npm run test:web` - Run tests in web environment

## [0.2.2] 
### Updating CI to create a package and VSIX on Github
- Publishing VSIX to releases on Github

## [0.2.1] 
### Updating CI to create a package and VSIX on Github
- Simple changes to `ci.yml`

## [0.2.0] 

### ✨ **New Features**
- **Expanded Gothic glossary** with 110 basic vocabulary entries
  - Complete personal pronoun system (ik, þu, is, si, ita, weis, jus, eis, ijos, ija)
  - Essential nouns (family, nature, time, places)
  - Common verbs with proper conjugations (wisan, haban, qiþan, gaggan, etc.)
  - Descriptive adjectives and prepositions
  - Numbers 1-10, hundred, thousand
  - Interrogative and temporal adverbs
  - Detailed grammatical documentation for each entry

### 🧪 **Testing Infrastructure**
- **Added comprehensive unit testing framework** with 71+ passing tests
- **Expanded test coverage** for all language-specific functionality:
  - **Enhanced `stripDiacritics` tests** - Comprehensive medieval language handling validation
  - **Rune conversion tests** - All scripts with extensive Unicode and case preservation tests
  - **Provider logic tests** - Complete coverage of all extension features
- **Created provider helper functions** for testable business logic
- **Separated pure functions** from VS Code dependencies for better testability
- **Added test coverage** for all providers:
  - Completion provider logic (word extraction, Unicode handling)
  - Hover provider logic (text normalization, dictionary lookups)
  - Substitution provider logic (digraph matching, case handling)
  - Marker completion logic (smart completion triggering)
  - Macro launcher logic (rune block parsing)
  - Gutter decoration logic (line detection for icons)
  - Semantic tokens logic (word highlighting)
- **Fast test execution**: All unit tests complete in ~19ms

### 🔧 **Developer Experience**
- **New npm scripts**:
  - `npm run test:unit` - Fast unit tests for development
  - `npm run test` - Full integration tests with VS Code
  - `npm run package-extension` - Build extension and create VSIX file
- **VS Code task integration** for running tests from Command Palette
- **Improved code architecture** with clear separation of concerns

### 🚀 **CI/CD Improvements**
- **Optimized GitHub Actions workflow**:
  - Reduced matrix from 12 to 6 jobs (50% faster CI)
  - Added npm caching for faster builds
  - Strategic test execution (unit tests everywhere, integration tests on Linux only)
- **Updated to modern Azure AD authentication** for VS Code Marketplace publishing
  - Replaced deprecated PAT tokens with AAD username/password authentication
  - Improved security and compliance with Microsoft's latest standards
- **Enhanced VSIX packaging**:
  - Automated VSIX creation for releases
  - VSIX artifact uploads for debugging and distribution
  - Proper extension packaging workflow
- **Automated marketplace publishing** on releases

### 📚 **Documentation**
- **Added comprehensive testing guide** (`TESTING.md`)
- **Created CI/CD documentation** with setup instructions
- **Improved code documentation** with inline comments
- **Enhanced Gothic vocabulary** with detailed linguistic annotations

### 🐛 **Bug Fixes**
- **Fixed import dependencies** for rune conversion functions
- **Improved digraph matching** with longest-match-first algorithm
- **Enhanced text normalization** for better hover provider accuracy
- **Corrected Gothic conjunction classification** (jah: conjunction, not preposition)
- **Fixed medieval language diacritics handling** - `stripDiacritics` now correctly:
  - Only removes diacritical marks from vowels (á, é, í, ó, ú, ý → a, e, i, o, u, y)
  - Preserves all medieval consonants and special letters (þ, ð, ƿ, æ, ƕ remain unchanged)
  - Converts macron ash (ǣ) to regular ash (æ)
  - Maintains proper case preservation throughout

### 🏗️ **Internal Improvements**
- **Major code refactoring** to reduce duplication and improve maintainability:
  - **Generic rune conversion function** - Eliminated duplicate logic across all rune scripts
  - **Data-driven extension activation** - Refactored from repetitive registration to config-driven approach
  - **Improved `stripDiacritics` function** - Now correctly handles medieval languages (only removes diacritics from vowels, preserves all special letters like þ, ð, ƿ, æ, ƕ)
- **Refactored utility functions** into logical modules:
  - `pureHelpers.ts` - VS Code-independent utilities with generic `convertToRunes` function
  - `providerHelpers.ts` - Testable provider business logic
  - `helpers.ts` - VS Code-dependent wrappers
- **Updated all rune scripts** to use the new generic conversion helper
- **Enhanced extension activation** with `registerLanguage` helper function
- **Improved type safety** throughout the codebase

### 📁 **New Files**
- `src/utils/pureHelpers.ts` - Pure utility functions with generic rune conversion
- `src/utils/providerHelpers.ts` - Testable provider logic
- `src/test/unit/` - Unit test directory with comprehensive coverage
- `src/test/runUnitTests.ts` - Fast unit test runner
- `TESTING.md` - Testing documentation and guide

## [0.1.1]
- Pre-Release
- Adding XML style tag markers for multiline transliterations:
  - `<Futhorc>`
  - `<ElderFuthark>`
  - `<YoungerFuthark>`
  - `<MedievalFuthark>`
  - `<Gothic>`
- Removed `@` style inline markers
- Removed Codelense for now
- Fixed bug in `toGothic` function that wasn't handling `th` correctly.
- Updated README.md to better reflect functionality.
- Added "gutter" icons for each transliteration type

## [0.1.0]

- Pre-Release
- Added basic functionality for autocomplete and language support
  - **Old English:** 772 basic words
  - **Old Norse:** 36,847 words
  - **Gothic:** 1 placeholder word
- Added `@rune` transliterations:
  - _Elder Futhark_
  - _Younger Futhark_
  - _Medieval Futhark_
  - _Futhorc_ (Anglo Saxon)
  - _Gothic Script_