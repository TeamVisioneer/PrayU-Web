import { BibleCard as BibleCardType } from "supabase/types/tables";
import { getISODateYMD } from "@/lib/utils";

// 말씀카드에 표시할 키워드 최대 개수
export const MAX_BIBLE_CARD_KEYWORDS = 3;

// 말씀카드 디자인 원본(BibleCardBase)의 기준 크기.
// 화면 표시는 이 크기를 scale 로 축소하고, 캡처는 원본 크기로 찍는다.
export const BIBLE_CARD_WIDTH = 380;
export const BIBLE_CARD_HEIGHT = (BIBLE_CARD_WIDTH * 4) / 3;

export interface BibleCardContent {
  name: string;
  bibleSentence: string;
  bibleReference: string;
  colors: string[];
  radius: string[];
  keywords: string[];
  date: { year: string; month: string; day: string };
}

export const toBibleCardContent = (
  bibleCard: BibleCardType,
): BibleCardContent => ({
  name: bibleCard.name,
  bibleSentence: bibleCard.bible_sentence,
  bibleReference: bibleCard.bible_reference,
  colors: bibleCard.colors,
  radius: bibleCard.radius,
  keywords: bibleCard.keywords,
  date: getISODateYMD(bibleCard.created_at),
});

// 380px 기준 카드에서 구절 길이에 따라 폰트 크기를 단계적으로 줄인다.
// 같은 길이는 항상 같은 스타일을 반환하므로 화면 렌더링과 이미지 캡처 결과가 일치한다.
export interface BibleVerseStyle {
  fontSize: number;
  lineHeight: number;
  paddingX: number;
}

export const getBibleVerseStyle = (verseLength: number): BibleVerseStyle => {
  if (verseLength <= 50) return { fontSize: 30, lineHeight: 38, paddingX: 50 };
  if (verseLength <= 90) return { fontSize: 24, lineHeight: 31, paddingX: 45 };
  if (verseLength <= 140) return { fontSize: 20, lineHeight: 26, paddingX: 38 };
  if (verseLength <= 200) return { fontSize: 17, lineHeight: 22, paddingX: 32 };
  return { fontSize: 14, lineHeight: 19, paddingX: 28 };
};

// 파스텔 그라데이션 프리셋. 글씨색은 배경 밝기에 따라 자동 보정하므로(getCardTextColorOnGradient)
// 밝은 파스텔만 모아도 가독성이 유지된다.
export const BIBLE_CARD_COLOR_PRESETS: string[][] = [
  ["#84fab0", "#8fd3f4"],
  ["#ff9a9e", "#fecfef"],
  ["#a1c4fd", "#c2e9fb"],
  ["#fbc2eb", "#a6c1ee"],
  ["#d4fc79", "#96e6a1"],
  ["#e0c3fc", "#8ec5fc"],
  ["#ffdee9", "#b5fffc"],
  ["#fad0c4", "#ffd1ff"],
  ["#c1dfe6", "#feebc8"],
  ["#ffecd2", "#fcb69f"],
  ["#c9ffbf", "#ffafbd"],
  ["#89f7fe", "#66a6ff"],
  ["#f6d365", "#fda085"],
  ["#a8edea", "#fed6e3"],
  ["#fff1eb", "#ace0f9"],
  ["#fddb92", "#d1fdff"],
  ["#f5f7fa", "#c3cfe2"],
  ["#fdcbf1", "#e6dee9"],
  ["#d9afd9", "#97d9e1"],
  ["#cfd9df", "#e2ebf0"],
  ["#accbee", "#e7f0fd"],
  ["#e9defa", "#fbfcdb"],
  ["#f3e7e9", "#e3eeff"],
  ["#fbc2eb", "#bdb2ff"],
  ["#b5ead7", "#c7ceea"],
  ["#ffdac1", "#e2f0cb"],
];

// ---- 색상 유틸: 배경 밝기에 따른 가독성 좋은 글씨색 산출 ----

const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  const value = parseInt(full, 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
};

const relativeLuminance = (hex: string): number => {
  const { r, g, b } = hexToRgb(hex);
  const channel = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

// 카드 색 정체성은 그라데이션 블롭이 담당하고, 글씨는 중립 모노크롬으로 위계를 만든다.
// (색을 글씨에 분산하지 않아야 블롭이 색 주인공으로 정돈된다)
export const BIBLE_CARD_TEXT_DARK = "#2B2B2B"; // 구절·이름 (주요 텍스트)
export const BIBLE_CARD_TEXT_MUTED = "#6B7280"; // 키워드 (메타 텍스트)

// 구절 본문 글씨색: 밝은 파스텔이면 중립 다크, 어두운 배경(기존 진한 프리셋 카드)이면 흰색.
export const getCardTextColorOnGradient = (colors: string[]): string => {
  const avgLuminance =
    colors.reduce((sum, c) => sum + relativeLuminance(c), 0) /
    (colors.length || 1);
  return avgLuminance < 0.5 ? "#FFFFFF" : BIBLE_CARD_TEXT_DARK;
};
