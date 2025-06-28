#!/usr/bin/env node

/**
 * Check PR Status Script
 * 
 * This script checks the status of a PR for the current branch
 * and can optionally merge it if all checks pass.
 * 
 * Usage: 
 *   npm run check-pr              # Just check status
 *   npm run check-pr -- --merge   # Check and merge if ready
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

async function checkPRStatus(shouldMerge = false) {
    log('🔍 Checking PR status...', 'blue');
    
    const currentBranch = getCurrentBranch();
    log(`Current branch: ${currentBranch}`, 'cyan');
    
    // Find PR for current branch
    const prData = execCommand(
        `gh pr list --head ${currentBranch} --base main --json number,url,title,mergeable,state`,
        { silent: true, allowFailure: true }
    );
    
    if (!prData) {
        log('No PR found for current branch or GitHub CLI error.', 'yellow');
        return;
    }
    
    let prs;
    try {
        prs = JSON.parse(prData);
    } catch (error) {
        log(`Failed to parse PR data: ${error.message}`, 'red');
        return;
    }
    
    if (prs.length === 0) {
        log('No PR found for current branch.', 'yellow');
        return;
    }
    
    const pr = prs[0];
    log(`\n📋 PR Information:`, 'cyan');
    log(`   Number: #${pr.number}`, 'cyan');
    log(`   Title: ${pr.title}`, 'cyan');
    log(`   URL: ${pr.url}`, 'cyan');
    log(`   State: ${pr.state}`, 'cyan');
    log(`   Mergeable: ${pr.mergeable}`, 'cyan');
    
    // Check CI status
    log(`\n🔄 Checking CI status...`, 'yellow');
    const checksResult = execCommand(
        `gh pr checks ${pr.number} --json state,conclusion,name`,
        { silent: true, allowFailure: true }
    );
    
    if (!checksResult) {
        log('Failed to get check status.', 'red');
        return;
    }
    
    let checks;
    try {
        checks = JSON.parse(checksResult);
    } catch (error) {
        log(`Failed to parse check results: ${error.message}`, 'red');
        return;
    }
    
    const pendingChecks = checks.filter(check => check.state === 'PENDING' || check.state === 'IN_PROGRESS');
    const failedChecks = checks.filter(check => check.conclusion === 'FAILURE' || check.conclusion === 'CANCELLED');
    const succeededChecks = checks.filter(check => check.conclusion === 'SUCCESS');
    
    log(`\n📊 Check Summary:`, 'cyan');
    log(`   ✅ Passed: ${succeededChecks.length}`, 'green');
    log(`   ⏳ Pending: ${pendingChecks.length}`, 'yellow');
    log(`   ❌ Failed: ${failedChecks.length}`, 'red');
    
    if (succeededChecks.length > 0) {
        log(`\n✅ Passed Checks:`, 'green');
        succeededChecks.forEach(check => log(`   • ${check.name}`, 'green'));
    }
    
    if (pendingChecks.length > 0) {
        log(`\n⏳ Pending Checks:`, 'yellow');
        pendingChecks.forEach(check => log(`   • ${check.name}`, 'yellow'));
    }
    
    if (failedChecks.length > 0) {
        log(`\n❌ Failed Checks:`, 'red');
        failedChecks.forEach(check => log(`   • ${check.name}`, 'red'));
    }
    
    // Determine if ready to merge
    const allPassed = pendingChecks.length === 0 && failedChecks.length === 0 && succeededChecks.length > 0;
    const readyToMerge = allPassed && pr.mergeable && pr.state === 'OPEN';
    
    log(`\n🎯 Status:`, 'cyan');
    if (readyToMerge) {
        log('   🟢 Ready to merge!', 'green');
        
        if (shouldMerge) {
            log('\n🔀 Merging PR...', 'yellow');
            try {
                execCommand(`gh pr merge ${pr.number} --squash --delete-branch`);
                log(`✅ PR #${pr.number} merged successfully!`, 'green');
            } catch (error) {
                log(`Failed to merge PR: ${error.message}`, 'red');
            }
        } else {
            log('\n💡 To merge this PR, run:', 'cyan');
            log(`   npm run check-pr -- --merge`, 'cyan');
            log(`   or manually: gh pr merge ${pr.number} --squash --delete-branch`, 'cyan');
        }
    } else {
        log('   🟡 Not ready to merge yet.', 'yellow');
        if (pendingChecks.length > 0) {
            log('   📝 Waiting for CI checks to complete.', 'yellow');
        }
        if (failedChecks.length > 0) {
            log('   🔴 Some checks failed - please fix issues.', 'red');
        }
        if (!pr.mergeable) {
            log('   ⚠️  PR has merge conflicts - please resolve.', 'yellow');
        }
        if (pr.state !== 'OPEN') {
            log(`   📌 PR state is '${pr.state}' - expected 'OPEN'.`, 'yellow');
        }
    }
}

function main() {
    const shouldMerge = process.argv.includes('--merge');
    checkPRStatus(shouldMerge);
}

if (require.main === module) {
    main();
}
