import * as assert from 'assert';
import * as vscode from 'vscode';
import * as myExtension from '../../extension';

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

	test('Commands should be registered', async () => {
		const commands = await vscode.commands.getCommands(true);
		assert.ok(commands.includes('extension.convertRunesBlocks'));
	});
});
