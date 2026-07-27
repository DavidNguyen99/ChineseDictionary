import { useState, useEffect } from 'react';

export type SpeechRateOption = 0.5 | 0.75 | 1.0 | 1.25;

export const SPEECH_RATES: { value: SpeechRateOption; label: string; description: string; icon: string }[] = [
    { value: 0.5, label: '0.5x', description: 'Rất chậm (Luyện âm)', icon: '🐢' },
    { value: 0.75, label: '0.75x', description: 'Chậm vừa', icon: '🚶' },
    { value: 1.0, label: '1.0x', description: 'Tốc độ chuẩn', icon: '⚡' },
    { value: 1.25, label: '1.25x', description: 'Nhanh', icon: '🐇' },
];

const STORAGE_KEY = 'app_speech_rate';

export const useAudioSettings = () => {
    const [speechRate, setSpeechRateState] = useState<SpeechRateOption>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = parseFloat(saved);
            if ([0.5, 0.75, 1.0, 1.25].includes(parsed)) {
                return parsed as SpeechRateOption;
            }
        }
        return 0.8 as unknown as SpeechRateOption; // Default comfortable learning rate
    });

    const setSpeechRate = (rate: SpeechRateOption) => {
        setSpeechRateState(rate);
        localStorage.setItem(STORAGE_KEY, rate.toString());
    };

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY && e.newValue) {
                const parsed = parseFloat(e.newValue);
                if ([0.5, 0.75, 1.0, 1.25].includes(parsed)) {
                    setSpeechRateState(parsed as SpeechRateOption);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return {
        speechRate,
        setSpeechRate,
        rates: SPEECH_RATES,
    };
};
