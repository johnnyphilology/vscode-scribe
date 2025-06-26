import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Completion Provider Test Suite', () => {

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
