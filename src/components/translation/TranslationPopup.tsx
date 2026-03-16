
import React, { useRef, useLayoutEffect, useState } from 'react';
import type { TranslationResult } from '../../services/translationService';
import { Loader2, X, Volume2 } from 'lucide-react';
import { useSpeech } from '../../hooks/useSpeech';

interface TranslationPopupProps {
    position: { x: number; y: number } | null;
    translation: TranslationResult | null;
    loading: boolean;
    isVisible: boolean;
    onClose: () => void;
}

export const TranslationPopup: React.FC<TranslationPopupProps> = ({
    position,
    translation,
    loading,
    isVisible,
    onClose,
}) => {
    const popupRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const { speak } = useSpeech();

    // Handle positioning to keep in viewport
    useLayoutEffect(() => {
        if (position && popupRef.current) {
            const rect = popupRef.current.getBoundingClientRect();
            let x = position.x;
            const y = position.y;

            const OFFSET = 10;
            let finalY = y - rect.height - OFFSET;

            // If not enough space above, flip to below
            if (finalY < 10) {
                finalY = y + 30 + OFFSET; // Approximate line height
            }

            // Horizontal clamp
            if (x - rect.width / 2 < 10) {
                x = rect.width / 2 + 10; // Left edge
            } else if (x + rect.width / 2 > window.innerWidth - 10) {
                x = window.innerWidth - rect.width / 2 - 10; // Right edge
            }

            if (coords.x !== x || coords.y !== finalY) {
                // eslint-disable-next-line
                setCoords({ x, y: finalY });
            }
        }
    }, [position, translation, loading]);

    if (!isVisible || !position) return null;

    return (
        <div
            ref={popupRef}
            className={`fixed z-50 transition-all duration-200 ease-in-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                }`}
            style={{
                left: coords.x,
                top: coords.y,
                transform: 'translateX(-50%)', // Center horizontally on X
            }}
        >
            <div className="bg-white/90 dark:bg-slate-800/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-xl p-4 min-w-[280px] max-w-[320px] text-sm animate-in fade-in zoom-in-95 duration-200 relative group">

                {/* Close Button - absolute positioning within card */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={14} />
                </button>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-4 space-x-2 text-indigo-500">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Translating...</span>
                    </div>
                )}

                {/* Content State */}
                {!loading && translation && (
                    <div className="space-y-3">
                        {/* Header: Original Word */}
                        <div className="border-b border-gray-100 pb-2 mb-2 flex justify-between items-start mr-6">
                            <div>
                                <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">{translation.sourceLang === 'unknown' ? 'Detected' : translation.sourceLang}</span>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 leading-tight">
                                    {translation.original}
                                </h3>
                            </div>
                            {translation.source === 'external' && (
                                <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded ml-2 whitespace-nowrap">Web</span>
                            )}
                        </div>

                        {/* Translations */}
                        <div className="grid gap-2">

                            {/* English Result (if not source) */}
                            {translation.translations.en && translation.sourceLang !== 'en' && (
                                <div className="bg-indigo-50/50 p-2 rounded-lg border border-indigo-100/50">
                                    <div className="text-xs text-indigo-400 font-medium mb-0.5">English</div>
                                    <div className="text-gray-800 font-medium">{translation.translations.en}</div>
                                </div>
                            )}

                            {/* Vietnamese Result (if not source) */}
                            {translation.translations.vi && translation.sourceLang !== 'vi' && (
                                <div className="bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/50">
                                    <div className="text-xs text-emerald-500 font-medium mb-0.5">Vietnamese</div>
                                    <div className="text-gray-800 font-medium">{translation.translations.vi}</div>
                                </div>
                            )}

                            {/* Chinese Result (if not source) */}
                            {(translation.translations.zh || translation.translations.pinyin) && translation.sourceLang !== 'zh' && (
                                <div className="bg-rose-50/50 p-2 rounded-lg border border-rose-100/50">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <div className="text-xs text-rose-400 font-medium">Chinese</div>
                                        {translation.translations.zh && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    speak(translation.translations.zh!, 'zh-CN');
                                                }}
                                                className="p-1 rounded-full hover:bg-rose-100 text-rose-400 hover:text-rose-600 transition-colors -mt-1 -mr-1"
                                                title="Listen"
                                            >
                                                <Volume2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        {translation.translations.zh && (
                                            <span className="text-lg font-serif text-gray-800">{translation.translations.zh}</span>
                                        )}
                                        {translation.translations.pinyin && (
                                            <span className="text-rose-600/80 font-mono text-sm">{translation.translations.pinyin}</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Logic for when source IS Chinese, we show Pinyin separately? */}
                            {translation.sourceLang === 'zh' && translation.translations.pinyin && (
                                <div className="bg-rose-50/50 p-2 rounded-lg border border-rose-100/50">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <div className="text-xs text-rose-400 font-medium my-auto">Pinyin</div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                speak(translation.original, 'zh-CN');
                                            }}
                                            className="p-1 rounded-full hover:bg-rose-100 text-rose-400 hover:text-rose-600 transition-colors -mr-1"
                                            title="Listen"
                                        >
                                            <Volume2 size={14} />
                                        </button>
                                    </div>
                                    <span className="text-rose-600/80 font-mono text-sm">{translation.translations.pinyin}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Empty/Error State */}
                {!loading && !translation && (
                    <div className="text-gray-400 text-center py-2 italic">
                        No translation found.
                    </div>
                )}
            </div>

            {/* Decorative arrow (Triangle) - Simplified */}
            <div
                className="w-4 h-4 bg-white/90 backdrop-blur-xl absolute left-1/2 -translate-x-1/2 rotate-45 border-r border-b border-white/20 shadow-sm"
                style={{
                    bottom: -6, // If positioned above
                    display: coords.y < (position.y || 0) ? 'block' : 'none' // only show if popup is above
                }}
            />
        </div>
    );
};
