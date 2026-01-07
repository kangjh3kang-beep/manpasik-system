"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface HealthScoreRingProps {
  score: number; // 0-100
  previousScore?: number;
  className?: string;
}

// 점수에 따른 상태 및 색상 정의
const getScoreStatus = (score: number) => {
  if (score >= 80) {
    return {
      label: "양호",
      color: "var(--manpasik-bio-green)",
      colorClass: "text-green-400",
      bgClass: "bg-green-500/20",
      gradient: "url(#scoreGradientGreen)",
    };
  } else if (score >= 60) {
    return {
      label: "보통",
      color: "#eab308",
      colorClass: "text-yellow-400",
      bgClass: "bg-yellow-500/20",
      gradient: "url(#scoreGradientYellow)",
    };
  } else if (score >= 40) {
    return {
      label: "주의",
      color: "#f97316",
      colorClass: "text-orange-400",
      bgClass: "bg-orange-500/20",
      gradient: "url(#scoreGradientOrange)",
    };
  } else {
    return {
      label: "위험",
      color: "#ef4444",
      colorClass: "text-red-400",
      bgClass: "bg-red-500/20",
      gradient: "url(#scoreGradientRed)",
    };
  }
};

export default function HealthScoreRing({
  score,
  previousScore,
  className,
}: HealthScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const status = getScoreStatus(score);

  // 점수 애니메이션
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  // 링 차트 계산
  const radius = 80;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const progress = (animatedScore / 100) * circumference;

  // 트렌드 계산
  const trend = previousScore !== undefined ? score - previousScore : 0;
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;

  return (
    <div
      className={cn(
        "p-6 rounded-2xl",
        "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]",
        className
      )}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">건강 점수</h3>
          <p className="text-sm text-gray-400">오늘의 종합 건강 상태</p>
        </div>
        {previousScore !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium",
              trend > 0 ? "bg-green-500/20 text-green-400" : 
              trend < 0 ? "bg-red-500/20 text-red-400" : 
              "bg-gray-500/20 text-gray-400"
            )}
          >
            <TrendIcon className="w-4 h-4" />
            <span>{trend > 0 ? "+" : ""}{trend}점</span>
          </div>
        )}
      </div>

      {/* 링 차트 */}
      <div className="relative w-48 h-48 mx-auto mb-6">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          {/* 그래디언트 정의 */}
          <defs>
            <linearGradient id="scoreGradientGreen" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <linearGradient id="scoreGradientYellow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#facc15" />
            </linearGradient>
            <linearGradient id="scoreGradientOrange" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#fb923c" />
            </linearGradient>
            <linearGradient id="scoreGradientRed" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#f87171" />
            </linearGradient>
            {/* 글로우 필터 */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 배경 원 */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
          />

          {/* 진행 원 */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={status.gradient}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            filter="url(#glow)"
            className="transition-all duration-300 ease-out"
          />
        </svg>

        {/* 중앙 텍스트 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold text-white mb-1">
            {animatedScore}
          </span>
          <span className={cn("text-lg font-medium", status.colorClass)}>
            {status.label}
          </span>
        </div>
      </div>

      {/* 하단 메트릭스 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-white/5 text-center">
          <p className="text-xs text-gray-400 mb-1">혈당</p>
          <p className="text-lg font-bold text-white">98</p>
          <p className="text-xs text-green-400">정상</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 text-center">
          <p className="text-xs text-gray-400 mb-1">스트레스</p>
          <p className="text-lg font-bold text-white">32</p>
          <p className="text-xs text-green-400">낮음</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 text-center">
          <p className="text-xs text-gray-400 mb-1">수면</p>
          <p className="text-lg font-bold text-white">7.5h</p>
          <p className="text-xs text-yellow-400">보통</p>
        </div>
      </div>
    </div>
  );
}


