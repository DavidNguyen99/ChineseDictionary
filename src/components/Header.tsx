import React from 'react';
import { Book } from 'lucide-react';
import { AudioSpeedSelector } from './AudioSpeedSelector';

export const Header: React.FC = () => {
    return (
        <header className="text-center pt-8 pb-6 md:pt-12 md:pb-8 relative">
            <div className="flex justify-end mb-2 sm:absolute sm:top-4 sm:right-0 sm:mb-0">
                <AudioSpeedSelector />
            </div>

            <div className="inline-flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-spiritual-100 mb-4">
                <Book className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-spiritual-900 mb-3 tracking-tight">
                Spiritual Dictionary
            </h1>
            <p className="text-spiritual-500 text-lg md:text-xl font-light tracking-wide">
                Từ Điển Tiếng Trung Thuộc Linh
            </p>
        </header>
    );
};
