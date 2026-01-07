"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Plus,
  Phone,
  User,
  Trash2,
  Edit2,
  Bell,
  AlertTriangle,
  Shield,
  Heart,
  Thermometer,
  Wind,
  Activity,
  Save,
  X,
} from "lucide-react";

// 긴급 연락처 타입
interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

// 임계값 설정 타입
interface ThresholdSetting {
  id: string;
  name: string;
  icon: string;
  unit: string;
  minValue: number;
  maxValue: number;
  currentMin: number;
  currentMax: number;
  alertEnabled: boolean;
}

// 초기 긴급 연락처
const initialContacts: EmergencyContact[] = [
  {
    id: "1",
    name: "김철수",
    phone: "010-1234-5678",
    relationship: "배우자",
    isPrimary: true,
  },
  {
    id: "2",
    name: "이영희",
    phone: "010-9876-5432",
    relationship: "자녀",
    isPrimary: false,
  },
];

// 초기 임계값 설정
const initialThresholds: ThresholdSetting[] = [
  {
    id: "glucose",
    name: "혈당",
    icon: "🩸",
    unit: "mg/dL",
    minValue: 0,
    maxValue: 400,
    currentMin: 70,
    currentMax: 180,
    alertEnabled: true,
  },
  {
    id: "heartRate",
    name: "심박수",
    icon: "💓",
    unit: "bpm",
    minValue: 30,
    maxValue: 200,
    currentMin: 50,
    currentMax: 120,
    alertEnabled: true,
  },
  {
    id: "bloodPressure",
    name: "혈압 (수축기)",
    icon: "🫀",
    unit: "mmHg",
    minValue: 60,
    maxValue: 250,
    currentMin: 90,
    currentMax: 140,
    alertEnabled: true,
  },
  {
    id: "radon",
    name: "라돈",
    icon: "☢️",
    unit: "Bq/m³",
    minValue: 0,
    maxValue: 500,
    currentMin: 0,
    currentMax: 148,
    alertEnabled: true,
  },
  {
    id: "co2",
    name: "CO2",
    icon: "🌫️",
    unit: "ppm",
    minValue: 0,
    maxValue: 5000,
    currentMin: 0,
    currentMax: 1500,
    alertEnabled: false,
  },
];

