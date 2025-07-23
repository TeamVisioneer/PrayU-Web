export interface ThanksCard {
  id: string;
  title: string;
  content: string;
  author: string;
  category: "감사" | "기도요청" | "찬양" | "간증";
  image?: string;
  createdAt: string;
}

export interface ThanksCardHeaderProps {
  currentTime: Date;
}

export interface ThanksCardStatsProps {
  totalCount: number;
}

export interface ThanksCardItemProps {
  card: ThanksCard;
}

export interface ThanksCardCarouselProps {
  cards: ThanksCard[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export interface ThanksCardQRCodeProps {
  // QR 코드 관련 props (현재는 정적)
}

export interface ThanksCardProgressIndicatorProps {
  totalItems: number;
  currentIndex: number;
  onIndexChange: (index: number) => void;
}
