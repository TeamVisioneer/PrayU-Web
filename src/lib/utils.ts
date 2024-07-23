import { type ClassValue, clsx } from "clsx";
import { PrayWithProfiles } from "supabase/types/tables";
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

export const getISOTodayDate = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const koreaOffset = 9 * 60;
  const koreaTime = new Date(today.getTime() + koreaOffset * 60 * 1000);

  const isoString = koreaTime.toISOString();

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

// 데이터를 user_id로 그룹화하고 정렬하는 함수
export const groupAndSortByUserId = (data: PrayWithProfiles[]) => {
  const hash: { [key: string]: PrayWithProfiles[] } = {};

  // 데이터를 user_id로 그룹화
  data.forEach((item) => {
    if (!hash[item.user_id!]) {
      hash[item.user_id!] = [];
    }
    hash[item.user_id!].push(item);
  });

  // 그룹화된 데이터를 created_at으로 정렬
  Object.keys(hash).forEach((user_id) => {
    hash[user_id].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  });

  // user_id별 데이터 수에 따라 정렬
  const sortedEntries = Object.entries(hash).sort(
    (a, b) => b[1].length - a[1].length
  );

  // 정렬된 데이터 해시를 다시 객체로 변환
  const sortedHash = sortedEntries.reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {} as { [key: string]: PrayWithProfiles[] });

  return sortedHash;
};

// 해시 맵을 다시 배열로 변환
export const mergeSortedData = (hash: {
  [key: string]: PrayWithProfiles[];
}) => {
  return Object.values(hash).flat();
};
