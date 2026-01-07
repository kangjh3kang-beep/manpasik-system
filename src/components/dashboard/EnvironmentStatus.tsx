"use client";

import { cn } from "@/lib/utils";
import { Wind, Droplets, Thermometer, AlertTriangle } from "lucide-react";

interface EnvironmentData {
  airQuality: {
    index: number;
    status: "좋음" | "보통" | "나쁨" | "매우나쁨";
    pm25: number;
    pm10: number;
    co2: number;
  };
  water: {
    ph: number;
    status: "양호" | "주의" | "위험";
    chlorine: number;
  };
  indoor: {
    temperature: number;
    humidity: number;
    radon: number;
    lastMeasured: string;
  };
}

// 샘플 데이터
const environmentData: EnvironmentData = {
  airQuality: {
    index: 45,
    status: "좋음",
    pm25: 12,
    pm10: 28,
    co2: 650,
  },
  water: {
    ph: 7.2,
    status: "양호",
    chlorine: 0.3,
  },
  indoor: {
    temperature: 23.5,
    humidity: 48,
    radon: 45,
    lastMeasured: "2시간 전",
  },
};

const getAirQualityColor = (status: string) => {
  switch (status) {
    case "좋음":
      return "text-green-400 bg-green-500/20";
    case "보통":
      return "text-yellow-400 bg-yellow-500/20";
    case "나쁨":
      return "text-orange-400 bg-orange-500/20";
    case "매우나쁨":
      return "text-red-400 bg-red-500/20";
    default:
      return "text-gray-400 bg-gray-500/20";
  }
};

const getWaterStatusColor = (status: string) => {
  switch (status) {
    case "양호":
      return "text-green-400";
    case "주의":
      return "text-yellow-400";
    case "위험":
      return "text-red-400";
    default:
      return "text-gray-400";
  }
};

export default function EnvironmentStatus() {
  const { airQuality, water, indoor } = environmentData;

  return (
    <div
      className={cn(
        "p-6 rounded-2xl",
        "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]"
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">환경 모니터링</h3>
          <p className="text-sm text-gray-400">실내/외 환경 상태</p>
        </div>
        <span className="text-xs text-gray-500">{indoor.lastMeasured} 측정</span>
      </div>

      {/* 환경 지표 그리드 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 공기질 */}
        <div className="p-4 rounded-xl bg-white/5">
          <div className="flex items-center gap-2 mb-3">
            <Wind className="w-4 h-4 text-[var(--manpasik-primary)]" />
            <span className="text-sm text-gray-400">공기질</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{airQuality.index}</p>
              <p className="text-xs text-gray-500">AQI</p>
            </div>
            <span
              className={cn(
                "px-2 py-1 rounded-lg text-xs font-medium",
                getAirQualityColor(airQuality.status)
              )}
            >
              {airQuality.status}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">PM2.5</span>
              <p className="text-white">{airQuality.pm25} ㎍/m³</p>
            </div>
            <div>
              <span className="text-gray-500">CO2</span>
              <p className="text-white">{airQuality.co2} ppm</p>
            </div>
          </div>
        </div>

        {/* 수질 */}
        <div className="p-4 rounded-xl bg-white/5">
          <div className="flex items-center gap-2 mb-3">
            <Droplets className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-400">수질</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{water.ph}</p>
              <p className="text-xs text-gray-500">pH</p>
            </div>
            <span className={cn("text-sm font-medium", getWaterStatusColor(water.status))}>
              {water.status}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5">
            <div className="text-xs">
              <span className="text-gray-500">잔류염소</span>
              <p className="text-white">{water.chlorine} mg/L</p>
            </div>
          </div>
        </div>

        {/* 실내 온습도 */}
        <div className="p-4 rounded-xl bg-white/5">
          <div className="flex items-center gap-2 mb-3">
            <Thermometer className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-gray-400">실내 환경</span>
          </div>
          <div className="flex gap-4">
            <div>
              <p className="text-xl font-bold text-white">{indoor.temperature}°</p>
              <p className="text-xs text-gray-500">온도</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white">{indoor.humidity}%</p>
              <p className="text-xs text-gray-500">습도</p>
            </div>
          </div>
        </div>

        {/* 라돈 */}
        <div className="p-4 rounded-xl bg-white/5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-400">라돈</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{indoor.radon}</p>
              <p className="text-xs text-gray-500">Bq/m³</p>
            </div>
            <span
              className={cn(
                "px-2 py-1 rounded-lg text-xs font-medium",
                indoor.radon < 100
                  ? "text-green-400 bg-green-500/20"
                  : indoor.radon < 150
                  ? "text-yellow-400 bg-yellow-500/20"
                  : "text-red-400 bg-red-500/20"
              )}
            >
              {indoor.radon < 100 ? "안전" : indoor.radon < 150 ? "주의" : "위험"}
            </span>
          </div>
        </div>
      </div>

      {/* 환경 측정 버튼 */}
      <button className="w-full mt-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors text-sm font-medium">
        환경 측정하기 →
      </button>
    </div>
  );
}

