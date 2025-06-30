import * as vscode from 'vscode';
import oldEnglishSubs from '../../data/oldenglish/substitutions.json';

/**
 * Check if developer mode is enabled
 */
export function isDeveloperMode(): boolean {
    const config = vscode.workspace.getConfiguration('scribe');
    const devMode = config.get<boolean>('enableDeveloperMode');
    return devMode !== undefined ? devMode : false;
}

/**
 * Get dynamic Old English substitutions based on wynn setting
 */
export function getOldEnglishSubstitutions(): { [key: string]: string } {
    const config = vscode.workspace.getConfiguration('scribe');
    const enableWynn = config.get<boolean>('oldenglish.enableWynn', false);
    
    const baseSubstitutions: { [key: string]: string } = { ...oldEnglishSubs };
    
    if (enableWynn) {
        // Add w -> ƿ substitution
        baseSubstitutions['w'] = 'ƿ';
        baseSubstitutions['W'] = 'Ƿ';
    }
    
    return baseSubstitutions;
}

/**
 * Register configuration change handlers
 */
export function registerConfigurationHandlers(context: vscode.ExtensionContext) {
    // Watch for configuration changes
    vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('scribe')) {
            if (event.affectsConfiguration('scribe.completion.highlightColor')) {
                vscode.window.showInformationMessage(
                    '🎨 Word entry highlight color changed. Update your settings.json with the new template to see changes.',
                    'Generate Template'
                ).then(selection => {
                    if (selection === 'Generate Template') {
                        vscode.commands.executeCommand('scribe.setupWorkspaceSettings');
                    }
                });
            }
            
            if (event.affectsConfiguration('scribe.oldenglish.enableWynn')) {
                const config = vscode.workspace.getConfiguration('scribe');
                const enableWynn = config.get<boolean>('oldenglish.enableWynn', false);
                const mode = enableWynn ? 'enabled' : 'disabled';
                vscode.window.showInformationMessage(
                    `ƿ Wynn mode ${mode}. Old English completions and word highlighting will now ${enableWynn ? 'use ƿ (wynn)' : 'use w'} characters.`
                );
            }
        }
    }, null, context.subscriptions);
}
