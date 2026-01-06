"use client";

import HealthScoreRing from "@/components/dashboard/HealthScoreRing";
import DeviceStatus from "@/components/dashboard/DeviceStatus";
import LiveChart from "@/components/dashboard/LiveChart";
import { cn } from "@/lib/utils";
import {
  Calendar,
  ArrowRight,
  Zap,
  FileText,
  Plus,
  Bell,
} from "lucide-react";

// 빠른 액션 정의
const quickActions = [
  {
    title: "새 측정 시작",
    description: "리더기로 즉시 측정",
    icon: Plus,
    color: "var(--manpasik-primary)",
    bgColor: "bg-[var(--manpasik-primary)]/20",
    hoverBorder: "hover:border-[var(--manpasik-primary)]/50",
  },
  {
    title: "리포트 보기",
    description: "상세 건강 분석",
    icon: FileText,
    color: "var(--manpasik-secondary)",
    bgColor: "bg-[var(--manpasik-secondary)]/20",
    hoverBorder: "hover:border-[var(--manpasik-secondary)]/50",
  },
  {
    title: "기기 연결",
    description: "새 리더기 등록",
    icon: Zap,
    color: "var(--manpasik-bio-green)",
    bgColor: "bg-[var(--manpasik-bio-green)]/20",
    hoverBorder: "hover:border-[var(--manpasik-bio-green)]/50",
  },
  {
    title: "알림 설정",
    description: "맞춤 알림 관리",
    icon: Bell,
    color: "#eab308",
    bgColor: "bg-yellow-500/20",
    hoverBorder: "hover:border-yellow-500/50",
  },
];

// 최근 활동 더미 데이터
const recentActivities = [
  {
    id: 1,
    type: "measurement",
    title: "혈당 측정 완료",
    value: "98 mg/dL",
    status: "정상",
    time: "10분 전",
    statusColor: "text-green-400",
  },
  {
    id: 2,
    type: "sync",
    title: "기기 동기화",
    value: "MPK-Reader-Alpha",
    status: "성공",
    time: "1시간 전",
    statusColor: "text-green-400",
  },
  {
    id: 3,
    type: "alert",
    title: "콜레스테롤 주의",
    value: "205 mg/dL",
    status: "주의",
    time: "어제",
    statusColor: "text-yellow-400",
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

      {/* 메인 그리드 - PC 3단, 모바일 1단 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* 건강 점수 링 */}
        <HealthScoreRing score={87} previousScore={82} />

        {/* 기기 상태 */}
        <DeviceStatus />

        {/* 최근 활동 */}
        <div
          className={cn(
            "p-6 rounded-2xl",
            "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]"
          )}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">최근 활동</h3>
              <p className="text-sm text-gray-400">최근 기록 요약</p>
            </div>
            <button className="text-sm text-[var(--manpasik-primary)] hover:underline flex items-center gap-1">
              전체 보기
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-bold text-white">{activity.value}</p>
                  <p className={cn("text-xs", activity.statusColor)}>
                    {activity.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 라이브 차트 - 전체 너비 */}
      <div className="mb-8">
        <LiveChart />
      </div>

      {/* 빠른 작업 */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">빠른 작업</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.title}
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
                <p className="font-medium text-white group-hover:text-white">
                  {action.title}
                </p>
                <p className="text-sm text-gray-400">{action.description}</p>
              </button>
            );
          })}
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
          <p className="text-gray-300 leading-relaxed">
            식후 혈당 관리를 위해 식사 후 <span className="text-[var(--manpasik-primary)] font-medium">15분간 가벼운 산책</span>을 권장합니다. 
            이는 혈당 스파이크를 약 25% 감소시키는 데 도움이 됩니다.
          </p>
          <button className="mt-4 text-sm text-[var(--manpasik-primary)] hover:underline flex items-center gap-1">
            더 많은 팁 보기
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
