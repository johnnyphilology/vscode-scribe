import * as vscode from 'vscode';
import { MarkerCommand } from "../types/marker-command";
import { extractWordList as pureExtractWordList, stripDiacritics as pureStripDiacritics, applyCasing as pureApplyCasing } from './pureHelpers';

// Re-export pure functions
export const extractWordList = pureExtractWordList;
export const stripDiacritics = pureStripDiacritics;
export const applyCasing = pureApplyCasing;

// Re-export provider helpers for use in providers
export * from './providerHelpers';

// VS Code dependent functions
export function bracketMarkers(markers: Array<string>) {
    let markerCommands: MarkerCommand[] = [];
    markers.forEach(marker => {
       markerCommands.push({
           label: `<${marker}>`,
           detail: `Insert a ${marker} block`,
           insertText: new vscode.SnippetString(`<${marker}>\n$0\n</${marker}>`)
       });
    });
    return markerCommands;
}
