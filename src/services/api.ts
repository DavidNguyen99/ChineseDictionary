import Papa from 'papaparse';

export interface DictionaryEntry {
    English: string;
    Simplified: string;
    Traditional: string;
    Part_Of_Speech: string;
    Pinyin: string;
    Vietnamese: string;
    Verse: string;
    Verse_EN: string;
    Verse_CN: string;
    Verse_VN: string;
    Chinese: string;
}

const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1qTwcWdQY2YxELXoKUE4jaj9bpImpnfKGE3gAEQIqR_g/edit?usp=sharing';

const normalizeGoogleSheetUrl = (url: string): string => {
    if (url.includes('format=csv') || url.includes('output=csv')) return url;

    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
        return `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
    }

    return url;
};

export const fetchDictionaryData = async (url: string = DEFAULT_SHEET_URL): Promise<DictionaryEntry[]> => {
    const csvUrl = normalizeGoogleSheetUrl(url);
    if (!csvUrl) {
        console.warn('No Google Sheet URL provided.');
        return [];
    }

    return new Promise((resolve, reject) => {
        Papa.parse<Record<string, string>>(csvUrl, {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: (results: Papa.ParseResult<Record<string, string>>) => {
                if (results.data && results.data.length > 0) {
                    // normalize data
                    const normalizedData: DictionaryEntry[] = results.data.map((row) => {
                        // Safely access fields, providing fallbacks
                        const simplified = row['Simplified'] || row['Simplify'] || row['Chinese'] || ''; // Fallback to 'Chinese' if old sheet
                        const traditional = row['Traditional'] || '';

                        return {
                            English: row['English'] || '',
                            Simplified: simplified,
                            Traditional: traditional,
                            Part_Of_Speech: row['Part_Of_Speech'] || '',
                            Pinyin: row['Pinyin'] || '',
                            Vietnamese: row['Vietnamese'] || '',
                            Verse: row['Verse'] || '',
                            Verse_EN: row['Verse_EN'] || '',
                            Verse_CN: row['Verse_CN'] || '',
                            Verse_VN: row['Verse_VN'] || '',
                            Chinese: simplified || traditional // Primary display character
                        };
                    });

                    resolve(normalizedData);
                } else {
                    resolve([]);
                }
            },
            error: (error: Error) => {
                console.error('Error fetching CSV:', error);
                reject(error);
            },
        });
    });
};
