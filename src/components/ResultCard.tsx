import React from 'react';
import type { DictionaryEntry } from '../services/api';
import { Globe2, Languages, Volume2, Turtle, BookType } from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';
import { BibleVerseDisplay } from './BibleVerseDisplay';

import { pinyin } from 'pinyin-pro';

interface ResultCardProps {
    entry: DictionaryEntry;
}

export const ResultCard: React.FC<ResultCardProps> = ({ entry }) => {
    const { speak } = useSpeech();

    // Helper to clean keywords (remove parenthetical metadata like "(noun)")
    const cleanKeyword = (s: string) => s ? s.replace(/\(.*\)/g, '').trim() : '';

    // Prefer explicit Pinyin from DB, fallback to auto-generated from Simplified or Traditional
    const displayPinyin = entry.Pinyin || pinyin(entry.Simplified || entry.Traditional || '', { toneType: 'symbol' });

    // Primary character for speech (Simplified usually preferred for TTS)
    const speechText = entry.Simplified || entry.Traditional || entry.Chinese;

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-spiritual-200 p-8 hover:shadow-lg transition-all duration-300 group">
            {/* Cards Header: English & Chinese */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between border-b border-spiritual-200 pb-6 mb-6 gap-6">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-red-50 rounded-lg shrink-0 mt-1">
                        <Languages className="w-6 h-6 text-red-700" />
                    </div>
                    <div>
                        <span className="text-xs uppercase tracking-widest font-bold text-spiritual-500 block mb-2">
                            Chinese {entry.Traditional && entry.Simplified !== entry.Traditional && <span className="opacity-70 normal-case">(Simp / Trad)</span>}
                        </span>

                        <div className="flex items-center flex-wrap gap-2">
                            {/* Simplified / Main */}
                            <h3 className="text-4xl font-serif text-spiritual-900 font-medium" data-translate-content>{entry.Simplified || entry.Traditional}</h3>

                            {/* Traditional (if different) */}
                            {entry.Traditional && entry.Simplified !== entry.Traditional && (
                                <span className="text-2xl text-spiritual-500 font-serif ml-2 select-all decoration-dotted underline hover:text-spiritual-700 transition-colors cursor-help" title="Traditional Character" data-translate-content>
                                    {entry.Traditional}
                                </span>
                            )}

                            <div className="flex items-center gap-1 ml-2">
                                <button
                                    onClick={() => speak(speechText, 'zh-CN')}
                                    className="p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600/80 hover:text-red-700 transition-all duration-200 shadow-sm"
                                    aria-label="Listen to Chinese pronunciation"
                                    title="Listen (Chinese)"
                                >
                                    <Volume2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => speak(speechText, 'zh-CN', 0.5)}
                                    className="p-2 rounded-full bg-green-50 hover:bg-green-100 text-green-600/80 hover:text-green-700 transition-all duration-200 shadow-sm"
                                    aria-label="Listen to Chinese pronunciation (Slow)"
                                    title="Listen Slow (Chinese)"
                                >
                                    <Turtle className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        {displayPinyin && <p className="text-base text-spiritual-600 font-sans mt-1 font-medium">{displayPinyin}</p>}
                    </div>
                </div>

                <div className="flex items-start gap-4 md:text-right md:justify-end">
                    <div className="order-2 md:order-1">
                        <span className="text-xs uppercase tracking-widest font-bold text-spiritual-500 block mb-2">English</span>
                        <div className="flex items-center md:justify-end gap-3">
                            <h3 className="text-3xl font-serif font-bold text-spiritual-900 leading-none" data-translate-content>{entry.English}</h3>
                            <button
                                onClick={() => speak(entry.English, 'en-US')}
                                className="p-2 rounded-full bg-spiritual-50 hover:bg-accent-100 text-spiritual-600 hover:text-accent-800 transition-all duration-200 shadow-sm"
                                aria-label="Listen to English pronunciation"
                                title="Listen (English)"
                            >
                                <Volume2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="p-2 bg-accent-50 rounded-lg shrink-0 mt-1 order-1 md:order-2">
                        <Globe2 className="w-6 h-6 text-accent-700" />
                    </div>
                </div>
            </div>

            {/* Main Content: Vietnamese definition & Part of Speech */}
            <div className="mb-6 bg-spiritual-50/50 p-4 rounded-xl border border-spiritual-100/50">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs uppercase tracking-widest font-bold text-spiritual-500">Meaning (Vietnamese)</span>
                    {entry.Part_Of_Speech && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-100 text-accent-800 text-[11px] font-bold border border-accent-200 shadow-sm">
                            <BookType className="w-3.5 h-3.5" />
                            {entry.Part_Of_Speech}
                        </span>
                    )}
                </div>

                <p className="text-xl text-spiritual-900 leading-relaxed font-serif font-medium" data-translate-content>
                    {entry.Vietnamese}
                </p>
            </div>

            {/* Footer: Trilingual Verse Reference */}
            <BibleVerseDisplay
                verseVN={entry.Verse_VN || entry.Verse}
                verseCN={entry.Verse_CN}
                verseEN={entry.Verse_EN}
                reference={entry.Verse}
                keywordVN={entry.Vietnamese ? entry.Vietnamese.split(/[,;]/).map(cleanKeyword).filter(Boolean) : undefined}
                keywordCN={[entry.Simplified, entry.Traditional].filter((k): k is string => !!k).flatMap(k => k.split(/[,;]/)).map(cleanKeyword).filter(Boolean)}
                keywordEN={entry.English ? [cleanKeyword(entry.English)] : undefined}
            />
        </div>
    );
};
