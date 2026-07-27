import React, { useState } from 'react';
import { getSyllablesWithTones, TONE_DETAILS } from '../services/toneUtils';
import { Info, X } from 'lucide-react';

interface PinyinToneBadgeProps {
    pinyinText?: string;
    chineseText?: string;
    showLegendToggle?: boolean;
    className?: string;
}

export const PinyinToneBadge: React.FC<PinyinToneBadgeProps> = ({
    pinyinText = '',
    chineseText = '',
    showLegendToggle = true,
    className = '',
}) => {
    const [showModal, setShowModal] = useState<boolean>(false);
    const syllables = getSyllablesWithTones(pinyinText, chineseText);

    if (syllables.length === 0) return null;

    return (
        <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
            {syllables.map((syl, i) => (
                <span
                    key={i}
                    title={`${syl.pinyinSymbol} - ${syl.toneName}`}
                    className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg border text-sm font-medium transition-all duration-200 shadow-2xs ${syl.bgClass} ${syl.textClass} ${syl.borderClass}`}
                >
                    <span>{syl.pinyinSymbol}</span>
                    <span className="text-[11px] opacity-75 font-mono ml-0.5">{syl.toneSymbol}</span>
                </span>
            ))}

            {showLegendToggle && (
                <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="p-1 rounded-full text-spiritual-400 hover:text-spiritual-700 hover:bg-spiritual-100 transition-colors ml-1"
                    title="Bảng Hướng Dẫn 5 Thanh Điệu Tiếng Trung"
                    aria-label="Tone Guide"
                >
                    <Info className="w-3.5 h-3.5" />
                </button>
            )}

            {/* Tone Legend Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-spiritual-950/40 backdrop-blur-xs animate-fadeIn">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-spiritual-100 relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 p-1 rounded-full text-spiritual-400 hover:text-spiritual-700 hover:bg-spiritual-100 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xl">🎵</span>
                            <h3 className="text-lg font-bold text-spiritual-900 font-serif">
                                Bảng 5 Thanh Điệu Tiếng Trung (Pinyin Tones)
                            </h3>
                        </div>

                        <p className="text-xs text-spiritual-600 mb-4 leading-relaxed">
                            Mỗi thanh điệu được tô màu riêng biệt để giúp bạn nhận diện cao độ và đọc đúng ngữ điệu tự nhiên.
                        </p>

                        <div className="space-y-2.5">
                            {Object.entries(TONE_DETAILS).map(([key, item]) => (
                                <div
                                    key={key}
                                    className={`p-3 rounded-xl border flex items-start gap-3 ${item.bgClass} ${item.borderClass}`}
                                >
                                    <span className="px-2 py-1 bg-white/80 rounded-md font-mono text-sm font-bold shadow-2xs shrink-0">
                                        {item.symbol} {key === '5' ? '0' : key}
                                    </span>
                                    <div className="flex-1">
                                        <div className={`text-sm font-bold ${item.textClass}`}>
                                            {item.nameVi}
                                        </div>
                                        <div className="text-xs opacity-80 font-sans mt-0.5">
                                            {item.contour}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowModal(false)}
                            className="w-full mt-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium text-sm transition-colors shadow-md"
                        >
                            Đã Hiểu
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
