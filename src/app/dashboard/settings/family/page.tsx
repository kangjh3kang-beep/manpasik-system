"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  Plus,
  UserPlus,
  Shield,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Bell,
  Check,
  X,
} from "lucide-react";

// 가족 구성원 데이터
const mockFamilyMembers = [
  {
    id: "user-1",
    name: "나 (본인)",
    email: "user@manpasik.com",
    phone: "010-1234-5678",
    role: "owner" as const,
    avatar: "👤",
    permissions: ["view", "edit", "share", "emergency"],
    lastActive: "현재 활동 중",
    joinedAt: "2024-01-01",
    canViewData: true,
    receiveEmergencyAlert: true,
  },
  {
    id: "user-2",
    name: "어머니",
    email: "mother@manpasik.com",
    phone: "010-2345-6789",
    role: "member" as const,
    avatar: "👩",
    permissions: ["view", "emergency"],
    lastActive: "오늘 오전 10:32",
    joinedAt: "2024-03-15",
    canViewData: true,
    receiveEmergencyAlert: true,
  },
  {
    id: "user-3",
    name: "아버지",
    email: "father@manpasik.com",
    phone: "010-3456-7890",
    role: "member" as const,
    avatar: "👨",
    permissions: ["view"],
    lastActive: "어제",
    joinedAt: "2024-03-15",
    canViewData: true,
    receiveEmergencyAlert: false,
  },
  {
    id: "user-4",
    name: "담당 의사",
    email: "doctor@hospital.com",
    phone: "02-123-4567",
    role: "guardian" as const,
    avatar: "👨‍⚕️",
    permissions: ["view", "emergency"],
    lastActive: "3일 전",
    joinedAt: "2024-06-01",
    canViewData: true,
    receiveEmergencyAlert: true,
  },
];

type MemberRole = "owner" | "member" | "guardian";

const roleLabels: Record<MemberRole, { label: string; color: string }> = {
  owner: { label: "관리자", color: "text-manpasik-primary" },
  member: { label: "가족", color: "text-manpasik-secondary" },
  guardian: { label: "보호자", color: "text-green-400" },
};

