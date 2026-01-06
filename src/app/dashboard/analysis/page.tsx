"use client";

import { useState } from "react";

// 차트 데이터 (시뮬레이션)
const trendData = {
  glucose: {
    name: "혈당",
    unit: "mg/dL",
    current: 98,
    average: 102,
    trend: "stable",
    data: [95, 98, 105, 102, 99, 98, 96, 103, 100, 98],
    normalRange: { min: 70, max: 100 },
  },
  cholesterol: {
    name: "콜레스테롤",
    unit: "mg/dL",
    current: 185,
    average: 192,
    trend: "improving",
    data: [210, 205, 198, 195, 192, 188, 185, 187, 186, 185],
    normalRange: { min: 0, max: 200 },
  },
  radon: {
    name: "라돈",
    unit: "Bq/m³",
    current: 45,
    average: 52,
    trend: "improving",
    data: [68, 62, 58, 55, 52, 48, 45, 47, 46, 45],
    normalRange: { min: 0, max: 148 },
  },
};

const correlations = [
  { a: "수면 시간", b: "혈당", correlation: -0.65, insight: "수면이 부족할수록 혈당이 높아지는 경향" },
  { a: "운동량", b: "스트레스", correlation: -0.72, insight: "운동을 많이 할수록 스트레스가 낮아지는 경향" },
  { a: "실내 CO2", b: "집중력", correlation: -0.58, insight: "CO2 농도가 높을수록 집중력 저하" },
];

export default function AnalysisPage() {
  const [activeTab, setActiveTab] = useState<"trends" | "correlations" | "reports">("trends");
  const [selectedMetric, setSelectedMetric] = useState<string>("glucose");
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");

  const currentData = trendData[selectedMetric as keyof typeof trendData];

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">데이터 분석</h1>
        <p className="text-gray-400">
          측정 데이터의 트렌드와 상관관계를 분석합니다
        </p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex gap-2 mb-8">
        {[
          { id: "trends", label: "트렌드 분석", icon: "📈" },
          { id: "correlations", label: "상관관계 분석", icon: "🔗" },
          { id: "reports", label: "리포트 생성", icon: "📊" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === tab.id
                ? "bg-manpasik-primary text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 트렌드 분석 */}
      {activeTab === "trends" && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 사이드바 - 지표 선택 */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">측정 항목</h2>
            <div className="space-y-2">
              {Object.entries(trendData).map(([key, data]) => (
                <button
                  key={key}
                  onClick={() => setSelectedMetric(key)}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    selectedMetric === key
                      ? "bg-manpasik-primary/20 border border-manpasik-primary"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{data.name}</span>
                    <span className={`text-sm ${
                      data.trend === "improving" ? "text-green-400" :
                      data.trend === "worsening" ? "text-red-400" :
                      "text-gray-400"
                    }`}>
                      {data.trend === "improving" ? "↗ 개선" :
                       data.trend === "worsening" ? "↘ 악화" :
                       "→ 안정"}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">
                    현재: {data.current} {data.unit}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* 메인 차트 영역 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 기간 선택 */}
            <div className="flex justify-end gap-2">
              {[
                { id: "7d", label: "7일" },
                { id: "30d", label: "30일" },
                { id: "90d", label: "3개월" },
                { id: "1y", label: "1년" },
              ].map((range) => (
                <button
                  key={range.id}
                  onClick={() => setTimeRange(range.id as typeof timeRange)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    timeRange === range.id
                      ? "bg-manpasik-primary text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* 차트 (시뮬레이션) */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{currentData.name} 추이</h3>
                  <p className="text-gray-400 text-sm">최근 {timeRange === "7d" ? "7일" : timeRange === "30d" ? "30일" : timeRange === "90d" ? "3개월" : "1년"}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">{currentData.current}</p>
                  <p className="text-gray-400">{currentData.unit}</p>
                </div>
              </div>

              {/* 간단한 라인 차트 시뮬레이션 */}
              <div className="relative h-48 mb-4">
                <div className="absolute inset-0 flex items-end justify-between gap-1">
                  {currentData.data.map((value, index) => {
                    const max = Math.max(...currentData.data) + 20;
                    const min = Math.min(...currentData.data) - 20;
                    const height = ((value - min) / (max - min)) * 100;
                    const isInRange = value >= currentData.normalRange.min && value <= currentData.normalRange.max;
                    
                    return (
                      <div
                        key={index}
                        className="flex-1 flex flex-col justify-end"
                      >
                        <div
                          className={`w-full rounded-t transition-all ${
                            isInRange ? "bg-green-500" : "bg-amber-500"
                          }`}
                          style={{ height: `${height}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
                
                {/* 정상 범위 표시 */}
                <div
                  className="absolute left-0 right-0 border-t border-dashed border-green-500/50"
                  style={{ 
                    bottom: `${((currentData.normalRange.max - (Math.min(...currentData.data) - 20)) / 
                      (Math.max(...currentData.data) + 20 - Math.min(...currentData.data) + 20)) * 100}%` 
                  }}
                />
              </div>

              {/* 범례 */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500" />
                  <span className="text-gray-400">정상 범위</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-amber-500" />
                  <span className="text-gray-400">주의 필요</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-t border-dashed border-green-500" />
                  <span className="text-gray-400">정상 상한 ({currentData.normalRange.max} {currentData.unit})</span>
                </div>
              </div>
            </div>

            {/* 통계 요약 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="glass rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">평균</p>
                <p className="text-2xl font-bold text-white">{currentData.average}</p>
                <p className="text-gray-400 text-sm">{currentData.unit}</p>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">최소</p>
                <p className="text-2xl font-bold text-white">{Math.min(...currentData.data)}</p>
                <p className="text-gray-400 text-sm">{currentData.unit}</p>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">최대</p>
                <p className="text-2xl font-bold text-white">{Math.max(...currentData.data)}</p>
                <p className="text-gray-400 text-sm">{currentData.unit}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 상관관계 분석 */}
      {activeTab === "correlations" && (
        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">발견된 상관관계</h2>
          <div className="space-y-4">
            {correlations.map((corr, index) => (
              <div key={index} className="p-4 rounded-xl bg-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-lg bg-manpasik-primary/20 text-manpasik-primary">
                      {corr.a}
                    </span>
                    <span className="text-gray-400">↔</span>
                    <span className="px-3 py-1 rounded-lg bg-manpasik-secondary/20 text-manpasik-secondary">
                      {corr.b}
                    </span>
                  </div>
                  <span className={`font-bold ${corr.correlation < 0 ? "text-red-400" : "text-green-400"}`}>
                    {corr.correlation > 0 ? "+" : ""}{corr.correlation.toFixed(2)}
                  </span>
                </div>
                <p className="text-gray-300">{corr.insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 리포트 생성 */}
      {activeTab === "reports" && (
        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">건강 리포트 생성</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { type: "weekly", name: "주간 리포트", desc: "최근 7일간의 건강 데이터 요약" },
              { type: "monthly", name: "월간 리포트", desc: "최근 30일간의 상세 분석" },
              { type: "comprehensive", name: "종합 건강 리포트", desc: "전체 데이터 기반 상세 분석" },
              { type: "medical", name: "의료 공유용 리포트", desc: "의료진과 공유할 수 있는 형식" },
            ].map((report) => (
              <button
                key={report.type}
                className="p-6 rounded-xl bg-white/5 hover:bg-white/10 text-left transition-all group"
              >
                <h3 className="font-bold text-white group-hover:text-manpasik-primary transition-colors mb-2">
                  {report.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4">{report.desc}</p>
                <span className="text-manpasik-primary text-sm">
                  PDF 생성 →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
