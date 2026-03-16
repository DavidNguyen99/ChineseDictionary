import React from 'react';
import { Book } from 'lucide-react';

export const Header: React.FC = () => {
    return (
        <header className="text-center py-12 md:py-16">
            <div className="inline-flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-spiritual-100 mb-6">
                <Book className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-spiritual-900 mb-4 tracking-tight">
                Spiritual Dictionary
            </h1>
            <p className="text-spiritual-500 text-lg md:text-xl font-light tracking-wide">
                Từ Điển Tiếng Trung Thuộc Linh
            </p>
        </header>
    );
};
