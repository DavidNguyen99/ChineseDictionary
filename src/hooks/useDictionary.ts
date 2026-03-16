import { useState, useEffect, useMemo } from 'react';
import type { DictionaryEntry } from '../services/api';
import { fetchDictionaryData } from '../services/api';
import type { Language } from '../services/detector';
import { detectLanguage } from '../services/detector';



export const useDictionary = (sheetUrl: string) => {
    const [data, setData] = useState<DictionaryEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const [currentQuery, setCurrentQuery] = useState<string>('');
    const [debouncedQuery, setDebouncedQuery] = useState<string>('');
    const [detectedLanguage, setDetectedLanguage] = useState<Language>('Unknown');

    // Fetch data on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const fetchedData = await fetchDictionaryData(sheetUrl);
                setData(fetchedData);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Unknown error loading dictionary'));
            } finally {
                setLoading(false);
            }
        };

        if (sheetUrl) {
            loadData();
        } else {
            setLoading(false); // No URL, valid state but empty
        }
    }, [sheetUrl]);

    // Debounce query for filtering
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(currentQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [currentQuery]);

    // Search logic (updates UI immediately, filtering is debounced)
    const search = (query: string) => {
        setCurrentQuery(query);
        setDetectedLanguage(detectLanguage(query));
    };

    // Filter results based on DEBOUNCED query and detection
    const results = useMemo(() => {
        if (!debouncedQuery || debouncedQuery.trim() === '') return [];
        if (data.length === 0) return [];

        const lowerQuery = debouncedQuery.toLowerCase().trim();

        const getScore = (text: string | undefined): number => {
            if (!text) return 0;
            // For Chinese, usually distinct case, but safe to normalize
            const lowerText = text.toLowerCase();

            if (lowerText === lowerQuery) return 100 - (text.length * 0.1);
            if (lowerText.startsWith(lowerQuery)) return 80 - (text.length * 0.1);
            if (lowerText.includes(lowerQuery)) return 50 - (text.length * 0.1);
            return 0;
        };

        const scored = data.map((entry) => {
            let score = 0;

            switch (detectedLanguage) {
                case 'English':
                    score = getScore(entry.English);
                    break;
                case 'Chinese':
                    score = Math.max(
                        getScore(entry.Simplified),
                        getScore(entry.Traditional),
                        getScore(entry.Chinese)
                    );
                    break;
                case 'Vietnamese':
                    score = getScore(entry.Vietnamese);
                    break;
                default:
                    // Unknown language: search all and take best match
                    score = Math.max(
                        getScore(entry.English),
                        getScore(entry.Simplified),
                        getScore(entry.Traditional),
                        getScore(entry.Vietnamese)
                    );
                    break;
            }

            return { entry, score };
        });

        // Filter valid results and sort by score
        const sorted = scored
            .filter((item) => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .map((item) => item.entry);

        // Limit results to 50
        return sorted.slice(0, 50);
    }, [data, debouncedQuery, detectedLanguage]);

    return {
        data,
        loading,
        error,
        search,
        results,
        detectedLanguage,
        currentQuery
    };
};
