
import { useState, useEffect, useCallback } from 'react';

interface SelectionState {
    text: string;
    position: { x: number; y: number } | null;
    isVisible: boolean;
}

export const useWordSelection = () => {
    const [selection, setSelection] = useState<SelectionState>({
        text: '',
        position: null,
        isVisible: false,
    });

    // Helper to check translatable area
    const isTranslatableNode = (node: Node | null): boolean => {
        let targetNode = node instanceof Text ? node.parentElement : (node as HTMLElement);
        while (targetNode && targetNode !== document.body) {
            if (targetNode instanceof HTMLElement) {
                if (targetNode.hasAttribute('data-translate-content')) {
                    return true;
                }
            }
            targetNode = targetNode.parentNode as HTMLElement;
        }
        return false;
    };

    const handleSelection = useCallback(() => {
        const activeSelection = window.getSelection();

        // If no selection or empty
        if (!activeSelection || activeSelection.isCollapsed || !activeSelection.toString().trim()) {
            return;
        }

        const text = activeSelection.toString().trim();
        if (!text) return;

        // Check if valid range exists
        if (activeSelection.rangeCount === 0) return;

        const range = activeSelection.getRangeAt(0);

        // Validation: Translatable area?
        if (!isTranslatableNode(range.commonAncestorContainer)) {
            return;
        }

        const rect = range.getBoundingClientRect();

        // Ensure rect is valid (non-zero) - sometimes mobile selection rect is weird
        if (rect.width === 0 && rect.height === 0) return;

        // Calculate a good position (centered above the selection)
        const x = rect.left + rect.width / 2;
        const y = rect.top;

        setSelection({
            text,
            position: { x, y },
            isVisible: true,
        });
    }, []);

    const handleClick = useCallback((e: MouseEvent) => {
        // If we clicked inside the popup, do nothing (handled by stopPropagation usually)
        // But here we attach to window/document, so we need to be careful.

        // Check if user clicked on specific text (Range expansion)
        // Use caretRangeFromPoint for single-click word detection
        const sel = window.getSelection();

        // If user already has a selection (dragged), don't override with single word lookup *unless* they clicked elsewhere.
        if (sel && !sel.isCollapsed && sel.toString().trim().length > 0) {
            // The drag logic (mouseup) handles this.
            // BUT if they clicked on the SAME selection, we keep it.
            // If outside, global click handler usually clears selection (browser default).
            // We verify if selection is still valid in 'handleSelection'.
            return;
        }

        // Try to get word at point
        if (document.caretRangeFromPoint) {
            const range = document.caretRangeFromPoint(e.clientX, e.clientY);
            if (range && range.startContainer.nodeType === Node.TEXT_NODE) {
                // Expand to word
                // Clone range to not affect UI cursor if possible, though 'expand' might not exist on Range
                // We use the Selection object to help expand, or manual expansion.
                // Manual expansion is safer to avoid UI jumping.

                let start = range.startOffset;
                let end = range.startOffset;
                const textContent = range.startContainer.textContent || '';

                // --- Language-aware Expansion ---

                // Simple check for CJK at the cursor position
                // Note: 'start' is the caret position. textContent[start] is char after caret. textContent[start-1] is char before.
                // caretRangeFromPoint usually gives insertion point closest to click.
                // If we click ON a character, it might be before or after.
                // Let's check both neighborhood chars.
                const charAfter = textContent[start] || '';
                const charBefore = textContent[start - 1] || '';
                const isCJK = /[\u4e00-\u9fa5]/.test(charAfter) || /[\u4e00-\u9fa5]/.test(charBefore);

                let cleanWord = '';

                if (isCJK) {
                    // Chinese/CJK logic: Don't expand by whitespace!
                    // Ideally use Intl.Segmenter
                    if ('Intl' in window && 'Segmenter' in Intl) {
                        const segmenter = new Intl.Segmenter('zh', { granularity: 'word' });
                        const segments = segmenter.segment(textContent);

                        for (const seg of segments) {
                            const segEnd = seg.index + seg.segment.length;
                            // Check if cursor is roughly inside this segment
                            // Be lenient with cursor being at start/end boundary
                            if (start >= seg.index && start <= segEnd) {
                                // eslint-disable-next-line no-useless-escape
                                if (seg.segment.trim() && !/[.,!?;:"'()\[\]{}«»“”]/.test(seg.segment)) {
                                    cleanWord = seg.segment;
                                    start = seg.index;
                                    end = segEnd;
                                    break;
                                }
                            }
                        }
                    }

                    // Fallback if Segmenter failed or not supported: Select single character
                    if (!cleanWord) {
                        // Prefer the character we actually clicked. 
                        // Logic: if we are at index i, did we click left or right?
                        // It's hard to know exactly without complex math, but usually picking VALID CJK char near cursor is safe.
                        if (/[\u4e00-\u9fa5]/.test(charAfter)) {
                            cleanWord = charAfter;
                            end = start + 1;
                        } else if (/[\u4e00-\u9fa5]/.test(charBefore)) {
                            cleanWord = charBefore;
                            start = start - 1;
                        }
                    }
                } else {
                    // Standard Latin/Vietnamese logic (Space delimited)

                    // Look back
                    while (start > 0 && /\S/.test(textContent[start - 1])) {
                        start--;
                    }
                    // Look forward
                    while (end < textContent.length && /\S/.test(textContent[end])) {
                        end++;
                    }

                    const word = textContent.slice(start, end);
                    // eslint-disable-next-line no-useless-escape
                    const punctuationRegex = /[.,!?;:"'()\[\]{}«»“”]/g;
                    cleanWord = word.replace(punctuationRegex, '').trim();
                }

                if (cleanWord.length > 0) {
                    // We found a word.

                    // VALIDATION: Check if this node is inside a translatable area
                    // We traverse up from the text node's parent
                    let targetNode: Node | null = range.startContainer.parentElement;
                    let isTranslatable = false;
                    while (targetNode && targetNode !== document.body) {
                        if (targetNode instanceof HTMLElement) {
                            if (targetNode.hasAttribute('data-translate-content')) {
                                isTranslatable = true;
                                break;
                            }
                            // Also stop if we hit non-interactive containers that shouldn't be clicked?
                            // But mainly we whitelist 'data-translate-content'.
                        }
                        targetNode = targetNode.parentNode;
                    }

                    if (!isTranslatable) {
                        setSelection(prev => ({ ...prev, isVisible: false }));
                        return;
                    }

                    // We need its rect.
                    const wordRange = document.createRange();
                    wordRange.setStart(range.startContainer, start);
                    wordRange.setEnd(range.startContainer, end);
                    const rect = wordRange.getBoundingClientRect();

                    // CRITICAL: Validating Click Position
                    // caretRangeFromPoint returns strict text offset, but if you click in empty space 
                    // inside the block, it effectively "snaps" to nearest char.
                    // We must ensure the click (e.clientX, e.clientY) is strictly INSIDE the word rect.
                    // Add small padding (e.g. 2px) to be user friendly but not loose.
                    const PADDING = 2;
                    const isInsideX = e.clientX >= rect.left - PADDING && e.clientX <= rect.right + PADDING;
                    const isInsideY = e.clientY >= rect.top - PADDING && e.clientY <= rect.bottom + PADDING;

                    if (!isInsideX || !isInsideY) {
                        setSelection(prev => ({ ...prev, isVisible: false }));
                        return;
                    }

                    setSelection({
                        text: cleanWord,
                        position: { x: rect.left + rect.width / 2, y: rect.top },
                        isVisible: true
                    });
                    return;
                }
            }
        }

        // If we reach here, we likely clicked whitespace or non-text. Hide popup.
        setSelection(prev => ({ ...prev, isVisible: false }));

    }, []);



    useEffect(() => {
        let debounceTimer: NodeJS.Timeout;

        const onSelectionChange = () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                handleSelection();
            }, 600); // 600ms debounce to allow user to finish dragging handles or dismiss native menu
        };

        // Attach listeners
        document.addEventListener('selectionchange', onSelectionChange);
        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('selectionchange', onSelectionChange);
            document.removeEventListener('click', handleClick);
            clearTimeout(debounceTimer);
        };
    }, [handleSelection, handleClick]);

    return { selection, setSelection };
};
