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

const KpiCard = ({
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
  <Card className="overflow-hidden">
    <CardHeader className="pb-1">
      <CardTitle className="text-xs font-medium text-gray-500">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {delta !== undefined && delta !== null && (
        <div
          className={`text-xs ${
            delta > 0
              ? "text-blue-600"
              : delta < 0
                ? "text-red-500"
                : "text-gray-400"
          }`}
        >
          이전 기간 대비 {delta > 0 ? "+" : ""}
          {delta}
        </div>
      )}
      {hint && <div className="text-xs text-gray-400">{hint}</div>}
    </CardContent>
  </Card>
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
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiCard title="누적 유저" value={kpi.totalUsers} />
          <KpiCard
            title="신규 유저"
            value={kpi.newUsers}
            delta={kpi.newUsers - kpi.prevNewUsers}
          />
          <KpiCard title="누적 그룹" value={kpi.totalGroups} />
          <KpiCard
            title="신규 그룹"
            value={kpi.newGroups}
            delta={kpi.newGroups - kpi.prevNewGroups}
          />
          <KpiCard title="DAU" value={kpi.dau} hint="오늘 기도한 유저" />
          <KpiCard title="WAU" value={kpi.wau} hint="최근 7일" />
          <KpiCard title="기도 수" value={kpi.prayCount} hint="기간 합계" />
          <KpiCard
            title="기도카드"
            value={kpi.prayCardCount}
            hint="기간 작성 수"
          />
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
