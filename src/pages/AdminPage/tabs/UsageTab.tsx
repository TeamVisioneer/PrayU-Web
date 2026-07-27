import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FeatureUsage, fetchFeatureUsage } from "@/apis/admin";
import { CHART_SERIES, gridProps, xAxisProps, yAxisProps } from "./chartTheme";
import { ChartTooltip } from "./ChartParts";

// 단일 계열이라 범례를 두지 않는다 — 제목이 계열명을 대신한다
const LLM_SERIES = [
  { key: "calls", label: "호출", color: CHART_SERIES.primary },
];

const FEATURE_LABEL: Record<string, string> = {
  bible_card: "말씀카드",
  qt: "QT",
};

const UsageTab = ({ days }: { days: number }) => {
  const [usage, setUsage] = useState<FeatureUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchFeatureUsage(days).then((result) => {
      if (cancelled) return;
      setUsage(result);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [days]);

  if (isLoading) {
    return <div className="py-10 text-center text-gray-500">불러오는 중...</div>;
  }
  if (!usage) {
    return (
      <div className="py-10 text-center text-sm text-red-500">
        사용량을 불러오지 못했어요
      </div>
    );
  }

  const totalCost = usage.llmByFeature.reduce(
    (sum, row) => sum + row.estimatedCostUsd,
    0,
  );
  const totalCalls = usage.llmByFeature.reduce((sum, row) => sum + row.calls, 0);
  const checkRate =
    usage.notificationSent > 0
      ? Math.round((usage.notificationChecked / usage.notificationSent) * 100)
      : 0;

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-gray-500">
              LLM 호출
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCalls}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-gray-500">
              추정 비용
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
            <div className="text-xs text-gray-400">코드 상수 단가 기준</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-gray-500">
              공유 보상 지급
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage.shareRewardCount}</div>
            <div className="text-xs text-gray-400">
              {usage.shareRewardUsers}명
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-gray-500">
              알림 확인율
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{checkRate}%</div>
            <div className="text-xs text-gray-400">
              {usage.notificationChecked} / {usage.notificationSent}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">일별 LLM 호출</CardTitle>
        </CardHeader>
        <CardContent className="h-48 pl-0 pr-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={usage.llmDaily} margin={{ top: 4, right: 4 }}>
              <CartesianGrid {...gridProps} />
              <XAxis {...xAxisProps} />
              <YAxis {...yAxisProps} />
              <Tooltip
                cursor={{ fill: "#f5f5f5" }}
                content={ChartTooltip(LLM_SERIES)}
              />
              <Bar
                dataKey="calls"
                fill={CHART_SERIES.primary}
                radius={[4, 4, 0, 0]}
                maxBarSize={18}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">피처별 사용</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-12 gap-2 border-b bg-gray-50 px-4 py-2 text-xs font-medium text-gray-600">
            <div className="col-span-3">피처</div>
            <div className="col-span-2 text-center">호출</div>
            <div className="col-span-3 text-center">입력 토큰</div>
            <div className="col-span-2 text-center">출력 토큰</div>
            <div className="col-span-2 text-center">비용</div>
          </div>
          <div className="divide-y">
            {usage.llmByFeature.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                기간 내 LLM 호출이 없어요
              </div>
            )}
            {usage.llmByFeature.map((row) => (
              <div
                key={row.feature}
                className="grid grid-cols-12 items-center gap-2 px-4 py-2.5 text-sm"
              >
                <div className="col-span-3">
                  {FEATURE_LABEL[row.feature] || row.feature}
                </div>
                <div className="col-span-2 text-center">{row.calls}</div>
                <div className="col-span-3 text-center">
                  {row.promptTokens.toLocaleString()}
                </div>
                <div className="col-span-2 text-center">
                  {row.completionTokens.toLocaleString()}
                </div>
                {/* 피처별 금액은 소액이라 2자리로는 전부 0.00으로 뭉개진다 */}
                <div className="col-span-2 text-center">
                  ${row.estimatedCostUsd.toFixed(4)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-gray-500">
              말씀카드 생성
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage.bibleCardCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-gray-500">
              QT 생성
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage.qtCount}</div>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-gray-400">
        비용은 코드 상수 단가(constants/llmPricing.ts) 기준 추정치이며 정산
        기준이 아닙니다.
      </p>
    </div>
  );
};

export default UsageTab;
