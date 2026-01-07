"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Brain, Sparkles, ChevronRight, RefreshCw } from "lucide-react";
import Link from "next/link";

interface AIInsight {
  id: string;
  type: "health" | "environment" | "lifestyle" | "alert";
  title: string;
  content: string;
  action?: {
    label: string;
    href: string;
  };
  priority: "low" | "medium" | "high";
}

// 샘플 AI 인사이트
const sampleInsights: AIInsight[] = [
  {
    id: "1",
    type: "health",
    title: "혈당 패턴 분석",
    content: "최근 7일간 식후 2시간 혈당이 평균 15% 개선되었습니다. 현재 식단 패턴을 유지하세요!",
    action: {
      label: "상세 분석 보기",
      href: "/dashboard/analysis",
    },
    priority: "low",
  },
  {
    id: "2",
    type: "lifestyle",
    title: "운동 추천",
    content: "오늘 오후 3시경 30분 산책을 권장합니다. 식후 혈당 관리에 효과적입니다.",
    action: {
      label: "운동 코칭 받기",
      href: "/dashboard/ai-coach",
    },
    priority: "medium",
  },
  {
    id: "3",
    type: "environment",
    title: "환기 권장",
    content: "실내 CO2 농도가 높아지고 있습니다. 창문을 열어 10분간 환기해주세요.",
    priority: "high",
  },
];

const typeConfig = {
  health: {
    icon: "❤️",
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
  environment: {
    icon: "🌿",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  lifestyle: {
    icon: "🏃",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  alert: {
    icon: "⚠️",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
};

const priorityStyles = {
  low: "border-l-green-500",
  medium: "border-l-yellow-500",
  high: "border-l-red-500",
};

export default function AIInsightCard() {
  const [insights, setInsights] = useState<AIInsight[]>(sampleInsights);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // 자동 슬라이드
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % insights.length);
        setIsAnimating(false);
      }, 300);
    }, 8000);

    return () => clearInterval(interval);
  }, [insights.length]);

  const currentInsight = insights[currentIndex];
  const config = typeConfig[currentInsight.type];

  const handleRefresh = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % insights.length);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div
      className={cn(
        "p-6 rounded-2xl relative overflow-hidden",
        "bg-gradient-to-br from-[var(--manpasik-primary)]/10 to-[var(--manpasik-secondary)]/10",
        "border border-[var(--manpasik-primary)]/20"
      )}
    >
      {/* 배경 효과 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--manpasik-primary)]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-[var(--manpasik-secondary)]/10 rounded-full blur-2xl" />

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-manpasik-gradient flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              AI 인사이트
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </h3>
            <p className="text-xs text-gray-400">만파 AI가 분석한 맞춤 정보</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <RefreshCw className={cn("w-4 h-4", isAnimating && "animate-spin")} />
        </button>
      </div>

      {/* 인사이트 카드 */}
      <div
        className={cn(
          "p-4 rounded-xl bg-white/5 border-l-4 transition-all duration-300",
          priorityStyles[currentInsight.priority],
          isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
        )}
      >
        <div className="flex items-start gap-3">
          <span className={cn("text-2xl p-2 rounded-lg", config.bg)}>
            {config.icon}
          </span>
          <div className="flex-1">
            <h4 className="font-medium text-white mb-1">{currentInsight.title}</h4>
            <p className="text-sm text-gray-400 leading-relaxed">{currentInsight.content}</p>

            {currentInsight.action && (
              <Link
                href={currentInsight.action.href}
                className="inline-flex items-center gap-1 mt-3 text-sm text-[var(--manpasik-primary)] hover:underline"
              >
                {currentInsight.action.label}
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 인디케이터 */}
      <div className="flex justify-center gap-2 mt-4">
        {insights.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              i === currentIndex
                ? "bg-[var(--manpasik-primary)] w-6"
                : "bg-white/20 hover:bg-white/40"
            )}
          />
        ))}
      </div>

      {/* AI 코치 바로가기 */}
      <Link
        href="/dashboard/ai-coach"
        className="mt-4 w-full py-3 rounded-xl bg-manpasik-gradient text-white font-medium text-center flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
      >
        <Brain className="w-5 h-5" />
        AI 코치와 상담하기
      </Link>
    </div>
  );
}

