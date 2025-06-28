import * as vscode from 'vscode';

/**
 * Auto-activate Scribe theme if setting is enabled
 */
export function autoActivateTheme() {
    const config = vscode.workspace.getConfiguration('scribe');
    const autoActivate = config.get<boolean>('theme.autoActivate', true);
    
    if (autoActivate) {
        const currentTheme = vscode.workspace.getConfiguration('workbench').get<string>('colorTheme');
        if (currentTheme !== 'Scribe') {
            vscode.workspace.getConfiguration('workbench').update('colorTheme', 'Scribe', vscode.ConfigurationTarget.Global);
            console.log('[Scribe] Auto-activated Scribe theme');
        }
    }
}
