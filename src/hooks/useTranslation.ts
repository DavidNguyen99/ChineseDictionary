
import { useState, useEffect } from 'react';
import { translateText } from '../services/translationService';
import type { TranslationResult } from '../services/translationService';
import type { DictionaryEntry } from '../services/api';

export const useTranslation = (
    text: string,
    data: DictionaryEntry[],
    isVisible: boolean
) => {
    const [translation, setTranslation] = useState<TranslationResult | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isVisible || !text || !text.trim()) {
            // Don't clear immediately if we want to fade out? 
            // But usually if not visible, we reset state or just stop fetching.
            if (!isVisible) {
                // Optional: clear translation when closed
                // setTranslation(null); 
            }
            return;
        }

        const loadTranslation = async () => {
            setLoading(true);
            setError(null);
            try {
                // We pass 'Unknown' as language hint for now since we don't track column source
                const result = await translateText(text, data, 'Unknown');
                setTranslation(result);
            } catch (err) {
                console.error('Translation error:', err);
                setError('Failed to translate');
            } finally {
                setLoading(false);
            }
        };

        // Debounce slightly to avoid rapid clicks spamming
        const timer = setTimeout(loadTranslation, 200);

        return () => clearTimeout(timer);
    }, [text, isVisible, data]); // 'data' should be stable from useDictionary

    return { translation, loading, error };
};
