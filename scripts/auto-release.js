#!/usr/bin/env node

/**
 * Auto Release Script for Scribe Extension
 * 
 * This script automates the process of:
 * 1. Creating a pull request from current branch to main
 * 2. Waiting for CI checks (tests + SonarQube) to pass
 * 3. Auto-merging the PR if all checks pass
 * 4. Creating a new release with tag matching package.json version
 * 
 * Prerequisites:
 * - GitHub CLI (gh) installed and authenticated
 * - Current branch has commits to merge
 * - package.json version has been updated
 * 
 * Usage: npm run auto-release
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const REPO_OWNER = 'johnnyphilology';
const REPO_NAME = 'scribe';
const BASE_BRANCH = 'main';
const CHECK_INTERVAL = 30000; // 30 seconds
const MAX_WAIT_TIME = 1800000; // 30 minutes

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, options = {}) {
    try {
        const result = execSync(command, { 
            encoding: 'utf8',
            stdio: options.silent ? 'pipe' : 'inherit',
            ...options
        });
        return result?.trim();
    } catch (error) {
        if (!options.allowFailure) {
            log(`Error executing command: ${command}`, 'red');
            log(error.message, 'red');
            process.exit(1);
        }
        return null;
    }
}

function getPackageVersion() {
    const packagePath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    return packageJson.version;
}

function getCurrentBranch() {
    return execCommand('git branch --show-current', { silent: true });
}

function getLatestCommitMessage() {
    return execCommand('git log -1 --pretty=%B', { silent: true });
}

function hasUncommittedChanges() {
    const status = execCommand('git status --porcelain', { silent: true });
    return status.length > 0;
}

function generateReleaseNotes() {
    const version = getPackageVersion();
    const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
    
    if (!fs.existsSync(changelogPath)) {
        return `Release v${version}`;
    }
    
    const changelog = fs.readFileSync(changelogPath, 'utf8');
    const lines = changelog.split('\n');
    
    // Find the current version section
    let inCurrentVersion = false;
    let releaseNotes = [];
    
    for (const line of lines) {
        if (line.includes(`[Unreleased]`) || line.includes(`[${version}]`)) {
            inCurrentVersion = true;
            continue;
        }
        
        if (inCurrentVersion && line.startsWith('## [') && !line.includes(version)) {
            break; // Reached next version section
        }
        
        if (inCurrentVersion && line.trim()) {
            releaseNotes.push(line);
        }
    }
    
    if (releaseNotes.length === 0) {
        return `Release v${version}\n\nSee CHANGELOG.md for details.`;
    }
    
    return `Release v${version}\n\n${releaseNotes.join('\n')}`;
}

async function waitForChecks(prNumber) {
    log(`Waiting for CI checks to complete for PR #${prNumber}...`, 'yellow');
    
    const startTime = Date.now();
    
    while (Date.now() - startTime < MAX_WAIT_TIME) {
        const checksResult = execCommand(
            `gh pr checks ${prNumber} --json state,conclusion,name`,
            { silent: true, allowFailure: true }
        );
        
        if (!checksResult) {
            log('Failed to get check status, retrying...', 'yellow');
            await sleep(CHECK_INTERVAL);
            continue;
        }
        
        let checks;
        try {
            checks = JSON.parse(checksResult);
        } catch (parseError) {
            log(`Failed to parse check results: ${parseError.message}, retrying...`, 'yellow');
            await sleep(CHECK_INTERVAL);
            continue;
        }
        
        const pendingChecks = checks.filter(check => check.state === 'PENDING' || check.state === 'IN_PROGRESS');
        const failedChecks = checks.filter(check => check.conclusion === 'FAILURE' || check.conclusion === 'CANCELLED');
        const succeededChecks = checks.filter(check => check.conclusion === 'SUCCESS');
        
        log(`Checks status: ${succeededChecks.length} passed, ${pendingChecks.length} pending, ${failedChecks.length} failed`, 'cyan');
        
        if (failedChecks.length > 0) {
            log('Some checks failed:', 'red');
            failedChecks.forEach(check => log(`  ❌ ${check.name}`, 'red'));
            return false;
        }
        
        if (pendingChecks.length === 0) {
            log('All checks passed!', 'green');
            return true;
        }
        
        log(`Waiting for ${pendingChecks.length} pending checks...`, 'yellow');
        pendingChecks.forEach(check => log(`  ⏳ ${check.name}`, 'yellow'));
        
        await sleep(CHECK_INTERVAL);
    }
    
    log('Timeout waiting for checks to complete', 'red');
    return false;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    log('🚀 Starting auto-release process...', 'blue');
    
    // Verify prerequisites
    log('Checking prerequisites...', 'cyan');
    
    // Check if gh CLI is installed
    const ghVersion = execCommand('gh --version', { silent: true, allowFailure: true });
    if (!ghVersion) {
        log('GitHub CLI (gh) is not installed. Please install it first.', 'red');
        process.exit(1);
    }
    
    // Check if authenticated
    const authStatus = execCommand('gh auth status', { silent: true, allowFailure: true });
    if (!authStatus) {
        log('GitHub CLI is not authenticated. Please run: gh auth login', 'red');
        process.exit(1);
    }
    
    // Check for uncommitted changes
    if (hasUncommittedChanges()) {
        log('You have uncommitted changes. Please commit or stash them first.', 'red');
        process.exit(1);
    }
    
    const currentBranch = getCurrentBranch();
    const version = getPackageVersion();
    const commitMessage = getLatestCommitMessage();
    
    log(`Current branch: ${currentBranch}`, 'cyan');
    log(`Package version: ${version}`, 'cyan');
    log(`Latest commit: ${commitMessage}`, 'cyan');
    
    if (currentBranch === BASE_BRANCH) {
        log('You are on the main branch. Please create a feature branch first.', 'red');
        process.exit(1);
    }
    
    // Push current branch
    log('Pushing current branch to origin...', 'yellow');
    execCommand(`git push origin ${currentBranch}`);
    
    // Create pull request
    log('Creating pull request...', 'yellow');
    const prTitle = `Release v${version}`;
    const prBody = `Automated release PR for version ${version}

**Changes:**
${commitMessage}

**Version:** ${version}

This PR will be automatically merged once all CI checks pass.`;
    
    const prResult = execCommand(
        `gh pr create --title "${prTitle}" --body "${prBody}" --base ${BASE_BRANCH} --head ${currentBranch}`,
        { silent: true }
    );
    
    const prNumber = prResult.match(/#(\d+)/)?.[1];
    if (!prNumber) {
        log('Failed to extract PR number from result', 'red');
        process.exit(1);
    }
    
    log(`✅ Pull request created: #${prNumber}`, 'green');
    
    // Wait for checks to pass
    const checksPass = await waitForChecks(prNumber);
    
    if (!checksPass) {
        log('CI checks failed or timed out. PR will not be merged automatically.', 'red');
        log(`Please review the PR manually: https://github.com/${REPO_OWNER}/${REPO_NAME}/pull/${prNumber}`, 'yellow');
        process.exit(1);
    }
    
    // Merge the PR
    log('Merging pull request...', 'yellow');
    execCommand(`gh pr merge ${prNumber} --squash --delete-branch`);
    log(`✅ Pull request #${prNumber} merged and branch deleted`, 'green');
    
    // Switch back to main and pull latest
    log('Switching to main branch and pulling latest changes...', 'yellow');
    execCommand(`git checkout ${BASE_BRANCH}`);
    execCommand('git pull origin main');
    
    // Create release
    log('Creating GitHub release...', 'yellow');
    const tagName = `v${version}`;
    const releaseNotes = generateReleaseNotes();
    
    // Check if tag already exists
    const existingTag = execCommand(`git tag -l ${tagName}`, { silent: true, allowFailure: true });
    if (existingTag) {
        log(`Tag ${tagName} already exists. Skipping release creation.`, 'yellow');
    } else {
        execCommand(`gh release create ${tagName} --title "Release ${tagName}" --notes "${releaseNotes}"`);
        log(`✅ Release ${tagName} created successfully`, 'green');
    }
    
    log('🎉 Auto-release process completed successfully!', 'green');
    log(`🔗 View release: https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/tag/${tagName}`, 'cyan');
}

// Run the script
if (require.main === module) {
    main().catch(error => {
        log(`Unexpected error: ${error.message}`, 'red');
        process.exit(1);
    });
}

module.exports = { main };
