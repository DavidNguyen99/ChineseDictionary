import { useCallback, useEffect, useState } from 'react';
import { useAudioSettings } from './useAudioSettings';

type LanguageCode = 'en-US' | 'zh-CN' | 'vi-VN';

export const useSpeech = () => {
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [activeText, setActiveText] = useState<string | null>(null);
    const { speechRate } = useAudioSettings();

    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis?.getVoices() || [];
            if (availableVoices.length > 0) {
                setVoices(availableVoices);
            }
        };

        loadVoices();

        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    const stop = useCallback(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
            setActiveText(null);
        }
    }, []);

    const speak = useCallback((
        text: string, 
        lang: LanguageCode, 
        customRate?: number,
        onBoundary?: (event: SpeechSynthesisEvent) => void,
        onEnd?: () => void
    ) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            console.warn('Web Speech API not supported in this browser.');
            return;
        }

        // Cancel any ongoing speech to prevent queuing
        window.speechSynthesis.cancel();

        const rateToUse = customRate ?? speechRate;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = rateToUse;

        setIsPlaying(true);
        setActiveText(text);

        utterance.onend = () => {
            setIsPlaying(false);
            setActiveText(null);
            if (onEnd) onEnd();
        };

        utterance.onerror = () => {
            setIsPlaying(false);
            setActiveText(null);
            if (onEnd) onEnd();
        };

        if (onBoundary) utterance.onboundary = onBoundary;

        if (voices.length > 0) {
            const voice = voices.find(v => v.lang === lang) ||
                voices.find(v => v.lang.startsWith(lang.split('-')[0]));

            if (voice) {
                utterance.voice = voice;
            } else if (lang === 'zh-CN') {
                const chineseVoice = voices.find(v => v.lang.includes('zh') || v.name.includes('Chinese'));
                if (chineseVoice) utterance.voice = chineseVoice;
            }
        }

        window.speechSynthesis.speak(utterance);
    }, [voices, speechRate]);

    return { speak, stop, isPlaying, activeText };
};
