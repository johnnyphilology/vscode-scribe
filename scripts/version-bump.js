#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  return packageJson.version;
}

function parseVersion(version) {
  const [major, minor, patch] = version.split('.').map(Number);
  return { major, minor, patch };
}

function bumpVersion(currentVersion, bumpType) {
  const { major, minor, patch } = parseVersion(currentVersion);
  
  switch (bumpType) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error('Invalid bump type. Must be major, minor, or patch.');
  }
}

function updatePackageJson(newVersion) {
  const packagePath = 'package.json';
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  packageJson.version = newVersion;
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`✅ Updated package.json: ${packageJson.version} → ${newVersion}`);
}

function updateReadme(oldVersion, newVersion) {
  const readmePath = 'README.md';
  let readme = fs.readFileSync(readmePath, 'utf8');
  
  // Replace version references in README (if any exist)
  const versionPattern = new RegExp(oldVersion.replace(/\./g, '\\.'), 'g');
  const updatedReadme = readme.replace(versionPattern, newVersion);
  
  if (readme !== updatedReadme) {
    fs.writeFileSync(readmePath, updatedReadme);
    console.log(`✅ Updated README.md: ${oldVersion} → ${newVersion}`);
  } else {
    console.log(`ℹ️  No version references found in README.md`);
  }
}

function updateChangelog(newVersion) {
  const changelogPath = 'CHANGELOG.md';
  let changelog = fs.readFileSync(changelogPath, 'utf8');
  
  const today = new Date().toISOString().split('T')[0];
  const newEntry = `## [${newVersion}] - ${today}
### Added
- 

### Changed
- 

### Fixed
- 

`;

  // Insert new entry after the "# Change Log" header
  const headerPattern = /(# Change Log\s*\n)/;
  const updatedChangelog = changelog.replace(headerPattern, `$1\n${newEntry}`);
  
  fs.writeFileSync(changelogPath, updatedChangelog);
  console.log(`✅ Added new section to CHANGELOG.md: [${newVersion}]`);
}

function askBumpType() {
  return new Promise((resolve) => {
    console.log('\n🚀 Semantic Version Bump');
    console.log('========================');
    console.log('Choose bump type:');
    console.log('  1) patch   - Bug fixes (0.0.X)');
    console.log('  2) minor   - New features (0.X.0)');
    console.log('  3) major   - Breaking changes (X.0.0)');
    console.log('  q) quit    - Cancel operation');
    
    rl.question('\nEnter your choice (1/2/3/q): ', (answer) => {
      switch (answer.toLowerCase().trim()) {
        case '1':
        case 'patch':
          resolve('patch');
          break;
        case '2':
        case 'minor':
          resolve('minor');
          break;
        case '3':
        case 'major':
          resolve('major');
          break;
        case 'q':
        case 'quit':
          console.log('❌ Operation cancelled.');
          process.exit(0);
          break;
        default:
          console.log('❌ Invalid choice. Please enter 1, 2, 3, or q.');
          resolve(askBumpType());
      }
    });
  });
}

function confirmBump(oldVersion, newVersion, bumpType) {
  return new Promise((resolve) => {
    console.log(`\n📋 Version Bump Summary:`);
    console.log(`   Current: ${oldVersion}`);
    console.log(`   New:     ${newVersion}`);
    console.log(`   Type:    ${bumpType}`);
    
    rl.question('\nProceed with version bump? (y/N): ', (answer) => {
      resolve(answer.toLowerCase().trim() === 'y' || answer.toLowerCase().trim() === 'yes');
    });
  });
}

async function main() {
  try {
    // Check if we're in the right directory
    if (!fs.existsSync('package.json')) {
      console.error('❌ No package.json found. Please run this script from the project root.');
      process.exit(1);
    }

    const currentVersion = getCurrentVersion();
    console.log(`📦 Current version: ${currentVersion}`);
    
    const bumpType = await askBumpType();
    const newVersion = bumpVersion(currentVersion, bumpType);
    
    const confirmed = await confirmBump(currentVersion, newVersion, bumpType);
    
    if (!confirmed) {
      console.log('❌ Operation cancelled.');
      process.exit(0);
    }
    
    console.log('\n🔄 Updating files...');
    
    // Update files
    updatePackageJson(newVersion);
    updateReadme(currentVersion, newVersion);
    updateChangelog(newVersion);
    
    console.log('\n🎉 Version bump completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Edit CHANGELOG.md to add your changes');
    console.log('   2. Commit your changes: git add -A && git commit -m "chore: bump version to ' + newVersion + '"');
    console.log('   3. Create a tag: git tag v' + newVersion);
    console.log('   4. Push changes: git push && git push --tags');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = { bumpVersion, parseVersion };