export default function EmergencySettingsPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>(initialContacts);
  const [thresholds, setThresholds] =
    useState<ThresholdSetting[]>(initialThresholds);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    relationship: "",
  });

  // 알림 설정
  const [alertSettings, setAlertSettings] = useState({
    pushNotification: true,
    smsAlert: true,
    callAlert: false,
    autoEmergencyCall: false,
    silentHours: false,
    silentStart: "22:00",
    silentEnd: "07:00",
  });

  const handleAddContact = () => {
    if (newContact.name && newContact.phone) {
      const contact: EmergencyContact = {
        id: Date.now().toString(),
        ...newContact,
        isPrimary: contacts.length === 0,
      };
      setContacts([...contacts, contact]);
      setNewContact({ name: "", phone: "", relationship: "" });
      setIsAddingContact(false);
    }
  };

  const handleDeleteContact = (id: string) => {
    setContacts(contacts.filter((c) => c.id !== id));
  };

  const handleSetPrimary = (id: string) => {
    setContacts(
      contacts.map((c) => ({
        ...c,
        isPrimary: c.id === id,
      }))
    );
  };

  const handleThresholdChange = (
    id: string,
    field: "currentMin" | "currentMax" | "alertEnabled",
    value: number | boolean
  ) => {
    setThresholds(
      thresholds.map((t) =>
        t.id === id ? { ...t, [field]: value } : t
      )
    );
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
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
          긴급 대응 설정
        </h1>
        <p className="text-gray-400">
          위험 상황 발생 시 자동으로 알림을 보낼 연락처와 임계값을 설정하세요
        </p>
      </div>

      {/* 긴급 연락처 */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Phone className="w-5 h-5 text-red-400" />
            긴급 연락처
          </h2>
          <button
            onClick={() => setIsAddingContact(true)}
            className="px-4 py-2 rounded-xl bg-[var(--manpasik-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            연락처 추가
          </button>
        </div>

        <div className="space-y-3">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={cn(
                "p-4 rounded-xl flex items-center gap-4",
                "bg-[var(--glass-bg)] backdrop-blur-xl border",
                contact.isPrimary
                  ? "border-red-500/30"
                  : "border-[var(--glass-border)]"
              )}
            >
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <User className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-white">{contact.name}</p>
                  {contact.isPrimary && (
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs">
                      대표
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400">
                  {contact.phone} • {contact.relationship}
                </p>
              </div>
              <div className="flex gap-2">
                {!contact.isPrimary && (
                  <button
                    onClick={() => handleSetPrimary(contact.id)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 text-sm transition-colors"
                  >
                    대표 지정
                  </button>
                )}
                <button
                  onClick={() => handleDeleteContact(contact.id)}
                  className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* 연락처 추가 폼 */}
          {isAddingContact && (
            <div
              className={cn(
                "p-4 rounded-xl",
                "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--manpasik-primary)]/30"
              )}
            >
              <div className="grid grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="이름"
                  value={newContact.name}
                  onChange={(e) =>
                    setNewContact({ ...newContact, name: e.target.value })
                  }
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-[var(--manpasik-primary)]"
                />
                <input
                  type="tel"
                  placeholder="전화번호"
                  value={newContact.phone}
                  onChange={(e) =>
                    setNewContact({ ...newContact, phone: e.target.value })
                  }
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-[var(--manpasik-primary)]"
                />
                <input
                  type="text"
                  placeholder="관계 (예: 배우자)"
                  value={newContact.relationship}
                  onChange={(e) =>
                    setNewContact({
                      ...newContact,
                      relationship: e.target.value,
                    })
                  }
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-[var(--manpasik-primary)]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsAddingContact(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 text-sm transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleAddContact}
                  className="px-4 py-2 rounded-xl bg-[var(--manpasik-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  저장
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 임계값 설정 */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          임계값 설정
        </h2>
        <p className="text-gray-400 text-sm mb-4">
          측정값이 설정된 범위를 벗어나면 알림을 받습니다.
        </p>

        <div className="space-y-4">
          {thresholds.map((threshold) => (
            <div
              key={threshold.id}
              className={cn(
                "p-4 rounded-xl",
                "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]"
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{threshold.icon}</span>
                  <div>
                    <p className="font-bold text-white">{threshold.name}</p>
                    <p className="text-sm text-gray-400">
                      범위: {threshold.currentMin} ~ {threshold.currentMax}{" "}
                      {threshold.unit}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={threshold.alertEnabled}
                    onChange={(e) =>
                      handleThresholdChange(
                        threshold.id,
                        "alertEnabled",
                        e.target.checked
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--manpasik-primary)]"></div>
                </label>
              </div>

              {threshold.alertEnabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      최소값 ({threshold.unit})
                    </label>
                    <input
                      type="number"
                      value={threshold.currentMin}
                      onChange={(e) =>
                        handleThresholdChange(
                          threshold.id,
                          "currentMin",
                          Number(e.target.value)
                        )
                      }
                      min={threshold.minValue}
                      max={threshold.currentMax - 1}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[var(--manpasik-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      최대값 ({threshold.unit})
                    </label>
                    <input
                      type="number"
                      value={threshold.currentMax}
                      onChange={(e) =>
                        handleThresholdChange(
                          threshold.id,
                          "currentMax",
                          Number(e.target.value)
                        )
                      }
                      min={threshold.currentMin + 1}
                      max={threshold.maxValue}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[var(--manpasik-primary)]"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 알림 방식 설정 */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-[var(--manpasik-primary)]" />
          알림 방식
        </h2>

        <div
          className={cn(
            "p-5 rounded-xl space-y-4",
            "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]"
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">푸시 알림</p>
              <p className="text-sm text-gray-400">
                앱 푸시 알림으로 즉시 알림
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={alertSettings.pushNotification}
                onChange={(e) =>
                  setAlertSettings({
                    ...alertSettings,
                    pushNotification: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--manpasik-primary)]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">SMS 알림</p>
              <p className="text-sm text-gray-400">
                긴급 연락처에 문자 발송
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={alertSettings.smsAlert}
                onChange={(e) =>
                  setAlertSettings({
                    ...alertSettings,
                    smsAlert: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--manpasik-primary)]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">자동 긴급 전화</p>
              <p className="text-sm text-gray-400">
                심각한 상황 시 119 자동 연결
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={alertSettings.autoEmergencyCall}
                onChange={(e) =>
                  setAlertSettings({
                    ...alertSettings,
                    autoEmergencyCall: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
            </label>
          </div>

          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-white">방해금지 시간</p>
                <p className="text-sm text-gray-400">
                  설정된 시간에는 알림 무음 (긴급 제외)
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertSettings.silentHours}
                  onChange={(e) =>
                    setAlertSettings({
                      ...alertSettings,
                      silentHours: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--manpasik-primary)]"></div>
              </label>
            </div>

            {alertSettings.silentHours && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    시작 시간
                  </label>
                  <input
                    type="time"
                    value={alertSettings.silentStart}
                    onChange={(e) =>
                      setAlertSettings({
                        ...alertSettings,
                        silentStart: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[var(--manpasik-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    종료 시간
                  </label>
                  <input
                    type="time"
                    value={alertSettings.silentEnd}
                    onChange={(e) =>
                      setAlertSettings({
                        ...alertSettings,
                        silentEnd: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[var(--manpasik-primary)]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 저장 버튼 */}
      <div className="flex justify-end">
        <button className="px-6 py-3 rounded-xl bg-manpasik-gradient text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
          <Save className="w-5 h-5" />
          모든 설정 저장
        </button>
      </div>
    </div>
  );
}

