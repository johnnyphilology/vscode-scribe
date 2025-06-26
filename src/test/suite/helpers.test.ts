import * as assert from 'assert';
import * as vscode from 'vscode';
import { bracketMarkers, extractWordList, stripDiacritics } from '../../utils/helpers';

suite('Helper Functions Test Suite', () => {
	
	test('bracketMarkers should create proper marker commands', () => {
		const markers = ['runes', 'test'];
		const result = bracketMarkers(markers);
		
		assert.strictEqual(result.length, 2);
		assert.strictEqual(result[0].label, '<runes>');
		assert.strictEqual(result[0].detail, 'Insert a runes block');
		assert.ok(result[0].insertText instanceof vscode.SnippetString);
	});

	test('extractWordList should extract word strings from word entries', () => {
		const wordEntries = [
			{ word: 'hello' },
			{ word: 'world' },
			{ word: 'test' }
		];
		const result = extractWordList(wordEntries);
		
		assert.deepStrictEqual(result, ['hello', 'world', 'test']);
	});

	test('stripDiacritics should remove diacritical marks', () => {
		assert.strictEqual(stripDiacritics('café'), 'cafe');
		assert.strictEqual(stripDiacritics('naïve'), 'naive');
		assert.strictEqual(stripDiacritics('résumé'), 'resume');
		assert.strictEqual(stripDiacritics('normal'), 'normal');
	});
});
