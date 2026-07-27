import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ActivationFunnel,
  DailyPoint,
  KpiSummary,
  fetchActivationFunnel,
  fetchDailySeries,
  fetchKpiSummary,
} from "@/apis/admin";

/** 상단 고정 지표 — 매일 보는 3개 (누적/오늘 신규) */
const HeadlineStat = ({
  title,
  value,
}: {
  title: string;
  value: number | string;
}) => (
  <div className="flex flex-1 flex-col items-center gap-0.5 py-3">
    <span className="text-xs text-gray-500">{title}</span>
    <span className="text-xl font-bold leading-none">{value}</span>
  </div>
);

/** 기간 지표 — 보조. 값·라벨 위치를 고정해 줄이 흔들리지 않게 한다 */
const PeriodStat = ({
  title,
  value,
  delta,
  hint,
}: {
  title: string;
  value: number | string;
  delta?: number | null;
  hint?: string;
}) => (
  <div className="flex flex-col gap-0.5 rounded-lg bg-white px-3 py-2.5">
    <span className="text-[11px] leading-none text-gray-500">{title}</span>
    <span className="text-lg font-bold leading-tight">{value}</span>
    <span className="h-3 text-[11px] leading-none">
      {delta !== undefined && delta !== null ? (
        <span
          className={
            delta > 0
              ? "text-blue-600"
              : delta < 0
                ? "text-red-500"
                : "text-gray-400"
          }
        >
          {delta > 0 ? "+" : ""}
          {delta} vs 이전
        </span>
      ) : (
        <span className="text-gray-400">{hint || ""}</span>
      )}
    </span>
  </div>
);

const FunnelBar = ({
  label,
  value,
  base,
}: {
  label: string;
  value: number;
  base: number;
}) => {
  const ratio = base > 0 ? Math.round((value / base) * 100) : 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">
          {value}명 <span className="text-gray-400">({ratio}%)</span>
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div
          className="h-2 rounded-full bg-blue-500"
          style={{ width: `${ratio}%` }}
        />
      </div>
    </div>
  );
};

const OverviewTab = ({ days }: { days: number }) => {
  const [kpi, setKpi] = useState<KpiSummary | null>(null);
  const [series, setSeries] = useState<DailyPoint[] | null>(null);
  const [funnel, setFunnel] = useState<ActivationFunnel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    Promise.all([
      fetchKpiSummary(days),
      fetchDailySeries(days),
      fetchActivationFunnel(days),
    ]).then(([kpiResult, seriesResult, funnelResult]) => {
      if (cancelled) return;
      setKpi(kpiResult);
      setSeries(seriesResult);
      setFunnel(funnelResult);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [days]);

  if (isLoading) {
    return <div className="py-10 text-center text-gray-500">불러오는 중...</div>;
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {kpi ? (
        <div className="flex flex-col gap-3">
          {/* 매일 확인하는 3개는 기간 선택과 무관하게 항상 위에 고정 */}
          <Card>
            <CardContent className="flex divide-x p-0">
              <HeadlineStat title="누적 유저" value={kpi.totalUsers} />
              <HeadlineStat title="오늘 신규 유저" value={kpi.todayNewUsers} />
              <HeadlineStat title="오늘 신규 그룹" value={kpi.todayNewGroups} />
            </CardContent>
          </Card>

          <div>
            <div className="mb-1.5 text-xs font-medium text-gray-500">
              최근 {days}일
            </div>
            <div className="grid grid-cols-3 gap-2">
              <PeriodStat
                title="신규 유저"
                value={kpi.newUsers}
                delta={kpi.newUsers - kpi.prevNewUsers}
              />
              <PeriodStat
                title="신규 그룹"
                value={kpi.newGroups}
                delta={kpi.newGroups - kpi.prevNewGroups}
              />
              <PeriodStat
                title="누적 그룹"
                value={kpi.totalGroups}
                hint="전체"
              />
              <PeriodStat title="DAU" value={kpi.dau} hint="오늘 기도" />
              <PeriodStat title="WAU" value={kpi.wau} hint="7일 기도" />
              <PeriodStat
                title="활성 유저"
                value={kpi.activeUsers}
                hint="기간 내 기도"
              />
              <PeriodStat title="기도 수" value={kpi.prayCount} hint="합계" />
              <PeriodStat
                title="기도카드"
                value={kpi.prayCardCount}
                hint="작성 수"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-sm text-red-500">지표를 불러오지 못했어요</div>
      )}

      {funnel && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              활성화 퍼널 — 기간 내 가입자 기준
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {funnel.signedUp === 0 ? (
              <div className="text-sm text-gray-500">기간 내 가입자가 없어요</div>
            ) : (
              <>
                <FunnelBar
                  label="가입"
                  value={funnel.signedUp}
                  base={funnel.signedUp}
                />
                <FunnelBar
                  label="그룹 가입"
                  value={funnel.joinedGroup}
                  base={funnel.signedUp}
                />
                <FunnelBar
                  label="기도카드 작성"
                  value={funnel.wrotePrayCard}
                  base={funnel.signedUp}
                />
                <FunnelBar
                  label="기도"
                  value={funnel.prayed}
                  base={funnel.signedUp}
                />
              </>
            )}
          </CardContent>
        </Card>
      )}

      {series && (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">유입 추이</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="newUsers"
                    name="신규 유저"
                    stroke="#608CFF"
                    fill="#608CFF"
                    fillOpacity={0.2}
                  />
                  <Area
                    type="monotone"
                    dataKey="newGroups"
                    name="신규 그룹"
                    stroke="#34D399"
                    fill="#34D399"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">활동 추이</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="prays"
                    name="기도"
                    stroke="#608CFF"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="prayCards"
                    name="기도카드"
                    stroke="#F59E0B"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default OverviewTab;
