import * as assert from 'assert';
import * as vscode from 'vscode';

describe('Basic Integration Tests', () => {
	
	it('Extension should be present', () => {
		// Skip if VS Code API is not available
		if (!vscode.extensions) {
			console.log('Skipping test - VS Code extensions API not available');
			return;
		}
		assert.ok(vscode.extensions.getExtension('JohnnyPhilology.scribe'));
	});

	it('Extension should activate', async () => {
		// Skip if VS Code API is not available
		if (!vscode.extensions) {
			console.log('Skipping test - VS Code extensions API not available');
			return;
		}
		const extension = vscode.extensions.getExtension('JohnnyPhilology.scribe');
		if (extension) {
			await extension.activate();
			assert.strictEqual(extension.isActive, true);
		}
	});

	it('Core commands should be registered', async () => {
		// Skip if VS Code API is not available
		if (!vscode.extensions || !vscode.commands) {
			console.log('Skipping test - VS Code API not available');
			return;
		}
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

	it('Developer commands should be registered', async () => {
		// Skip if VS Code API is not available
		if (!vscode.extensions || !vscode.commands) {
			console.log('Skipping test - VS Code API not available');
			return;
		}
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

	it('Configuration settings should be available', () => {
		const config = vscode.workspace.getConfiguration('scribe');
		
		// Test that configuration schema is properly defined
		// These will have default values even if not explicitly set
		const autoActivateTheme = config.get('theme.autoActivate');
		const developerMode = config.get('developerMode');
		const dataPath = config.get('dataPath');
		const highlightColor = config.get('completion.highlightColor');
		
		// Should have boolean or defined values (not undefined)
		assert.notStrictEqual(autoActivateTheme, undefined);
		assert.notStrictEqual(developerMode, undefined);
		assert.notStrictEqual(dataPath, undefined);
		assert.notStrictEqual(highlightColor, undefined);
	});
});
