#!/usr/bin/env node

/**
 * Simple test script to debug GitHub CLI and API issues
 */

const { execSync } = require('child_process');

function execCommand(command, options = {}) {
    try {
        const result = execSync(command, {
            encoding: 'utf8',
            stdio: options.silent ? 'pipe' : 'inherit',
            ...options
        });
        return options.silent ? result.trim() : true;
    } catch (error) {
        if (!options.allowFailure) {
            console.error(`Command failed: ${command}`);
            console.error(`Error: ${error.message}`);
            process.exit(1);
        }
        return null;
    }
}

function log(message, color = 'white') {
    const colors = {
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        cyan: '\x1b[36m',
        white: '\x1b[37m',
        reset: '\x1b[0m'
    };
    console.log(`${colors[color] || colors.white}${message}${colors.reset}`);
}

async function testGitHubCLI() {
    log('Testing GitHub CLI functionality...', 'cyan');
    
    // Test 1: Check if gh is installed and authenticated
    log('\n1. Checking GitHub CLI installation...', 'yellow');
    const ghVersion = execCommand('gh --version', { silent: true, allowFailure: true });
    if (ghVersion) {
        log(`✅ GitHub CLI installed: ${ghVersion.split('\n')[0]}`, 'green');
    } else {
        log('❌ GitHub CLI not found or not working', 'red');
        return;
    }
    
    // Test 2: Check authentication
    log('\n2. Checking GitHub authentication...', 'yellow');
    const authStatus = execCommand('gh auth status', { silent: true, allowFailure: true });
    if (authStatus) {
        log('✅ GitHub CLI authenticated', 'green');
    } else {
        log('❌ GitHub CLI not authenticated. Run: gh auth login', 'red');
        return;
    }
    
    // Test 3: Check repository access
    log('\n3. Checking repository access...', 'yellow');
    const repoInfo = execCommand('gh repo view --json name,owner', { silent: true, allowFailure: true });
    if (repoInfo) {
        try {
            const repo = JSON.parse(repoInfo);
            log(`✅ Repository accessible: ${repo.owner.login}/${repo.name}`, 'green');
        } catch (error) {
            log(`⚠️  Repository accessible but JSON parse failed: ${error.message}`, 'yellow');
        }
    } else {
        log('❌ Cannot access repository. Make sure you\'re in a git repository.', 'red');
        return;
    }
    
    // Test 4: Check for existing PRs
    log('\n4. Checking for existing PRs...', 'yellow');
    const prs = execCommand('gh pr list --json number,title,state --limit 5', { silent: true, allowFailure: true });
    if (prs) {
        try {
            const prList = JSON.parse(prs);
            log(`✅ Found ${prList.length} PRs (showing first 5)`, 'green');
            prList.forEach(pr => {
                log(`   #${pr.number}: ${pr.title} (${pr.state})`, 'cyan');
            });
        } catch (error) {
            log(`⚠️  PR list retrieved but JSON parse failed: ${error.message}`, 'yellow');
        }
    } else {
        log('⚠️  Could not retrieve PR list', 'yellow');
    }
    
    // Test 5: Test API access directly
    log('\n5. Testing direct API access...', 'yellow');
    const apiTest = execCommand('gh api user --jq .login', { silent: true, allowFailure: true });
    if (apiTest) {
        log(`✅ API access working, authenticated as: ${apiTest}`, 'green');
    } else {
        log('❌ Direct API access failed', 'red');
    }
    
    log('\n🏁 GitHub CLI test completed!', 'green');
}

// Run the test
testGitHubCLI().catch(error => {
    log(`Test failed with error: ${error.message}`, 'red');
    process.exit(1);
});
