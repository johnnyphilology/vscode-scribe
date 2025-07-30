import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export interface WordEntry {
    word: string;
    detail: string;
    documentation: string;
}

export interface LanguageConfig {
    id: string;
    name: string;
    file: string;
}

/**
 * Get the configured data path from VS Code settings
 */
function getDataPath(): string {
    const config = vscode.workspace.getConfiguration('scribe');
    return config.get<string>('dataPath', 'data');
}

/**
 * Get language configurations with current data path
 */
export function getLanguages(): { [key: string]: LanguageConfig } {
    const dataPath = getDataPath();
    
    return {
        'oldenglish': { 
            id: 'oldenglish', 
            name: 'Old English', 
            file: path.join(dataPath, 'oldenglish', 'completionWords.json')
        },
        'oldnorse': { 
            id: 'oldnorse', 
            name: 'Old Norse', 
            file: path.join(dataPath, 'oldnorse', 'completionWords.json')
        },
        'gothic': { 
            id: 'gothic', 
            name: 'Gothic', 
            file: path.join(dataPath, 'gothic', 'completionWords.json')
        },
        'latin': { 
            id: 'latin', 
            name: 'Latin', 
            file: path.join(dataPath, 'latin', 'completionWords.json')
        }
    };
}

// Legacy export for backward compatibility
export const LANGUAGES = getLanguages();

/**
 * Load words from a JSON file
 */
export function loadWords(filePath: string): WordEntry[] {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        throw new Error(`Error loading ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Save words to a JSON file
 */
export function saveWords(filePath: string, words: WordEntry[]): boolean {
    try {
        const content = JSON.stringify(words, null, 2) + '\n';
        fs.writeFileSync(filePath, content);
        return true;
    } catch (error) {
        console.error(`Error saving ${filePath}:`, error);
        return false;
    }
}

/**
 * Find an existing word in the words array (case-insensitive)
 */
export function findExistingWord(words: WordEntry[], targetWord: string): WordEntry | undefined {
    return words.find(entry => 
        entry.word.toLowerCase() === targetWord.toLowerCase()
    );
}

/**
 * Merge two word entries
 */
export function mergeEntries(existing: WordEntry, newEntry: WordEntry): WordEntry {
    const mergedDetail = existing.detail === newEntry.detail 
        ? existing.detail 
        : `${existing.detail}; ${newEntry.detail}`;
        
    const mergedDocumentation = existing.documentation === newEntry.documentation
        ? existing.documentation
        : `${existing.documentation}\n\n${newEntry.documentation}`;
        
    return {
        word: existing.word,
        detail: mergedDetail,
        documentation: mergedDocumentation
    };
}

/**
 * Add a word to the dictionary
 */
export function addWordToDictionary(
    workspaceRoot: string,
    languageId: string,
    word: string,
    detail: string,
    documentation: string,
    action: 'add' | 'merge' | 'replace' = 'add'
): { success: boolean; message: string; count?: number } {
    try {
        const languages = getLanguages();
        const language = languages[languageId];
        if (!language) {
            return { success: false, message: 'Invalid language selected' };
        }

        const filePath = path.join(workspaceRoot, language.file);
        if (!fs.existsSync(filePath)) {
            return { success: false, message: `Language file not found: ${language.file}` };
        }

        const words = loadWords(filePath);
        const existingEntry = findExistingWord(words, word);

        const newEntry: WordEntry = { word, detail, documentation };
        let finalEntry = newEntry;

        if (existingEntry) {
            switch (action) {
                case 'merge':
                    finalEntry = mergeEntries(existingEntry, newEntry);
                    break;
                case 'replace':
                    finalEntry = newEntry;
                    break;
                case 'add':
                    return { 
                        success: false, 
                        message: `Word "${word}" already exists. Please specify merge or replace action.` 
                    };
            }
        }

        // Remove existing entry if it exists
        if (existingEntry) {
            const index = words.findIndex(entry => 
                entry.word.toLowerCase() === word.toLowerCase()
            );
            if (index !== -1) {
                words.splice(index, 1);
            }
        }

        // Add new entry
        words.push(finalEntry);

        // Sort alphabetically by word
        words.sort((a, b) => a.word.toLowerCase().localeCompare(b.word.toLowerCase()));

        // Save file
        if (saveWords(filePath, words)) {
            return {
                success: true,
                message: `Word "${finalEntry.word}" added to ${language.name} dictionary!`,
                count: words.length
            };
        } else {
            return { success: false, message: 'Failed to save the dictionary file' };
        }

    } catch (error) {
        return {
            success: false,
            message: `Error adding word: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}

/**
 * Check if a word exists in the dictionary
 */
export function checkWordExists(
    workspaceRoot: string,
    languageId: string,
    word: string
): { exists: boolean; entry?: WordEntry } {
    try {
        const languages = getLanguages();
        const language = languages[languageId];
        if (!language) {
            return { exists: false };
        }

        const filePath = path.join(workspaceRoot, language.file);
        if (!fs.existsSync(filePath)) {
            return { exists: false };
        }

        const words = loadWords(filePath);
        const existingEntry = findExistingWord(words, word);

        return {
            exists: !!existingEntry,
            entry: existingEntry
        };

    } catch (error) {
        console.error('Error checking word:', error);
        return { exists: false };
    }
}
