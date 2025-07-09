import * as vscode from 'vscode';
import oldEnglishSubs from '../../external/scribe-data/data/oldenglish/substitutions.json';

/**
 * Check if developer mode is enabled
 */
export function isDeveloperMode(): boolean {
    const config = vscode.workspace.getConfiguration('scribe');
    const devMode = config.get<boolean>('enableDeveloperMode');
    return devMode ?? false;
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
 * Handle Wynn mode configuration changes
 */
function handleWynnModeChange() {
    const config = vscode.workspace.getConfiguration('scribe');
    const enableWynn = config.get<boolean>('oldenglish.enableWynn', false);
    const autoReload = config.get<boolean>('autoReloadOnWynnToggle', true);
    const mode = enableWynn ? 'enabled' : 'disabled';
    
    if (autoReload) {
        // Auto-reload with a brief notification
        vscode.window.showInformationMessage(
            `ƿ Wynn mode ${mode}. Reloading window to apply changes...`,
            { modal: false }
        );
        // Small delay to let user see the message
        setTimeout(() => {
            vscode.commands.executeCommand('workbench.action.reloadWindow');
        }, 1000);
    } else {
        // Show choice for manual control
        vscode.window.showInformationMessage(
            `ƿ Wynn mode ${mode}. Old English completions and word highlighting will now ${enableWynn ? 'use ƿ (wynn)' : 'use w'} characters. A reload is required for changes to take effect.`,
            'Reload Window',
            'Later'
        ).then(selection => {
            if (selection === 'Reload Window') {
                vscode.commands.executeCommand('workbench.action.reloadWindow');
            }
        });
    }
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
                handleWynnModeChange();
            }
        }
    }, null, context.subscriptions);
}
