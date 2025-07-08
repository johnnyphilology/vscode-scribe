import * as vscode from 'vscode';
import { 
    getLanguages, 
    addWordToDictionary, 
    checkWordExists 
} from '../utils/wordDictionary';

export class AddWordWebviewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'scribe.addWordView';
    private _view?: vscode.WebviewView;
    private readonly _extensionUri: vscode.Uri;

    constructor(private readonly extensionUri: vscode.Uri) {
        this._extensionUri = extensionUri;
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(
            async (data) => {
                switch (data.type) {
                    case 'addWord':
                        await this.handleAddWord(data.payload);
                        break;
                    case 'checkWord':
                        await this.handleCheckWord(data.payload);
                        break;
                }
            },
            undefined,
            []
        );
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

            // Normalize word to lowercase for consistency
            const normalizedWord = payload.word.toLowerCase().trim();

            // If no action specified, check if word exists first
            if (!payload.action) {
                const checkResult = checkWordExists(workspaceRoot, payload.language, normalizedWord);
                if (checkResult.exists && checkResult.entry) {
                    // Word exists, need user decision
                    const languages = getLanguages();
                    this.sendMessage({
                        type: 'wordExists',
                        payload: {
                            existing: checkResult.entry,
                            new: {
                                word: normalizedWord,
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
                normalizedWord,
                payload.detail,
                payload.documentation,
                payload.action || 'add'
            );

            if (result.success) {
                const languages = getLanguages();
                this.sendMessage({
                    type: 'wordAdded',
                    payload: {
                        word: normalizedWord,
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

            // Normalize word to lowercase for consistency
            const normalizedWord = payload.word.toLowerCase().trim();
            const result = checkWordExists(workspaceRoot, payload.language, normalizedWord);

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
        if (this._view) {
            this._view.webview.postMessage(message);
        }
    }

    private showError(message: string) {
        vscode.window.showErrorMessage(message);
        this.sendMessage({
            type: 'error',
            payload: { message }
        });
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
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
            padding: 20px;
            margin: 0;
        }

        .form-group {
            margin-bottom: 15px;
        }

        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: var(--vscode-input-foreground);
        }

        input, select, textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid var(--vscode-input-border);
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 2px;
            box-sizing: border-box;
        }

        textarea {
            resize: vertical;
            min-height: 80px;
            font-family: var(--vscode-font-family);
        }

        .button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            border-radius: 2px;
            cursor: pointer;
            margin-right: 8px;
            margin-bottom: 8px;
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
            padding: 10px;
            border-radius: 2px;
            margin-bottom: 15px;
            display: none;
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

        .status.warning {
            background-color: var(--vscode-inputValidation-warningBackground);
            border: 1px solid var(--vscode-inputValidation-warningBorder);
            color: var(--vscode-inputValidation-warningForeground);
        }

        .existing-word {
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            padding: 10px;
            border-radius: 2px;
            margin: 10px 0;
        }

        .word-check {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 5px;
        }

        .word-exists-indicator {
            font-size: 12px;
            padding: 2px 6px;
            border-radius: 2px;
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
            margin-top: 15px;
            padding: 15px;
            border: 1px solid var(--vscode-input-border);
            border-radius: 2px;
            background-color: var(--vscode-input-background);
        }

        .merge-options h3 {
            margin-top: 0;
            color: var(--vscode-inputValidation-warningForeground);
        }

        .entry-preview {
            background-color: var(--vscode-editor-background);
            padding: 10px;
            border-radius: 2px;
            margin: 10px 0;
            border-left: 3px solid var(--vscode-textLink-foreground);
        }

        .entry-preview h4 {
            margin: 0 0 5px 0;
            color: var(--vscode-textLink-foreground);
        }

        .entry-preview p {
            margin: 5px 0;
            font-size: 0.9em;
        }

        .form-actions {
            margin-top: 20px;
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }

        h1 {
            margin-top: 0;
            color: var(--vscode-textLink-foreground);
            border-bottom: 1px solid var(--vscode-input-border);
            padding-bottom: 10px;
        }
    </style>
</head>
<body>
    <h1>📚 Add Word to Dictionary</h1>
    
    <div id="status" class="status"></div>

    <form id="addWordForm">
        <div class="form-group">
            <label for="language">Language:</label>
            <select id="language" required>
                <option value="">Select a language...</option>
                <option value="oldenglish" selected>Old English</option>
                <option value="oldnorse">Old Norse</option>
                <option value="gothic">Gothic</option>
            </select>
        </div>

        <div class="form-group">
            <label for="word">Word:</label>
            <input type="text" id="word" required placeholder="Enter the word (will be stored as lowercase)">
            <div class="word-check">
                <span id="wordExists" class="word-exists-indicator" style="display: none;"></span>
            </div>
        </div>

        <div class="form-group">
            <label for="detail">Definition/Detail:</label>
            <input type="text" id="detail" required placeholder="Enter the definition or detail">
        </div>

        <div class="form-group">
            <label for="documentation">Documentation:</label>
            <textarea id="documentation" required placeholder="Enter documentation (multi-line supported)"></textarea>
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
                word: wordInput.value.toLowerCase().trim(), // Normalize to lowercase
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
                word: wordInput.value.toLowerCase().trim(), // Normalize to lowercase
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

            // Normalize word to lowercase for checking
            const normalizedWord = word.toLowerCase();

            vscode.postMessage({
                type: 'checkWord',
                payload: { language, word: normalizedWord }
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
