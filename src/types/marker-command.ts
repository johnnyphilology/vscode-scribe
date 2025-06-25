import * as vscode from 'vscode';

export interface MarkerCommand {
    label: string;
    detail?: string;
    insertText?: string | vscode.SnippetString;
}