import React from 'react';

interface HighlightTextProps {
    text: string;
    keyword?: string | string[];
    className?: string; // Allow custom styling for the container or highlight
    highlightClass?: string;
}

export const HighlightText: React.FC<HighlightTextProps> = ({ text, keyword, highlightClass = "bg-yellow-200 text-spiritual-900 font-bold px-0.5 rounded-sm" }) => {
    if (!keyword || !text || (Array.isArray(keyword) && keyword.length === 0)) {
        return <>{text}</>;
    }

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
                    <span key={i} className={highlightClass}>
                        {part}
                    </span>
                ) : (
                    part
                )
            )}
        </>
    );
};
