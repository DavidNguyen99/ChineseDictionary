import React from 'react';
import { ResultCard } from './ResultCard';
import type { DictionaryEntry } from '../services/api';

interface ResultListProps {
    results: DictionaryEntry[];
    loading: boolean;
    hasQuery: boolean;
}

export const ResultList: React.FC<ResultListProps> = ({ results, loading, hasQuery }) => {
    if (loading) {
        return (
            <div className="flex flex-col gap-4 mt-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white/50 h-40 rounded-xl animate-pulse border border-spiritual-100" />
                ))}
            </div>
        );
    }

    if (hasQuery && results.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-spiritual-500 text-lg">No results found for your search.</p>
                <p className="text-spiritual-400 text-sm mt-2">Try checking the spelling or switch language keyword.</p>
            </div>
        );
    }

    if (!hasQuery) {
        return (
            <div className="text-center py-20 opacity-50">
                <p className="text-spiritual-400 font-serif italic text-xl">"...seeks finds..."</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 mt-8 pb-20">
            {results.map((entry, index) => (
                // Using index as key is risky if list changes dynamically in complex ways, 
                // but for a search result list it's generally acceptable if data has no ID.
                // Ideally we'd combine fields for a unique key.
                <ResultCard key={`${entry.English}-${index}`} entry={entry} />
            ))}
        </div>
    );
};
