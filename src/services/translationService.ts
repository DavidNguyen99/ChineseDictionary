
import { pinyin } from 'pinyin-pro';
import type { DictionaryEntry } from './api';

// --- Types ---
export interface TranslationResult {
  original: string;
  sourceLang: 'en' | 'zh' | 'vi' | 'unknown';
  translations: {
    en?: string;
    zh?: string;
    vi?: string;
    pinyin?: string;
  };
  source: 'internal' | 'external';
}

// --- Internal Lookup (Dictionary) ---

/**
 * Searches the internal dictionary for an EXACT match.
 * Case-insensitive.
 */
export const searchInternal = (
  term: string,
  data: DictionaryEntry[]
): DictionaryEntry | null => {
  if (!term || !data.length) return null;
  const lowerTerm = term.trim().toLowerCase();

  return (
    data.find((entry) => {
      return (
        entry.English.toLowerCase() === lowerTerm ||
        entry.Simplified.toLowerCase() === lowerTerm ||
        entry.Traditional.toLowerCase() === lowerTerm ||
        entry.Vietnamese.toLowerCase() === lowerTerm
      );
    }) || null
  );
};

// --- External API (Google Apps Script) ---

// User provided Google Apps Script for translation
const GOOGLE_SCRIPT_API_URL = 'https://script.google.com/macros/s/AKfycbxZBlhXeZHXh92gkKqLeEcT3juS2tCyL98iRSUEl7IuWlNj2tmKF5TlT9kLylMQMSw7Rw/exec';

