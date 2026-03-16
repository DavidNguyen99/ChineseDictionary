
export type Language = 'Vietnamese' | 'Chinese' | 'English' | 'Unknown';

/**
 * Detects the language of the input text based on character ranges.
 * Priority: Chinese > Vietnamese > English
 */
export const detectLanguage = (text: string): Language => {
    if (!text || text.trim() === '') return 'Unknown';

    const cleanText = text.trim();

    // Detect Chinese characters (Hanzi)
    // Range: \u4E00-\u9FFF (CJK Unified Ideographs)
    const hasChinese = /[\u4E00-\u9FFF]/.test(cleanText);
    if (hasChinese) return 'Chinese';

    // Detect Vietnamese with Diacritics (Strong Signal)
    // Check for specific Vietnamese characters (á, à, ả, ã, ạ, etc.)
    const vietnameseRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
    if (vietnameseRegex.test(cleanText)) return 'Vietnamese';

    // Detect ASCII Text (Non-accented Vietnamese vs English)
    const asciiRegex = /^[a-zA-Z\s0-9.,?!'"-]+$/;
    if (asciiRegex.test(cleanText)) {
        // If the text is pure ASCII, it could be English or non-accented Vietnamese.
        // We check if *all* words looks like valid Vietnamese syllables.
        // If they do, we bias towards Vietnamese for this application (Spiritual Dictionary).
        const words = cleanText
            .toLowerCase()
            .replace(/[.,?!'"-]/g, ' ') // Remove punctuation
            .split(/\s+/)
            .filter(w => w.length > 0);

        if (words.length > 0) {
            const allWordsAreVietnamese = words.every(isVietnameseSyllable);
            if (allWordsAreVietnamese) {
                return 'Vietnamese';
            }
        }

        // If strict VN check fails (e.g. "Spirit", "God"), fall back to English
        return 'English';
    }

    // Fallback
    return 'English';
};

/**
 * Checks if a word follows valid Vietnamese phonotactics (heuristically).
 * Vietnamese syllable structure: (Consonant) + (w) + Vowel + (Consonant)
 * This is a loose check for ASCII input.
 */
const isVietnameseSyllable = (word: string): boolean => {
    // 1. Check for invalid characters in VN (f, j, w, z)
    // Note: 'z' is sometimes used for 'd' in telex/slang but in dictionary context we assume standard.
    // 'f' is sometimes 'ph', 'j' is 'gi', 'w' is 'u/o'.
    if (/[fjwz]/.test(word)) return false;

    // 2. Regex for valid VN syllable structure
    // Start: Optional. One of: b, c, d, g, h, k, l, m, n, p, q, r, s, t, v, x
    //        OR Digraphs: ch, gh, gi, kh, ng, ngh, nh, ph, qu, th, tr
    // Middle: Vowels (a, e, i, o, u, y) - allowing clusters like 'uye', 'oa', etc.
    // End: Optional. One of: c, ch, m, n, ng, nh, p, t

    // Regex explanation:
    // ^
    // (?:tr|th|ch|ph|nh|kh|gi|qu|ngh|ng|gh|[b-dghk-npr-tvx])?  -> Optional Start Consonant (Longer matches first)
    // [aeiouy]{1,4}                                           -> Vowel nucleus (1-4 chars)
    // (?:ch|ng|nh|[cmnpt])?                                   -> Optional End Consonant
    // $

    const vnSyllableRegex = /^(?:tr|th|ch|ph|nh|kh|gi|qu|ngh|ng|gh|[b-dghk-npr-tvx])?[aeiouy]{1,4}(?:ch|ng|nh|[cmnpt])?$/;

    return vnSyllableRegex.test(word);
};
