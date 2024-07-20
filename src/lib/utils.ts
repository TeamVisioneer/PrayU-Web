import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getISOToday = () => {
  const now = new Date();

  // UTC 시간에서 KST (UTC+9) 시간으로 변환
  const koreaOffset = 9 * 60; // KST는 UTC+9이므로 9시간 * 60분
  const koreaTime = new Date(now.getTime() + koreaOffset * 60 * 1000);

  // 한국 시간대를 보존하면서 ISO 형식으로 반환
  const isoString = koreaTime.toISOString();

  // ISO 문자열에서 시간을 제거하고 날짜 부분만 반환
  return isoString.replace("Z", "+09:00");
};

// korean iso
export const getISODate = (dateString: string | null) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const koreaOffset = 9 * 60; // KST는 UTC+9이므로 9시간 * 60분
  const koreaTime = new Date(date.getTime() + koreaOffset * 60 * 1000);
  const isoString = koreaTime.toISOString();
  return isoString.replace("Z", "+09:00");
};
