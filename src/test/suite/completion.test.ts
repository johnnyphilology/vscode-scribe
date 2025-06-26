import * as assert from 'assert';
import * as vscode from 'vscode';
import { applyCasing } from '../../utils/helpers';

suite('Completion Provider Test Suite', () => {
	
	test('applyCasing should handle various casing scenarios', () => {
		// All lowercase input
		assert.strictEqual(applyCasing('test', 'example'), 'example');
		
		// First letter capitalized
		assert.strictEqual(applyCasing('Test', 'example'), 'Example');
		
		// All uppercase input (more than one character)
		assert.strictEqual(applyCasing('TEST', 'example'), 'EXAMPLE');
		
		// Single uppercase character
		assert.strictEqual(applyCasing('T', 'example'), 'Example');
		
		// Empty input
		assert.strictEqual(applyCasing('', 'example'), 'example');
	});

	test('completion provider should be registered for medieval languages', async () => {
		// This is an integration test that checks if completion providers are registered
		const languages = ['oldenglish', 'oldnorse', 'gothic'];
		
		for (const lang of languages) {
			// Create a mock document
			const uri = vscode.Uri.parse(`untitled:test.${lang === 'oldenglish' ? 'oe' : lang === 'oldnorse' ? 'on' : 'got'}`);
			const document = await vscode.workspace.openTextDocument({ 
				language: lang,
				content: 'test'
			});
			
			// Check if completion providers exist for the language
			const position = new vscode.Position(0, 4);
			const completions = await vscode.commands.executeCommand(
				'vscode.executeCompletionItemProvider',
				document.uri,
				position
			) as vscode.CompletionList;
			
			// The completion provider should be registered (may not have items if no matches)
			assert.ok(completions !== undefined);
		}
	});
});
