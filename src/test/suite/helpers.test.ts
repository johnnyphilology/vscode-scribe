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

	test('stripDiacritics should handle medieval language characters', () => {
		// Old English specific characters
		assert.strictEqual(stripDiacritics('hūs'), 'hus'); // long u
		assert.strictEqual(stripDiacritics('æppel'), 'aeppel'); // ash
		assert.strictEqual(stripDiacritics('þæt'), 'thaet'); // thorn + ash
		assert.strictEqual(stripDiacritics('ġōd'), 'god'); // dotted g + long o
		assert.strictEqual(stripDiacritics('cȳning'), 'cyning'); // long y
		assert.strictEqual(stripDiacritics('ƿiþ'), 'with'); // wynn + thorn
		
		// Old Norse specific characters  
		assert.strictEqual(stripDiacritics('Óðinn'), 'othinn'); // accented o + eth
		assert.strictEqual(stripDiacritics('Ragnarök'), 'ragnarok'); // accented o
		assert.strictEqual(stripDiacritics('víkingr'), 'vikingr'); // accented i
		assert.strictEqual(stripDiacritics('þórr'), 'thorr'); // thorn + accented o
		assert.strictEqual(stripDiacritics('áss'), 'ass'); // accented a
		
		// Gothic specific characters
		assert.strictEqual(stripDiacritics('guþ'), 'guth'); // thorn
		assert.strictEqual(stripDiacritics('ƕas'), 'hvas'); // hwair
		
		// Mixed medieval text
		assert.strictEqual(stripDiacritics('Béowulf'), 'beowulf');
		assert.strictEqual(stripDiacritics('Ēadweard'), 'eadweard');
		assert.strictEqual(stripDiacritics('Ælfræd'), 'aelfraeth');
		
		// Should preserve non-diacritic characters
		assert.strictEqual(stripDiacritics('cyning'), 'cyning');
		assert.strictEqual(stripDiacritics(''), '');
	});
});
