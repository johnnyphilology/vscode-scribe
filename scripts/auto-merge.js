#!/usr/bin/env node

/**
 * Create and Auto-Merge PR Script
 * 
 * This script creates a PR and auto-merges it if CI passes.
 * Use this for feature branches that don't need a release.
 * 
 * Usage: npm run auto-merge
 */

const { execSync } = require('child_process');

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

function getCurrentBranch() {
    return execCommand('git branch --show-current', { silent: true });
}

function getLatestCommitMessage() {
    return execCommand('git log -1 --pretty=%B', { silent: true });
}

function main() {
    log('🔀 Creating auto-merge PR...', 'blue');
    
    const currentBranch = getCurrentBranch();
    const commitMessage = getLatestCommitMessage();
    
    if (currentBranch === 'main') {
        log('You are on the main branch. Please create a feature branch first.', 'red');
        process.exit(1);
    }
    
    log(`Current branch: ${currentBranch}`, 'cyan');
    log(`Latest commit: ${commitMessage}`, 'cyan');
    
    // Push current branch
    log('Pushing current branch...', 'yellow');
    execCommand(`git push origin ${currentBranch}`);
    
    // Create PR with auto-merge
    log('Creating PR with auto-merge enabled...', 'yellow');
    const prTitle = commitMessage.split('\n')[0]; // First line of commit message
    const prBody = `${commitMessage}

This PR will be automatically merged once all CI checks pass.`;
    
    const prResult = execCommand(
        `gh pr create --title "${prTitle}" --body "${prBody}" --base main --head ${currentBranch}`,
        { silent: true }
    );
    
    const prNumber = prResult.match(/#(\d+)/)?.[1];
    if (!prNumber) {
        log('Failed to extract PR number', 'red');
        process.exit(1);
    }
    
    // Enable auto-merge
    execCommand(`gh pr merge ${prNumber} --auto --squash --delete-branch`);
    
    log(`✅ PR #${prNumber} created with auto-merge enabled`, 'green');
    log(`🔗 View PR: ${prResult}`, 'cyan');
    log('The PR will merge automatically once all checks pass.', 'yellow');
}

if (require.main === module) {
    main();
}
