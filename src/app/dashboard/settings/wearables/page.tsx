"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  Watch,
  Smartphone,
  Heart,
  Activity,
  Zap,
  RefreshCw,
  Check,
  X,
  ExternalLink,
} from "lucide-react";

// 연동 가능한 기기/앱 목록
const integrations = [
  {
    id: "apple-health",
    name: "Apple Health",
    icon: "🍎",
    type: "app",
    description: "iPhone의 건강 앱과 데이터를 동기화합니다",
    connected: true,
    lastSync: "5분 전",
    dataTypes: ["걸음 수", "심박수", "수면", "활동 칼로리"],
    color: "bg-pink-500/20",
    iconColor: "text-pink-400",
  },
  {
    id: "google-fit",
    name: "Google Fit",
    icon: "❤️",
    type: "app",
    description: "Google Fit과 건강 데이터를 동기화합니다",
    connected: false,
    lastSync: null,
    dataTypes: ["걸음 수", "심박수", "운동", "체중"],
    color: "bg-green-500/20",
    iconColor: "text-green-400",
  },
  {
    id: "samsung-health",
    name: "Samsung Health",
    icon: "💙",
    type: "app",
    description: "Samsung Health와 연동하여 Galaxy 기기 데이터를 가져옵니다",
    connected: false,
    lastSync: null,
    dataTypes: ["걸음 수", "심박수", "수면", "스트레스"],
    color: "bg-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    id: "apple-watch",
    name: "Apple Watch",
    icon: "⌚",
    type: "wearable",
    description: "Apple Watch의 상세 건강 데이터를 가져옵니다",
    connected: true,
    lastSync: "10분 전",
    dataTypes: ["심박수", "ECG", "혈중 산소", "수면 단계"],
    color: "bg-gray-500/20",
    iconColor: "text-gray-400",
  },
  {
    id: "galaxy-watch",
    name: "Galaxy Watch",
    icon: "⌚",
    type: "wearable",
    description: "Galaxy Watch 시리즈와 연동합니다",
    connected: false,
    lastSync: null,
    dataTypes: ["심박수", "ECG", "체성분", "수면"],
    color: "bg-purple-500/20",
    iconColor: "text-purple-400",
  },
  {
    id: "fitbit",
    name: "Fitbit",
    icon: "🏃",
    type: "wearable",
    description: "Fitbit 기기와 연동하여 활동 데이터를 가져옵니다",
    connected: false,
    lastSync: null,
    dataTypes: ["걸음 수", "심박수", "수면", "활동 영역"],
    color: "bg-teal-500/20",
    iconColor: "text-teal-400",
  },
  {
    id: "garmin",
    name: "Garmin",
    icon: "🎯",
    type: "wearable",
    description: "Garmin 스포츠 워치와 연동합니다",
    connected: false,
    lastSync: null,
    dataTypes: ["심박수", "VO2 Max", "훈련 부하", "회복 시간"],
    color: "bg-blue-600/20",
    iconColor: "text-blue-500",
  },
  {
    id: "oura",
    name: "Oura Ring",
    icon: "💍",
    type: "wearable",
    description: "Oura 링의 상세 수면 및 활동 데이터",
    connected: false,
    lastSync: null,
    dataTypes: ["수면 품질", "심박 변이", "체온", "활동"],
    color: "bg-slate-500/20",
    iconColor: "text-slate-400",
  },
];

// 스마트홈 연동
const smartHomeIntegrations = [
  {
    id: "smart-air",
    name: "스마트 공기청정기",
    description: "실내 공기질 자동 제어",
    connected: false,
    brands: ["삼성", "LG", "다이슨", "샤오미"],
  },
  {
    id: "smart-ac",
    name: "스마트 에어컨",
    description: "실내 온도 자동 조절",
    connected: true,
    brands: ["삼성", "LG", "캐리어"],
  },
  {
    id: "smart-light",
    name: "스마트 조명",
    description: "수면 리듬에 맞춘 조명 제어",
    connected: false,
    brands: ["Philips Hue", "LIFX", "스마트싱스"],
  },
];

