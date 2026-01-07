"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Search,
  Filter,
  Calendar,
  MessageCircle,
  TrendingUp,
  Lightbulb,
  Heart,
  Dumbbell,
  Moon,
  Utensils,
  Wind,
  ChevronRight,
  Star,
  Trash2,
  Download,
} from "lucide-react";

// 상담 히스토리 타입
interface CoachingSession {
  id: string;
  date: string;
  time: string;
  topic: "health" | "nutrition" | "exercise" | "sleep" | "environment";
  title: string;
  summary: string;
  messageCount: number;
  insights: string[];
  starred: boolean;
}

// 주제별 설정
const topicConfig = {
  health: {
    name: "건강 상담",
    icon: Heart,
    color: "text-red-400",
    bg: "bg-red-500/20",
  },
  nutrition: {
    name: "식단 추천",
    icon: Utensils,
    color: "text-amber-400",
    bg: "bg-amber-500/20",
  },
  exercise: {
    name: "운동 코칭",
    icon: Dumbbell,
    color: "text-blue-400",
    bg: "bg-blue-500/20",
  },
  sleep: {
    name: "수면 분석",
    icon: Moon,
    color: "text-purple-400",
    bg: "bg-purple-500/20",
  },
  environment: {
    name: "환경 분석",
    icon: Wind,
    color: "text-green-400",
    bg: "bg-green-500/20",
  },
};

// 샘플 상담 히스토리
const sampleHistory: CoachingSession[] = [
  {
    id: "1",
    date: "2026-01-07",
    time: "10:30",
    topic: "health",
    title: "오늘의 건강 상태 분석",
    summary:
      "혈당 수치가 정상 범위이며, 수면 시간이 조금 부족합니다. 오늘 밤은 일찍 주무시는 것을 권장합니다.",
    messageCount: 8,
    insights: [
      "혈당: 98 mg/dL (정상)",
      "수면: 6.2시간 (부족)",
      "권장 취침 시간: 22:00",
    ],
    starred: true,
  },
  {
    id: "2",
    date: "2026-01-06",
    time: "19:45",
    topic: "nutrition",
    title: "저녁 식단 추천",
    summary:
      "혈당 관리를 위한 저당질 저녁 식단을 추천받았습니다. 연어 스테이크와 구운 채소가 권장되었습니다.",
    messageCount: 12,
    insights: [
      "추천 메뉴: 연어 스테이크",
      "단백질 40g / 탄수화물 20g",
      "예상 식후 혈당: 120 mg/dL",
    ],
    starred: false,
  },
  {
    id: "3",
    date: "2026-01-05",
    time: "07:00",
    topic: "exercise",
    title: "아침 운동 루틴",
    summary:
      "공복 유산소 운동 30분 코스를 추천받았습니다. 지방 연소와 혈당 관리에 효과적입니다.",
    messageCount: 6,
    insights: [
      "추천: 가벼운 조깅 30분",
      "예상 칼로리 소모: 200kcal",
      "공복 운동 효과: 지방 연소 증가",
    ],
    starred: true,
  },
  {
    id: "4",
    date: "2026-01-04",
    time: "22:30",
    topic: "sleep",
    title: "수면 품질 개선",
    summary:
      "최근 수면 패턴을 분석하고 수면 품질 개선을 위한 조언을 받았습니다.",
    messageCount: 10,
    insights: [
      "평균 수면 시간: 6.5시간",
      "수면 효율: 78%",
      "개선 포인트: 취침 1시간 전 블루라이트 차단",
    ],
    starred: false,
  },
  {
    id: "5",
    date: "2026-01-03",
    time: "14:00",
    topic: "environment",
    title: "실내 공기질 점검",
    summary:
      "거실 공기질을 분석하고 환기 필요성과 공기청정기 설정을 조언받았습니다.",
    messageCount: 5,
    insights: [
      "CO2: 850 ppm (환기 필요)",
      "VOCs: 120 ppb (보통)",
      "권장: 창문 환기 15분",
    ],
    starred: false,
  },
  {
    id: "6",
    date: "2026-01-02",
    time: "09:15",
    topic: "health",
    title: "주간 건강 리뷰",
    summary:
      "지난 주 건강 데이터를 종합 분석하고 개선점을 상담받았습니다.",
    messageCount: 15,
    insights: [
      "혈당 평균: 102 mg/dL",
      "운동량: 주 3회 (목표: 5회)",
      "전반적 건강 점수: 82점",
    ],
    starred: true,
  },
];

