import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Loader2, RefreshCw } from 'lucide-react';
import type { DictionaryEntry } from '../services/api';
import { segmentSentence, fetchSentenceTranslation } from '../services/sentenceParser';
import type { ParsedToken } from '../services/sentenceParser';
import { useSpeech } from '../hooks/useSpeech';
import { fetchExternalTranslation, fetchWordDefinitions, fetchWiktionaryDefinitions } from '../services/translationService';

interface KaraokeReaderProps {
    dictionaryData: DictionaryEntry[];
}

export const KaraokeReader: React.FC<KaraokeReaderProps> = ({ dictionaryData }) => {
    const [text, setText] = useState<string>('耶和华说，我的同在必和你同去，使你得安息。');
    const [tokens, setTokens] = useState<ParsedToken[]>([]);
    const [fullTranslation, setFullTranslation] = useState<string>('');
    const [isTranslating, setIsTranslating] = useState<boolean>(false);
    
    // Playback state
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [activeIndex, setActiveIndex] = useState<number>(-1);
    const [playbackRate, setPlaybackRate] = useState<number>(0.8);
    
    const { speak } = useSpeech();
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial parse when component mounts or text/dict changes
    useEffect(() => {
        handleParse(text);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dictionaryData]); 

    const handleParse = async (currentText: string) => {
        if (!currentText.trim()) {
            setTokens([]);
            setFullTranslation('');
            return;
        }

        // 1. Segment using local dictionary
        const segmented = segmentSentence(currentText, dictionaryData);
        setTokens(segmented); // Display UI immediately

        // 2. Fetch full sentence translation + enrich unknown tokens, both in parallel
        setIsTranslating(true);

        const [enhancedTokens, fullSentence] = await Promise.all([
            // Enrich ALL Chinese tokens: DB entry + external meanings + full definitions
            Promise.all(
                segmented.map(async (token) => {
                    if (!/[\u4e00-\u9fa5]/.test(token.text)) return token;
                    try {
                        const [transVi, transEn, definitions, wiktionary] = await Promise.all([
                            fetchExternalTranslation(token.text, 'zh', 'vi'),
                            token.dictionaryEntry?.English
                                ? Promise.resolve(null)
                                : fetchExternalTranslation(token.text, 'zh', 'en'),
                            fetchWordDefinitions(token.text, 'vi'),
                            fetchWiktionaryDefinitions(token.text),
                        ]);
                        return {
                            ...token,
                            extMeaning: transVi ?? undefined,
                            extMeaningEn: (token.dictionaryEntry?.English ? undefined : transEn) ?? undefined,
                            definitions: definitions.length > 0 ? definitions : undefined,
                            wiktionary: wiktionary.length > 0 ? wiktionary : undefined,
                        };
                    } catch (e) {
                        console.error('Failed to fetch translation for', token.text, e);
                    }
                    return token;
                })
            ),
            // Full sentence: always use external API for a natural, grammatically correct result
            fetchSentenceTranslation(currentText, 'vi'),
        ]);

        setTokens(enhancedTokens);
        setFullTranslation(fullSentence || '');
        setIsTranslating(false);
    };

    const handlePlay = () => {
        if (isPlaying) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
            setActiveIndex(-1);
            return;
        }

        if (!text.trim()) return;

        setIsPlaying(true);
        setActiveIndex(0);

        speak(
            text, 
            'zh-CN', 
            playbackRate, 
            (event) => {
                // onBoundary callback highlights text
                setActiveIndex(event.charIndex);
            },
            () => {
                // onEnd callback resets
                setIsPlaying(false);
                setActiveIndex(-1);
            }
        );
    };

    // Clean up speech on unmount
    useEffect(() => {
        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // Helper to determine if a token is currently being spoken
    const isTokenActive = (token: ParsedToken, currentActive: number) => {
        return currentActive >= token.startIndex && currentActive < token.startIndex + token.length;
    };

    return (
        <div className="w-full max-w-3xl mx-auto p-6 bg-white/60 backdrop-blur-md rounded-3xl shadow-sm border border-white/50 animate-fade-in-up">
            
            <h2 className="text-2xl font-serif text-spiritual-900 mb-6 flex items-center gap-2">
                <Volume2 className="w-6 h-6 text-primary-500" />
                Luyện Đọc & Dịch Câu
            </h2>

            {/* Input Section */}
            <div className="mb-8">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Nhập câu tiếng Trung vào đây (Ví dụ: 耶和华说，我的同在必和你同去，使你得安息。)..."
                    className="w-full p-4 rounded-2xl bg-white border border-spiritual-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-100/50 transition-all resize-none shadow-inner-sm text-lg text-spiritual-800"
                    rows={3}
                />
                <div className="flex gap-3 mt-4 justify-end">
                    <button
                        onClick={() => handleParse(text)}
                        className="px-6 py-2.5 rounded-full bg-spiritual-100 text-spiritual-700 font-medium hover:bg-spiritual-200 transition-colors flex items-center gap-2"
                        disabled={isTranslating}
                    >
                        {isTranslating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Phân tích & Dịch
                    </button>

                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-spiritual-200">
                        <span className="text-xs font-semibold text-spiritual-400 w-10 text-center shrink-0">
                            {playbackRate.toFixed(1)}x
                        </span>
                        <input
                            type="range"
                            min={0.3}
                            max={1.5}
                            step={0.1}
                            value={playbackRate}
                            onChange={(e) => setPlaybackRate(Number(e.target.value))}
                            className="w-24 accent-primary-500 cursor-pointer"
                            title={`Tốc độ: ${playbackRate.toFixed(1)}x`}
                        />
                    </div>

                    <button
                        onClick={handlePlay}
                        className={`px-8 py-2.5 rounded-full font-medium transition-all shadow-md flex items-center gap-2 ${
                            isPlaying 
                                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-200'
                                : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-200'
                        }`}
                    >
                        <Volume2 className="w-5 h-5" />
                        {isPlaying ? 'Dừng đọc' : 'Nghe Phát Âm'}
                    </button>
                </div>
            </div>

            {/* Karaoke Display Section */}
            {tokens.length > 0 && (
                <div className="mb-8 p-8 bg-white rounded-3xl shadow-sm border border-spiritual-100">
                    <div 
                        className="flex flex-wrap gap-x-2 gap-y-8 leading-[3.5] justify-center items-end"
                        ref={containerRef}
                    >
                        {tokens.map((token, idx) => {
                            const active = isTokenActive(token, activeIndex);
                            const hasEntry = !!token.dictionaryEntry;
                            
                            return (
                                <ruby 
                                    key={`${token.startIndex}-${idx}`}
                                    className={`relative group cursor-pointer transition-colors duration-300 ${
                                        active ? 'text-primary-600' : 'text-spiritual-900'
                                    }`}
                                    onClick={() => {
                                        // Stop main playback if it's running
                                        window.speechSynthesis.cancel();
                                        setIsPlaying(false);
                                        setActiveIndex(-1);
                                        
                                        // Read only the specific word aloud
                                        speak(token.text, 'zh-CN', playbackRate);
                                    }}
                                >
                                    <span className={`text-4xl md:text-5xl font-serif ${
                                        hasEntry && !active ? 'border-b-2 border-dotted border-spiritual-200 group-hover:border-primary-300 pb-1' : ''
                                    }`}>
                                        {token.text}
                                    </span>

                                    {/* Handle Pinyin Display visually */}
                                    <rt className={`text-xl font-medium tracking-wide transition-colors duration-300 mb-1 ${
                                        active ? 'text-primary-500' : 'text-spiritual-400 group-hover:text-primary-400'
                                    }`}>
                                        {token.pinyin}
                                    </rt>

                                    {/* Rich Multi-POS Definition Tooltip */}
                                    {(hasEntry || token.extMeaning || token.definitions?.length) && (() => {
                                        // Split DB Vietnamese by common separators
                                        const dbViRaw = token.dictionaryEntry?.Vietnamese || '';
                                        const dbViMeanings = dbViRaw.split(/[//,;，；]/).map(m => m.trim()).filter(Boolean);
                                        
                                        const dbEn = token.dictionaryEntry?.English || token.extMeaningEn || null;
                                        const hasDefs = token.definitions && token.definitions.length > 0;

                                        return (
                                            <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-max max-w-[280px] bg-gray-900/98 text-white text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 pointer-events-none shadow-2xl backdrop-blur-md overflow-hidden ring-1 ring-white/10">
                                                
                                                {/* 1. Database Meanings (Highest Priority) */}
                                                {dbViMeanings.length > 0 && (
                                                    <div className="px-3 pt-3 pb-2.5 border-b border-white/10 bg-emerald-500/10">
                                                        <div className="flex flex-col gap-1">
                                                            {dbViMeanings.map((m, i) => (
                                                                <p key={i} className="font-bold leading-snug text-emerald-300">
                                                                    {dbViMeanings.length > 1 && <span className="opacity-40 mr-1.5 font-normal">{i+1}.</span>}
                                                                    {m}
                                                                </p>
                                                            ))}
                                                        </div>
                                                        {dbEn && <p className="text-white/50 italic mt-1.5 border-t border-white/10 pt-1">{dbEn}</p>}
                                                    </div>
                                                )}

                                                {/* 2. Dictionary API Definitions (Grouped by POS) */}
                                                {hasDefs && (
                                                    <div className="px-3 py-2.5 space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                                                        {token.definitions!.map((def, di) => {
                                                             const posVi: Record<string, string> = {
                                                                 'noun': 'Danh từ',
                                                                 'verb': 'Động từ',
                                                                 'adjective': 'Tính từ',
                                                                 'adverb': 'Trạng từ',
                                                                 'pronoun': 'Đại từ',
                                                                 'preposition': 'Giới từ',
                                                                 'đồng nghĩa': 'Đồng nghĩa'
                                                             };
                                                             const label = posVi[def.pos.toLowerCase()] || def.pos;

                                                             return (
                                                                 <div key={di} className="first:mt-0">
                                                                     <span className="text-[9px] font-bold uppercase tracking-widest text-primary-400 opacity-80">{label}</span>
                                                                     <ul className="mt-1 space-y-1">
                                                                         {def.meanings.map((m, mi) => (
                                                                             <li key={mi} className="flex gap-1.5 text-white/90">
                                                                                 <span className="text-white/30 shrink-0 tabular-nums">{mi + 1}.</span>
                                                                                 <span className="leading-snug">{m}</span>
                                                                             </li>
                                                                         ))}
                                                                     </ul>
                                                                 </div>
                                                             );
                                                        })}
                                                    </div>
                                                )}

                                                {/* 3. High Quality Definitions (Wiktionary translated) */}
                                                {token.wiktionary && token.wiktionary.length > 0 && (
                                                    <div className="px-3 py-2.5 border-t border-white/5 bg-violet-500/5">
                                                        <span className="text-[9px] font-bold uppercase tracking-widest text-violet-400 opacity-70 block mb-1.5">📖 Từ điển mở</span>
                                                        <div className="space-y-2">
                                                            {token.wiktionary.map((entry, wi) => {
                                                                 // Simple mapping for common POS
                                                                 const posVi: Record<string, string> = {
                                                                     'noun': 'Danh từ',
                                                                     'verb': 'Động từ',
                                                                     'adjective': 'Tính từ',
                                                                     'adverb': 'Trạng từ',
                                                                     'pronoun': 'Đại từ',
                                                                     'preposition': 'Giới từ'
                                                                 };
                                                                 const label = posVi[entry.pos.toLowerCase()] || entry.pos;
                                                                 
                                                                 return (
                                                                     <div key={wi}>
                                                                         <span className="text-[9px] font-semibold italic text-white/40 uppercase tracking-tighter">{label}</span>
                                                                         <ul className="mt-0.5 space-y-0.5">
                                                                             {entry.definitions.map((d, di) => (
                                                                                 <li key={di} className="flex gap-1.5 text-white/85">
                                                                                     <span className="text-white/25 shrink-0 tabular-nums">{di + 1}.</span>
                                                                                     <span className="leading-snug">{d}</span>
                                                                                 </li>
                                                                             ))}
                                                                         </ul>
                                                                     </div>
                                                                 );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* 4. Fallback Single External Meaning */}
                                                {!hasDefs && !token.wiktionary?.length && token.extMeaning && (
                                                    <div className="px-3 py-2.5 bg-spiritual-500/5">
                                                        <span className="text-[9px] font-bold uppercase tracking-widest text-spiritual-400 opacity-60 block mb-1">Dịch bổ sung</span>
                                                        <p className="leading-snug text-white/90">{token.extMeaning}</p>
                                                        {(!dbViRaw && dbEn) && <p className="text-white/50 italic mt-1.5 border-t border-white/10 pt-1">{dbEn}</p>}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </ruby>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Full Translation Section */}
            {text.trim() && (
                <div className="p-6 bg-gradient-to-br from-spiritual-50 to-white rounded-3xl border border-spiritual-100">
                    <h3 className="text-sm font-semibold text-spiritual-500 uppercase tracking-widest mb-2">Dịch Nghĩa Cả Câu</h3>
                    {isTranslating ? (
                        <div className="flex items-center gap-2 text-spiritual-400 animate-pulse">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Đang dịch...
                        </div>
                    ) : (
                        <p className="text-xl text-spiritual-800 font-medium leading-relaxed">
                            {fullTranslation || "Không thể dịch câu này lúc này."}
                        </p>
                    )}
                </div>
            )}
            
        </div>
    );
};
