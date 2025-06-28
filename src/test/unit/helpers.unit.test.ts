import * as assert from 'assert';
import { extractWordList, stripDiacritics, applyCasing } from '../../utils/pureHelpers';

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

	describe('stripDiacritics', () => {
		it('should remove common diacritical marks', () => {
			assert.strictEqual(stripDiacritics('café'), 'cafe');
			assert.strictEqual(stripDiacritics('naïve'), 'naive');
			assert.strictEqual(stripDiacritics('résumé'), 'resume');
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
