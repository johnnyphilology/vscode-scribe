import * as path from 'path';
const Mocha = require('mocha');
const glob = require('glob');

export function run(): Promise<void> {
	// Create the mocha test
	const mocha = new Mocha({
		ui: 'bdd', // Use BDD interface to support describe/it/beforeEach syntax
		color: true,
		timeout: 10000 // 10 second timeout for CI environments
	});

	const testsRoot = path.resolve(__dirname, '..');

	return new Promise((resolve, reject) => {
		try {
			// Find test files using glob
			let pattern = path.join(testsRoot, '**/**.test.js');
			
			// In CI environments, use a more conservative test pattern
			if (process.env.CI || process.env.GITHUB_ACTIONS || process.env.VSCODE_TEST_CI) {
				console.log('Running in CI mode - using basic tests only');
				// Only run basic integration tests in CI that don't require full VS Code API
				pattern = path.join(testsRoot, 'suite/basic.test.js');
			}
			
			const files = glob.sync(pattern);

			if (files.length === 0) {
				console.warn('No test files found in pattern:', pattern);
				// If no files found with CI pattern, fallback to basic tests
				if (process.env.CI || process.env.GITHUB_ACTIONS || process.env.VSCODE_TEST_CI) {
					const basicTestPath = path.join(testsRoot, 'suite/basic.test.js');
					if (require('fs').existsSync(basicTestPath)) {
						files.push(basicTestPath);
					}
				}
			} else {
				console.log(`Found ${files.length} test files`);
			}

			// Add files to the test suite
			files.forEach((f: string) => {
				console.log('Adding test file:', path.relative(testsRoot, f));
				try {
					mocha.addFile(f);
				} catch (error) {
					console.error('Error adding test file:', f, error);
				}
			});

			// Run the mocha test
			mocha.run((failures: number) => {
				if (failures > 0) {
					console.error(`${failures} tests failed.`);
					reject(new Error(`${failures} tests failed.`));
				} else {
					console.log('All tests passed!');
					resolve();
				}
			});
		} catch (err) {
			console.error('Error setting up tests:', err);
			reject(err);
		}
	});
}
