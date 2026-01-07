"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  MonitorUp,
  MessageSquare,
  FileText,
  Heart,
  Activity,
  ChevronUp,
  ChevronDown,
  Send,
  X,
  Maximize2,
  Volume2,
  VolumeX,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "doctor" | "system";
  content: string;
  timestamp: Date;
}

interface VitalData {
  heartRate: number;
  bloodPressure: { systolic: number; diastolic: number };
  glucose: number;
  spo2: number;
}

// 의사 정보
const doctorInfo = {
  name: "김영희 전문의",
  specialty: "내분비내과",
  hospital: "서울대학교병원",
  image: "👩‍⚕️",
};

// 환자 최근 데이터 시뮬레이션
const recentMeasurements = [
  { type: "혈당", value: "98", unit: "mg/dL", status: "정상", time: "오늘 09:30" },
  { type: "콜레스테롤", value: "185", unit: "mg/dL", status: "양호", time: "어제" },
  { type: "케톤", value: "0.5", unit: "mmol/L", status: "정상", time: "3일 전" },
];

export default function TelemedicineSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 상태 관리
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVitalsOpen, setIsVitalsOpen] = useState(true);
  const [sessionTime, setSessionTime] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // 바이탈 데이터
  const [vitals, setVitals] = useState<VitalData>({
    heartRate: 72,
    bloodPressure: { systolic: 120, diastolic: 80 },
    glucose: 98,
    spo2: 98,
  });
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 연결 시뮬레이션
  useEffect(() => {
    const connectTimer = setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      
      // 시스템 메시지 추가
      setChatMessages([
        {
          id: "system-1",
          role: "system",
          content: "화상 진료가 시작되었습니다. 상담 내용은 기록됩니다.",
          timestamp: new Date(),
        },
        {
          id: "doctor-1",
          role: "doctor",
          content: "안녕하세요! 김영희 전문의입니다. 오늘 어떤 증상으로 상담을 원하시나요?",
          timestamp: new Date(),
        },
      ]);
    }, 3000);

    return () => clearTimeout(connectTimer);
  }, []);

  // 세션 타이머
  useEffect(() => {
    if (!isConnected) return;
    
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isConnected]);

  // 바이탈 데이터 업데이트 시뮬레이션
  useEffect(() => {
    if (!isConnected) return;
    
    const vitalsTimer = setInterval(() => {
      setVitals(prev => ({
        heartRate: Math.max(60, Math.min(100, prev.heartRate + (Math.random() - 0.5) * 4)),
        bloodPressure: {
          systolic: Math.max(100, Math.min(140, prev.bloodPressure.systolic + (Math.random() - 0.5) * 5)),
          diastolic: Math.max(60, Math.min(90, prev.bloodPressure.diastolic + (Math.random() - 0.5) * 3)),
        },
        glucose: prev.glucose,
        spo2: Math.max(95, Math.min(100, prev.spo2 + (Math.random() - 0.5) * 1)),
      }));
    }, 3000);

    return () => clearInterval(vitalsTimer);
  }, [isConnected]);

  // 채팅 스크롤
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    
    setChatMessages(prev => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: chatInput,
        timestamp: new Date(),
      },
    ]);
    setChatInput("");

    // 의사 자동 응답 시뮬레이션
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          id: `doctor-${Date.now()}`,
          role: "doctor",
          content: "네, 이해했습니다. 조금 더 자세히 말씀해 주시겠어요?",
          timestamp: new Date(),
        },
      ]);
    }, 2000);
  };

  const handleEndCall = () => {
    if (confirm("진료를 종료하시겠습니까?")) {
      router.push("/dashboard/telemedicine?tab=appointments");
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // 연결 중 화면
  if (isConnecting) {
    return (
      <div className="fixed inset-0 bg-[var(--manpasik-deep-ocean)] flex flex-col items-center justify-center z-50">
        <div className="text-center">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[var(--manpasik-primary)] to-[var(--manpasik-secondary)] flex items-center justify-center mb-8 mx-auto animate-pulse">
            <span className="text-5xl">{doctorInfo.image}</span>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            {doctorInfo.name}
          </h2>
          <p className="text-gray-400 mb-8">
            {doctorInfo.specialty} • {doctorInfo.hospital}
          </p>
          
          <div className="flex items-center justify-center gap-2 text-[var(--manpasik-primary)]">
            <div className="w-3 h-3 rounded-full bg-[var(--manpasik-primary)] animate-ping" />
            <span>연결 중...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[var(--manpasik-deep-ocean)] flex flex-col z-50">
      {/* 상단 헤더 */}
      <div className="h-14 px-4 flex items-center justify-between bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--manpasik-primary)] to-[var(--manpasik-secondary)] flex items-center justify-center text-sm">
              {doctorInfo.image}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{doctorInfo.name}</p>
              <p className="text-xs text-gray-400">{doctorInfo.specialty}</p>
            </div>
          </div>
          <div className="h-6 w-px bg-white/20" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm text-white font-mono">{formatTime(sessionTime)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 비디오 영역 */}
        <div className="flex-1 relative bg-black">
          {/* 의사 비디오 (메인) */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
            <div className="text-center">
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[var(--manpasik-primary)] to-[var(--manpasik-secondary)] flex items-center justify-center mb-4 mx-auto">
                <span className="text-7xl">{doctorInfo.image}</span>
              </div>
              <p className="text-white font-medium">{doctorInfo.name}</p>
              <p className="text-gray-400 text-sm">화상 연결됨</p>
            </div>
          </div>

          {/* 내 비디오 (PIP) */}
          <div className="absolute bottom-4 right-4 w-48 h-36 rounded-xl bg-gray-800 border-2 border-white/20 overflow-hidden shadow-2xl">
            {isVideoOff ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <VideoOff className="w-8 h-8 text-gray-500" />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                <div className="w-16 h-16 rounded-full bg-[var(--manpasik-primary)] flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
              </div>
            )}
            <div className="absolute bottom-2 left-2 flex items-center gap-1">
              {isMuted && <MicOff className="w-4 h-4 text-red-400" />}
            </div>
          </div>

          {/* 실시간 바이탈 오버레이 */}
          <div className="absolute top-4 left-4">
            <button
              onClick={() => setIsVitalsOpen(!isVitalsOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/50 backdrop-blur-sm text-white text-sm hover:bg-black/70 transition-colors"
            >
              <Heart className="w-4 h-4 text-red-400" />
              <span>실시간 바이탈</span>
              {isVitalsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {isVitalsOpen && (
              <div className="mt-2 p-4 rounded-xl bg-black/70 backdrop-blur-sm space-y-3 w-64">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span className="text-gray-400 text-sm">심박수</span>
                  </div>
                  <span className="text-white font-mono">{Math.round(vitals.heartRate)} bpm</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-400 text-sm">혈압</span>
                  </div>
                  <span className="text-white font-mono">
                    {Math.round(vitals.bloodPressure.systolic)}/{Math.round(vitals.bloodPressure.diastolic)} mmHg
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🩸</span>
                    <span className="text-gray-400 text-sm">혈당</span>
                  </div>
                  <span className="text-white font-mono">{vitals.glucose} mg/dL</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">💨</span>
                    <span className="text-gray-400 text-sm">산소포화도</span>
                  </div>
                  <span className="text-white font-mono">{Math.round(vitals.spo2)}%</span>
                </div>
              </div>
            )}
          </div>

          {/* 최근 측정 데이터 */}
          <div className="absolute top-4 right-4 w-64">
            <div className="p-4 rounded-xl bg-black/70 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-[var(--manpasik-primary)]" />
                <span className="text-white text-sm font-medium">최근 측정 데이터</span>
              </div>
              <div className="space-y-2">
                {recentMeasurements.map((m, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{m.type}</span>
                    <span className="text-white">
                      {m.value} <span className="text-gray-500">{m.unit}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 채팅 사이드바 */}
        {isChatOpen && (
          <div className="w-80 bg-black/30 backdrop-blur-sm border-l border-white/10 flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-white font-medium">채팅</h3>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "max-w-[85%]",
                    msg.role === "user" ? "ml-auto" : "",
                    msg.role === "system" ? "mx-auto text-center" : ""
                  )}
                >
                  {msg.role === "system" ? (
                    <p className="text-xs text-gray-500">{msg.content}</p>
                  ) : (
                    <div
                      className={cn(
                        "p-3 rounded-2xl text-sm",
                        msg.role === "user"
                          ? "bg-[var(--manpasik-primary)] text-white rounded-br-sm"
                          : "bg-white/10 text-white rounded-bl-sm"
                      )}
                    >
                      <p>{msg.content}</p>
                      <p className="text-xs opacity-60 mt-1">
                        {msg.timestamp.toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendChat()}
                  placeholder="메시지 입력..."
                  className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--manpasik-primary)]"
                />
                <button
                  onClick={handleSendChat}
                  className="p-2 rounded-xl bg-[var(--manpasik-primary)] text-white hover:bg-[var(--manpasik-primary)]/80 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 하단 컨트롤바 */}
      <div className="h-20 px-6 flex items-center justify-center gap-4 bg-black/50 backdrop-blur-sm border-t border-white/10">
        {/* 마이크 */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center transition-all",
            isMuted
              ? "bg-red-500 text-white"
              : "bg-white/10 text-white hover:bg-white/20"
          )}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        {/* 카메라 */}
        <button
          onClick={() => setIsVideoOff(!isVideoOff)}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center transition-all",
            isVideoOff
              ? "bg-red-500 text-white"
              : "bg-white/10 text-white hover:bg-white/20"
          )}
        >
          {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </button>

        {/* 화면 공유 */}
        <button
          onClick={() => setIsScreenSharing(!isScreenSharing)}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center transition-all",
            isScreenSharing
              ? "bg-[var(--manpasik-primary)] text-white"
              : "bg-white/10 text-white hover:bg-white/20"
          )}
        >
          <MonitorUp className="w-6 h-6" />
        </button>

        {/* 스피커 */}
        <button
          onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center transition-all",
            isSpeakerMuted
              ? "bg-yellow-500 text-white"
              : "bg-white/10 text-white hover:bg-white/20"
          )}
        >
          {isSpeakerMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>

        <div className="w-px h-8 bg-white/20 mx-2" />

        {/* 채팅 */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center transition-all",
            isChatOpen
              ? "bg-[var(--manpasik-primary)] text-white"
              : "bg-white/10 text-white hover:bg-white/20"
          )}
        >
          <MessageSquare className="w-6 h-6" />
        </button>

        <div className="w-px h-8 bg-white/20 mx-2" />

        {/* 통화 종료 */}
        <button
          onClick={handleEndCall}
          className="w-14 h-14 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all flex items-center justify-center"
        >
          <Phone className="w-6 h-6 rotate-[135deg]" />
        </button>
      </div>
    </div>
  );
}

