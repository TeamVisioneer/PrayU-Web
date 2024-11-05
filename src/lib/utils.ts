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

export const getISOTodayDate = (n: number = 0) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const afterDt = new Date(today.getTime() + n * 24 * 60 * 60 * 1000);

  const koreaOffset = 9 * 60;
  const koreaTime = new Date(afterDt.getTime() + koreaOffset * 60 * 1000);

  const isoString = koreaTime.toISOString();

  return isoString.replace("Z", "+09:00");
};

// korean iso
export const getISODate = (dateTime: Date | null) => {
  if (!dateTime) return "";
  const koreaOffset = 9 * 60; // KST는 UTC+9이므로 9시간 * 60분
  const koreaTime = new Date(dateTime.getTime() + koreaOffset * 60 * 1000);
  const isoString = koreaTime.toISOString();
  return isoString.replace("Z", "+09:00");
};

export const getISOOnlyDate = (dateString: string | null) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  const koreaOffset = 9 * 60; // KST는 UTC+9이므로 9시간 * 60분
  const koreaTime = new Date(date.getTime() + koreaOffset * 60 * 1000);
  const isoString = koreaTime.toISOString();
  return isoString.replace("Z", "+09:00");
};

export const getISOTodayDateYMD = () => {
  const todayDate = getISOTodayDate();
  const [datePart] = todayDate.split("T");
  const [year, month, day] = datePart.split("-");
  return { year, month, day };
};

export const getISODateYMD = (dateString: string) => {
  const [datePart] = dateString.split("T");
  const [year, month, day] = datePart.split("-");
  return { year, month, day };
};

export const isToday = (dateString: string) => {
  const today = getISOTodayDate();
  const [todayDt] = today.split("T");
  const [targetDt] = dateString.split("T");
  return todayDt === targetDt;
};

export const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}.${String(date.getDate()).padStart(2, "0")}`;
};

export const getWeekInfo = (
  // 날짜의 해당 주차와 해당 주차의 날짜들을 반환
  dateString: string
): { weekNumber: number; weekDates: string[] } => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth(); // 0 = January, 1 = February, etc.

  // 주차 계산
  const weekNumber = Math.ceil(
    (date.getDate() + (new Date(year, month, 1).getDay() + 1)) / 7
  );

  // 현재 주의 일요일 날짜 계산
  const startOfWeek = new Date(year, month, date.getDate() - date.getDay()); // 일요일

  // 주의 날짜를 저장할 배열
  const weekDates: string[] = [];

  // 이번 주의 일요일부터 토요일까지 날짜를 계산
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i); // 일요일부터 시작
    weekDates.push(day.toISOString().split("T")[0]); // ISO 형식으로 날짜를 문자열로 변환
    console.log(day);
  }

  return {
    weekNumber,
    weekDates,
  };
};

// sleep 함수
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const isIpAddress = (hostname: string) => {
  const ipv4Pattern =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Pattern = /^(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}$/;
  return ipv4Pattern.test(hostname) || ipv6Pattern.test(hostname);
};

export const getDomainUrl = () => {
  const { protocol, hostname, port } = window.location;
  return hostname === "localhost" || isIpAddress(hostname)
    ? `${protocol}//${hostname}:${port}`
    : `${protocol}//${hostname}`;
};

export const days = ["일", "월", "화", "수", "목", "금", "토"];
