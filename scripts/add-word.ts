#!/usr/bin/env node

import * as readline from 'readline';
import * as process from 'process';
import * as path from 'path';
import * as fs from 'fs';
import { 
    WordEntry, 
    LanguageConfig, 
    LANGUAGES, 
    addWordToDictionary, 
    checkWordExists, 
    mergeEntries,
    findExistingWord,
    loadWords
} from '../src/utils/wordDictionary';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askLanguage(): Promise<LanguageConfig> {
  return new Promise((resolve) => {
    console.log('\n📚 Add New Word Entry');
    console.log('====================');
    console.log('Select language:');
    console.log('  1) Old English');
    console.log('  2) Old Norse');
    console.log('  3) Gothic');
    console.log('  q) quit - Cancel operation');
    
    rl.question('\nEnter your choice (1/2/3/q): ', (answer) => {
      const choice = answer.toLowerCase().trim();
      switch (choice) {
        case '1':
          resolve(LANGUAGES.oldenglish);
          break;
        case '2':
          resolve(LANGUAGES.oldnorse);
          break;
        case '3':
          resolve(LANGUAGES.gothic);
          break;
        case 'q':
        case 'quit':
          console.log('❌ Operation cancelled.');
          process.exit(0);
          break;
        default:
          console.log('❌ Invalid choice. Please enter 1, 2, 3, or q.');
          resolve(askLanguage());
      }
    });
  });
}

function askWord(): Promise<string> {
  return new Promise((resolve) => {
    rl.question('\n📝 Enter the word: ', (word) => {
      const trimmedWord = word.trim();
      if (!trimmedWord) {
        console.log('❌ Word cannot be empty. Please try again.');
        resolve(askWord());
      } else {
        resolve(trimmedWord);
      }
    });
  });
}

function askDetail(): Promise<string> {
  return new Promise((resolve) => {
    rl.question('\n💬 Enter the definition/detail: ', (detail) => {
      const trimmedDetail = detail.trim();
      if (!trimmedDetail) {
        console.log('❌ Detail cannot be empty. Please try again.');
        resolve(askDetail());
      } else {
        resolve(trimmedDetail);
      }
    });
  });
}

function askDocumentation(): Promise<string> {
  return new Promise((resolve) => {
    console.log('\n📖 Enter documentation (multi-line supported):');
    console.log('   Type your documentation. Press Enter twice to finish.');
    console.log('   Or type "END" on a new line to finish.');
    
    let documentation = '';
    let emptyLineCount = 0;
    
    const collectDocumentation = () => {
      rl.question('> ', (line) => {
        if (line.trim().toUpperCase() === 'END') {
          resolve(documentation.trim());
          return;
        }
        
        if (line.trim() === '') {
          emptyLineCount++;
          if (emptyLineCount >= 2) {
            resolve(documentation.trim());
            return;
          }
          documentation += '\n';
        } else {
          emptyLineCount = 0;
          if (documentation && !documentation.endsWith('\n')) {
            documentation += '\n';
          }
          documentation += line;
        }
        
        collectDocumentation();
      });
    };
    
    collectDocumentation();
  });
}

function displayWordEntry(entry: WordEntry) {
  console.log(`\n📋 Word Entry:`);
  console.log(`   Word: ${entry.word}`);
  console.log(`   Detail: ${entry.detail}`);
  console.log(`   Documentation: ${entry.documentation}`);
}

function askMergeChoice(existingEntry: WordEntry, newEntry: WordEntry): Promise<'merge' | 'replace' | 'cancel'> {
  return new Promise((resolve) => {
    console.log('\n⚠️  Word already exists!');
    console.log('\n📖 Existing entry:');
    displayWordEntry(existingEntry);
    
    console.log('\n🆕 New entry:');
    displayWordEntry(newEntry);
    
    console.log('\nChoose action:');
    console.log('  1) Merge - Combine detail and documentation');
    console.log('  2) Replace - Replace existing entry with new one');
    console.log('  3) Cancel - Don\'t add this entry');
    
    rl.question('\nEnter your choice (1/2/3): ', (answer) => {
      switch (answer.trim()) {
        case '1':
        case 'merge':
          resolve('merge');
          break;
        case '2':
        case 'replace':
          resolve('replace');
          break;
        case '3':
        case 'cancel':
          resolve('cancel');
          break;
        default:
          console.log('❌ Invalid choice. Please enter 1, 2, or 3.');
          resolve(askMergeChoice(existingEntry, newEntry));
      }
    });
  });
}

