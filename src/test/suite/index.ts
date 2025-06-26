import * as path from 'path';
const Mocha = require('mocha');
const glob = require('glob');

export function run(): Promise<void> {
	// Create the mocha test
	const mocha = new Mocha({
		ui: 'tdd',
		color: true
	});

	const testsRoot = path.resolve(__dirname, '..');

	return new Promise((resolve, reject) => {
		try {
			// Find test files using glob
			const pattern = path.join(testsRoot, '**/**.test.js');
			const files = glob.sync(pattern);

			// Add files to the test suite
			files.forEach((f: string) => mocha.addFile(f));

			// Run the mocha test
			mocha.run((failures: number) => {
				if (failures > 0) {
					reject(new Error(`${failures} tests failed.`));
				} else {
					resolve();
				}
			});
		} catch (err) {
			console.error(err);
			reject(err);
		}
	});
}
