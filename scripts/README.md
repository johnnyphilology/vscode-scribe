# Scribe Development Scripts

This directory contains automation scripts for the Scribe VS Code extension development workflow.

## Scripts Overview

### 🔧 Development Scripts

#### `version-bump.js`
Interactive semantic version bumping tool.
```bash
npm run version-bump
```
**Features:**
- Interactive prompts for version type (patch, minor, major)
- Updates `package.json`, `README.md`, and `CHANGELOG.md`
- Validates version format
- Shows preview before applying changes

#### `add-word.js`
Interactive tool for adding new dictionary entries.
```bash
npm run add-word
```
**Features:**
- Add words to any medieval language dictionary
- Duplicate detection and merge capabilities
- Interactive prompts for word, definition, and language
- Automatic sorting and formatting

### 🚀 Release & CI Scripts

#### `auto-release.js`
Complete automated release workflow.
```bash
npm run auto-release
```
**What it does:**
1. ✅ **Creates PR** from current branch to main
2. ⏳ **Waits for CI** (tests + SonarQube) to pass
3. 🔀 **Auto-merges PR** if all checks pass
4. 🏷️ **Creates release** with tag matching `package.json` version
5. 📝 **Generates release notes** from CHANGELOG.md

**Prerequisites:**
- GitHub CLI (`gh`) installed and authenticated
- Current branch has commits ready for release
- `package.json` version updated (use `npm run version-bump`)
- All changes committed

#### `auto-merge.js`
Simple PR creation with auto-merge (no release).
```bash
npm run auto-merge
```
**What it does:**
1. ✅ **Creates PR** from current branch to main
2. 🔀 **Enables auto-merge** (squash + delete branch)
3. ⏳ **Waits for CI** to pass and merges automatically

**Use case:** Feature branches that don't need a version bump/release.

## Usage Examples

### Complete Release Workflow
```bash
# 1. Make your changes and commit them
git add .
git commit -m "feat: add new settings UI"

# 2. Bump version (interactive)
npm run version-bump

# 3. Commit version bump
git add .
git commit -m "chore: bump version to 0.5.0"

# 4. Create PR, wait for CI, merge, and release
npm run auto-release
```

### Feature Branch Merge
```bash
# 1. Make your changes and commit them
git add .
git commit -m "fix: resolve TypeScript errors"

# 2. Create PR with auto-merge
npm run auto-merge
```

### Manual Development
```bash
# Add new words to dictionary
npm run add-word

# Just bump version (no release)
npm run version-bump
```

## Prerequisites

### GitHub CLI Setup
```bash
# Install GitHub CLI
brew install gh

# Authenticate
gh auth login

# Verify authentication
gh auth status
```

### Repository Settings
Make sure your repository has:
- ✅ **Branch protection** rules on `main`
- ✅ **Required status checks** (CI/tests)
- ✅ **SonarQube integration** configured
- ✅ **Auto-merge enabled** in repository settings

## Script Features

### 🛡️ Safety Features
- **Prerequisite checks** (git status, gh auth, etc.)
- **Uncommitted changes detection**
- **Branch validation** (prevents running on main)
- **CI status monitoring** with timeout
- **Error handling** with descriptive messages

### 📊 CI Integration
- **Waits for all checks** to pass before merging
- **Monitors SonarQube** quality gate
- **Supports GitHub Actions** and other CI providers
- **Configurable timeout** (30 minutes default)

### 📝 Release Automation
- **Auto-generates release notes** from CHANGELOG.md
- **Creates GitHub releases** with proper tags
- **Maintains version consistency** across files
- **Supports semantic versioning**

## Configuration

### Customizing Auto-Release
Edit `scripts/auto-release.js` to modify:
- `CHECK_INTERVAL`: How often to check CI status (default: 30s)
- `MAX_WAIT_TIME`: Maximum time to wait for CI (default: 30min)
- `BASE_BRANCH`: Target branch for PRs (default: 'main')

### Customizing Repository Info
The scripts automatically detect repository info, but you can override:
```javascript
const REPO_OWNER = 'johnnyphilology';
const REPO_NAME = 'scribe';
```

## Troubleshooting

### Common Issues

**"GitHub CLI not authenticated"**
```bash
gh auth login
```

**"You have uncommitted changes"**
```bash
git add .
git commit -m "your commit message"
```

**"You are on the main branch"**
```bash
git checkout -b feature/your-feature-name
```

**"CI checks failed"**
- Check the PR page for detailed error information
- Fix issues and push new commits
- The scripts will re-check automatically

### Debug Mode
Run scripts with verbose output:
```bash
DEBUG=1 npm run auto-release
```

## Integration with VS Code

You can run these scripts directly from VS Code:
1. **Command Palette** (`Ctrl/Cmd+Shift+P`)
2. **Tasks: Run Task**
3. **npm: auto-release** (or other script name)

Or add keyboard shortcuts in VS Code settings.
