#!/usr/bin/env node

/**
 * Debug script to test GitHub CLI PR creation
 * Usage: node scripts/debug-gh.js
 */

const { execSync } = require('child_process');

function execCommand(command, options = {}) {
    try {
        console.log(`🔍 Executing: ${command}`);
        const result = execSync(command, { 
            encoding: 'utf8',
            stdio: 'pipe',
            ...options
        });
        console.log(`✅ Success:`);
        console.log(result);
        return result?.trim();
    } catch (error) {
        console.log(`❌ Error:`);
        console.log(error.message);
        if (error.stdout) {
            console.log(`📤 stdout:`);
            console.log(error.stdout.toString());
        }
        if (error.stderr) {
            console.log(`📥 stderr:`);
            console.log(error.stderr.toString());
        }
        return null;
    }
}

function getCurrentBranch() {
    return execCommand('git branch --show-current');
}

function main() {
    console.log('🔧 GitHub CLI Debug Script');
    console.log('================================');
    
    // Check GitHub CLI version
    console.log('\n1. Checking GitHub CLI version:');
    execCommand('gh --version');
    
    // Check authentication
    console.log('\n2. Checking authentication:');
    execCommand('gh auth status');
    
    // Check current branch
    console.log('\n3. Current branch:');
    const branch = getCurrentBranch();
    
    if (!branch) {
        console.log('❌ Could not determine current branch');
        return;
    }
    
    // Check if we can list PRs
    console.log('\n4. Testing PR list command:');
    execCommand(`gh pr list --head ${branch} --base main --json number,url`);
    
    // Test a dry-run PR create (this won't actually create a PR)
    console.log('\n5. Testing PR creation (dry run):');
    console.log('Note: This is just testing the command format, not actually creating a PR');
    
    const testTitle = 'Test PR Title';
    const testBody = 'Test PR Body';
    
    console.log(`Command that would be run:`);
    console.log(`gh pr create --title "${testTitle}" --body "${testBody}" --base main --head ${branch}`);
    
    console.log('\n✅ Debug complete. If you want to test actual PR creation, run the command above manually.');
}

if (require.main === module) {
    main();
}
