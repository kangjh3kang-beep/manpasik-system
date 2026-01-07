"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Phone, AlertTriangle, X, CheckCircle } from "lucide-react";

interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

// 샘플 긴급 연락처
const emergencyContacts: EmergencyContact[] = [
  { id: "1", name: "김철수", relation: "배우자", phone: "010-1234-5678" },
  { id: "2", name: "이영희", relation: "자녀", phone: "010-9876-5432" },
  { id: "3", name: "119", relation: "응급서비스", phone: "119" },
];

export default function EmergencyButton() {
  const [isPressed, setIsPressed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isEmergencySent, setIsEmergencySent] = useState(false);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  const HOLD_DURATION = 3000; // 3초

  const handlePressStart = () => {
    setIsPressed(true);
    setProgress(0);

    // 진행률 업데이트
    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (100 / (HOLD_DURATION / 50));
        return Math.min(next, 100);
      });
    }, 50);

    // 3초 후 긴급 호출 확인
    pressTimerRef.current = setTimeout(() => {
      setShowConfirm(true);
      setIsPressed(false);
      setProgress(0);
      if (progressRef.current) clearInterval(progressRef.current);
    }, HOLD_DURATION);
  };

  const handlePressEnd = () => {
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    setIsPressed(false);
    setProgress(0);
  };

  const handleEmergencyCall = () => {
    // 긴급 호출 실행
    setIsEmergencySent(true);
    setShowConfirm(false);

    // 실제로는 여기서 API 호출
    console.log("🚨 긴급 호출 발송:", emergencyContacts);

    // 5초 후 초기화
    setTimeout(() => {
      setIsEmergencySent(false);
    }, 5000);
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  useEffect(() => {
    return () => {
      if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, []);

  return (
    <>
      {/* 긴급 버튼 */}
      <div
        className={cn(
          "p-4 rounded-2xl relative overflow-hidden",
          "bg-gradient-to-br from-red-900/30 to-red-800/20",
          "border border-red-500/30"
        )}
      >
        <div className="flex items-center gap-4">
          {/* 버튼 */}
          <button
            onMouseDown={handlePressStart}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd}
            onTouchStart={handlePressStart}
            onTouchEnd={handlePressEnd}
            className={cn(
              "relative w-16 h-16 rounded-full flex items-center justify-center",
              "bg-gradient-to-br from-red-500 to-red-600",
              "shadow-lg shadow-red-500/30",
              "transition-transform active:scale-95",
              isPressed && "animate-pulse"
            )}
          >
            {/* 진행률 링 */}
            {isPressed && (
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="30"
                  fill="none"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="4"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="30"
                  fill="none"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 30}`}
                  strokeDashoffset={`${2 * Math.PI * 30 * (1 - progress / 100)}`}
                  className="transition-all duration-50"
                />
              </svg>
            )}
            <Phone className="w-6 h-6 text-white" />
          </button>

          {/* 설명 */}
          <div className="flex-1">
            <h3 className="font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              긴급 호출
            </h3>
            <p className="text-sm text-gray-400">
              {isPressed
                ? `${Math.ceil((HOLD_DURATION - (progress / 100) * HOLD_DURATION) / 1000)}초 유지...`
                : "3초간 길게 누르면 긴급 연락처에 알림"}
            </p>
            <div className="mt-2 flex gap-1">
              {emergencyContacts.slice(0, 3).map((contact) => (
                <span
                  key={contact.id}
                  className="px-2 py-0.5 rounded text-xs bg-white/10 text-gray-300"
                >
                  {contact.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 긴급 호출 확인 모달 */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[var(--manpasik-deep-ocean)] border border-red-500/30 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">긴급 호출 확인</h2>
              <p className="text-gray-400">
                아래 연락처에 긴급 알림을 보내시겠습니까?
              </p>
            </div>

            {/* 연락처 목록 */}
            <div className="space-y-2 mb-6">
              {emergencyContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                >
                  <div>
                    <p className="font-medium text-white">{contact.name}</p>
                    <p className="text-sm text-gray-400">{contact.relation}</p>
                  </div>
                  <p className="text-sm text-gray-300">{contact.phone}</p>
                </div>
              ))}
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 py-3 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 transition-colors font-medium"
              >
                취소
              </button>
              <button
                onClick={handleEmergencyCall}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                긴급 호출
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 긴급 호출 완료 알림 */}
      {isEmergencySent && (
        <div className="fixed bottom-4 right-4 z-50 p-4 rounded-xl bg-green-500 text-white shadow-lg flex items-center gap-3 animate-slide-up">
          <CheckCircle className="w-6 h-6" />
          <div>
            <p className="font-medium">긴급 호출 전송 완료</p>
            <p className="text-sm text-green-100">연락처에 알림이 발송되었습니다</p>
          </div>
          <button onClick={() => setIsEmergencySent(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <style jsx global>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

