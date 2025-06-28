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

/**
 * Apply the Scribe theme
 */
export async function applyTheme(): Promise<void> {
    try {
        const workbenchConfig = vscode.workspace.getConfiguration('workbench');
        await workbenchConfig.update('colorTheme', 'Scribe Medieval Theme', vscode.ConfigurationTarget.Global);
        await workbenchConfig.update('iconTheme', 'scribe-icon-theme', vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage('Scribe theme applied successfully!');
    } catch (error) {
        vscode.window.showErrorMessage(`Error applying theme: ${error}`);
    }
}

/**
 * Reset theme to default
 */
export async function resetTheme(): Promise<void> {
    try {
        const workbenchConfig = vscode.workspace.getConfiguration('workbench');
        await workbenchConfig.update('colorTheme', undefined, vscode.ConfigurationTarget.Global);
        await workbenchConfig.update('iconTheme', undefined, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage('Theme reset to default successfully!');
    } catch (error) {
        vscode.window.showErrorMessage(`Error resetting theme: ${error}`);
    }
}
