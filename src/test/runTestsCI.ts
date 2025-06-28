import * as path from 'path';

import { runTests } from '@vscode/test-electron';

async function main() {
	try {
		// The folder containing the Extension Manifest package.json
		// Passed to `--extensionDevelopmentPath`
		const extensionDevelopmentPath = path.resolve(__dirname, '../../');

		// The path to test runner
		// Passed to --extensionTestsPath
		const extensionTestsPath = path.resolve(__dirname, './suite/index');

		// Configure test environment
		const testOptions = {
			extensionDevelopmentPath,
			extensionTestsPath,
			launchArgs: [
				'--no-sandbox',
				'--disable-gpu',
				'--disable-dev-shm-usage',
				'--disable-extensions-except=' + extensionDevelopmentPath
			]
		};

		// Set CI environment flag
		process.env.VSCODE_TEST_CI = 'true';

		console.log('Starting VS Code extension tests...');
		console.log('Extension path:', extensionDevelopmentPath);
		console.log('Tests path:', extensionTestsPath);

		// Download VS Code, unzip it and run the integration test
		await runTests(testOptions);
		
		console.log('Tests completed successfully!');
	} catch (err) {
		console.error('Failed to run tests:', err);
		process.exit(1);
	}
}

main();
