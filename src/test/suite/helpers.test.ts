import * as assert from 'assert';
import * as vscode from 'vscode';
import { bracketMarkers, extractWordList, stripDiacritics } from '../../utils/helpers';

describe('Helper Functions Test Suite', () => {
	
	it('bracketMarkers should create proper marker commands', () => {
		// Skip if VS Code API is not available
		if (!vscode.SnippetString) {
			console.log('Skipping test - VS Code SnippetString API not available');
			return;
		}
		
		const markers = ['runes', 'test'];
		const result = bracketMarkers(markers);
		
		assert.strictEqual(result.length, 2);
		assert.strictEqual(result[0].label, '<runes>');
		assert.strictEqual(result[0].detail, 'Insert a runes block');
		assert.ok(result[0].insertText instanceof vscode.SnippetString);
	});

	it('extractWordList should extract word strings from word entries', () => {
		const wordEntries = [
			{ word: 'hello' },
			{ word: 'world' },
			{ word: 'test' }
		];
		const result = extractWordList(wordEntries);
		
		assert.deepStrictEqual(result, ['hello', 'world', 'test']);
	});

	it('stripDiacritics should only remove diacritical marks, preserve medieval letters', () => {
		// Should only remove diacritical marks (macrons, accents) from vowels
		assert.strictEqual(stripDiacritics('hūs'), 'hus'); // remove macron from u
		assert.strictEqual(stripDiacritics('gōd'), 'god'); // remove macron from o
		assert.strictEqual(stripDiacritics('cȳning'), 'cyning'); // remove macron from y
		assert.strictEqual(stripDiacritics('Óðinn'), 'Oðinn'); // remove accent from O
		assert.strictEqual(stripDiacritics('víkingr'), 'vikingr'); // remove accent from i
		assert.strictEqual(stripDiacritics('áss'), 'ass'); // remove accent from a
		
		// Should convert macron ash to regular ash
		assert.strictEqual(stripDiacritics('ǣppel'), 'æppel'); // macron ash to regular ash
		assert.strictEqual(stripDiacritics('Ǣlfræd'), 'Ælfræd'); // macron ash to regular ash
		
		// Should preserve all medieval letters without diacritics
		assert.strictEqual(stripDiacritics('æppel'), 'æppel'); // preserve regular ash
		assert.strictEqual(stripDiacritics('þæt'), 'þæt'); // preserve thorn and ash
		assert.strictEqual(stripDiacritics('ƿiþ'), 'ƿiþ'); // preserve wynn and thorn
		assert.strictEqual(stripDiacritics('guþ'), 'guþ'); // preserve thorn
		assert.strictEqual(stripDiacritics('ƕas'), 'ƕas'); // preserve hwair
		assert.strictEqual(stripDiacritics('ċġ'), 'cg'); // dotted letters still get normalized
		
		// Mixed examples
		assert.strictEqual(stripDiacritics('Béowulf'), 'Beowulf'); // remove accent from e
		assert.strictEqual(stripDiacritics('Ēadweard'), 'Eadweard'); // remove macron from E
		
		// Should preserve text without diacritics
		assert.strictEqual(stripDiacritics('cyning'), 'cyning');
		assert.strictEqual(stripDiacritics('þðƿƕæ'), 'þðƿƕæ'); // all medieval letters preserved
		assert.strictEqual(stripDiacritics(''), '');
	});
});