export default function FamilySettingsPage() {
  const [members, setMembers] = useState(mockFamilyMembers);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<MemberRole>("member");

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`${inviteEmail}로 초대 이메일을 발송했습니다.`);
    setInviteEmail("");
    setShowInviteModal(false);
  };

  const handleRemoveMember = (memberId: string) => {
    if (confirm("정말로 이 가족 구성원을 삭제하시겠습니까?")) {
      setMembers(members.filter((m) => m.id !== memberId));
    }
  };

  const togglePermission = (memberId: string, field: "canViewData" | "receiveEmergencyAlert") => {
    setMembers(
      members.map((m) =>
        m.id === memberId ? { ...m, [field]: !m[field] } : m
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">가족 관리</h1>
            <p className="text-gray-400">
              가족 구성원을 추가하고 데이터 공유 권한을 관리하세요
            </p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 rounded-xl bg-manpasik-primary text-white font-medium flex items-center gap-2 hover:bg-manpasik-primary/80 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            가족 초대
          </button>
        </div>
      </div>

      {/* 가족 구성원 목록 */}
      <div className="space-y-4 mb-8">
        {members.map((member) => (
          <div
            key={member.id}
            className={cn(
              "glass rounded-2xl overflow-hidden transition-all",
              selectedMember === member.id && "ring-2 ring-manpasik-primary"
            )}
          >
            {/* 기본 정보 */}
            <div
              className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() =>
                setSelectedMember(
                  selectedMember === member.id ? null : member.id
                )
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-manpasik-primary to-manpasik-secondary flex items-center justify-center text-2xl">
                    {member.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">
                        {member.name}
                      </h3>
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full bg-white/10",
                          roleLabels[member.role].color
                        )}
                      >
                        {roleLabels[member.role].label}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{member.email}</p>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-400">
                  <p>마지막 활동: {member.lastActive}</p>
                </div>
              </div>
            </div>

            {/* 상세 정보 */}
            {selectedMember === member.id && (
              <div className="px-6 pb-6 border-t border-white/10">
                <div className="pt-6 grid md:grid-cols-2 gap-6">
                  {/* 왼쪽: 연락처 정보 */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-3">
                        연락처 정보
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-white">{member.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-white">{member.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-3">
                        가입 정보
                      </h4>
                      <p className="text-sm text-gray-300">
                        가입일: {member.joinedAt}
                      </p>
                    </div>
                  </div>

                  {/* 오른쪽: 권한 설정 */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-3">
                      권한 설정
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                        <div className="flex items-center gap-3">
                          {member.canViewData ? (
                            <Eye className="w-5 h-5 text-green-400" />
                          ) : (
                            <EyeOff className="w-5 h-5 text-gray-400" />
                          )}
                          <span className="text-white">건강 데이터 열람</span>
                        </div>
                        <button
                          onClick={() => togglePermission(member.id, "canViewData")}
                          disabled={member.role === "owner"}
                          className={cn(
                            "w-12 h-6 rounded-full transition-colors relative",
                            member.canViewData ? "bg-green-500" : "bg-gray-600",
                            member.role === "owner" && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                              member.canViewData ? "right-1" : "left-1"
                            )}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                        <div className="flex items-center gap-3">
                          <Bell
                            className={cn(
                              "w-5 h-5",
                              member.receiveEmergencyAlert
                                ? "text-red-400"
                                : "text-gray-400"
                            )}
                          />
                          <span className="text-white">긴급 알림 수신</span>
                        </div>
                        <button
                          onClick={() =>
                            togglePermission(member.id, "receiveEmergencyAlert")
                          }
                          className={cn(
                            "w-12 h-6 rounded-full transition-colors relative",
                            member.receiveEmergencyAlert
                              ? "bg-red-500"
                              : "bg-gray-600"
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                              member.receiveEmergencyAlert ? "right-1" : "left-1"
                            )}
                          />
                        </button>
                      </div>
                    </div>

                    {/* 삭제 버튼 */}
                    {member.role !== "owner" && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="w-full p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center gap-2 transition-colors mt-4"
                      >
                        <Trash2 className="w-5 h-5" />
                        <span>가족에서 삭제</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 초대 모달 */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">가족 초대</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  이메일 주소
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="family@example.com"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-manpasik-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  역할 선택
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInviteRole("member")}
                    className={cn(
                      "p-3 rounded-xl border transition-all text-left",
                      inviteRole === "member"
                        ? "border-manpasik-primary bg-manpasik-primary/20"
                        : "border-white/10 hover:border-white/30"
                    )}
                  >
                    <span className="block font-medium text-white">가족</span>
                    <span className="text-xs text-gray-400">
                      건강 데이터 열람 가능
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInviteRole("guardian")}
                    className={cn(
                      "p-3 rounded-xl border transition-all text-left",
                      inviteRole === "guardian"
                        ? "border-green-500 bg-green-500/20"
                        : "border-white/10 hover:border-white/30"
                    )}
                  >
                    <span className="block font-medium text-white">보호자</span>
                    <span className="text-xs text-gray-400">
                      의사/간호사 등 전문가
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-manpasik-primary text-white font-medium hover:bg-manpasik-primary/80 transition-colors"
              >
                초대 이메일 발송
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 보호자 모드 안내 */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2">보호자 모드</h3>
            <p className="text-gray-400 mb-4">
              담당 의사나 간호사를 보호자로 등록하면, 긴급 상황 시 즉시 알림을
              받고 원격으로 건강 상태를 모니터링할 수 있습니다.
            </p>
            <Link
              href="/dashboard/settings/guardian"
              className="text-manpasik-primary hover:underline text-sm"
            >
              보호자 모드 자세히 알아보기 →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

