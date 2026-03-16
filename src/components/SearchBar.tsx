import React from 'react';
import { Search, X } from 'lucide-react';
import type { Language } from '../services/detector';
import { clsx } from 'clsx';

interface SearchBarProps {
    onSearch: (query: string) => void;
    detectedLanguage: Language;
    currentQuery: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, detectedLanguage, currentQuery }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearch(e.target.value);
    };

    const handleClear = () => {
        onSearch('');
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto group">
            {/* Background glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-200 to-accent-200 rounded-2xl blur opacity-30 group-focus-within:opacity-75 transition duration-500"></div>

            <div className="relative bg-white rounded-xl shadow-lg flex items-center p-2 border border-spiritual-100 focus-within:ring-2 focus-within:ring-primary-300 transition-all">
                <div className="pl-4 pr-3 text-spiritual-400">
                    <Search className="w-6 h-6" />
                </div>

                <input
                    type="text"
                    className="flex-1 w-full p-3 text-lg text-spiritual-800 bg-transparent outline-none placeholder:text-spiritual-300 font-serif"
                    placeholder="Search word in English, Vietnamese or Chinese..."
                    value={currentQuery}
                    onChange={handleChange}
                    autoFocus
                />

                {/* Language Badge */}
                <div className="flex items-center gap-2 pr-2">
                    {currentQuery && detectedLanguage !== 'Unknown' && (
                        <span className={clsx(
                            "text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider transition-all animate-in fade-in zoom-in",
                            detectedLanguage === 'English' && "bg-primary-100 text-primary-800",
                            detectedLanguage === 'Chinese' && "bg-red-50 text-red-700",
                            detectedLanguage === 'Vietnamese' && "bg-accent-100 text-accent-800"
                        )}>
                            {detectedLanguage}
                        </span>
                    )}

                    {currentQuery && (
                        <button
                            onClick={handleClear}
                            className="p-2 hover:bg-spiritual-100 rounded-full text-spiritual-400 transition-colors"
                            aria-label="Clear search"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
