
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
    // GAS fetch usually requires 'text', 'source', 'target'
    // User script uses: q, source, target. (e.parameter.q)
    const url = `${GOOGLE_SCRIPT_API_URL}?q=${encodeURIComponent(text)}&source=${sourceLang}&target=${targetLang}`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const json = await response.json();

    // User script returns: { text: ... }
    if (json.text) return json.text;

    // Fallback if structure changes
    if (json.translation) return json.translation;
    if (typeof json === 'string') return json;

    return null;
  } catch (error) {
    console.error('External translation error:', error);
    return null;
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