function confirmAddition(entry: WordEntry, language: LanguageConfig): Promise<boolean> {
  return new Promise((resolve) => {
    console.log(`\n📋 Confirm addition to ${language.name}:`);
    displayWordEntry(entry);
    
    rl.question('\nAdd this entry? (y/N): ', (answer) => {
      resolve(answer.toLowerCase().trim() === 'y' || answer.toLowerCase().trim() === 'yes');
    });
  });
}

function askAddAnother(): Promise<boolean> {
  return new Promise((resolve) => {
    rl.question('\n➕ Add another word? (y/N): ', (answer) => {
      resolve(answer.toLowerCase().trim() === 'y' || answer.toLowerCase().trim() === 'yes');
    });
  });
}

async function addWordEntry(): Promise<boolean> {
  try {
    // Check if we're in the right directory
    const workspaceRoot = process.cwd();
    if (!fs.existsSync(path.join(workspaceRoot, 'package.json'))) {
      console.error('❌ No package.json found. Please run this script from the project root.');
      process.exit(1);
    }

    const language = await askLanguage();
    
    console.log(`\n📚 Adding word to ${language.name} dictionary`);
    
    // Check current dictionary size
    const filePath = path.join(workspaceRoot, language.file);
    if (fs.existsSync(filePath)) {
      const words = loadWords(filePath);
      console.log(`📊 Current dictionary size: ${words.length} words`);
    }
    
    const word = await askWord();
    
    // Check if word exists
    const checkResult = checkWordExists(workspaceRoot, language.id, word);
    if (checkResult.exists && checkResult.entry) {
      console.log('⚠️  Word already exists in dictionary!');
    }
    
    const detail = await askDetail();
    const documentation = await askDocumentation();
    
    const newEntry: WordEntry = { word, detail, documentation };
    let action: 'add' | 'merge' | 'replace' = 'add';
    let shouldAdd = true;
    
    if (checkResult.exists && checkResult.entry) {
      const choice = await askMergeChoice(checkResult.entry, newEntry);
      
      switch (choice) {
        case 'merge':
          action = 'merge';
          const merged = mergeEntries(checkResult.entry, newEntry);
          console.log('\n🔀 Entries will be merged:');
          displayWordEntry(merged);
          break;
        case 'replace':
          action = 'replace';
          console.log('\n🔄 Entry will be replaced');
          break;
        case 'cancel':
          shouldAdd = false;
          console.log('❌ Entry cancelled.');
          break;
      }
    }
    
    if (shouldAdd) {
      const finalEntry = action === 'merge' && checkResult.entry ? mergeEntries(checkResult.entry, newEntry) : newEntry;
      const confirmed = await confirmAddition(finalEntry, language);
      
      if (confirmed) {
        const result = addWordToDictionary(workspaceRoot, language.id, word, detail, documentation, action);
        
        if (result.success) {
          console.log(`\n✅ ${result.message}`);
          console.log(`📊 Dictionary now contains ${result.count} words`);
        } else {
          console.log(`❌ ${result.message}`);
          return false;
        }
      } else {
        console.log('❌ Entry not added.');
        shouldAdd = false;
      }
    }
    
    return shouldAdd;
    
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

async function main() {
  let continueAdding = true;
  
  while (continueAdding) {
    const added = await addWordEntry();
    continueAdding = await askAddAnother();
  }
  
  console.log('\n🎉 Word addition session completed!');
  console.log('\n📝 Next steps:');
  console.log('   1. Test the new words in VS Code');
  console.log('   2. Commit your changes: git add external/scribe-data/data/ && git commit -m "feat: add new word entries"');
  
  rl.close();
}

if (require.main === module) {
  main().catch(console.error);
}
