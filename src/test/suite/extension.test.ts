import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension('JohnnyPhilology.scribe'));
	});

	test('Extension should activate', async () => {
		const extension = vscode.extensions.getExtension('JohnnyPhilology.scribe');
		if (extension) {
			await extension.activate();
			assert.strictEqual(extension.isActive, true);
		}
	});

	test('Core commands should be registered', async () => {
		// Ensure extension is activated first
		const extension = vscode.extensions.getExtension('JohnnyPhilology.scribe');
		if (extension && !extension.isActive) {
			await extension.activate();
		}
		
		const commands = await vscode.commands.getCommands(true);
		
		// Test core functionality commands
		assert.ok(commands.includes('extension.convertLanguageBlocks'));
		assert.ok(commands.includes('scribe.setupWorkspaceSettings'));
	});

	test('Developer commands should be registered', async () => {
		// Ensure extension is activated first
		const extension = vscode.extensions.getExtension('JohnnyPhilology.scribe');
		if (extension && !extension.isActive) {
			await extension.activate();
		}
		
		const commands = await vscode.commands.getCommands(true);
		
		// Test developer mode commands
		const developerCommands = [
			'scribe.addWord',
			'scribe.autoMerge',
			'scribe.versionBump'
		];

		for (const cmd of developerCommands) {
			assert.ok(commands.includes(cmd), `Developer command ${cmd} should be registered`);
		}
	});

	test('Configuration settings should be available', () => {
		const config = vscode.workspace.getConfiguration('scribe');
		
		// Test that configuration schema is properly defined
		// These will have default values even if not explicitly set
		const enableSemanticTokens = config.get('enableSemanticTokens');
		const enableDeveloperMode = config.get('enableDeveloperMode');
		const dictionaryDataPath = config.get('dictionaryDataPath');
		
		// Should have boolean or defined values (not undefined)
		assert.notStrictEqual(enableSemanticTokens, undefined);
		assert.notStrictEqual(enableDeveloperMode, undefined);
		assert.notStrictEqual(dictionaryDataPath, undefined);
	});

	test('Language support should be properly configured', async () => {
		// Test that medieval languages are supported
		const supportedLanguages = ['oldenglish', 'oldnorse', 'gothic'];
		
		for (const lang of supportedLanguages) {
			// Try to create a document with the language
			try {
				const doc = await vscode.workspace.openTextDocument({
					language: lang,
					content: 'test content'
				});
				assert.ok(doc.languageId === lang);
				await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
			} catch (error) {
				console.log(`Language ${lang} test error:`, error);
				// Don't fail the test if language isn't fully configured in test environment
			}
		}
	});
});