export const fetchExternalTranslation = async (
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string | null> => {
  try {
    const url = `${GOOGLE_SCRIPT_API_URL}?q=${encodeURIComponent(text)}&source=${sourceLang}&target=${targetLang}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const json = await response.json();
    if (json.text) return json.text;
    if (json.translation) return json.translation;
    if (typeof json === 'string') return json;
    return null;
  } catch (error) {
    console.error('External translation error:', error);
    return null;
  }
};

export interface WordDefinition {
  pos: string;       // part of speech label
  meanings: string[]; // list of Vietnamese meanings for that POS
}
/**
 * Fetches multiple definitions for a Chinese word using Google Translate.
 * Uses dt=bd (dictionary entries), dt=at (alternative translations), 
 * and dt=md (definitions/examples) for the richest possible Vietnamese results.
 */
export const fetchWordDefinitions = async (
  word: string,
  targetLang: string = 'vi'
): Promise<WordDefinition[]> => {
  try {
    // Add dt=md for definitions/examples
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh&tl=${targetLang}&dt=bd&dt=at&dt=md&dt=t&q=${encodeURIComponent(word)}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    
    const rawData = await res.json() as unknown;
    if (!Array.isArray(rawData)) return [];
    const data = rawData as (unknown[] | null)[];

    const results: WordDefinition[] = [];

    // 1. Process Dictionary Block (dt=bd)
    const dictBlock = data[1];
    if (Array.isArray(dictBlock)) {
      dictBlock.forEach((entry: unknown) => {
        if (Array.isArray(entry) && entry[0] && Array.isArray(entry[1])) {
          results.push({
            pos: String(entry[0]),
            meanings: (entry[1] as string[]).filter(Boolean).slice(0, 6),
          });
        }
      });
    }

    // 2. Process Definitions/Examples (dt=md)
    // Often at index 12 in the response
    const mdBlock = data[12];
    if (Array.isArray(mdBlock)) {
      mdBlock.forEach((entry: unknown) => {
        if (Array.isArray(entry) && entry[0] && Array.isArray(entry[1])) {
          const pos = String(entry[0]);
          const defs = entry[1] as unknown[][];
          const meanings = defs
            .map(d => (Array.isArray(d) ? String(d[0]) : null))
            .filter((t): t is string => !!t)
            .slice(0, 5);
          
          if (meanings.length > 0) {
            // Find existing POS or add new
            const existing = results.find(r => r.pos === pos);
            if (existing) {
              existing.meanings = Array.from(new Set([...existing.meanings, ...meanings]));
            } else {
              results.push({ pos, meanings });
            }
          }
        }
      });
    }

    // 3. Process Alternative Translations (dt=at) - Fallback
    if (results.length === 0) {
      const altTranslations = data[5];
      if (Array.isArray(altTranslations) && Array.isArray(altTranslations[0])) {
        const topLevelAlts = altTranslations[0] as unknown[][];
        if (Array.isArray(topLevelAlts[2])) {
          const altEntries = topLevelAlts[2] as unknown[][];
          const flatAlts = altEntries
            .map(t => (Array.isArray(t) ? t[0] : null))
            .filter((t): t is string => typeof t === 'string' && t.length > 0)
            .slice(0, 10);
          
          if (flatAlts.length > 0) {
            results.push({ pos: 'đồng nghĩa', meanings: flatAlts });
          }
        }
      }
    }

    return results;
  } catch (error) {
    console.error('Word definitions fetch error:', error);
    return [];
  }
};

export interface WiktionaryEntry {
  pos: string;
  definitions: string[];
}

/**
 * Fetches definitions from English Wiktionary (very complete) 
 * but translates them to Vietnamese.
 */
export const fetchWiktionaryDefinitions = async (
  word: string
): Promise<WiktionaryEntry[]> => {
  try {
    // English Wiktionary is much more detailed for Chinese characters
    const url = `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`;
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (!res.ok) return [];
    
    const data = await res.json() as Record<string, unknown[]>;
    const entries: WiktionaryEntry[] = [];

    // Focus on "zh" (Chinese) section
    const langEntries = data['zh'] || data['en'];
    if (Array.isArray(langEntries)) {
      // Collect all definitions first
      const rawDefs: { pos: string, text: string }[] = [];
      
      for (const entryObj of langEntries) {
        const entry = entryObj as { partOfSpeech?: string; definitions?: { definition: string }[] };
        const pos = entry.partOfSpeech || 'từ';
        (entry.definitions || []).slice(0, 3).forEach(d => {
          const text = (d.definition || '').replace(/<[^>]+>/g, '').trim();
          if (text) {
            rawDefs.push({ pos, text });
          }
        });
      }

      // Translate them all to Vietnamese in parallel
      const translated = await Promise.all(
        rawDefs.slice(0, 5).map(async (d) => {
          const vi = await fetchExternalTranslation(d.text, 'en', 'vi');
          return { pos: d.pos, vi: vi || d.text };
        })
      );

      // Group back by POS
      translated.forEach(t => {
        const existing = entries.find(e => e.pos === t.pos);
        if (existing) {
          existing.definitions.push(t.vi);
        } else {
          entries.push({ pos: t.pos, definitions: [t.vi] });
        }
      });
    }

    return entries;
  } catch (error) {
    console.error('Wiktionary API error:', error);
    return [];
  }
};

// --- Pinyin Generation ---

export const generatePinyin = (text: string): string => {
  // Only generate pinyin if text contains Chinese characters
  if (!/[\u4e00-\u9fa5]/.test(text)) return '';

  try {
    return pinyin(text, { toneType: 'symbol' });
  } catch (e) {
    console.error('Pinyin generation error:', e);
    return '';
  }
};

// --- Orchestration Service ---

const isVietnamese = (text: string): boolean => {
  // Check for Vietnamese-specific vowels and tones
  return /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text);
};

export const translateText = async (
  term: string,
  data: DictionaryEntry[],
  currentLang: 'English' | 'Chinese' | 'Vietnamese' | 'Unknown'
): Promise<TranslationResult> => {
  const result: TranslationResult = {
    original: term,
    sourceLang: 'unknown',
    translations: {},
    source: 'internal',
  };

  // 1. Detect source language map to code
  let srcCode = 'en';

  // Clean term for detection
  const cleanTerm = term.trim();

  if (currentLang === 'Chinese') srcCode = 'zh';
  else if (currentLang === 'Vietnamese') srcCode = 'vi';
  else {
    // Heuristic Detection
    if (/[\u4e00-\u9fa5]/.test(cleanTerm)) {
      srcCode = 'zh';
    } else if (isVietnamese(cleanTerm)) {
      srcCode = 'vi';
    } else {
      srcCode = 'en';
    }
  }

  // Update result source lang reference
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result.sourceLang = srcCode as any;

  // 2. Try Internal Lookup First
  const internalMatch = searchInternal(term, data);

  if (internalMatch) {
    result.source = 'internal';
    result.translations = {
      en: internalMatch.English,
      zh: internalMatch.Simplified || internalMatch.Chinese,
      vi: internalMatch.Vietnamese,
      pinyin: internalMatch.Pinyin || generatePinyin(internalMatch.Simplified || internalMatch.Chinese || ''),
    };
    return result;
  }

  // 3. Fallback to External API
  result.source = 'external';

  // Determine Targets
  const targets: string[] = [];
  if (srcCode === 'en') targets.push('zh', 'vi');
  else if (srcCode === 'zh') targets.push('en', 'vi');
  else if (srcCode === 'vi') targets.push('en', 'zh');
  else targets.push('zh', 'vi'); // Fallback

  const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  // Parallel fetch
  await Promise.all(
    targets.map(async (target) => {
      const translated = await fetchExternalTranslation(term, srcCode, target);

      if (translated) {
        // Validation:
        // 1. Not identical (case-insensitive)
        // 2. Not just the same word with accents removed (common failure mode for VN -> EN)
        //    e.g. "khiêm" -> "Khiem"
        const isSelf = translated.toLowerCase() === term.toLowerCase();
        const isDeaccentedSelf = normalize(translated) === normalize(term);

        // Allow self-match ONLY if lengths are very different (unlikely) or it's Chinese (chars vs pinyin?) 
        // Actually for translation between Latin scripts (VN <-> EN), closely matching usually means failure/proper noun.

        const isInvalid = isSelf || (srcCode === 'vi' && target === 'en' && isDeaccentedSelf);

        if (!isInvalid) {
          if (target === 'en') result.translations.en = translated;
          if (target === 'zh') {
            result.translations.zh = translated;
            // Only generate pinyin if result is actually Chinese
            if (/[\u4e00-\u9fa5]/.test(translated)) {
              result.translations.pinyin = generatePinyin(translated);
            }
          }
          if (target === 'vi') result.translations.vi = translated;
        }
      }
    })
  );

  // Generating pinyin for the SOURCE if it was Chinese?
  if (srcCode === 'zh') {
    result.translations.pinyin = generatePinyin(term);
  }

  return result;
};
