export interface ThanksCardFormData {
  name: string;
  photo?: File;
  photoPreview?: string;
  prayerContent: string;
}

export interface StepProps {
  formData: ThanksCardFormData;
  onUpdate: (data: Partial<ThanksCardFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isLoading?: boolean;
}

export interface CompletionStepProps {
  formData: ThanksCardFormData;
  cardNumber: number | null;
  onViewAllCards: () => void;
}

export type StepType = "name" | "photo" | "prayer" | "completion";
