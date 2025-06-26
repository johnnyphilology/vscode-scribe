import { describe, it } from 'mocha';
import * as assert from 'assert';
import { extractWordList, isInAtMarker, stripDiacritics, applyCasing } from '../../utils/pureHelpers';

// Unit tests that don't require VS Code context
describe('Scribe Utility Functions', () => {
	
	describe('extractWordList', () => {
		it('should extract word strings from word entries', () => {
			const wordEntries = [
				{ word: 'hello' },
				{ word: 'world' },
				{ word: 'test' }
			];
			const result = extractWordList(wordEntries);
			assert.deepStrictEqual(result, ['hello', 'world', 'test']);
		});

		it('should handle empty array', () => {
			const result = extractWordList([]);
			assert.deepStrictEqual(result, []);
		});
	});

	describe('isInAtMarker', () => {
		it('should detect @ markers at start of line', () => {
			assert.strictEqual(isInAtMarker('@runes test'), true);
			assert.strictEqual(isInAtMarker('  @marker'), true);
			assert.strictEqual(isInAtMarker('@'), false); // needs word boundary
		});

		it('should not detect @ markers in middle of line', () => {
			assert.strictEqual(isInAtMarker('normal text'), false);
			assert.strictEqual(isInAtMarker('text @marker'), false);
		});
	});

	describe('stripDiacritics', () => {
		it('should remove common diacritical marks', () => {
			assert.strictEqual(stripDiacritics('café'), 'cafe');
			assert.strictEqual(stripDiacritics('naïve'), 'naive');
			assert.strictEqual(stripDiacritics('résumé'), 'resume');
		});

		it('should handle Old English characters', () => {
			assert.strictEqual(stripDiacritics('æ'), 'ae');
			assert.strictEqual(stripDiacritics('þ'), 'th');
			assert.strictEqual(stripDiacritics('ð'), 'th');
			assert.strictEqual(stripDiacritics('ƿ'), 'w');
		});

		it('should handle text without diacritics', () => {
			assert.strictEqual(stripDiacritics('normal'), 'normal');
			assert.strictEqual(stripDiacritics(''), '');
		});
	});

	describe('applyCasing', () => {
		it('should preserve lowercase when input is lowercase', () => {
			assert.strictEqual(applyCasing('test', 'example'), 'example');
		});

		it('should capitalize first letter when input starts with capital', () => {
			assert.strictEqual(applyCasing('Test', 'example'), 'Example');
			assert.strictEqual(applyCasing('T', 'example'), 'Example');
		});

		it('should make all uppercase when input is all uppercase', () => {
			assert.strictEqual(applyCasing('TEST', 'example'), 'EXAMPLE');
		});

		it('should handle empty input', () => {
			assert.strictEqual(applyCasing('', 'example'), 'example');
		});
	});
});
