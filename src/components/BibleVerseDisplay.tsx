import React, { useState } from 'react';
import { pinyin } from 'pinyin-pro';
import { BookOpen } from 'lucide-react';

interface BibleVerseDisplayProps {
    verseVN: string;
    verseCN: string;
    verseEN: string;
    reference: string;
    keywordVN?: string | string[];
    keywordCN?: string | string[];
    keywordEN?: string | string[];
}

const HighlightText: React.FC<{ text: string; keyword?: string | string[] }> = ({ text, keyword }) => {
    if (!keyword || !text || (Array.isArray(keyword) && keyword.length === 0)) return <>{text}</>;

    const keywords = Array.isArray(keyword) ? keyword : [keyword];

    // Create a pattern that matches any of the keywords
    const pattern = keywords
        .filter(k => k && k.trim().length > 0)
        .map(k => k.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // Escape regex chars
        .join('|');

    if (!pattern) return <>{text}</>;

    // Regex for splitting (Global)
    const splitRegex = new RegExp(`(${pattern})`, 'gi');

    // Split the text. With capturing group, matches are at odd indices (1, 3, 5...)
    const parts = text.split(splitRegex);

    return (
        <>
            {parts.map((part, i) =>
                i % 2 === 1 ? (
                    <span key={i} className="bg-yellow-200 text-spiritual-900 font-bold px-0.5 rounded-sm">
                        {part}
                    </span>
                ) : (
                    part
                )
            )}
        </>
    );
};

export const BibleVerseDisplay: React.FC<BibleVerseDisplayProps> = ({
    verseVN, verseCN, verseEN, reference,
    keywordVN, keywordCN, keywordEN
}) => {
    // Generate Pinyin for the Chinese verse
    const verseCNPinyin = verseCN ? pinyin(verseCN, { toneType: 'symbol' }) : '';

    const [activeTab, setActiveTab] = useState<'VN' | 'CN' | 'EN'>('VN');

    if (!verseVN && !verseCN && !verseEN) return null;

    return (
        <div className="bg-spiritual-50 rounded-xl p-4 mt-4 border border-spiritual-100">
            <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-primary-600" />
                <span className="text-xs font-bold text-primary-700 uppercase tracking-wider">Bible Verification ({reference})</span>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 border-b border-spiritual-200 pb-1">
                {verseVN && (
                    <button
                        onClick={() => setActiveTab('VN')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'VN' ? 'bg-white text-primary-700 shadow-sm' : 'text-spiritual-500 hover:text-spiritual-700'}`}
                    >
                        Vietnamese
                    </button>
                )}
                {verseCN && (
                    <button
                        onClick={() => setActiveTab('CN')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'CN' ? 'bg-white text-primary-700 shadow-sm' : 'text-spiritual-500 hover:text-spiritual-700'}`}
                    >
                        Chinese
                    </button>
                )}
                {verseEN && (
                    <button
                        onClick={() => setActiveTab('EN')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'EN' ? 'bg-white text-primary-700 shadow-sm' : 'text-spiritual-500 hover:text-spiritual-700'}`}
                    >
                        English
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="min-h-[80px]">
                {activeTab === 'VN' && verseVN && (
                    <div className="animate-fadeIn" data-translate-content>
                        <p className="text-lg text-spiritual-900 font-serif leading-relaxed italic">
                            "<HighlightText text={verseVN} keyword={keywordVN} />"
                        </p>
                    </div>
                )}

                {activeTab === 'CN' && verseCN && (
                    <div className="animate-fadeIn" data-translate-content>
                        <p className="text-xl text-spiritual-800 font-medium font-serif">
                            <HighlightText text={verseCN} keyword={keywordCN} />
                        </p>
                        <p className="text-sm text-spiritual-700 font-sans mt-1 font-medium">{verseCNPinyin}</p>
                    </div>
                )}

                {activeTab === 'EN' && verseEN && (
                    <div className="animate-fadeIn" data-translate-content>
                        <p className="text-lg text-spiritual-800 font-serif italic text-pretty">
                            "<HighlightText text={verseEN} keyword={keywordEN} />"
                        </p>
                    </div>
                )}
            </div>

            {/* Quick Compare / Summary (Cross Reference) */}
            <div className="mt-4 pt-3 border-t border-spiritual-200/80 flex flex-col sm:flex-row gap-3 text-sm text-spiritual-800 font-serif">
                {activeTab !== 'VN' && verseVN && (
                    <div className="flex items-start gap-2 flex-1">
                        <span className="font-sans text-[11px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-spiritual-200 text-spiritual-800 shrink-0 mt-0.5">
                            VN
                        </span>
                        <p className="leading-snug">
                            <HighlightText text={verseVN} keyword={keywordVN} />
                        </p>
                    </div>
                )}
                {activeTab !== 'CN' && verseCN && (
                    <div className="flex items-start gap-2 flex-1">
                        <span className="font-sans text-[11px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-spiritual-200 text-spiritual-800 shrink-0 mt-0.5">
                            CN
                        </span>
                        <p className="leading-snug">
                            <HighlightText text={verseCN} keyword={keywordCN} />
                        </p>
                    </div>
                )}
                {activeTab !== 'EN' && verseEN && (
                    <div className="flex items-start gap-2 flex-1">
                        <span className="font-sans text-[11px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-spiritual-200 text-spiritual-800 shrink-0 mt-0.5">
                            EN
                        </span>
                        <p className="leading-snug italic">
                            <HighlightText text={verseEN} keyword={keywordEN} />
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
