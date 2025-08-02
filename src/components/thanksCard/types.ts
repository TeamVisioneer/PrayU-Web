// ThanksCard 타입은 supabase/types/tables.ts에서 import하여 사용
import { ThanksCard as DbThanksCard } from "../../../supabase/types/tables";
export type ThanksCard = DbThanksCard;

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
