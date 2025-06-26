# Test Configuration

This directory contains the test setup for the Scribe VS Code extension.

## Test Structure

- `runTest.ts` - Main test runner that launches VS Code and runs tests
- `suite/index.ts` - Test suite configuration using Mocha
- `suite/*.test.ts` - Individual test files

## Test Files

1. **extension.test.ts** - Tests the main extension activation and command registration
2. **helpers.test.ts** - Tests utility functions like `bracketMarkers`, `extractWordList`, etc.
3. **completion.test.ts** - Tests the completion provider functionality

## Running Tests

To run the tests:

```bash
npm test
```

Or run individual steps:

```bash
npm run compile-tests  # Compile TypeScript test files
npm run compile        # Compile main extension
npm run lint          # Run linting
node ./out/test/runTest.js  # Run the actual tests
```

## Test Dependencies

The test setup uses:
- `@vscode/test-electron` - VS Code testing framework
- `mocha` - Test runner
- `glob` - File pattern matching for test discovery
- `@types/mocha`, `@types/node` - TypeScript definitions
