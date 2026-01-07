"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
  BarChart,
  Bar,
} from "recharts";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Calendar,
  Filter,
  FileText,
  Share2,
  Printer,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Info,
  Brain,
} from "lucide-react";
import Link from "next/link";

// 측정 데이터 타입
interface MeasurementData {
  date: string;
  glucose?: number;
  cholesterol?: number;
  ketone?: number;
  radon?: number;
  co2?: number;
  vocs?: number;
  stress?: number;
  sleep?: number;
  heartRate?: number;
}

// 30일간 시뮬레이션 데이터
const generateMockData = (): MeasurementData[] => {
  const data: MeasurementData[] = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      glucose: Math.round(85 + Math.random() * 30),
      cholesterol: Math.round(170 + Math.random() * 40),
      ketone: Math.round((0.2 + Math.random() * 0.6) * 10) / 10,
      radon: Math.round(40 + Math.random() * 60),
      co2: Math.round(500 + Math.random() * 600),
      vocs: Math.round(80 + Math.random() * 100),
      stress: Math.round(30 + Math.random() * 50),
      sleep: Math.round((5 + Math.random() * 3) * 10) / 10,
      heartRate: Math.round(60 + Math.random() * 30),
    });
  }
  return data;
};

const mockData = generateMockData();

// 측정 항목 정의
const metrics = {
  glucose: {
    name: "혈당",
    unit: "mg/dL",
    color: "#10b981",
    normalMin: 70,
    normalMax: 100,
    icon: "🩸",
  },
  cholesterol: {
    name: "콜레스테롤",
    unit: "mg/dL",
    color: "#f59e0b",
    normalMin: 0,
    normalMax: 200,
    icon: "🫀",
  },
  ketone: {
    name: "케톤",
    unit: "mmol/L",
    color: "#8b5cf6",
    normalMin: 0,
    normalMax: 0.6,
    icon: "⚡",
  },
  radon: {
    name: "라돈",
    unit: "Bq/m³",
    color: "#ef4444",
    normalMin: 0,
    normalMax: 148,
    icon: "☢️",
  },
  co2: {
    name: "CO2",
    unit: "ppm",
    color: "#06b6d4",
    normalMin: 0,
    normalMax: 1000,
    icon: "🌫️",
  },
  vocs: {
    name: "VOCs",
    unit: "ppb",
    color: "#ec4899",
    normalMin: 0,
    normalMax: 150,
    icon: "💨",
  },
};

// 상관관계 데이터
const correlationData = [
  {
    factorA: "수면 시간",
    factorB: "혈당",
    correlation: -0.65,
    insight:
      "수면이 부족할수록 혈당이 높아지는 경향이 있습니다. 7시간 이상 수면을 권장합니다.",
    recommendation: "오늘 밤 11시 전에 취침하세요.",
  },
  {
    factorA: "운동량",
    factorB: "스트레스",
    correlation: -0.72,
    insight:
      "운동을 많이 할수록 스트레스 지수가 낮아집니다. 규칙적인 운동이 정신 건강에 도움됩니다.",
    recommendation: "매일 30분 가벼운 산책을 추가하세요.",
  },
  {
    factorA: "실내 CO2",
    factorB: "집중력",
    correlation: -0.58,
    insight:
      "CO2 농도가 높을수록 집중력과 인지 능력이 저하됩니다. 정기적인 환기가 필요합니다.",
    recommendation: "2시간마다 10분씩 환기하세요.",
  },
  {
    factorA: "식후 산책",
    factorB: "혈당 스파이크",
    correlation: -0.81,
    insight:
      "식후 15분 산책만으로도 혈당 스파이크를 크게 줄일 수 있습니다.",
    recommendation: "점심 식사 후 가벼운 산책을 하세요.",
  },
];

// 예측 데이터
const predictionData = [
  { week: "이번 주", glucose: 95, predicted: false },
  { week: "다음 주", glucose: 92, predicted: true },
  { week: "2주 후", glucose: 89, predicted: true },
  { week: "3주 후", glucose: 87, predicted: true },
  { week: "4주 후", glucose: 85, predicted: true },
];

