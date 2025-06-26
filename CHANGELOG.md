# Change Log

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