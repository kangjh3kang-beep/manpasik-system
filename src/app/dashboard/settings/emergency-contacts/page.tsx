"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  Plus,
  Phone,
  AlertTriangle,
  Edit2,
  Trash2,
  Star,
  Bell,
  MapPin,
  Clock,
  X,
} from "lucide-react";

// 긴급 연락처 데이터
const mockEmergencyContacts = [
  {
    id: "ec-1",
    name: "어머니",
    relation: "가족",
    phone: "010-2345-6789",
    isPrimary: true,
    receiveAlert: true,
    responseTime: "즉시",
  },
  {
    id: "ec-2",
    name: "아버지",
    relation: "가족",
    phone: "010-3456-7890",
    isPrimary: false,
    receiveAlert: true,
    responseTime: "5분 내",
  },
  {
    id: "ec-3",
    name: "담당 의사 (김OO)",
    relation: "의료진",
    phone: "02-123-4567",
    isPrimary: false,
    receiveAlert: true,
    responseTime: "업무 시간 내",
  },
];

// 임계값 설정
const mockThresholds = [
  {
    id: "th-1",
    metric: "혈당",
    unit: "mg/dL",
    min: 70,
    max: 180,
    criticalMin: 54,
    criticalMax: 250,
    enabled: true,
  },
  {
    id: "th-2",
    metric: "케톤",
    unit: "mmol/L",
    min: 0,
    max: 0.6,
    criticalMin: 0,
    criticalMax: 1.5,
    enabled: true,
  },
  {
    id: "th-3",
    metric: "라돈",
    unit: "Bq/m³",
    min: 0,
    max: 148,
    criticalMin: 0,
    criticalMax: 300,
    enabled: true,
  },
];

