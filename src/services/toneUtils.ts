import { pinyin } from 'pinyin-pro';

export interface SyllableTone {
    raw: string;
    pinyinSymbol: string;
    toneNumber: number; // 1, 2, 3, 4, 5
    toneSymbol: string;
    toneName: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
}

export const TONE_DETAILS: Record<number, {
    symbol: string;
    name: string;
    nameVi: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
    contour: string;
}> = {
    1: {
        symbol: 'ˉ',
        name: 'First Tone (High Level)',
        nameVi: 'Thanh 1 (Ngang / Cao)',
        bgClass: 'bg-sky-100/90 hover:bg-sky-200',
        textClass: 'text-sky-900 font-semibold',
        borderClass: 'border-sky-300',
        contour: '55 (Cao ngang)',
    },
    2: {
        symbol: 'ˊ',
        name: 'Second Tone (Rising)',
        nameVi: 'Thanh 2 (Sắc / Sắc đi lên)',
        bgClass: 'bg-emerald-100/90 hover:bg-emerald-200',
        textClass: 'text-emerald-900 font-semibold',
        borderClass: 'border-emerald-300',
        contour: '35 (Tăng từ trung lên cao)',
    },
    3: {
        symbol: 'ˇ',
        name: 'Third Tone (Falling-Rising)',
        nameVi: 'Thanh 3 (Hỏi / Xuống rồi lên)',
        bgClass: 'bg-amber-100/90 hover:bg-amber-200',
        textClass: 'text-amber-900 font-semibold',
        borderClass: 'border-amber-300',
        contour: '214 (Xuống thấp rồi vút lên)',
    },
    4: {
        symbol: 'ˋ',
        name: 'Fourth Tone (Falling)',
        nameVi: 'Thanh 4 (Huyền / Nhấn dứt khoát)',
        bgClass: 'bg-rose-100/90 hover:bg-rose-200',
        textClass: 'text-rose-900 font-semibold',
        borderClass: 'border-rose-300',
        contour: '51 (Từ cao rơi mạnh xuống)',
    },
    5: {
        symbol: '·',
        name: 'Neutral Tone (Light)',
        nameVi: 'Thanh Nhẹ (Nhẹ & Ngắn)',
        bgClass: 'bg-slate-100/90 hover:bg-slate-200',
        textClass: 'text-slate-700 font-normal',
        borderClass: 'border-slate-300',
        contour: 'Light/Short',
    },
};

/**
 * Extracts tone details for a given Pinyin string or Chinese characters.
 */
export const getSyllablesWithTones = (text: string, chineseFallback?: string): SyllableTone[] => {
    if (!text && !chineseFallback) return [];

    let pinyinSymbols: string[] = [];
    let pinyinNums: string[] = [];

    if (text) {
        pinyinSymbols = text.trim().split(/\s+/);
        // Try getting numbered pinyin from text or chinese fallback
        const sourceText = chineseFallback || text;
        pinyinNums = pinyin(sourceText, { toneType: 'num', type: 'array' });
    } else if (chineseFallback) {
        pinyinSymbols = pinyin(chineseFallback, { toneType: 'symbol', type: 'array' });
        pinyinNums = pinyin(chineseFallback, { toneType: 'num', type: 'array' });
    }

    return pinyinSymbols.map((symbol, idx) => {
        const numStr = pinyinNums[idx] || '';
        // Extract last digit if available
        const toneMatch = numStr.match(/(\d)$/);
        let toneNum = toneMatch ? parseInt(toneMatch[1], 10) : 5;
        if (toneNum < 1 || toneNum > 5) toneNum = 5;

        const info = TONE_DETAILS[toneNum] || TONE_DETAILS[5];

        return {
            raw: symbol,
            pinyinSymbol: symbol,
            toneNumber: toneNum,
            toneSymbol: info.symbol,
            toneName: info.nameVi,
            bgClass: info.bgClass,
            textClass: info.textClass,
            borderClass: info.borderClass,
        };
    });
};