// 커스텀 툴팁
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-3 rounded-lg shadow-xl border border-white/20">
        <p className="text-white font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value} {entry.unit || ""}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalysisPage() {
  const [activeTab, setActiveTab] = useState<
    "trends" | "correlations" | "predictions" | "reports"
  >("trends");
  const [selectedMetric, setSelectedMetric] = useState<keyof typeof metrics>(
    "glucose"
  );
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const [compareMetric, setCompareMetric] = useState<
    keyof typeof metrics | null
  >(null);

  const currentMetric = metrics[selectedMetric];

  // 통계 계산
  const stats = useMemo(() => {
    const values = mockData
      .map((d) => d[selectedMetric as keyof MeasurementData] as number)
      .filter(Boolean);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const latest = values[values.length - 1];
    const previous = values[values.length - 2];
    const trend =
      latest > previous ? "up" : latest < previous ? "down" : "stable";
    const trendPercent = ((latest - previous) / previous) * 100;

    // 정상 범위 내 비율
    const inRangeCount = values.filter(
      (v) => v >= currentMetric.normalMin && v <= currentMetric.normalMax
    ).length;
    const inRangePercent = (inRangeCount / values.length) * 100;

    return {
      avg: Math.round(avg * 10) / 10,
      min: Math.round(min * 10) / 10,
      max: Math.round(max * 10) / 10,
      latest,
      trend,
      trendPercent: Math.round(trendPercent * 10) / 10,
      inRangePercent: Math.round(inRangePercent),
    };
  }, [selectedMetric, currentMetric]);

  const TrendIcon =
    stats.trend === "up"
      ? TrendingUp
      : stats.trend === "down"
      ? TrendingDown
      : Minus;

  return (
    <div className="p-4 lg:p-8">
      {/* 헤더 */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">
            데이터 분석
          </h1>
          <p className="text-gray-400">
            측정 데이터의 트렌드, 상관관계, AI 예측을 확인하세요
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            필터
          </button>
          <button className="px-4 py-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            내보내기
          </button>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {[
          { id: "trends", label: "트렌드 분석", icon: "📈" },
          { id: "correlations", label: "상관관계", icon: "🔗" },
          { id: "predictions", label: "AI 예측", icon: "🔮" },
          { id: "reports", label: "리포트", icon: "📊" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              "px-5 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2",
              activeTab === tab.id
                ? "bg-manpasik-gradient text-white shadow-lg"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            )}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 트렌드 분석 */}
      {activeTab === "trends" && (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* 왼쪽: 지표 선택 */}
          <div className="lg:col-span-1">
            <div
              className={cn(
                "rounded-2xl p-5",
                "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]"
              )}
            >
              <h2 className="text-lg font-bold text-white mb-4">측정 항목</h2>
              <div className="space-y-2">
                {Object.entries(metrics).map(([key, metric]) => (
                  <button
                    key={key}
                    onClick={() =>
                      setSelectedMetric(key as keyof typeof metrics)
                    }
                    className={cn(
                      "w-full p-3 rounded-xl text-left transition-all flex items-center gap-3",
                      selectedMetric === key
                        ? "bg-white/10 border border-white/20"
                        : "hover:bg-white/5"
                    )}
                  >
                    <span className="text-xl">{metric.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-white text-sm">
                        {metric.name}
                      </p>
                      <p className="text-xs text-gray-400">{metric.unit}</p>
                    </div>
                    {selectedMetric === key && (
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: metric.color }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* 비교 지표 선택 */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-sm font-medium text-gray-400 mb-3">
                  비교 분석
                </h3>
                <select
                  value={compareMetric || ""}
                  onChange={(e) =>
                    setCompareMetric(
                      e.target.value
                        ? (e.target.value as keyof typeof metrics)
                        : null
                    )
                  }
                  className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--manpasik-primary)]"
                >
                  <option value="">선택안함</option>
                  {Object.entries(metrics)
                    .filter(([key]) => key !== selectedMetric)
                    .map(([key, metric]) => (
                      <option key={key} value={key}>
                        {metric.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* 오른쪽: 차트 및 통계 */}
          <div className="lg:col-span-3 space-y-6">
            {/* 기간 선택 + 통계 요약 */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* 기간 선택 */}
              <div className="flex gap-2">
                {[
                  { id: "7d", label: "7일" },
                  { id: "30d", label: "30일" },
                  { id: "90d", label: "3개월" },
                  { id: "1y", label: "1년" },
                ].map((range) => (
                  <button
                    key={range.id}
                    onClick={() => setTimeRange(range.id as typeof timeRange)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm transition-all",
                      timeRange === range.id
                        ? "bg-[var(--manpasik-primary)] text-white"
                        : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 통계 카드 */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div
                className={cn(
                  "p-4 rounded-xl",
                  "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]"
                )}
              >
                <p className="text-xs text-gray-400 mb-1">현재</p>
                <p className="text-2xl font-bold text-white">{stats.latest}</p>
                <p className="text-xs text-gray-400">{currentMetric.unit}</p>
              </div>
              <div
                className={cn(
                  "p-4 rounded-xl",
                  "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]"
                )}
              >
                <p className="text-xs text-gray-400 mb-1">평균</p>
                <p className="text-2xl font-bold text-white">{stats.avg}</p>
                <p className="text-xs text-gray-400">{currentMetric.unit}</p>
              </div>
              <div
                className={cn(
                  "p-4 rounded-xl",
                  "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]"
                )}
              >
                <p className="text-xs text-gray-400 mb-1">최소/최대</p>
                <p className="text-2xl font-bold text-white">
                  {stats.min}~{stats.max}
                </p>
                <p className="text-xs text-gray-400">{currentMetric.unit}</p>
              </div>
              <div
                className={cn(
                  "p-4 rounded-xl",
                  "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]"
                )}
              >
                <p className="text-xs text-gray-400 mb-1">정상 범위</p>
                <p className="text-2xl font-bold text-[var(--manpasik-bio-green)]">
                  {stats.inRangePercent}%
                </p>
                <p className="text-xs text-gray-400">달성률</p>
              </div>
              <div
                className={cn(
                  "p-4 rounded-xl",
                  "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]"
                )}
              >
                <p className="text-xs text-gray-400 mb-1">추세</p>
                <div className="flex items-center gap-2">
                  <TrendIcon
                    className={cn(
                      "w-5 h-5",
                      stats.trend === "up"
                        ? "text-red-400"
                        : stats.trend === "down"
                        ? "text-green-400"
                        : "text-gray-400"
                    )}
                  />
                  <span className="text-2xl font-bold text-white">
                    {Math.abs(stats.trendPercent)}%
                  </span>
                </div>
                <p className="text-xs text-gray-400">전일 대비</p>
              </div>
            </div>

            {/* 메인 차트 */}
            <div
              className={cn(
                "p-6 rounded-2xl",
                "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]"
              )}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {currentMetric.icon} {currentMetric.name} 추이
                  </h3>
                  <p className="text-sm text-gray-400">
                    최근{" "}
                    {timeRange === "7d"
                      ? "7일"
                      : timeRange === "30d"
                      ? "30일"
                      : timeRange === "90d"
                      ? "3개월"
                      : "1년"}
                  </p>
                </div>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockData}>
                    <defs>
                      <linearGradient
                        id="colorGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={currentMetric.color}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor={currentMetric.color}
                          stopOpacity={0}
                        />
                      </linearGradient>
                      {compareMetric && (
                        <linearGradient
                          id="compareGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={metrics[compareMetric].color}
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor={metrics[compareMetric].color}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      )}
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.1)"
                    />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <ReferenceLine
                      y={currentMetric.normalMax}
                      label={{
                        value: `상한 ${currentMetric.normalMax}`,
                        fill: "rgba(255,255,255,0.5)",
                        fontSize: 12,
                      }}
                      stroke="rgba(255,255,255,0.3)"
                      strokeDasharray="5 5"
                    />
                    <Area
                      type="monotone"
                      dataKey={selectedMetric}
                      name={currentMetric.name}
                      stroke={currentMetric.color}
                      strokeWidth={2}
                      fill="url(#colorGradient)"
                    />
                    {compareMetric && (
                      <Area
                        type="monotone"
                        dataKey={compareMetric}
                        name={metrics[compareMetric].name}
                        stroke={metrics[compareMetric].color}
                        strokeWidth={2}
                        fill="url(#compareGradient)"
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 상관관계 분석 */}
      {activeTab === "correlations" && (
        <div className="space-y-6">
          {/* 상관관계 요약 */}
          <div className="grid lg:grid-cols-2 gap-6">
            {correlationData.map((corr, index) => (
              <div
                key={index}
                className={cn(
                  "p-6 rounded-2xl",
                  "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]"
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1.5 rounded-lg bg-[var(--manpasik-primary)]/20 text-[var(--manpasik-primary)] text-sm font-medium">
                      {corr.factorA}
                    </span>
                    <span className="text-gray-400">↔</span>
                    <span className="px-3 py-1.5 rounded-lg bg-[var(--manpasik-secondary)]/20 text-[var(--manpasik-secondary)] text-sm font-medium">
                      {corr.factorB}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "px-3 py-1 rounded-full text-sm font-bold",
                      corr.correlation < -0.5
                        ? "bg-red-500/20 text-red-400"
                        : corr.correlation > 0.5
                        ? "bg-green-500/20 text-green-400"
                        : "bg-gray-500/20 text-gray-400"
                    )}
                  >
                    {corr.correlation > 0 ? "+" : ""}
                    {corr.correlation.toFixed(2)}
                  </div>
                </div>

                <p className="text-gray-300 mb-4">{corr.insight}</p>

                <div className="p-3 rounded-xl bg-[var(--manpasik-bio-green)]/10 border border-[var(--manpasik-bio-green)]/20">
                  <div className="flex items-center gap-2 text-[var(--manpasik-bio-green)]">
                    <Brain className="w-4 h-4" />
                    <span className="text-sm font-medium">AI 추천</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">
                    {corr.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 상관관계 매트릭스 안내 */}
          <div
            className={cn(
              "p-6 rounded-2xl text-center",
              "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]"
            )}
          >
            <Info className="w-12 h-12 mx-auto mb-4 text-[var(--manpasik-primary)]" />
            <h3 className="text-lg font-bold text-white mb-2">
              더 많은 상관관계 발견하기
            </h3>
            <p className="text-gray-400 mb-4">
              더 많은 데이터를 축적하면 AI가 숨겨진 패턴을 찾아드립니다.
            </p>
            <Link
              href="/dashboard/measurement"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-manpasik-gradient text-white font-medium hover:opacity-90 transition-opacity"
            >
              측정 시작하기
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* AI 예측 */}
      {activeTab === "predictions" && (
        <div className="space-y-6">
          {/* 예측 차트 */}
          <div
            className={cn(
              "p-6 rounded-2xl",
              "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]"
            )}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">🔮 혈당 예측</h3>
                <p className="text-sm text-gray-400">
                  현재 추세를 기반으로 4주 후까지 예측
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[var(--manpasik-bio-green)]" />
                  <span className="text-gray-400">실제 데이터</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[var(--manpasik-primary)] opacity-50" />
                  <span className="text-gray-400">AI 예측</span>
                </div>
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={predictionData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis dataKey="week" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" domain={[70, 110]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="glucose"
                    name="혈당"
                    fill="var(--manpasik-bio-green)"
                    radius={[4, 4, 0, 0]}
                    fillOpacity={0.8}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 예측 인사이트 */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div
              className={cn(
                "p-6 rounded-2xl",
                "bg-gradient-to-br from-green-500/20 to-emerald-500/10",
                "border border-green-500/20"
              )}
            >
              <CheckCircle className="w-10 h-10 text-green-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">
                긍정적 전망
              </h3>
              <p className="text-gray-300 text-sm">
                현재 추세를 유지하면 4주 내에 혈당이 정상 범위로 안정화될
                것으로 예측됩니다.
              </p>
            </div>

            <div
              className={cn(
                "p-6 rounded-2xl",
                "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]"
              )}
            >
              <Brain className="w-10 h-10 text-[var(--manpasik-primary)] mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">AI 권장사항</h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• 식후 15분 산책 유지</li>
                <li>• 단백질 섭취 비율 증가</li>
                <li>• 취침 시간 규칙화</li>
              </ul>
            </div>

            <div
              className={cn(
                "p-6 rounded-2xl",
                "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]"
              )}
            >
              <AlertTriangle className="w-10 h-10 text-amber-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">주의 사항</h3>
              <p className="text-gray-300 text-sm">
                예측은 현재 생활 패턴 유지 시 결과입니다. 생활 습관이
                변경되면 결과가 달라질 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 리포트 */}
      {activeTab === "reports" && (
        <div className="grid lg:grid-cols-2 gap-6">
          {[
            {
              type: "weekly",
              name: "주간 리포트",
              desc: "최근 7일간의 건강 데이터 요약",
              icon: "📅",
              ready: true,
            },
            {
              type: "monthly",
              name: "월간 리포트",
              desc: "최근 30일간의 상세 분석",
              icon: "📊",
              ready: true,
            },
            {
              type: "comprehensive",
              name: "종합 건강 리포트",
              desc: "전체 데이터 기반 상세 분석",
              icon: "📋",
              ready: true,
            },
            {
              type: "medical",
              name: "의료 공유용 리포트",
              desc: "의료진과 공유할 수 있는 형식",
              icon: "🏥",
              ready: true,
            },
          ].map((report) => (
            <div
              key={report.type}
              className={cn(
                "p-6 rounded-2xl transition-all group",
                "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]",
                "hover:border-[var(--manpasik-primary)]/50"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{report.icon}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-[var(--manpasik-primary)] transition-colors mb-1">
                    {report.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">{report.desc}</p>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 rounded-lg bg-[var(--manpasik-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      PDF 다운로드
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 text-sm font-medium transition-colors flex items-center gap-2">
                      <Share2 className="w-4 h-4" />
                      공유
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 text-sm font-medium transition-colors flex items-center gap-2">
                      <Printer className="w-4 h-4" />
                      인쇄
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
