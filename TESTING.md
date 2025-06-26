# Scribe Extension Testing Guide

This document explains the complete testing setup for the Scribe VS Code extension.

## Test Architecture

The testing setup is split into two main categories:

### 1. Unit Tests (Fast, No VS Code Required)
- **Location**: `src/test/unit/`
- **Purpose**: Test pure functions and business logic
- **Dependencies**: None (runs in Node.js directly)
- **Speed**: Very fast (milliseconds)

### 2. Integration Tests (Slower, Requires VS Code)
- **Location**: `src/test/suite/`
- **Purpose**: Test VS Code-specific functionality like providers, commands, etc.
- **Dependencies**: Requires VS Code extension host
- **Speed**: Slower (seconds)

## File Structure

```
src/test/
├── README.md                    # This file
├── runTest.ts                   # Integration test runner (uses VS Code)
├── runUnitTests.ts              # Unit test runner (pure Node.js)
├── suite/
│   ├── index.ts                 # Test suite configuration for integration tests
│   ├── extension.test.ts        # Extension activation tests
│   ├── helpers.test.ts          # Helper function tests (VS Code dependent)
│   └── completion.test.ts       # Completion provider tests
└── unit/
    └── helpers.unit.test.ts     # Pure helper function tests
```

## Running Tests

### Option 1: Command Line

```bash
# Run only unit tests (fast)
npm run test:unit

# Run integration tests (slower, downloads VS Code if needed)
npm test

# Compile tests only (useful for checking TypeScript errors)
npm run compile-tests
```

### Option 2: VS Code Tasks

1. Open Command Palette (`Cmd+Shift+P`)
2. Type "Tasks: Run Task"
3. Choose from:
   - `npm: test:unit` - Run unit tests
   - `npm: test` - Run integration tests

### Option 3: Test Explorer (if installed)

If you have the VS Code Test Explorer extension installed, you can:
- View all tests in the Test Explorer panel
- Run individual tests or test suites
- Debug tests with breakpoints

## Test Categories

### Unit Tests (src/test/unit/)

These test pure functions that don't depend on VS Code APIs:

- **extractWordList**: Extracts word strings from word entry objects
- **isInAtMarker**: Detects @marker patterns in text
- **stripDiacritics**: Removes diacritical marks from text
- **applyCasing**: Applies proper casing to completion suggestions

### Integration Tests (src/test/suite/)

These test VS Code-specific functionality:

- **Extension activation**: Tests that the extension loads correctly
- **Command registration**: Tests that commands are registered
- **Completion providers**: Tests that completion providers work
- **Hover providers**: Tests hover functionality
- **Language features**: Tests syntax highlighting, etc.

## Adding New Tests

### Adding Unit Tests

1. Create a new file in `src/test/unit/` with the pattern `*.unit.test.ts`
2. Import the functions you want to test from `src/utils/pureHelpers.ts`
3. Write tests using Mocha's `describe` and `it` functions
4. Use Node.js `assert` module for assertions

Example:
```typescript
import { describe, it } from 'mocha';
import * as assert from 'assert';
import { myFunction } from '../../utils/pureHelpers';

describe('My Function', () => {
    it('should do something', () => {
        const result = myFunction('input');
        assert.strictEqual(result, 'expected');
    });
});
```

### Adding Integration Tests

1. Create a new file in `src/test/suite/` with the pattern `*.test.ts`
2. Import VS Code APIs and your extension code
3. Write tests using Mocha's `suite` and `test` functions
4. Use VS Code's test utilities for assertions

Example:
```typescript
import * as assert from 'assert';
import * as vscode from 'vscode';

suite('My Feature', () => {
    test('should work with VS Code', async () => {
        // Test VS Code functionality
        const result = await vscode.commands.executeCommand('myCommand');
        assert.ok(result);
    });
});
```

## Test Utilities

### Pure Helper Functions

Located in `src/utils/pureHelpers.ts`, these functions can be tested without VS Code:
- No VS Code dependencies
- Fast to test
- Easy to debug
- Good for business logic

### VS Code Helper Functions

Located in `src/utils/helpers.ts`, these functions require VS Code:
- Depend on VS Code APIs
- Require integration tests
- Test actual extension behavior

## Best Practices

1. **Write unit tests first**: Test pure functions before integration
2. **Keep tests focused**: One test should test one thing
3. **Use descriptive names**: Test names should describe what they're testing
4. **Test edge cases**: Empty inputs, null values, etc.
5. **Mock external dependencies**: Use mocks for external services
6. **Keep tests fast**: Unit tests should run in milliseconds

## Debugging Tests

### Unit Tests
- Use Node.js debugger: `node --inspect-brk ./out/test/runUnitTests.js`
- Set breakpoints in VS Code
- Use `console.log` for simple debugging

### Integration Tests
- Use VS Code's built-in test debugging
- Set breakpoints in test files
- Use the "Debug Test" CodeLens that appears above test functions

## Common Issues

### "Cannot find module 'vscode'" in unit tests
- Make sure you're importing from `pureHelpers.ts`, not `helpers.ts`
- Unit tests should not depend on VS Code APIs

### Tests timing out
- Increase timeout in Mocha configuration
- Check for async operations that aren't being awaited

### VS Code not found for integration tests
- The test runner will download VS Code automatically
- Check your internet connection
- Clear `.vscode-test` directory if needed

## Example Test Output

### Unit Tests
```
  Scribe Utility Functions
    extractWordList
      ✔ should extract word strings from word entries
      ✔ should handle empty array
    isInAtMarker
      ✔ should detect @ markers at start of line
      ✔ should not detect @ markers in middle of line
    stripDiacritics
      ✔ should remove common diacritical marks
      ✔ should handle Old English characters
    applyCasing
      ✔ should preserve lowercase when input is lowercase
      ✔ should capitalize first letter when input starts with capital
  11 passing (6ms)
```

### Integration Tests
```
  Extension Test Suite
    ✔ Extension should be present
    ✔ Extension should activate
    ✔ Commands should be registered
  3 passing (2s)
```
