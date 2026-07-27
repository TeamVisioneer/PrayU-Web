import { SeriesLabel } from "./chartTheme";

// recharts가 커스텀 content에 넘기는 값만 좁게 정의 (버전별 타입 변동을 타지 않게)
interface TooltipRenderProps {
  active?: boolean;
  label?: string | number;
  payload?: Array<{ dataKey?: string | number; value?: number | string }>;
}

type ValueFormatter = (value: number) => string;

/** 툴팁 — 계열 정의를 받아 색 점·라벨·값을 그린다 */
export const ChartTooltip =
  (series: SeriesLabel[], formatValue?: ValueFormatter) =>
  ({ active, payload, label }: TooltipRenderProps) => {
    if (!active || !payload || payload.length === 0) return null;
    return (
      <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-md">
        <div className="mb-1 text-[11px] text-gray-400">{label}</div>
        {payload.map((entry) => {
          const meta = series.find((item) => item.key === entry.dataKey);
          if (!meta) return null;
          const value = Number(entry.value ?? 0);
          return (
            <div
              key={String(entry.dataKey)}
              className="flex items-center gap-2 text-xs text-gray-700"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: meta.color }}
              />
              <span className="text-gray-500">{meta.label}</span>
              <span className="ml-auto font-semibold">
                {formatValue ? formatValue(value) : value.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

/** 범례 — 2계열 이상일 때만. 글자는 회색이고 색은 점이 담당한다 */
export const ChartLegend = ({ series }: { series: SeriesLabel[] }) => (
  <div className="flex items-center gap-3">
    {series.map((item) => (
      <div key={item.key} className="flex items-center gap-1.5">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: item.color }}
        />
        <span className="text-[11px] text-gray-500">{item.label}</span>
      </div>
    ))}
  </div>
);
