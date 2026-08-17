import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getISOTodayDate, formatToDateString, days } from "@/lib/utils";
import useBaseStore from "@/stores/baseStore";
import { Skeleton } from "@/components/ui/skeleton";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * 월 단위 기도 달력. 데이터 소유권도 여기 있다 —
 * 월이 바뀔 때마다 해당 월 범위로 직접 조회한다 (plans/my-profile-refresh.md PR 2).
 * 기도한 날만 채운다 — 안 한 날 표식(✗)은 죄책감 UI 라 쓰지 않는다.
 */
const PrayCalendar = () => {
  const user = useBaseStore((state) => state.user);
  const fetchPrayListByDate = useBaseStore(
    (state) => state.fetchPrayListByDate
  );

  const todayString = formatToDateString(getISOTodayDate());
  const [todayYear, todayMonth] = todayString
    .split("-")
    .map((v) => Number(v));

  const [anchor, setAnchor] = useState({ year: todayYear, month: todayMonth });
  // 월별 조회 결과는 지역 상태로 — 월 전환 중 이전 달 데이터가 새 그리드에 섞이지 않게 한다
  const [prayedDates, setPrayedDates] = useState<Set<string> | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setPrayedDates(null);
    const start = `${anchor.year}-${pad(anchor.month)}-01`;
    const end =
      anchor.month === 12
        ? `${anchor.year + 1}-01-01`
        : `${anchor.year}-${pad(anchor.month + 1)}-01`;
    fetchPrayListByDate(user.id, start, end).then((prayList) => {
      if (cancelled || !prayList) return;
      setPrayedDates(
        new Set(prayList.map((pray) => pray.created_at.split("T")[0]))
      );
    });
    return () => {
      cancelled = true;
    };
  }, [user, anchor, fetchPrayListByDate]);

  const isCurrentMonth =
    anchor.year === todayYear && anchor.month === todayMonth;

  const moveMonth = (delta: number) => {
    setAnchor(({ year, month }) => {
      const next = month + delta;
      if (next < 1) return { year: year - 1, month: 12 };
      if (next > 12) return { year: year + 1, month: 1 };
      return { year, month: next };
    });
  };

  const firstDayOfWeek = new Date(anchor.year, anchor.month - 1, 1).getDay();
  const daysInMonth = new Date(anchor.year, anchor.month, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDayOfWeek }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="w-full flex flex-col gap-3 rounded-2xl border border-glassBorder/50 bg-surfaceCard/70 p-5 shadow-member">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-black">
          {anchor.year}년 {anchor.month}월
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="이전 달"
            onClick={() => moveMonth(-1)}
            className="rounded-lg p-1.5 text-liteBlack transition-colors hover:bg-white/60"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            aria-label="다음 달"
            onClick={() => moveMonth(1)}
            disabled={isCurrentMonth}
            className="rounded-lg p-1.5 text-liteBlack transition-colors hover:bg-white/60 disabled:text-deactivate disabled:hover:bg-transparent"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => (
          <span
            key={day}
            className="flex h-7 items-center justify-center text-xs text-deactivate"
          >
            {day}
          </span>
        ))}
        {prayedDates === null
          ? Array.from({ length: cells.length }, (_, i) => (
              <Skeleton key={i} className="aspect-square rounded-full" />
            ))
          : cells.map((day, i) => {
              if (day === null) return <div key={`blank-${i}`} />;
              const dateString = `${anchor.year}-${pad(anchor.month)}-${pad(day)}`;
              const isToday = dateString === todayString;
              const isFuture = dateString > todayString;
              const hasPrayed = prayedDates.has(dateString);
              return (
                <div
                  key={dateString}
                  className={`flex aspect-square items-center justify-center rounded-full text-sm ${
                    hasPrayed
                      ? "bg-accentFrom font-semibold text-white"
                      : isFuture
                        ? "text-deactivate"
                        : "text-dark"
                  } ${isToday && !hasPrayed ? "font-bold text-accentTo ring-1 ring-inset ring-accentFrom/60" : ""} ${
                    isToday && hasPrayed ? "ring-2 ring-inset ring-white/70" : ""
                  }`}
                >
                  {day}
                </div>
              );
            })}
      </div>
    </div>
  );
};

export default PrayCalendar;
