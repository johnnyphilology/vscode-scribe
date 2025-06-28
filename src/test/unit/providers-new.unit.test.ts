import { describe, it } from 'mocha';
import * as assert from 'assert';
import * as sinon from 'sinon';

// Mock VS Code API since these are unit tests
const mockVSCode = {
    workspace: {
        getConfiguration: sinon.stub(),
    },
    Uri: {
        file: sinon.stub().returns({ fsPath: '/mock/path' }),
    },
    window: {
        showInformationMessage: sinon.stub(),
        showErrorMessage: sinon.stub(),
    },
    ConfigurationTarget: {
        Global: 1,
    },
};

// Mock the vscode module before importing our modules
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function (...args: any[]) {
    if (args[0] === 'vscode') {
        return mockVSCode;
    }
    return originalRequire.apply(this, args);
};

// Import modules after setting up mocks
import { generateSettingsTemplate } from '../../providers/settingsTemplate';
import { applyTheme, resetTheme } from '../../providers/themeManager';
import { isDeveloperMode } from '../../providers/configurationManager';

describe('New Provider Modules', () => {
    
    beforeEach(() => {
        // Reset all stubs before each test
        sinon.resetHistory();
    });

    describe('settingsTemplate', () => {
        describe('generateSettingsTemplate', () => {
            it('should return a valid JSON settings template', () => {
                const mockConfig = {
                    get: sinon.stub().withArgs('completion.highlightColor', '#FFD700').returns('#FFD700'),
                };
                mockVSCode.workspace.getConfiguration.returns(mockConfig);
                
                const template = generateSettingsTemplate();
                
                // Should be valid JSON
                assert.doesNotThrow(() => JSON.parse(template));
                
                const settings = JSON.parse(template);
                
                // Should include scribe-specific settings
                assert.ok('scribe.dictionaryDataPath' in settings);
                assert.ok('scribe.enableSemanticTokens' in settings);
                assert.ok('scribe.enableDeveloperMode' in settings);
                
                // Should have reasonable default values
                assert.strictEqual(settings['scribe.enableSemanticTokens'], true);
                assert.strictEqual(settings['scribe.enableDeveloperMode'], false);
                assert.ok(typeof settings['scribe.dictionaryDataPath'] === 'string');
            });

            it('should include theme and file association settings', () => {
                const mockConfig = {
                    get: sinon.stub().withArgs('completion.highlightColor', '#FFD700').returns('#FFD700'),
                };
                mockVSCode.workspace.getConfiguration.returns(mockConfig);
                
                const template = generateSettingsTemplate();
                const settings = JSON.parse(template);
                
                // Should include theme settings
                assert.ok(settings['workbench.colorTheme']);
                assert.ok(settings['workbench.iconTheme']);
                
                // Should include file associations
                assert.ok(settings['files.associations']);
                assert.ok(settings['files.associations']['*.oe']);
                assert.ok(settings['files.associations']['*.on']);
                assert.ok(settings['files.associations']['*.got']);
            });

            it('should be properly formatted JSON', () => {
                const mockConfig = {
                    get: sinon.stub().withArgs('completion.highlightColor', '#FFD700').returns('#FFD700'),
                };
                mockVSCode.workspace.getConfiguration.returns(mockConfig);
                
                const template = generateSettingsTemplate();
                
                // Should start and end with braces
                assert.ok(template.trim().startsWith('{'));
                assert.ok(template.trim().endsWith('}'));
                
                // Should have proper indentation (assuming 2 spaces)
                const lines = template.split('\n');
                const indentedLines = lines.filter((line: string) => line.startsWith('  '));
                assert.ok(indentedLines.length > 0, 'Should have indented lines');
            });
        });
    });

    describe('themeManager', () => {
        describe('applyTheme', () => {
            beforeEach(() => {
                const mockConfig = {
                    update: sinon.stub().resolves(),
                };
                mockVSCode.workspace.getConfiguration.returns(mockConfig);
            });

            it('should update workbench settings for theme application', async () => {
                const mockConfig = mockVSCode.workspace.getConfiguration();
                
                await applyTheme();
                
                // Should call getConfiguration for workbench
                assert.ok(mockVSCode.workspace.getConfiguration.calledWith('workbench'));
                
                // Should update colorTheme and iconTheme
                assert.ok(mockConfig.update.calledWith('colorTheme', 'Scribe Medieval Theme', 1));
                assert.ok(mockConfig.update.calledWith('iconTheme', 'scribe-icon-theme', 1));
            });

            it('should show success message on successful theme application', async () => {
                await applyTheme();
                
                assert.ok(mockVSCode.window.showInformationMessage.calledOnce);
                const message = mockVSCode.window.showInformationMessage.firstCall.args[0];
                assert.ok(message.includes('Scribe theme'));
            });

            it('should handle errors gracefully', async () => {
                const mockConfig = {
                    update: sinon.stub().rejects(new Error('Update failed')),
                };
                mockVSCode.workspace.getConfiguration.returns(mockConfig);
                
                await applyTheme();
                
                assert.ok(mockVSCode.window.showErrorMessage.calledOnce);
                const errorMessage = mockVSCode.window.showErrorMessage.firstCall.args[0];
                assert.ok(errorMessage.includes('Error applying theme'));
            });
        });

        describe('resetTheme', () => {
            beforeEach(() => {
                const mockConfig = {
                    update: sinon.stub().resolves(),
                };
                mockVSCode.workspace.getConfiguration.returns(mockConfig);
            });

            it('should reset workbench settings to default', async () => {
                const mockConfig = mockVSCode.workspace.getConfiguration();
                
                await resetTheme();
                
                // Should call getConfiguration for workbench
                assert.ok(mockVSCode.workspace.getConfiguration.calledWith('workbench'));
                
                // Should reset colorTheme and iconTheme to undefined
                assert.ok(mockConfig.update.calledWith('colorTheme', undefined, 1));
                assert.ok(mockConfig.update.calledWith('iconTheme', undefined, 1));
            });

            it('should show success message on successful theme reset', async () => {
                await resetTheme();
                
                assert.ok(mockVSCode.window.showInformationMessage.calledOnce);
                const message = mockVSCode.window.showInformationMessage.firstCall.args[0];
                assert.ok(message.includes('reset'));
            });
        });
    });

    describe('configurationManager', () => {
        describe('isDeveloperMode', () => {
            it('should return false when developer mode is disabled', () => {
                const mockConfig = {
                    get: sinon.stub().withArgs('enableDeveloperMode').returns(false),
                };
                mockVSCode.workspace.getConfiguration.returns(mockConfig);
                
                const result = isDeveloperMode();
                
                assert.strictEqual(result, false);
                assert.ok(mockVSCode.workspace.getConfiguration.calledWith('scribe'));
            });

            it('should return true when developer mode is enabled', () => {
                const mockConfig = {
                    get: sinon.stub().withArgs('enableDeveloperMode').returns(true),
                };
                mockVSCode.workspace.getConfiguration.returns(mockConfig);
                
                const result = isDeveloperMode();
                
                assert.strictEqual(result, true);
            });

            it('should handle missing configuration gracefully', () => {
                const mockConfig = {
                    get: sinon.stub().withArgs('enableDeveloperMode').returns(undefined),
                };
                mockVSCode.workspace.getConfiguration.returns(mockConfig);
                
                const result = isDeveloperMode();
                
                // Should default to false
                assert.strictEqual(result, false);
            });
        });
    });
});
