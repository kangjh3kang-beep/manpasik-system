"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Activity, Brain, TrendingUp, TrendingDown } from "lucide-react";

type ChartDataType = "bloodSugar" | "stress";

interface LiveChartProps {
  className?: string;
}

// 최근 7일 더미 데이터
const mockData = [
  { date: "12/31", day: "화", bloodSugar: 95, stress: 28 },
  { date: "01/01", day: "수", bloodSugar: 102, stress: 35 },
  { date: "01/02", day: "목", bloodSugar: 98, stress: 42 },
  { date: "01/03", day: "금", bloodSugar: 110, stress: 38 },
  { date: "01/04", day: "토", bloodSugar: 92, stress: 25 },
  { date: "01/05", day: "일", bloodSugar: 88, stress: 22 },
  { date: "01/06", day: "월", bloodSugar: 98, stress: 32 },
];

const chartConfig = {
  bloodSugar: {
    label: "혈당",
    unit: "mg/dL",
    color: "var(--manpasik-primary)",
    colorLight: "rgba(14, 165, 233, 0.2)",
    icon: Activity,
    normalRange: { min: 70, max: 100 },
  },
  stress: {
    label: "스트레스",
    unit: "점",
    color: "var(--manpasik-secondary)",
    colorLight: "rgba(139, 92, 246, 0.2)",
    icon: Brain,
    normalRange: { min: 0, max: 40 },
  },
};

// 커스텀 툴팁
const CustomTooltip = ({
  active,
  payload,
  label,
  dataType,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  dataType: ChartDataType;
}) => {
  if (!active || !payload || !payload.length) return null;

  const config = chartConfig[dataType];
  const value = payload[0].value;
  const isNormal = value >= config.normalRange.min && value <= config.normalRange.max;

  return (
    <div className="p-3 rounded-xl bg-[var(--manpasik-deep-ocean)] border border-white/20 shadow-xl">
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <p className="text-lg font-bold text-white">
        {value} <span className="text-sm font-normal text-gray-400">{config.unit}</span>
      </p>
      <p className={cn("text-xs mt-1", isNormal ? "text-green-400" : "text-yellow-400")}>
        {isNormal ? "정상 범위" : "주의 필요"}
      </p>
    </div>
  );
};

export default function LiveChart({ className }: LiveChartProps) {
  const [activeChart, setActiveChart] = useState<ChartDataType>("bloodSugar");

  const config = chartConfig[activeChart];
  const Icon = config.icon;

  // 통계 계산
  const values = mockData.map((d) => d[activeChart]);
  const average = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const trend = values[values.length - 1] - values[0];

  return (
    <div
      className={cn(
        "p-6 rounded-2xl",
        "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]",
        className
      )}
    >
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">건강 추이</h3>
          <p className="text-sm text-gray-400">최근 7일간 변화</p>
        </div>

        {/* 차트 타입 선택 */}
        <div className="flex p-1 bg-white/5 rounded-xl">
          {(Object.keys(chartConfig) as ChartDataType[]).map((type) => {
            const cfg = chartConfig[type];
            const TypeIcon = cfg.icon;
            return (
              <button
                key={type}
                onClick={() => setActiveChart(type)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  activeChart === type
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:text-white"
                )}
              >
                <TypeIcon className="w-4 h-4" />
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-xl bg-white/5">
          <p className="text-xs text-gray-400 mb-1">평균</p>
          <p className="text-xl font-bold text-white">{average}</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5">
          <p className="text-xs text-gray-400 mb-1">최고</p>
          <p className="text-xl font-bold text-red-400">{max}</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5">
          <p className="text-xs text-gray-400 mb-1">최저</p>
          <p className="text-xl font-bold text-green-400">{min}</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5">
          <p className="text-xs text-gray-400 mb-1">추세</p>
          <div className="flex items-center gap-1">
            {trend > 0 ? (
              <TrendingUp className="w-4 h-4 text-red-400" />
            ) : trend < 0 ? (
              <TrendingDown className="w-4 h-4 text-green-400" />
            ) : null}
            <p
              className={cn(
                "text-xl font-bold",
                trend > 0 ? "text-red-400" : trend < 0 ? "text-green-400" : "text-gray-400"
              )}
            >
              {trend > 0 ? "+" : ""}
              {trend}
            </p>
          </div>
        </div>
      </div>

      {/* 차트 */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${activeChart}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={config.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgb(156, 163, 175)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgb(156, 163, 175)", fontSize: 12 }}
              domain={["dataMin - 10", "dataMax + 10"]}
            />
            <Tooltip content={<CustomTooltip dataType={activeChart} />} />
            <Area
              type="monotone"
              dataKey={activeChart}
              stroke={config.color}
              strokeWidth={3}
              fill={`url(#gradient-${activeChart})`}
              dot={{
                fill: config.color,
                stroke: "var(--manpasik-deep-ocean)",
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                fill: config.color,
                stroke: "white",
                strokeWidth: 2,
                r: 6,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 정상 범위 안내 */}
      <div className="mt-4 p-3 rounded-xl bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: config.color }} />
          <span className="text-sm text-gray-400">{config.label} 정상 범위</span>
        </div>
        <span className="text-sm font-medium text-white">
          {config.normalRange.min} - {config.normalRange.max} {config.unit}
        </span>
      </div>
    </div>
  );
}