export default function EmergencyContactsPage() {
  const [contacts, setContacts] = useState(mockEmergencyContacts);
  const [thresholds, setThresholds] = useState(mockThresholds);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"contacts" | "thresholds">("contacts");

  // 새 연락처 폼 상태
  const [newContact, setNewContact] = useState({
    name: "",
    relation: "",
    phone: "",
  });

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    const contact = {
      id: `ec-${Date.now()}`,
      ...newContact,
      isPrimary: false,
      receiveAlert: true,
      responseTime: "즉시",
    };
    setContacts([...contacts, contact]);
    setNewContact({ name: "", relation: "", phone: "" });
    setShowAddModal(false);
  };

  const handleRemoveContact = (contactId: string) => {
    if (confirm("정말로 이 긴급 연락처를 삭제하시겠습니까?")) {
      setContacts(contacts.filter((c) => c.id !== contactId));
    }
  };

  const handleSetPrimary = (contactId: string) => {
    setContacts(
      contacts.map((c) => ({
        ...c,
        isPrimary: c.id === contactId,
      }))
    );
  };

  const toggleThreshold = (thresholdId: string) => {
    setThresholds(
      thresholds.map((t) =>
        t.id === thresholdId ? { ...t, enabled: !t.enabled } : t
      )
    );
  };

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
          <h1 className="text-3xl font-bold text-white mb-2">긴급 대응 설정</h1>
          <p className="text-gray-400">
            긴급 상황 발생 시 연락받을 사람과 알림 조건을 설정하세요
          </p>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("contacts")}
          className={cn(
            "px-6 py-3 rounded-xl font-medium transition-all",
            activeTab === "contacts"
              ? "bg-manpasik-primary text-white"
              : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
          )}
        >
          <Phone className="w-4 h-4 inline mr-2" />
          긴급 연락처
        </button>
        <button
          onClick={() => setActiveTab("thresholds")}
          className={cn(
            "px-6 py-3 rounded-xl font-medium transition-all",
            activeTab === "thresholds"
              ? "bg-manpasik-primary text-white"
              : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
          )}
        >
          <AlertTriangle className="w-4 h-4 inline mr-2" />
          임계값 설정
        </button>
      </div>

      {/* 긴급 연락처 탭 */}
      {activeTab === "contacts" && (
        <>
          {/* 긴급 연락처 목록 */}
          <div className="space-y-4 mb-6">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className={cn(
                  "glass rounded-xl p-4 flex items-center justify-between",
                  contact.isPrimary && "ring-2 ring-amber-500"
                )}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      contact.isPrimary
                        ? "bg-amber-500/20"
                        : "bg-white/5"
                    )}
                  >
                    <Phone
                      className={cn(
                        "w-6 h-6",
                        contact.isPrimary ? "text-amber-400" : "text-gray-400"
                      )}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white">{contact.name}</h3>
                      {contact.isPrimary && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                          <Star className="w-3 h-3 inline mr-1" />
                          1순위
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">
                      {contact.relation} • {contact.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!contact.isPrimary && (
                    <button
                      onClick={() => handleSetPrimary(contact.id)}
                      className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-amber-400 transition-colors"
                      title="1순위로 설정"
                    >
                      <Star className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveContact(contact.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 연락처 추가 버튼 */}
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full p-4 rounded-xl border-2 border-dashed border-white/20 text-gray-400 hover:border-manpasik-primary hover:text-manpasik-primary flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            긴급 연락처 추가
          </button>

          {/* 119 자동 연결 */}
          <div className="mt-8 glass rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">
                  119 자동 연결
                </h3>
                <p className="text-gray-400 mb-4">
                  위험 임계값 초과 시 119에 자동으로 연결됩니다. 위치 정보와
                  건강 데이터가 함께 전송됩니다.
                </p>
                <div className="flex items-center gap-4">
                  <button className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
                    119 자동 연결 활성화됨
                  </button>
                  <Link
                    href="/dashboard/settings/auto-alert"
                    className="text-manpasik-primary hover:underline text-sm"
                  >
                    자동 알림 설정 →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 임계값 설정 탭 */}
      {activeTab === "thresholds" && (
        <div className="space-y-4">
          {thresholds.map((threshold) => (
            <div key={threshold.id} className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {threshold.metric === "혈당"
                      ? "🩸"
                      : threshold.metric === "케톤"
                      ? "⚡"
                      : "☢️"}
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    {threshold.metric}
                  </h3>
                  <span className="text-gray-400 text-sm">
                    ({threshold.unit})
                  </span>
                </div>
                <button
                  onClick={() => toggleThreshold(threshold.id)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    threshold.enabled ? "bg-green-500" : "bg-gray-600"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                      threshold.enabled ? "right-1" : "left-1"
                    )}
                  />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-white/5">
                  <p className="text-gray-400 text-sm mb-2">주의 범위</p>
                  <p className="text-white font-medium">
                    {threshold.min} - {threshold.max} {threshold.unit}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-red-400 text-sm mb-2">위험 범위</p>
                  <p className="text-white font-medium">
                    &lt; {threshold.criticalMin} 또는 &gt; {threshold.criticalMax}{" "}
                    {threshold.unit}
                  </p>
                </div>
              </div>

              <p className="text-gray-400 text-sm mt-4">
                <Bell className="w-4 h-4 inline mr-1" />
                위험 범위 초과 시 긴급 연락처에 즉시 알림이 발송됩니다.
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 연락처 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">긴급 연락처 추가</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddContact} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  이름
                </label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) =>
                    setNewContact({ ...newContact, name: e.target.value })
                  }
                  placeholder="홍길동"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-manpasik-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  관계
                </label>
                <select
                  value={newContact.relation}
                  onChange={(e) =>
                    setNewContact({ ...newContact, relation: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-manpasik-primary"
                >
                  <option value="">선택하세요</option>
                  <option value="가족">가족</option>
                  <option value="친척">친척</option>
                  <option value="친구">친구</option>
                  <option value="의료진">의료진</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  전화번호
                </label>
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) =>
                    setNewContact({ ...newContact, phone: e.target.value })
                  }
                  placeholder="010-0000-0000"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-manpasik-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-manpasik-primary text-white font-medium hover:bg-manpasik-primary/80 transition-colors"
              >
                연락처 추가
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