export default function AICoachHistoryPage() {
  const [history, setHistory] = useState(sampleHistory);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [showStarredOnly, setShowStarredOnly] = useState(false);

  // 필터링
  const filteredHistory = history.filter((session) => {
    const matchesSearch =
      searchQuery === "" ||
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic =
      selectedTopic === null || session.topic === selectedTopic;
    const matchesStarred = !showStarredOnly || session.starred;
    return matchesSearch && matchesTopic && matchesStarred;
  });

  // 날짜별 그룹핑
  const groupedHistory = filteredHistory.reduce((acc, session) => {
    const date = session.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(session);
    return acc;
  }, {} as Record<string, CoachingSession[]>);

  const toggleStar = (id: string) => {
    setHistory(
      history.map((s) => (s.id === id ? { ...s, starred: !s.starred } : s))
    );
  };

  const deleteSession = (id: string) => {
    setHistory(history.filter((s) => s.id !== id));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split("T")[0]) {
      return "오늘";
    }
    if (dateStr === yesterday.toISOString().split("T")[0]) {
      return "어제";
    }
    return date.toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  };

  return (
    <div className="p-4 lg:p-8">
      {/* 헤더 */}
      <div className="mb-8">
        <Link
          href="/dashboard/ai-coach"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          AI 코치로 돌아가기
        </Link>
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
          상담 히스토리
        </h1>
        <p className="text-gray-400">
          만파 AI 코치와의 대화 기록을 확인하고 인사이트를 복습하세요
        </p>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* 검색 */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="상담 내용 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-[var(--manpasik-primary)]"
          />
        </div>

        {/* 필터 버튼들 */}
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
          <button
            onClick={() => setShowStarredOnly(!showStarredOnly)}
            className={cn(
              "px-4 py-2 rounded-xl whitespace-nowrap flex items-center gap-2 transition-all",
              showStarredOnly
                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            )}
          >
            <Star className={cn("w-4 h-4", showStarredOnly && "fill-current")} />
            즐겨찾기
          </button>

          {Object.entries(topicConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() =>
                  setSelectedTopic(selectedTopic === key ? null : key)
                }
                className={cn(
                  "px-4 py-2 rounded-xl whitespace-nowrap flex items-center gap-2 transition-all",
                  selectedTopic === key
                    ? `${config.bg} ${config.color} border border-current/30`
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="w-4 h-4" />
                {config.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div
          className={cn(
            "p-4 rounded-xl text-center",
            "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]"
          )}
        >
          <p className="text-3xl font-bold text-white">{history.length}</p>
          <p className="text-sm text-gray-400">총 상담</p>
        </div>
        <div
          className={cn(
            "p-4 rounded-xl text-center",
            "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]"
          )}
        >
          <p className="text-3xl font-bold text-[var(--manpasik-primary)]">
            {history.reduce((acc, s) => acc + s.messageCount, 0)}
          </p>
          <p className="text-sm text-gray-400">총 메시지</p>
        </div>
        <div
          className={cn(
            "p-4 rounded-xl text-center",
            "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]"
          )}
        >
          <p className="text-3xl font-bold text-[var(--manpasik-bio-green)]">
            {history.reduce((acc, s) => acc + s.insights.length, 0)}
          </p>
          <p className="text-sm text-gray-400">도출된 인사이트</p>
        </div>
        <div
          className={cn(
            "p-4 rounded-xl text-center",
            "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]"
          )}
        >
          <p className="text-3xl font-bold text-yellow-400">
            {history.filter((s) => s.starred).length}
          </p>
          <p className="text-sm text-gray-400">즐겨찾기</p>
        </div>
      </div>

      {/* 히스토리 목록 */}
      {Object.keys(groupedHistory).length === 0 ? (
        <div
          className={cn(
            "p-12 rounded-2xl text-center",
            "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]"
          )}
        >
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-bold text-white mb-2">
            상담 기록이 없습니다
          </h3>
          <p className="text-gray-400 mb-6">
            AI 코치와 대화를 시작하면 여기에 기록됩니다.
          </p>
          <Link
            href="/dashboard/ai-coach"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-manpasik-gradient text-white font-medium hover:opacity-90 transition-opacity"
          >
            AI 코치 시작하기
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedHistory)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([date, sessions]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(date)}
                </h3>
                <div className="space-y-3">
                  {sessions.map((session) => {
                    const config = topicConfig[session.topic];
                    const Icon = config.icon;

                    return (
                      <div
                        key={session.id}
                        className={cn(
                          "p-5 rounded-xl transition-all",
                          "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]",
                          "hover:border-white/20"
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                              config.bg
                            )}
                          >
                            <Icon className={cn("w-6 h-6", config.color)} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-white">
                                {session.title}
                              </h4>
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded-full text-xs",
                                  config.bg,
                                  config.color
                                )}
                              >
                                {config.name}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 mb-3">
                              {session.time} • {session.messageCount}개 메시지
                            </p>
                            <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                              {session.summary}
                            </p>

                            {/* 인사이트 */}
                            <div className="flex flex-wrap gap-2">
                              {session.insights.slice(0, 3).map((insight, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 rounded-lg bg-white/5 text-xs text-gray-400 flex items-center gap-1"
                                >
                                  <Lightbulb className="w-3 h-3 text-yellow-400" />
                                  {insight}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* 액션 버튼 */}
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => toggleStar(session.id)}
                              className={cn(
                                "p-2 rounded-lg transition-colors",
                                session.starred
                                  ? "text-yellow-400 bg-yellow-500/20"
                                  : "text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10"
                              )}
                            >
                              <Star
                                className={cn(
                                  "w-4 h-4",
                                  session.starred && "fill-current"
                                )}
                              />
                            </button>
                            <button
                              onClick={() => deleteSession(session.id)}
                              className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* 상세 보기 링크 */}
                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                          <Link
                            href={`/dashboard/ai-coach/session/${session.id}`}
                            className="text-sm text-[var(--manpasik-primary)] hover:underline flex items-center gap-1"
                          >
                            대화 전체 보기
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                          <button className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                            <Download className="w-4 h-4" />
                            내보내기
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

