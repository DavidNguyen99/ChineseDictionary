import { useCallback, useEffect, useState } from 'react';

type LanguageCode = 'en-US' | 'zh-CN' | 'vi-VN';

export const useSpeech = () => {
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                setVoices(availableVoices);
            }
        };

        loadVoices();

        // Dynamic loading for some browsers (like Chrome)
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    const speak = useCallback((
        text: string, 
        lang: LanguageCode, 
        rate: number = 0.8,
        onBoundary?: (event: SpeechSynthesisEvent) => void,
        onEnd?: () => void
    ) => {
        if (!window.speechSynthesis) {
            console.warn('Web Speech API not supported in this browser.');
            return;
        }

        // Cancel any ongoing speech to prevent queuing
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = rate; // Use the provided rate

        if (onBoundary) utterance.onboundary = onBoundary;
        if (onEnd) utterance.onend = onEnd;

        // iOS/Safari often ignores .lang unless .voice is explicitly set
        if (voices.length > 0) {
            // Find the best voice match
            const voice = voices.find(v => v.lang === lang) ||
                voices.find(v => v.lang.startsWith(lang.split('-')[0])); // Fallback to 'en' if 'en-US' missing

            if (voice) {
                utterance.voice = voice;
            } else {
                // Fallback for Chinese specifically if standard zh-CN is missing on some iOS versions
                // iOS sometimes uses 'zh-Hans' or specific names
                if (lang === 'zh-CN') {
                    const chineseVoice = voices.find(v => v.lang.includes('zh') || v.name.includes('Chinese'));
                    if (chineseVoice) utterance.voice = chineseVoice;
                }
            }
            // Debugging for user if needed
            // console.log(`Speaking "${text}" with voice:`, utterance.voice?.name || 'Default', 'Lang:', lang);
        }

        window.speechSynthesis.speak(utterance);
    }, [voices]);

    return { speak };
};
