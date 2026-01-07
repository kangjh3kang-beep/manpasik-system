"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  RefreshCw,
  Unlink,
  Clock,
  Activity,
  Home,
  Watch,
  Smartphone,
  Heart,
  Thermometer,
  Wind,
  Zap,
} from "lucide-react";

// 연동 서비스 타입
interface Integration {
  id: string;
  name: string;
  description: string;
  category: "health" | "wearable" | "smarthome" | "fitness";
  icon: string;
  connected: boolean;
  lastSync?: string;
  dataTypes?: string[];
  permissions?: string[];
}

// 연동 서비스 목록
const integrations: Integration[] = [
  // 건강 앱
  {
    id: "apple-health",
    name: "Apple Health",
    description: "심박수, 걸음수, 수면 데이터 동기화",
    category: "health",
    icon: "🍎",
    connected: true,
    lastSync: "5분 전",
    dataTypes: ["심박수", "걸음수", "수면", "운동"],
    permissions: ["읽기", "쓰기"],
  },
  {
    id: "samsung-health",
    name: "Samsung Health",
    description: "갤럭시 워치 및 스마트폰 건강 데이터",
    category: "health",
    icon: "📱",
    connected: false,
    dataTypes: ["심박수", "혈압", "산소포화도", "스트레스"],
  },
  {
    id: "google-fit",
    name: "Google Fit",
    description: "운동, 영양, 수면 데이터 통합",
    category: "health",
    icon: "🏃",
    connected: false,
    dataTypes: ["활동량", "영양", "수면", "체중"],
  },

  // 웨어러블
  {
    id: "fitbit",
    name: "Fitbit",
    description: "Fitbit 기기의 건강 데이터 동기화",
    category: "wearable",
    icon: "⌚",
    connected: true,
    lastSync: "1시간 전",
    dataTypes: ["심박수", "수면", "SpO2", "스트레스"],
    permissions: ["읽기"],
  },
  {
    id: "garmin",
    name: "Garmin Connect",
    description: "Garmin 스마트워치 데이터 연동",
    category: "wearable",
    icon: "🏔️",
    connected: false,
    dataTypes: ["심박수", "VO2 Max", "수면", "스트레스"],
  },
  {
    id: "oura",
    name: "Oura Ring",
    description: "수면 및 활동 추적 스마트링",
    category: "wearable",
    icon: "💍",
    connected: false,
    dataTypes: ["수면", "심박변이도", "체온", "활동량"],
  },
  {
    id: "whoop",
    name: "WHOOP",
    description: "회복, 수면, 훈련 최적화",
    category: "wearable",
    icon: "🔋",
    connected: false,
    dataTypes: ["회복점수", "수면", "스트레인", "심박수"],
  },

  // 스마트홈
  {
    id: "homeassistant",
    name: "Home Assistant",
    description: "스마트홈 통합 플랫폼 연동",
    category: "smarthome",
    icon: "🏠",
    connected: true,
    lastSync: "방금 전",
    dataTypes: ["온도", "습도", "공기질", "에너지"],
    permissions: ["읽기"],
  },
  {
    id: "smartthings",
    name: "SmartThings",
    description: "삼성 스마트홈 생태계 연동",
    category: "smarthome",
    icon: "🔌",
    connected: false,
    dataTypes: ["센서", "자동화", "에너지"],
  },
  {
    id: "philips-hue",
    name: "Philips Hue",
    description: "조명 자동화 (수면 모드 연동)",
    category: "smarthome",
    icon: "💡",
    connected: false,
    dataTypes: ["조명 상태", "일주기 리듬"],
  },
  {
    id: "airthings",
    name: "Airthings",
    description: "라돈 및 공기질 모니터링",
    category: "smarthome",
    icon: "🌬️",
    connected: false,
    dataTypes: ["라돈", "CO2", "VOCs", "온습도"],
  },

  // 피트니스
  {
    id: "strava",
    name: "Strava",
    description: "달리기, 사이클링 활동 연동",
    category: "fitness",
    icon: "🚴",
    connected: false,
    dataTypes: ["활동 기록", "경로", "심박수"],
  },
  {
    id: "nike-run",
    name: "Nike Run Club",
    description: "러닝 활동 및 도전 기록",
    category: "fitness",
    icon: "👟",
    connected: false,
    dataTypes: ["달리기", "페이스", "거리"],
  },
];

const categories = [
  { id: "all", name: "전체", icon: Activity },
  { id: "health", name: "건강 앱", icon: Heart },
  { id: "wearable", name: "웨어러블", icon: Watch },
  { id: "smarthome", name: "스마트홈", icon: Home },
  { id: "fitness", name: "피트니스", icon: Zap },
];

