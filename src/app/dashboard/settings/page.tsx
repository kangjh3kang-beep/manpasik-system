"use client";

import { useState } from "react";
import Link from "next/link";

const settingsSections = [
  {
    id: "account",
    name: "계정 설정",
    icon: "👤",
    items: [
      { name: "프로필 편집", href: "/dashboard/settings/profile" },
      { name: "이메일 변경", href: "/dashboard/settings/email" },
      { name: "비밀번호 변경", href: "/dashboard/settings/password" },
      { name: "연락처 관리", href: "/dashboard/settings/phone" },
    ],
  },
  {
    id: "devices",
    name: "기기 관리",
    icon: "📱",
    items: [
      { name: "연결된 리더기", href: "/dashboard/settings/devices" },
      { name: "새 리더기 추가", href: "/dashboard/settings/devices/add" },
      { name: "펌웨어 업데이트", href: "/dashboard/settings/firmware" },
    ],
  },
  {
    id: "family",
    name: "가족 관리",
    icon: "👨‍👩‍👧‍👦",
    items: [
      { name: "가족 구성원", href: "/dashboard/settings/family" },
      { name: "보호자 모드", href: "/dashboard/settings/guardian" },
      { name: "데이터 공유 설정", href: "/dashboard/settings/family-sharing" },
    ],
  },
  {
    id: "emergency",
    name: "긴급 대응",
    icon: "🚨",
    items: [
      { name: "긴급 연락처", href: "/dashboard/settings/emergency-contacts" },
      { name: "임계값 설정", href: "/dashboard/settings/thresholds" },
      { name: "자동 알림 설정", href: "/dashboard/settings/auto-alert" },
    ],
  },
  {
    id: "integrations",
    name: "외부 연동",
    icon: "🔗",
    items: [
      { name: "웨어러블 기기", href: "/dashboard/settings/wearables" },
      { name: "스마트홈", href: "/dashboard/settings/smart-home" },
      { name: "건강 앱 연동", href: "/dashboard/settings/health-apps" },
    ],
  },
  {
    id: "notifications",
    name: "알림 설정",
    icon: "🔔",
    items: [
      { name: "푸시 알림", href: "/dashboard/settings/push-notifications" },
      { name: "이메일 알림", href: "/dashboard/settings/email-notifications" },
      { name: "측정 리마인더", href: "/dashboard/settings/reminders" },
    ],
  },
  {
    id: "privacy",
    name: "개인정보",
    icon: "🔒",
    items: [
      { name: "데이터 공유 설정", href: "/dashboard/settings/data-sharing" },
      { name: "동의 관리", href: "/dashboard/settings/consent" },
      { name: "데이터 다운로드", href: "/dashboard/settings/data-export" },
      { name: "계정 삭제", href: "/dashboard/settings/delete-account", danger: true },
    ],
  },
];

// 연결된 기기 (시뮬레이션)
const connectedDevices = [
  {
    id: "mps-001",
    name: "만파식 리더기 #1",
    serial: "MPS-2024-001234",
    firmware: "v2.3.1",
    battery: 85,
    status: "online",
    lastSync: "방금 전",
  },
  {
    id: "mps-002",
    name: "만파식 리더기 #2",
    serial: "MPS-2024-005678",
    firmware: "v2.3.0",
    battery: 42,
    status: "offline",
    lastSync: "3시간 전",
  },
];

// 가족 구성원 (시뮬레이션)
const familyMembers = [
  {
    id: "user-1",
    name: "나",
    role: "owner",
    avatar: "👤",
    lastActive: "현재 활동 중",
  },
  {
    id: "user-2",
    name: "어머니",
    role: "member",
    avatar: "👩",
    lastActive: "오늘 오전 10:32",
  },
  {
    id: "user-3",
    name: "아버지",
    role: "member",
    avatar: "👨",
    lastActive: "어제",
  },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">설정</h1>
        <p className="text-gray-400">계정, 기기, 알림 설정을 관리하세요</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 왼쪽: 설정 카테고리 */}
        <div className="lg:col-span-2 space-y-4">
          {settingsSections.map((section) => (
            <div key={section.id} className="glass rounded-xl overflow-hidden">
              <button
                onClick={() =>
                  setActiveSection(activeSection === section.id ? null : section.id)
                }
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{section.icon}</span>
                  <span className="font-medium text-white">{section.name}</span>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    activeSection === section.id ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {activeSection === section.id && (
                <div className="px-4 pb-4">
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`block px-4 py-3 rounded-lg transition-colors ${
                          (item as { danger?: boolean }).danger
                            ? "text-red-400 hover:bg-red-500/10"
                            : "text-gray-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 오른쪽: 빠른 정보 */}
        <div className="space-y-6">
          {/* 연결된 기기 */}
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white">연결된 기기</h2>
              <span className="text-xs text-gray-400">{connectedDevices.length}개</span>
            </div>
            <div className="space-y-3">
              {connectedDevices.map((device) => (
                <div
                  key={device.id}
                  className="p-3 rounded-lg bg-white/5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        device.status === "online"
                          ? "bg-green-500/20"
                          : "bg-gray-500/20"
                      }`}
                    >
                      <svg
                        className={`w-5 h-5 ${
                          device.status === "online" ? "text-green-400" : "text-gray-400"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{device.name}</p>
                      <p className="text-xs text-gray-400">
                        {device.status === "online" ? "온라인" : "오프라인"} • 배터리{" "}
                        {device.battery}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/dashboard/settings/devices"
              className="block mt-4 text-center text-sm text-manpasik-primary hover:underline"
            >
              기기 관리 →
            </Link>
          </div>

          {/* 가족 구성원 */}
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white">가족 구성원</h2>
              <span className="text-xs text-gray-400">{familyMembers.length}명</span>
            </div>
            <div className="space-y-3">
              {familyMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-3 rounded-lg bg-white/5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-manpasik-primary to-manpasik-secondary flex items-center justify-center text-lg">
                      {member.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {member.name}
                        {member.role === "owner" && (
                          <span className="ml-2 text-xs text-manpasik-primary">(관리자)</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400">{member.lastActive}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/dashboard/settings/family"
              className="block mt-4 text-center text-sm text-manpasik-primary hover:underline"
            >
              가족 관리 →
            </Link>
          </div>

          {/* 앱 정보 */}
          <div className="glass rounded-xl p-6">
            <h2 className="font-bold text-white mb-4">앱 정보</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">버전</span>
                <span className="text-white">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">빌드</span>
                <span className="text-white">2026.01.06</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">환경</span>
                <span className="text-white">Production</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
              <Link
                href="/terms"
                className="block text-sm text-gray-400 hover:text-white"
              >
                이용약관
              </Link>
              <Link
                href="/privacy"
                className="block text-sm text-gray-400 hover:text-white"
              >
                개인정보처리방침
              </Link>
              <Link
                href="/support"
                className="block text-sm text-gray-400 hover:text-white"
              >
                고객센터
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
