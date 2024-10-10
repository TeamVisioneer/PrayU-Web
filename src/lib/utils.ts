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

// cookie
export const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return "";
};
