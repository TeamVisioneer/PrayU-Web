/**
 * 어드민 차트 공용 설정 (JSX 없음 — 컴포넌트는 ChartParts.tsx).
 *
 * recharts 기본값(회색 격자·기본 범례·원시 날짜 축)이 그대로면 지저분해서
 * 축·격자를 뒤로 물리고 범례·툴팁은 직접 그린다.
 *
 * 색은 임의로 고르지 않았다 — 명도대·채도·색각 분리·대비 검증을 통과한 조합이다
 * (blue↔orange: 색각 ΔE 24.7, 일반 33.6, 대비 3:1 이상).
 */
export const CHART_SERIES = {
  primary: "#2a78d6",
  secondary: "#eb6834",
} as const;

const AXIS_TICK = { fontSize: 11, fill: "#8b8b8b" } as const;

/** 축 눈금: 2026-07-21 → 7/21 (모바일 폭에서 겹치지 않게) */
export const formatDayTick = (value: string) => {
  const [, month, day] = value.split("-");
  if (!month || !day) return value;
  return `${Number(month)}/${Number(day)}`;
};

/** 공통 축 설정 — 축선·눈금선을 지우고 값만 남긴다 */
export const xAxisProps = {
  dataKey: "date",
  tickFormatter: formatDayTick,
  tick: AXIS_TICK,
  tickLine: false,
  axisLine: false,
  minTickGap: 24,
  interval: "preserveStartEnd" as const,
  dy: 4,
};

export const yAxisProps = {
  tick: AXIS_TICK,
  tickLine: false,
  axisLine: false,
  allowDecimals: false,
  width: 28,
};

export const gridProps = {
  stroke: "#f0f0f0",
  strokeDasharray: "0",
  vertical: false,
} as const;

export interface SeriesLabel {
  key: string;
  label: string;
  color: string;
}
