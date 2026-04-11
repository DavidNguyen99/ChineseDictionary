import { pinyin } from 'pinyin-pro';
import type { DictionaryEntry } from './api';
import { fetchExternalTranslation } from './translationService';
import type { WordDefinition, WiktionaryEntry } from './translationService';

export interface ParsedToken {
    text: string;
    startIndex: number;
    length: number;
    pinyin: string;
    dictionaryEntry?: DictionaryEntry;
    extMeaning?: string;    // external Vietnamese meaning (fallback)
    extMeaningEn?: string;  // external English meaning (fallback)
    definitions?: WordDefinition[];   // multi-POS definitions from Google Translate dict
    wiktionary?: WiktionaryEntry[];   // high-quality definitions from Wiktionary
}

export const segmentSentence = (
    sentence: string,
    dictionary: DictionaryEntry[]
): ParsedToken[] => {
    const tokens: ParsedToken[] = [];
    let i = 0;

    let maxWordLength = 0;
    const wordMap = new Map<string, DictionaryEntry>();

    const processStr = (str: string, currentEntry: DictionaryEntry) => {
        if (str && str.trim()) {
            const clean = str.trim();
            if (wordMap.has(clean)) {
                const existing = wordMap.get(clean)!;
                // Merge Vietnamese meanings safely
                if (currentEntry.Vietnamese && !existing.Vietnamese.includes(currentEntry.Vietnamese)) {
                    existing.Vietnamese = existing.Vietnamese 
                        ? `${existing.Vietnamese} / ${currentEntry.Vietnamese}` 
                        : currentEntry.Vietnamese;
                }
                // Merge English meanings safely
                if (currentEntry.English && !existing.English.includes(currentEntry.English)) {
                    existing.English = existing.English 
                        ? `${existing.English} / ${currentEntry.English}` 
                        : currentEntry.English;
                }
            } else {
                // Must clone to avoid mutating original dictionary array on subsequent merges
                wordMap.set(clean, { ...currentEntry });
            }
            maxWordLength = Math.max(maxWordLength, clean.length);
        }
    };

    dictionary.forEach(entry => {
        processStr(entry.Simplified, entry);
        processStr(entry.Traditional, entry);
        processStr(entry.Chinese, entry);
    });

    // Fallback if max word length is 0 (empty dictionary)
    if (maxWordLength === 0) maxWordLength = 5;

    let segmenter: Intl.Segmenter | null = null;
    try {
        segmenter = new Intl.Segmenter('zh-CN', { granularity: 'word' });
    } catch {
        console.warn("Intl.Segmenter not supported in this environment");
    }
    
    const segments = segmenter ? Array.from(segmenter.segment(sentence)) : [];

    while (i < sentence.length) {
        // Skip whitespace easily by making it a token
        if (sentence[i].trim() === '') {
             tokens.push({
                text: sentence[i],
                startIndex: i,
                length: 1,
                pinyin: ' '
            });
            i++;
            continue;
        }

        let dbMatchLength = 0;
        let dbMatchEntry: DictionaryEntry | undefined = undefined;

        // Try to find the longest matching word in DB
        for (let len = maxWordLength; len > 0; len--) {
            if (i + len <= sentence.length) {
                const subStr = sentence.substring(i, i + len);
                if (wordMap.has(subStr)) {
                    dbMatchLength = len;
                    dbMatchEntry = wordMap.get(subStr);
                    break;
                }
            }
        }

        const activeSegment = segments.find(s => i >= s.index && i < s.index + s.segment.length);
        
        let segLen = 0;
        let segText = "";
        if (activeSegment) {
            if (activeSegment.index === i) {
                segLen = activeSegment.segment.length;
                segText = activeSegment.segment;
            } else {
                segText = activeSegment.segment.substring(i - activeSegment.index);
                segLen = segText.length;
            }
        }

        if (dbMatchLength > 0 && dbMatchLength >= segLen) {
            // DB match wins (it's either longer or exactly the same length as the collocation)
            const subStr = sentence.substring(i, i + dbMatchLength);
            tokens.push({
                text: subStr,
                startIndex: i,
                length: dbMatchLength,
                pinyin: dbMatchEntry!.Pinyin || pinyin(subStr, { toneType: 'symbol' }),
                dictionaryEntry: dbMatchEntry
            });
            i += dbMatchLength;
        } else if (segLen > 0) {
            // Segmenter wins (collocation is longer than DB match, meaning the full collocation is NOT in DB)
            const isChinese = /[\u4e00-\u9fa5]/.test(segText);
            tokens.push({
                text: segText,
                startIndex: i,
                length: segLen,
                pinyin: isChinese ? pinyin(segText, { toneType: 'symbol' }) : segText
            });
            i += segLen;
        } else {
            // Fallback (e.g. Intl.Segmenter missing and NOT in DB)
            const char = sentence[i];
            const isChinese = /[\u4e00-\u9fa5]/.test(char);
            tokens.push({
                text: char,
                startIndex: i,
                length: 1,
                pinyin: isChinese ? pinyin(char, { toneType: 'symbol' }) : char
            });
            i++;
        }
    }

    return tokens;
};

export const fetchSentenceTranslation = async (
    sentence: string,
    targetLang: 'en' | 'vi' = 'vi'
): Promise<string | null> => {
    // Only fetch translation if there is some Chinese text
    if (!/[\u4e00-\u9fa5]/.test(sentence)) return null;

    try {
        const result = await fetchExternalTranslation(sentence, 'zh', targetLang);
        return result;
    } catch (e) {
        console.error("Failed to fetch full sentence translation", e);
        return null;
    }
};