export default function IntegrationsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [integrationsList, setIntegrationsList] = useState(integrations);

  const filteredIntegrations =
    selectedCategory === "all"
      ? integrationsList
      : integrationsList.filter((i) => i.category === selectedCategory);

  const connectedCount = integrationsList.filter((i) => i.connected).length;

  const handleConnect = async (id: string) => {
    setConnectingId(id);
    // 연결 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIntegrationsList((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, connected: true, lastSync: "방금 전" } : i
      )
    );
    setConnectingId(null);
  };

  const handleDisconnect = (id: string) => {
    setIntegrationsList((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, connected: false, lastSync: undefined } : i
      )
    );
  };

  const handleSync = async (id: string) => {
    setConnectingId(id);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIntegrationsList((prev) =>
      prev.map((i) => (i.id === id ? { ...i, lastSync: "방금 전" } : i))
    );
    setConnectingId(null);
  };

  return (
    <div className="p-4 lg:p-8">
      {/* 헤더 */}
      <div className="mb-8">
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          설정으로 돌아가기
        </Link>
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
          외부 서비스 연동
        </h1>
        <p className="text-gray-400">
          건강 앱, 웨어러블, 스마트홈 기기를 연결하여 통합 관리하세요
        </p>
      </div>

      {/* 연결 현황 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div
          className={cn(
            "p-4 rounded-xl text-center",
            "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]"
          )}
        >
          <p className="text-3xl font-bold text-[var(--manpasik-bio-green)]">
            {connectedCount}
          </p>
          <p className="text-sm text-gray-400">연결됨</p>
        </div>
        <div
          className={cn(
            "p-4 rounded-xl text-center",
            "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]"
          )}
        >
          <p className="text-3xl font-bold text-white">
            {integrationsList.length - connectedCount}
          </p>
          <p className="text-sm text-gray-400">연결 가능</p>
        </div>
        <div
          className={cn(
            "p-4 rounded-xl text-center",
            "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]"
          )}
        >
          <p className="text-3xl font-bold text-[var(--manpasik-primary)]">
            {integrationsList
              .filter((i) => i.connected)
              .reduce((acc, i) => acc + (i.dataTypes?.length || 0), 0)}
          </p>
          <p className="text-sm text-gray-400">동기화 항목</p>
        </div>
        <div
          className={cn(
            "p-4 rounded-xl text-center",
            "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]"
          )}
        >
          <p className="text-3xl font-bold text-white">실시간</p>
          <p className="text-sm text-gray-400">동기화 상태</p>
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-4 py-2 rounded-xl whitespace-nowrap flex items-center gap-2 transition-all",
                selectedCategory === cat.id
                  ? "bg-manpasik-gradient text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4" />
              {cat.name}
              <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-xs">
                {cat.id === "all"
                  ? integrationsList.length
                  : integrationsList.filter((i) => i.category === cat.id)
                      .length}
              </span>
            </button>
          );
        })}
      </div>

      {/* 연동 서비스 목록 */}
      <div className="grid lg:grid-cols-2 gap-4">
        {filteredIntegrations.map((integration) => (
          <div
            key={integration.id}
            className={cn(
              "p-5 rounded-2xl transition-all",
              "bg-[var(--glass-bg)] backdrop-blur-xl border",
              integration.connected
                ? "border-[var(--manpasik-bio-green)]/30"
                : "border-[var(--glass-border)]"
            )}
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">
                {integration.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-white">{integration.name}</h3>
                  {integration.connected && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--manpasik-bio-green)]/20 text-[var(--manpasik-bio-green)] text-xs">
                      <Check className="w-3 h-3" />
                      연결됨
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mb-3">
                  {integration.description}
                </p>

                {/* 데이터 타입 태그 */}
                {integration.dataTypes && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {integration.dataTypes.map((type) => (
                      <span
                        key={type}
                        className="px-2 py-0.5 rounded-lg bg-white/5 text-gray-400 text-xs"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                )}

                {/* 동기화 상태 및 버튼 */}
                <div className="flex items-center justify-between">
                  {integration.connected && integration.lastSync && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      마지막 동기화: {integration.lastSync}
                    </div>
                  )}

                  <div className="flex gap-2 ml-auto">
                    {integration.connected ? (
                      <>
                        <button
                          onClick={() => handleSync(integration.id)}
                          disabled={connectingId === integration.id}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5",
                            "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                          )}
                        >
                          <RefreshCw
                            className={cn(
                              "w-3.5 h-3.5",
                              connectingId === integration.id && "animate-spin"
                            )}
                          />
                          동기화
                        </button>
                        <button
                          onClick={() => handleDisconnect(integration.id)}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-1.5"
                        >
                          <Unlink className="w-3.5 h-3.5" />
                          연결 해제
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleConnect(integration.id)}
                        disabled={connectingId === integration.id}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                          "bg-[var(--manpasik-primary)] text-white hover:opacity-90",
                          connectingId === integration.id && "opacity-70"
                        )}
                      >
                        {connectingId === integration.id ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            연결 중...
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-4 h-4" />
                            연결하기
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 도움말 */}
      <div
        className={cn(
          "mt-8 p-6 rounded-2xl",
          "bg-gradient-to-r from-[var(--manpasik-primary)]/10 to-[var(--manpasik-secondary)]/10",
          "border border-[var(--manpasik-primary)]/20"
        )}
      >
        <h3 className="text-lg font-bold text-white mb-2">💡 연동 팁</h3>
        <ul className="text-gray-300 text-sm space-y-2">
          <li>
            • 건강 앱 연동 시 만파식 측정 데이터가 자동으로 동기화됩니다.
          </li>
          <li>
            • 스마트홈 연동으로 환경 측정 결과에 따라 자동화를 설정할 수
            있습니다.
          </li>
          <li>
            • 웨어러블 데이터와 만파식 데이터를 결합하면 더 정확한 건강 분석이
            가능합니다.
          </li>
          <li>
            • 연동된 서비스의 데이터는 암호화되어 안전하게 보호됩니다.
          </li>
        </ul>
      </div>
    </div>
  );
}

