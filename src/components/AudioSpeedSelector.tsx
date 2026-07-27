import React, { useState, useRef, useEffect } from 'react';
import { useAudioSettings, SPEECH_RATES, type SpeechRateOption } from '../hooks/useAudioSettings';
import { Gauge, Check } from 'lucide-react';

interface AudioSpeedSelectorProps {
    compact?: boolean;
}

export const AudioSpeedSelector: React.FC<AudioSpeedSelectorProps> = ({ compact = false }) => {
    const { speechRate, setSpeechRate } = useAudioSettings();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const currentRateInfo = SPEECH_RATES.find(r => r.value === speechRate) || SPEECH_RATES[1];

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200 shadow-2xs border ${
                    compact
                        ? 'px-2.5 py-1 text-xs bg-white/70 hover:bg-white text-spiritual-700 border-spiritual-200'
                        : 'px-3 py-1.5 text-sm bg-white/80 hover:bg-white text-spiritual-800 border-spiritual-300 backdrop-blur-md'
                }`}
                title="Tùy chỉnh tốc độ đọc (Audio Speed)"
            >
                <Gauge className={compact ? 'w-3.5 h-3.5 text-spiritual-500' : 'w-4 h-4 text-primary-600'} />
                <span>{currentRateInfo.label}</span>
                <span className="text-xs">{currentRateInfo.icon}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-spiritual-200 py-1.5 z-40 animate-fadeIn">
                    <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-spiritual-500 border-b border-spiritual-100 mb-1">
                        Tốc Độ Phát Âm (Audio Speed)
                    </div>
                    {SPEECH_RATES.map((rate) => {
                        const isSelected = speechRate === rate.value;
                        return (
                            <button
                                key={rate.value}
                                onClick={() => {
                                    setSpeechRate(rate.value as SpeechRateOption);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                                    isSelected
                                        ? 'bg-primary-50 text-primary-900 font-semibold'
                                        : 'text-spiritual-700 hover:bg-spiritual-50'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span>{rate.icon}</span>
                                    <div>
                                        <div>{rate.label}</div>
                                        <div className="text-[10px] text-spiritual-500 font-normal">{rate.description}</div>
                                    </div>
                                </div>
                                {isSelected && <Check className="w-3.5 h-3.5 text-primary-600 shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