export default function WearablesSettingsPage() {
  const [wearables, setWearables] = useState(integrations);
  const [smartHome, setSmartHome] = useState(smartHomeIntegrations);
  const [activeTab, setActiveTab] = useState<"wearables" | "smarthome">("wearables");

  const handleConnect = (integrationId: string) => {
    // 연결 시뮬레이션
    setWearables(
      wearables.map((w) =>
        w.id === integrationId
          ? { ...w, connected: true, lastSync: "방금 전" }
          : w
      )
    );
  };

  const handleDisconnect = (integrationId: string) => {
    if (confirm("정말로 연결을 해제하시겠습니까?")) {
      setWearables(
        wearables.map((w) =>
          w.id === integrationId
            ? { ...w, connected: false, lastSync: null }
            : w
        )
      );
    }
  };

  const handleSync = (integrationId: string) => {
    alert("동기화를 시작합니다...");
    setWearables(
      wearables.map((w) =>
        w.id === integrationId ? { ...w, lastSync: "방금 전" } : w
      )
    );
  };

  const handleSmartHomeToggle = (id: string) => {
    setSmartHome(
      smartHome.map((s) =>
        s.id === id ? { ...s, connected: !s.connected } : s
      )
    );
  };

  const connectedCount = wearables.filter((w) => w.connected).length;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          설정으로 돌아가기
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">외부 연동</h1>
          <p className="text-gray-400">
            웨어러블 기기, 건강 앱, 스마트홈과 연동하여 더 풍부한 건강 인사이트를
            받으세요
          </p>
        </div>
      </div>

      {/* 연결 상태 요약 */}
      <div className="glass rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-manpasik-primary/20 flex items-center justify-center">
              <Zap className="w-7 h-7 text-manpasik-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {connectedCount}개 연동됨
              </h3>
              <p className="text-gray-400 text-sm">
                총 {wearables.length}개 서비스 연동 가능
              </p>
            </div>
          </div>
          <button
            onClick={() => wearables.filter(w => w.connected).forEach(w => handleSync(w.id))}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            전체 동기화
          </button>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("wearables")}
          className={cn(
            "px-6 py-3 rounded-xl font-medium transition-all",
            activeTab === "wearables"
              ? "bg-manpasik-primary text-white"
              : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
          )}
        >
          <Watch className="w-4 h-4 inline mr-2" />
          웨어러블 & 앱
        </button>
        <button
          onClick={() => setActiveTab("smarthome")}
          className={cn(
            "px-6 py-3 rounded-xl font-medium transition-all",
            activeTab === "smarthome"
              ? "bg-manpasik-primary text-white"
              : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
          )}
        >
          <Smartphone className="w-4 h-4 inline mr-2" />
          스마트홈
        </button>
      </div>

      {/* 웨어러블 & 앱 탭 */}
      {activeTab === "wearables" && (
        <div className="space-y-4">
          {wearables.map((integration) => (
            <div
              key={integration.id}
              className="glass rounded-xl p-6 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center text-2xl",
                      integration.color
                    )}
                  >
                    {integration.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-white">
                        {integration.name}
                      </h3>
                      {integration.connected && (
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                          <Check className="w-3 h-3" />
                          연결됨
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-3">
                      {integration.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {integration.dataTypes.map((dt) => (
                        <span
                          key={dt}
                          className="text-xs px-2 py-1 rounded-lg bg-white/5 text-gray-300"
                        >
                          {dt}
                        </span>
                      ))}
                    </div>
                    {integration.connected && integration.lastSync && (
                      <p className="text-gray-500 text-xs mt-3">
                        마지막 동기화: {integration.lastSync}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {integration.connected ? (
                    <>
                      <button
                        onClick={() => handleSync(integration.id)}
                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        title="동기화"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDisconnect(integration.id)}
                        className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        연결 해제
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleConnect(integration.id)}
                      className="px-4 py-2 rounded-lg bg-manpasik-primary text-white hover:bg-manpasik-primary/80 transition-colors"
                    >
                      연결하기
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 스마트홈 탭 */}
      {activeTab === "smarthome" && (
        <div className="space-y-4">
          {smartHome.map((device) => (
            <div key={device.id} className="glass rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    {device.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-2">
                    {device.description}
                  </p>
                  <div className="flex gap-2">
                    {device.brands.map((brand) => (
                      <span
                        key={brand}
                        className="text-xs px-2 py-1 rounded-lg bg-white/5 text-gray-300"
                      >
                        {brand}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleSmartHomeToggle(device.id)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    device.connected ? "bg-green-500" : "bg-gray-600"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                      device.connected ? "right-1" : "left-1"
                    )}
                  />
                </button>
              </div>
            </div>
          ))}

          {/* 스마트홈 연동 안내 */}
          <div className="glass rounded-xl p-6 mt-6">
            <h3 className="text-lg font-bold text-white mb-4">
              🏠 스마트홈 자동화 예시
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <Activity className="w-5 h-5 text-manpasik-primary flex-shrink-0 mt-0.5" />
                <span>
                  라돈 농도가 높아지면 자동으로 공기청정기 가동 및 환기 알림
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <span>
                  수면 시간이 되면 조명 자동 감소 및 수면 유도 환경 조성
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span>
                  혈당이 낮아지면 스마트 알림 및 가족에게 자동 메시지 발송
                </span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

