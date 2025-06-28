#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const LANGUAGES = {
  '1': { id: 'oldenglish', name: 'Old English', file: 'data/oldenglish/completionWords.json' },
  '2': { id: 'oldnorse', name: 'Old Norse', file: 'data/oldnorse/completionWords.json' },
  '3': { id: 'gothic', name: 'Gothic', file: 'data/gothic/completionWords.json' }
};

function loadWords(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Error loading ${filePath}:`, error.message);
    process.exit(1);
  }
}

function saveWords(filePath, words) {
  try {
    const content = JSON.stringify(words, null, 2) + '\n';
    fs.writeFileSync(filePath, content);
    return true;
  } catch (error) {
    console.error(`❌ Error saving ${filePath}:`, error.message);
    return false;
  }
}

function findExistingWord(words, targetWord) {
  return words.find(entry => 
    entry.word.toLowerCase() === targetWord.toLowerCase()
  );
}

function askLanguage() {
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
      if (LANGUAGES[choice]) {
        resolve(LANGUAGES[choice]);
      } else if (choice === 'q' || choice === 'quit') {
        console.log('❌ Operation cancelled.');
        process.exit(0);
      } else {
        console.log('❌ Invalid choice. Please enter 1, 2, 3, or q.');
        resolve(askLanguage());
      }
    });
  });
}

function askWord() {
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

function askDetail() {
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

function askDocumentation() {
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

function displayWordEntry(entry) {
  console.log(`\n📋 Word Entry:`);
  console.log(`   Word: ${entry.word}`);
  console.log(`   Detail: ${entry.detail}`);
  console.log(`   Documentation: ${entry.documentation}`);
}

function askMergeChoice(existingEntry, newEntry) {
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

function mergeEntries(existing, newEntry) {
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

function confirmAddition(entry, language) {
  return new Promise((resolve) => {
    console.log(`\n📋 Confirm addition to ${language.name}:`);
    displayWordEntry(entry);
    
    rl.question('\nAdd this entry? (y/N): ', (answer) => {
      resolve(answer.toLowerCase().trim() === 'y' || answer.toLowerCase().trim() === 'yes');
    });
  });
}

function askAddAnother() {
  return new Promise((resolve) => {
    rl.question('\n➕ Add another word? (y/N): ', (answer) => {
      resolve(answer.toLowerCase().trim() === 'y' || answer.toLowerCase().trim() === 'yes');
    });
  });
}

async function addWordEntry() {
  try {
    // Check if we're in the right directory
    if (!fs.existsSync('package.json')) {
      console.error('❌ No package.json found. Please run this script from the project root.');
      process.exit(1);
    }

    const language = await askLanguage();
    
    // Check if language file exists
    if (!fs.existsSync(language.file)) {
      console.error(`❌ Language file not found: ${language.file}`);
      process.exit(1);
    }
    
    console.log(`\n📚 Adding word to ${language.name} dictionary`);
    
    const words = loadWords(language.file);
    console.log(`📊 Current dictionary size: ${words.length} words`);
    
    const word = await askWord();
    const detail = await askDetail();
    const documentation = await askDocumentation();
    
    const newEntry = { word, detail, documentation };
    const existingEntry = findExistingWord(words, word);
    
    let finalEntry = newEntry;
    let shouldAdd = true;
    
    if (existingEntry) {
      const choice = await askMergeChoice(existingEntry, newEntry);
      
      switch (choice) {
        case 'merge':
          finalEntry = mergeEntries(existingEntry, newEntry);
          console.log('\n🔀 Entries merged:');
          displayWordEntry(finalEntry);
          break;
        case 'replace':
          finalEntry = newEntry;
          console.log('\n🔄 Entry will be replaced');
          break;
        case 'cancel':
          shouldAdd = false;
          console.log('❌ Entry cancelled.');
          break;
      }
    }
    
    if (shouldAdd) {
      const confirmed = await confirmAddition(finalEntry, language);
      
      if (confirmed) {
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
        if (saveWords(language.file, words)) {
          console.log(`\n✅ Word "${finalEntry.word}" added to ${language.name} dictionary!`);
          console.log(`📊 Dictionary now contains ${words.length} words`);
        } else {
          console.log('❌ Failed to save the dictionary file.');
          return false;
        }
      } else {
        console.log('❌ Entry not added.');
        shouldAdd = false;
      }
    }
    
    return shouldAdd;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function main() {
  let continueAdding = true;
  
  while (continueAdding) {
    const added = await addWordEntry();
    
    if (added) {
      continueAdding = await askAddAnother();
    } else {
      continueAdding = await askAddAnother();
    }
  }
  
  console.log('\n🎉 Word addition session completed!');
  console.log('\n📝 Next steps:');
  console.log('   1. Test the new words in VS Code');
  console.log('   2. Commit your changes: git add data/ && git commit -m "feat: add new word entries"');
  
  rl.close();
}

if (require.main === module) {
  main();
}

module.exports = { loadWords, saveWords, findExistingWord, mergeEntries };
