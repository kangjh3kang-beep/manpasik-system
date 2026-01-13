"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Bot, Sparkles, ThumbsUp, ArrowRight } from "lucide-react";

interface AIInsightProps {
  glucoseValue: number;
  previousAverage?: number;
  className?: string;
}

// AI 코멘트 생성 함수
const generateInsight = (value: number, prevAvg?: number) => {
  const diff = prevAvg ? value - prevAvg : 0;
  const isNormal = value >= 70 && value <= 100;
  const isLow = value < 70;
  const isHigh = value > 100;

  let mainMessage = "";
  let advice = "";
  let emoji = "";

  if (isNormal) {
    emoji = "😊";
    if (diff < 0 && prevAvg) {
      mainMessage = `지난주 평균보다 ${Math.abs(diff)}mg/dL 낮아졌어요! 식단 관리가 잘 되고 있네요.`;
      advice = "지금처럼 유지하세요.";
    } else if (diff > 0 && prevAvg) {
      mainMessage = `지난주 평균보다 ${diff}mg/dL 높아졌지만, 여전히 정상 범위입니다.`;
      advice = "꾸준한 관리를 계속해주세요.";
    } else {
      mainMessage = "혈당이 정상 범위 내에 있습니다. 아주 좋아요!";
      advice = "현재 생활 습관을 유지하세요.";
    }
  } else if (isLow) {
    emoji = "⚠️";
    mainMessage = "혈당 수치가 다소 낮습니다.";
    advice = "가벼운 간식을 섭취하고, 증상이 있다면 휴식을 취하세요.";
  } else if (isHigh) {
    emoji = "📊";
    if (value <= 126) {
      mainMessage = "혈당이 약간 높은 편입니다.";
      advice = "식후 가벼운 산책을 추천드려요. 다음 식사에서는 탄수화물을 조금 줄여보세요.";
    } else {
      mainMessage = "혈당 수치가 높습니다. 주의가 필요해요.";
      advice = "지속적으로 높다면 전문의 상담을 권장드립니다.";
    }
  }

  return { mainMessage, advice, emoji };
};

export default function AIInsight({
  glucoseValue,
  previousAverage = 103,
  className,
}: AIInsightProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const insight = generateInsight(glucoseValue, previousAverage);
  const fullText = `${insight.mainMessage} ${insight.advice}`;

  // 타이핑 애니메이션
  useEffect(() => {
    setIsVisible(true);
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [fullText]);

  return (
    <div
      className={cn(
        "transition-all duration-500",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
    >
      {/* AI 헤더 */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-manpasik-gradient flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">만파식 AI</span>
          <Sparkles className="w-4 h-4 text-[var(--manpasik-primary)]" />
        </div>
      </div>

      {/* 말풍선 */}
      <div className="relative ml-10">
        {/* 말풍선 꼬리 */}
        <div className="absolute -left-2 top-4 w-3 h-3 bg-[var(--manpasik-primary)]/20 rotate-45 border-l border-b border-[var(--manpasik-primary)]/30" />
        
        {/* 말풍선 본체 */}
        <div className="relative p-4 rounded-2xl bg-[var(--manpasik-primary)]/10 border border-[var(--manpasik-primary)]/20">
          <p className="text-gray-200 leading-relaxed">
            <span className="text-xl mr-2">{insight.emoji}</span>
            {displayedText}
            <span className="inline-block w-0.5 h-4 bg-[var(--manpasik-primary)] ml-1 animate-pulse" />
          </p>
        </div>
      </div>

      {/* 추천 액션 */}
      <div className="mt-4 ml-10 flex flex-wrap gap-2">
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-sm">
          <ThumbsUp className="w-4 h-4" />
          도움이 됐어요
        </button>
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 text-gray-400 hover:text-[var(--manpasik-primary)] hover:bg-[var(--manpasik-primary)]/10 transition-colors text-sm">
          더 자세한 분석 보기
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}











