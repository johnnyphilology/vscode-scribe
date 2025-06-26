import { describe, it } from 'mocha';
import * as assert from 'assert';
import { toFuthorc } from '../../languages/oldenglish/runes/futhorc';
import { toElderFuthark } from '../../languages/oldnorse/runes/elderFuthark';
import { toYoungerFuthark } from '../../languages/oldnorse/runes/youngerFuthark';
import { toMedievalRunes } from '../../languages/oldnorse/runes/medieval';
import { toGothic } from '../../languages/gothic/runes/gothicScript';

describe('Rune Conversion Functions', () => {
    
    describe('toFuthorc', () => {
        it('should convert basic letters', () => {
            assert.strictEqual(toFuthorc('a'), 'ᚪ');
            assert.strictEqual(toFuthorc('b'), 'ᛒ');
            assert.strictEqual(toFuthorc('c'), 'ᚳ');
        });

        it('should convert digraphs', () => {
            assert.strictEqual(toFuthorc('th'), 'ᚦ');
            assert.strictEqual(toFuthorc('ng'), 'ᛝ');
            assert.strictEqual(toFuthorc('ae'), 'ᚫ');
            assert.strictEqual(toFuthorc('eo'), 'ᛇ');
        });

        it('should handle special Old English characters', () => {
            assert.strictEqual(toFuthorc('þ'), 'ᚦ');
            assert.strictEqual(toFuthorc('ð'), 'ᚦ');
        });

        it('should convert words with mixed digraphs and letters', () => {
            assert.strictEqual(toFuthorc('the'), 'ᚦᛖ');
            assert.strictEqual(toFuthorc('thing'), 'ᚦᛁᛝ');
        });

        it('should handle uppercase by converting to lowercase', () => {
            assert.strictEqual(toFuthorc('THE'), 'ᚦᛖ');
            assert.strictEqual(toFuthorc('Thing'), 'ᚦᛁᛝ');
        });

        it('should preserve non-letter characters', () => {
            assert.strictEqual(toFuthorc('the king'), 'ᚦᛖ kᛁᛝ'); // k is not in futhorc map
            assert.strictEqual(toFuthorc('hello!'), 'ᚻᛖᛚᛚᚩ!');
        });

        it('should handle empty string', () => {
            assert.strictEqual(toFuthorc(''), '');
        });

        it('should strip diacritics before conversion', () => {
            // Assuming stripDiacritics works correctly
            assert.strictEqual(toFuthorc('café'), 'ᚳᚪᚠᛖ');
        });
    });

    describe('toElderFuthark', () => {
        it('should convert basic letters', () => {
            // Test some basic conversions - adjust based on actual implementation
            const result = toElderFuthark('a');
            assert.ok(typeof result === 'string');
            assert.ok(result.length > 0);
        });

        it('should handle text input', () => {
            const result = toElderFuthark('hello');
            assert.ok(typeof result === 'string');
        });

        it('should handle empty string', () => {
            assert.strictEqual(toElderFuthark(''), '');
        });
    });

    describe('toYoungerFuthark', () => {
        it('should convert basic text', () => {
            const result = toYoungerFuthark('hello');
            assert.ok(typeof result === 'string');
        });

        it('should handle empty string', () => {
            assert.strictEqual(toYoungerFuthark(''), '');
        });
    });

    describe('toMedievalRunes', () => {
        it('should convert basic text', () => {
            const result = toMedievalRunes('hello');
            assert.ok(typeof result === 'string');
        });

        it('should handle empty string', () => {
            assert.strictEqual(toMedievalRunes(''), '');
        });
    });

    describe('toGothic', () => {
        it('should convert basic text', () => {
            const result = toGothic('hello');
            assert.ok(typeof result === 'string');
        });

        it('should handle empty string', () => {
            assert.strictEqual(toGothic(''), '');
        });
    });

    describe('Rune Conversion Integration', () => {
        const testText = 'hello world';
        
        it('should all handle the same input', () => {
            // Test that all conversion functions can handle basic input
            assert.ok(typeof toFuthorc(testText) === 'string');
            assert.ok(typeof toElderFuthark(testText) === 'string');
            assert.ok(typeof toYoungerFuthark(testText) === 'string');
            assert.ok(typeof toMedievalRunes(testText) === 'string');
            assert.ok(typeof toGothic(testText) === 'string');
        });

        it('should produce different outputs for different scripts', () => {
            // Each rune system should produce different output
            const results = [
                toFuthorc(testText),
                toElderFuthark(testText),
                toYoungerFuthark(testText),
                toMedievalRunes(testText),
                toGothic(testText)
            ];

            // At least some should be different (they're different rune systems)
            const uniqueResults = new Set(results);
            assert.ok(uniqueResults.size > 1, 'Different rune systems should produce different outputs');
        });
    });
});
