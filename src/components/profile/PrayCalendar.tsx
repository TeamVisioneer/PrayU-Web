import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getISOTodayDate, formatToDateString, days } from "@/lib/utils";
import useBaseStore from "@/stores/baseStore";
import { Skeleton } from "@/components/ui/skeleton";
import { PrayType, PrayTypeDatas } from "@/Enums/prayType";
import {
  PrayWithPrayCardProfiles,
  PrayWithProfiles,
} from "supabase/types/tables";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * 월 단위 기도 달력. 데이터 소유권도 여기 있다 —
 * 월이 바뀔 때마다 해당 월 범위로 직접 조회한다 (plans/my-profile-refresh.md PR 2).
 * 날짜 마킹은 "내가 기도한 날" — 데일리 기록(습관)의 축이다. 안 한 날 표식(✗)은 죄책감 UI 라 쓰지 않는다.
 * 날짜를 선택하면 그날 **남긴 기도 + 받은 기도**를 아래에 보여준다. 오늘이 기본 선택.
 */
const PrayCalendar = () => {
  const user = useBaseStore((state) => state.user);
  const fetchPrayListByDate = useBaseStore(
    (state) => state.fetchPrayListByDate
  );
  const fetchReceivedPrayListByDate = useBaseStore(
    (state) => state.fetchReceivedPrayListByDate
  );

  const todayString = formatToDateString(getISOTodayDate());
  const [todayYear, todayMonth] = todayString.split("-").map((v) => Number(v));

  const [anchor, setAnchor] = useState({ year: todayYear, month: todayMonth });
  // 월별 조회 결과는 지역 상태로 — 월 전환 중 이전 달 데이터가 새 그리드에 섞이지 않게 한다
  const [monthPrayList, setMonthPrayList] = useState<
    PrayWithPrayCardProfiles[] | null
  >(null);
  const [monthReceivedList, setMonthReceivedList] = useState<
    PrayWithProfiles[] | null
  >(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(todayString);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setMonthPrayList(null);
    setMonthReceivedList(null);
    const start = `${anchor.year}-${pad(anchor.month)}-01`;
    const end =
      anchor.month === 12
        ? `${anchor.year + 1}-01-01`
        : `${anchor.year}-${pad(anchor.month + 1)}-01`;
    Promise.all([
      fetchPrayListByDate(user.id, start, end),
      fetchReceivedPrayListByDate(user.id, start, end),
    ]).then(([prayList, receivedList]) => {
      if (cancelled) return;
      if (prayList) setMonthPrayList(prayList);
      setMonthReceivedList(receivedList ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, [user, anchor, fetchPrayListByDate, fetchReceivedPrayListByDate]);

  const isCurrentMonth =
    anchor.year === todayYear && anchor.month === todayMonth;

  const moveMonth = (delta: number) => {
    setAnchor(({ year, month }) => {
      const next = month + delta;
      if (next < 1) return { year: year - 1, month: 12 };
      if (next > 12) return { year: year + 1, month: 1 };
      return { year, month: next };
    });
    // 이번 달로 돌아오면 오늘을, 다른 달이면 선택 없음을 기본으로
    setSelectedDate(null);
  };

  const prayedDates = monthPrayList
    ? new Set(monthPrayList.map((pray) => pray.created_at.split("T")[0]))
    : null;
  const selectedPrayList =
    selectedDate && monthPrayList
      ? monthPrayList.filter(
          (pray) => pray.created_at.split("T")[0] === selectedDate
        )
      : [];
  const selectedReceivedList =
    selectedDate && monthReceivedList
      ? monthReceivedList.filter(
          (pray) => pray.created_at.split("T")[0] === selectedDate
        )
      : [];

  const firstDayOfWeek = new Date(anchor.year, anchor.month - 1, 1).getDay();
  const daysInMonth = new Date(anchor.year, anchor.month, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDayOfWeek }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const formatKstTime = (isoString: string) =>
    new Date(isoString).toLocaleTimeString("ko-KR", {
      hour: "numeric",
      minute: "2-digit",
    });

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
              const isSelected = dateString === selectedDate;
              // 활동한 날은 숫자 "색"으로만 포인트 — 배경 채움은 버그처럼 읽힌다 (2026-08-17 피드백)
              const hasPrayed = prayedDates.has(dateString);
              return (
                <button
                  key={dateString}
                  type="button"
                  disabled={isFuture}
                  onClick={() =>
                    setSelectedDate(isSelected ? null : dateString)
                  }
                  className={`flex aspect-square items-center justify-center rounded-full text-sm transition-all duration-150 ${
                    hasPrayed
                      ? "font-bold text-accentTo"
                      : isFuture
                        ? "text-deactivate"
                        : "text-dark active:bg-white/70"
                  } ${
                    isSelected
                      ? "ring-2 ring-inset ring-accentTo"
                      : isToday
                        ? "ring-1 ring-inset ring-accentFrom/60"
                        : ""
                  }`}
                >
                  {day}
                </button>
              );
            })}
      </div>

      {selectedDate && monthPrayList && (
        <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
          <span className="text-xs font-semibold text-dark">
            {Number(selectedDate.split("-")[1])}월{" "}
            {Number(selectedDate.split("-")[2])}일
          </span>
          {selectedPrayList.length === 0 &&
          selectedReceivedList.length === 0 ? (
            <p className="py-2 text-center text-sm text-dark">
              이 날의 기도 기록이 없어요
            </p>
          ) : (
            <>
              {selectedPrayList.length > 0 && (
                <ul className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-deactivate">
                    내가 남긴 기도
                  </span>
                  {selectedPrayList.map((pray) => {
                    const typeData = PrayTypeDatas[pray.pray_type as PrayType];
                    const targetName = pray.pray_card?.profiles?.full_name;
                    return (
                      <li
                        key={pray.id}
                        className="flex items-center gap-2.5 rounded-xl bg-white/70 px-3 py-2.5"
                      >
                        <img
                          src={typeData?.img}
                          alt={typeData?.text}
                          className="h-6 w-6 shrink-0"
                        />
                        <span className="min-w-0 flex-1 truncate text-sm text-liteBlack">
                          {targetName
                            ? `${targetName}님에게 마음을 전했어요`
                            : "마음을 전했어요"}
                        </span>
                        <span className="shrink-0 text-xs text-deactivate">
                          {formatKstTime(pray.created_at)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
              {selectedReceivedList.length > 0 && (
                <ul className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-deactivate">받은 기도</span>
                  {selectedReceivedList.map((pray) => {
                    const typeData = PrayTypeDatas[pray.pray_type as PrayType];
                    const senderName = pray.profiles?.full_name;
                    return (
                      <li
                        key={pray.id}
                        className="flex items-center gap-2.5 rounded-xl bg-white/70 px-3 py-2.5"
                      >
                        <img
                          src={typeData?.img}
                          alt={typeData?.text}
                          className="h-6 w-6 shrink-0"
                        />
                        <span className="min-w-0 flex-1 truncate text-sm text-liteBlack">
                          {senderName
                            ? `${senderName}님이 마음을 전했어요`
                            : "마음이 도착했어요"}
                        </span>
                        <span className="shrink-0 text-xs text-deactivate">
                          {formatKstTime(pray.created_at)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PrayCalendar;
