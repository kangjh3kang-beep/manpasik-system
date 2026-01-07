"use client";

import HealthScoreRing from "@/components/dashboard/HealthScoreRing";
import DeviceStatus from "@/components/dashboard/DeviceStatus";
import LiveChart from "@/components/dashboard/LiveChart";
import EnvironmentStatus from "@/components/dashboard/EnvironmentStatus";
import AIInsightCard from "@/components/dashboard/AIInsightCard";
import EmergencyButton from "@/components/dashboard/EmergencyButton";
import { cn } from "@/lib/utils";
import {
  Calendar,
  ArrowRight,
  Zap,
  FileText,
  Plus,
  Bell,
  Activity,
  Brain,
  ShoppingBag,
  Video,
} from "lucide-react";
import Link from "next/link";

// 빠른 액션 정의
const quickActions = [
  {
    title: "새 측정 시작",
    description: "리더기로 즉시 측정",
    icon: Plus,
    color: "var(--manpasik-primary)",
    bgColor: "bg-[var(--manpasik-primary)]/20",
    hoverBorder: "hover:border-[var(--manpasik-primary)]/50",
    href: "/dashboard/measure",
  },
  {
    title: "AI 코치 상담",
    description: "건강 상담 받기",
    icon: Brain,
    color: "var(--manpasik-secondary)",
    bgColor: "bg-[var(--manpasik-secondary)]/20",
    hoverBorder: "hover:border-[var(--manpasik-secondary)]/50",
    href: "/dashboard/ai-coach",
  },
  {
    title: "카트리지 구매",
    description: "마켓플레이스 이동",
    icon: ShoppingBag,
    color: "var(--manpasik-bio-green)",
    bgColor: "bg-[var(--manpasik-bio-green)]/20",
    hoverBorder: "hover:border-[var(--manpasik-bio-green)]/50",
    href: "/dashboard/marketplace",
  },
  {
    title: "화상 진료",
    description: "전문의 상담 예약",
    icon: Video,
    color: "#eab308",
    bgColor: "bg-yellow-500/20",
    hoverBorder: "hover:border-yellow-500/50",
    href: "/dashboard/telemedicine",
  },
];

// 최근 측정 더미 데이터
const recentMeasurements = [
  {
    id: 1,
    type: "혈당",
    value: "98",
    unit: "mg/dL",
    status: "정상",
    time: "10분 전",
    statusColor: "text-green-400",
    icon: "🩸",
  },
  {
    id: 2,
    type: "콜레스테롤",
    value: "185",
    unit: "mg/dL",
    status: "양호",
    time: "어제",
    statusColor: "text-green-400",
    icon: "🫀",
  },
  {
    id: 3,
    type: "케톤",
    value: "0.5",
    unit: "mmol/L",
    status: "정상",
    time: "2일 전",
    statusColor: "text-green-400",
    icon: "⚡",
  },
];

export default function DashboardPage() {
  // 현재 날짜
  const today = new Date();
  const formattedDate = today.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <div className="p-4 lg:p-8">
      {/* 상단 헤더 */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">
              안녕하세요! 👋
            </h1>
            <p className="text-gray-400">오늘의 건강 상태를 확인하세요</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* 메인 그리드 - 4열 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* 건강 점수 링 - 1열 */}
        <HealthScoreRing score={87} previousScore={82} />

        {/* 최근 측정 결과 - 1열 */}
        <div
          className={cn(
            "p-6 rounded-2xl",
            "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]"
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">최근 측정</h3>
            <Link
              href="/dashboard/analysis"
              className="text-sm text-[var(--manpasik-primary)] hover:underline flex items-center gap-1"
            >
              전체 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentMeasurements.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{m.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-white">{m.type}</p>
                    <p className="text-xs text-gray-500">{m.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">
                    {m.value}
                    <span className="text-xs text-gray-400 ml-1">{m.unit}</span>
                  </p>
                  <p className={cn("text-xs", m.statusColor)}>{m.status}</p>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/dashboard/measure"
            className="mt-4 w-full py-2.5 rounded-xl bg-manpasik-gradient text-white text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Activity className="w-4 h-4" />
            새 측정 시작
          </Link>
        </div>

        {/* AI 인사이트 - 2열 */}
        <div className="lg:col-span-2">
          <AIInsightCard />
        </div>
      </div>

      {/* 환경 상태 + 기기 상태 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <EnvironmentStatus />
        <DeviceStatus />
      </div>

      {/* 라이브 차트 - 전체 너비 */}
      <div className="mb-8">
        <LiveChart />
      </div>

      {/* 빠른 작업 + 긴급 버튼 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* 빠른 작업 - 2열 */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-white mb-4">빠른 작업</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className={cn(
                    "p-4 rounded-xl text-left transition-all duration-200 group",
                    "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]",
                    action.hoverBorder
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors",
                      action.bgColor
                    )}
                  >
                    <Icon className="w-5 h-5" style={{ color: action.color }} />
                  </div>
                  <p className="font-medium text-white group-hover:text-white text-sm">
                    {action.title}
                  </p>
                  <p className="text-xs text-gray-400">{action.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 긴급 버튼 - 1열 */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">긴급 상황</h2>
          <EmergencyButton />
        </div>
      </div>

      {/* 하단 정보 카드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 주간 목표 */}
        <div
          className={cn(
            "p-6 rounded-2xl",
            "bg-gradient-to-br from-[var(--manpasik-primary)]/20 to-[var(--manpasik-secondary)]/20",
            "border border-[var(--manpasik-primary)]/20"
          )}
        >
          <h3 className="text-lg font-bold text-white mb-4">이번 주 목표</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300">일일 측정</span>
                <span className="text-white font-medium">5/7일</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-manpasik-gradient rounded-full transition-all"
                  style={{ width: "71%" }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300">혈당 정상 유지</span>
                <span className="text-white font-medium">6/7일</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--manpasik-bio-green)] rounded-full transition-all"
                  style={{ width: "86%" }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300">환경 측정</span>
                <span className="text-white font-medium">3/7일</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--manpasik-secondary)] rounded-full transition-all"
                  style={{ width: "43%" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 팁 카드 */}
        <div
          className={cn(
            "p-6 rounded-2xl",
            "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]"
          )}
        >
          <h3 className="text-lg font-bold text-white mb-4">💡 오늘의 건강 팁</h3>
          <p className="text-gray-300 leading-relaxed mb-4">
            식후 혈당 관리를 위해 식사 후{" "}
            <span className="text-[var(--manpasik-primary)] font-medium">
              15분간 가벼운 산책
            </span>
            을 권장합니다. 이는 혈당 스파이크를 약 25% 감소시키는 데 도움이 됩니다.
          </p>
          <div className="flex gap-3">
            <Link
              href="/dashboard/ai-coach"
              className="text-sm text-[var(--manpasik-primary)] hover:underline flex items-center gap-1"
            >
              AI 코치에게 더 물어보기
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
