import * as vscode from 'vscode';
import { 
    WordEntry, 
    LanguageConfig, 
    getLanguages, 
    addWordToDictionary, 
    checkWordExists 
} from '../utils/wordDictionary';

export class AddWordWebviewPanel {
    private static currentPanel: AddWordWebviewPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it
        if (AddWordWebviewPanel.currentPanel) {
            AddWordWebviewPanel.currentPanel._panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel
        const panel = vscode.window.createWebviewPanel(
            'addWordPanel',
            '➕ Add Word to Dictionary',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [extensionUri]
            }
        );

        AddWordWebviewPanel.currentPanel = new AddWordWebviewPanel(panel, extensionUri);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;

        // Set the webview's initial html content
        this._panel.webview.html = this._getHtmlForWebview();

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.type) {
                    case 'addWord':
                        await this.handleAddWord(message.payload);
                        break;
                    case 'checkWord':
                        await this.handleCheckWord(message.payload);
                        break;
                }
            },
            null,
            this._disposables
        );
    }

    public dispose() {
        AddWordWebviewPanel.currentPanel = undefined;

        // Clean up our resources
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private async handleAddWord(payload: {
        language: string;
        word: string;
        detail: string;
        documentation: string;
        action?: 'add' | 'merge' | 'replace';
    }) {
        try {
            const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (!workspaceRoot) {
                this.showError('No workspace folder found');
                return;
            }

            // If no action specified, check if word exists first
            if (!payload.action) {
                const checkResult = checkWordExists(workspaceRoot, payload.language, payload.word);
                if (checkResult.exists && checkResult.entry) {
                    // Word exists, need user decision
                    const languages = getLanguages();
                    this.sendMessage({
                        type: 'wordExists',
                        payload: {
                            existing: checkResult.entry,
                            new: {
                                word: payload.word,
                                detail: payload.detail,
                                documentation: payload.documentation
                            },
                            language: languages[payload.language]?.name || payload.language
                        }
                    });
                    return;
                }
            }

            // Add the word
            const result = addWordToDictionary(
                workspaceRoot,
                payload.language,
                payload.word,
                payload.detail,
                payload.documentation,
                payload.action || 'add'
            );

            if (result.success) {
                const languages = getLanguages();
                this.sendMessage({
                    type: 'wordAdded',
                    payload: {
                        word: payload.word,
                        language: languages[payload.language]?.name || payload.language,
                        count: result.count || 0
                    }
                });
            } else {
                this.showError(result.message);
            }

        } catch (error) {
            this.showError(`Error adding word: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async handleCheckWord(payload: { language: string; word: string }) {
        try {
            const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (!workspaceRoot) {
                return;
            }

            const result = checkWordExists(workspaceRoot, payload.language, payload.word);

            this.sendMessage({
                type: 'wordCheckResult',
                payload: {
                    exists: result.exists,
                    entry: result.entry
                }
            });

        } catch (error) {
            console.error('Error checking word:', error);
        }
    }

    private sendMessage(message: any) {
        this._panel.webview.postMessage(message);
    }

    private showError(message: string) {
        vscode.window.showErrorMessage(message);
        this.sendMessage({
            type: 'error',
            payload: { message }
        });
    }

    private _getHtmlForWebview() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add Word to Dictionary</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            font-weight: var(--vscode-font-weight);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 30px;
            margin: 0;
            max-width: 800px;
            margin: 0 auto;
        }

        .container {
            background-color: var(--vscode-sideBar-background);
            padding: 30px;
            border-radius: 8px;
            border: 1px solid var(--vscode-panel-border);
        }

        .form-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
            color: var(--vscode-input-foreground);
            font-size: 14px;
        }

        input, select, textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid var(--vscode-input-border);
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 4px;
            box-sizing: border-box;
            font-size: 14px;
            font-family: var(--vscode-font-family);
        }

        textarea {
            resize: vertical;
            min-height: 120px;
            line-height: 1.5;
        }

        .button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 12px 20px;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 12px;
            margin-bottom: 12px;
            font-size: 14px;
            font-weight: 500;
        }

        .button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }

        .button.secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }

        .button.secondary:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }

        .status {
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
            display: none;
            font-weight: 500;
        }

        .status.success {
            background-color: var(--vscode-inputValidation-infoBackground);
            border: 1px solid var(--vscode-inputValidation-infoBorder);
            color: var(--vscode-inputValidation-infoForeground);
        }

        .status.error {
            background-color: var(--vscode-inputValidation-errorBackground);
            border: 1px solid var(--vscode-inputValidation-errorBorder);
            color: var(--vscode-inputValidation-errorForeground);
        }

        .existing-word {
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            padding: 15px;
            border-radius: 4px;
            margin: 15px 0;
        }

        .word-check {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 8px;
        }

        .word-exists-indicator {
            font-size: 12px;
            padding: 4px 8px;
            border-radius: 12px;
            font-weight: bold;
        }

        .word-exists-indicator.exists {
            background-color: var(--vscode-inputValidation-warningBackground);
            color: var(--vscode-inputValidation-warningForeground);
        }

        .word-exists-indicator.new {
            background-color: var(--vscode-inputValidation-infoBackground);
            color: var(--vscode-inputValidation-infoForeground);
        }

        .merge-options {
            display: none;
            margin-top: 20px;
            padding: 20px;
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            background-color: var(--vscode-input-background);
        }

        .merge-options h3 {
            margin-top: 0;
            color: var(--vscode-inputValidation-warningForeground);
            font-size: 16px;
        }

        .entry-preview {
            background-color: var(--vscode-editor-background);
            padding: 15px;
            border-radius: 4px;
            margin: 15px 0;
            border-left: 4px solid var(--vscode-textLink-foreground);
        }

        .entry-preview h4 {
            margin: 0 0 8px 0;
            color: var(--vscode-textLink-foreground);
            font-size: 14px;
        }

        .entry-preview p {
            margin: 8px 0;
            font-size: 13px;
            line-height: 1.4;
        }

        .form-actions {
            margin-top: 25px;
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }

        h1 {
            margin: 0 0 25px 0;
            color: var(--vscode-textLink-foreground);
            border-bottom: 2px solid var(--vscode-input-border);
            padding-bottom: 15px;
            font-size: 24px;
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        @media (max-width: 600px) {
            .form-row {
                grid-template-columns: 1fr;
            }
            
            body {
                padding: 15px;
            }
            
            .container {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📚 Add Word to Dictionary</h1>
        
        <div id="status" class="status"></div>

        <form id="addWordForm">
            <div class="form-row">
                <div class="form-group">
                    <label for="language">Language:</label>
                    <select id="language" required>
                        <option value="">Select a language...</option>
                        <option value="oldenglish">Old English</option>
                        <option value="oldnorse">Old Norse</option>
                        <option value="gothic">Gothic</option>
                        <option value="latin">Latin</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="word">Word:</label>
                    <input type="text" id="word" required placeholder="Enter the word">
                    <div class="word-check">
                        <span id="wordExists" class="word-exists-indicator" style="display: none;"></span>
                    </div>
                </div>
            </div>

            <div class="form-group">
                <label for="detail">Definition/Detail:</label>
                <input type="text" id="detail" required placeholder="Enter the definition or detail">
            </div>

            <div class="form-group">
                <label for="documentation">Documentation:</label>
                <textarea id="documentation" required placeholder="Enter documentation (etymology, usage examples, references, etc.)"></textarea>
            </div>

            <div id="mergeOptions" class="merge-options">
                <h3>⚠️ Word Already Exists!</h3>
                
                <div id="existingEntry" class="entry-preview">
                    <h4>Existing Entry:</h4>
                    <p><strong>Detail:</strong> <span id="existingDetail"></span></p>
                    <p><strong>Documentation:</strong> <span id="existingDocumentation"></span></p>
                </div>
                
                <div id="newEntry" class="entry-preview">
                    <h4>New Entry:</h4>
                    <p><strong>Detail:</strong> <span id="newDetail"></span></p>
                    <p><strong>Documentation:</strong> <span id="newDocumentation"></span></p>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="button" onclick="addWordWithAction('merge')">
                        🔀 Merge - Combine both entries
                    </button>
                    <button type="button" class="button" onclick="addWordWithAction('replace')">
                        🔄 Replace - Use new entry only
                    </button>
                    <button type="button" class="button secondary" onclick="cancelMerge()">
                        ❌ Cancel
                    </button>
                </div>
            </div>

            <div class="form-actions" id="normalActions">
                <button type="submit" class="button">➕ Add Word</button>
                <button type="button" class="button secondary" onclick="clearForm()">🔄 Clear Form</button>
            </div>
        </form>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let currentWordExists = false;
        let existingWordData = null;

        // Form elements
        const form = document.getElementById('addWordForm');
        const languageSelect = document.getElementById('language');
        const wordInput = document.getElementById('word');
        const detailInput = document.getElementById('detail');
        const documentationInput = document.getElementById('documentation');
        const statusDiv = document.getElementById('status');
        const wordExistsSpan = document.getElementById('wordExists');
        const mergeOptions = document.getElementById('mergeOptions');
        const normalActions = document.getElementById('normalActions');

        // Event listeners
        form.addEventListener('submit', handleSubmit);
        wordInput.addEventListener('input', debounce(checkWord, 500));
        languageSelect.addEventListener('change', () => {
            if (wordInput.value.trim()) {
                checkWord();
            }
        });

        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.type) {
                case 'wordAdded':
                    showStatus('success', \`✅ Word "\${message.payload.word}" added to \${message.payload.language} dictionary! Dictionary now contains \${message.payload.count} words.\`);
                    clearForm();
                    break;
                    
                case 'wordExists':
                    showMergeOptions(message.payload.existing, message.payload.new, message.payload.language);
                    break;
                    
                case 'wordCheckResult':
                    updateWordExistsIndicator(message.payload.exists, message.payload.entry);
                    break;
                    
                case 'error':
                    showStatus('error', message.payload.message);
                    break;
            }
        });

        function handleSubmit(e) {
            e.preventDefault();
            
            if (!validateForm()) {
                return;
            }

            const formData = {
                language: languageSelect.value,
                word: wordInput.value.trim(),
                detail: detailInput.value.trim(),
                documentation: documentationInput.value.trim()
            };

            vscode.postMessage({
                type: 'addWord',
                payload: formData
            });
        }

        function addWordWithAction(action) {
            const formData = {
                language: languageSelect.value,
                word: wordInput.value.trim(),
                detail: detailInput.value.trim(),
                documentation: documentationInput.value.trim(),
                action: action
            };

            vscode.postMessage({
                type: 'addWord',
                payload: formData
            });

            hideMergeOptions();
        }

        function cancelMerge() {
            hideMergeOptions();
        }

        function checkWord() {
            const word = wordInput.value.trim();
            const language = languageSelect.value;
            
            if (!word || !language) {
                wordExistsSpan.style.display = 'none';
                return;
            }

            vscode.postMessage({
                type: 'checkWord',
                payload: { language, word }
            });
        }

        function updateWordExistsIndicator(exists, entry) {
            currentWordExists = exists;
            existingWordData = entry;
            
            if (exists) {
                wordExistsSpan.textContent = 'Word exists';
                wordExistsSpan.className = 'word-exists-indicator exists';
                wordExistsSpan.style.display = 'inline-block';
            } else {
                wordExistsSpan.textContent = 'New word';
                wordExistsSpan.className = 'word-exists-indicator new';
                wordExistsSpan.style.display = 'inline-block';
            }
        }

        function showMergeOptions(existing, newEntry, language) {
            document.getElementById('existingDetail').textContent = existing.detail;
            document.getElementById('existingDocumentation').textContent = existing.documentation;
            document.getElementById('newDetail').textContent = newEntry.detail;
            document.getElementById('newDocumentation').textContent = newEntry.documentation;
            
            mergeOptions.style.display = 'block';
            normalActions.style.display = 'none';
        }

        function hideMergeOptions() {
            mergeOptions.style.display = 'none';
            normalActions.style.display = 'flex';
        }

        function validateForm() {
            const language = languageSelect.value;
            const word = wordInput.value.trim();
            const detail = detailInput.value.trim();
            const documentation = documentationInput.value.trim();

            if (!language) {
                showStatus('error', 'Please select a language.');
                languageSelect.focus();
                return false;
            }

            if (!word) {
                showStatus('error', 'Please enter a word.');
                wordInput.focus();
                return false;
            }

            if (!detail) {
                showStatus('error', 'Please enter a definition/detail.');
                detailInput.focus();
                return false;
            }

            if (!documentation) {
                showStatus('error', 'Please enter documentation.');
                documentationInput.focus();
                return false;
            }

            return true;
        }

        function clearForm() {
            form.reset();
            wordExistsSpan.style.display = 'none';
            hideMergeOptions();
            hideStatus();
            currentWordExists = false;
            existingWordData = null;
        }

        function showStatus(type, message) {
            statusDiv.textContent = message;
            statusDiv.className = \`status \${type}\`;
            statusDiv.style.display = 'block';
            
            // Auto-hide success messages after 5 seconds
            if (type === 'success') {
                setTimeout(hideStatus, 5000);
            }
        }

        function hideStatus() {
            statusDiv.style.display = 'none';
        }

        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    </script>
</body>
</html>`;
    }
}
