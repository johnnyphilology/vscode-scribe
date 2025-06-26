import * as path from 'path';
const Mocha = require('mocha');
const glob = require('glob');

// Create the mocha test runner for unit tests
const mocha = new Mocha({
	ui: 'bdd', // Use BDD interface for describe/it
	color: true,
	timeout: 5000
});

// Get the unit test files
const testsRoot = path.resolve(__dirname, '..');
const pattern = path.join(testsRoot, '**/unit/*.unit.test.js');
const unitTestFiles = glob.sync(pattern);

// Add unit test files to the test suite
unitTestFiles.forEach((f: string) => mocha.addFile(f));

// Run the tests
mocha.run((failures: number) => {
	if (failures > 0) {
		console.error(`${failures} unit tests failed.`);
		process.exit(1);
	} else {
		console.log('All unit tests passed!');
		process.exit(0);
	}
});
