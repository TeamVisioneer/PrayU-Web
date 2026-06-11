import { BibleCard as BibleCardType } from "supabase/types/tables";
import { getISODateYMD } from "@/lib/utils";

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

export const BIBLE_CARD_COLOR_PRESETS: string[][] = [
  ["#FFD194", "#D1913C"],
  ["#a8c0ff", "#3f2b96"],
  ["#89f7fe", "#66a6ff"],
  ["#ff9966", "#ff5e62"],
  ["#84fab0", "#8fd3f4"],
  ["#ff9a9e", "#fecfef"],
  ["#a1c4fd", "#c2e9fb"],
  ["#2ebf91", "#FFDAD7"],
  ["#005AA7", "#FFFDE4"],
  ["#1f4037", "#99f2c8"],
  ["#FDEB71", "#F8D800"],
  ["#F6D365", "#FDA085"],
  ["#FBC2EB", "#A6C1EE"],
  ["#D4FC79", "#96E6A1"],
  ["#E0C3FC", "#8EC5FC"],
  ["#F093FB", "#F5576C"],
  ["#4FACFE", "#00F2FE"],
  ["#43E97B", "#38F9D7"],
  ["#FA709A", "#FEE140"],
  ["#30CFD0", "#330867"],
  ["#667EEA", "#764BA2"],
  ["#13547A", "#80D0C7"],
  ["#FFDEE9", "#B5FFFC"],
  ["#FAD0C4", "#FFD1FF"],
  ["#C1DFE6", "#FEEBC8"],
  ["#FFECD2", "#FCB69F"],
  ["#B7F8DB", "#50A7C2"],
  ["#FBD3E9", "#BB377D"],
  ["#F0C27B", "#4B1248"],
  ["#C9FFBF", "#FFAFBD"],
];
