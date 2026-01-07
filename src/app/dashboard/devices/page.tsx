"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button, Input, Modal } from "@/components/ui";
import {
  Plus,
  Cpu,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  Settings,
  Trash2,
  RefreshCw,
  MoreVertical,
  CheckCircle,
  XCircle,
  Zap,
  Signal,
} from "lucide-react";

interface Device {
  id: string;
  name: string;
  model: string;
  serial: string;
  status: "online" | "offline" | "error";
  battery: number;
  firmware: string;
  lastSync: string;
  registeredAt: string;
  signalStrength?: number;
}

// 더미 기기 데이터
const mockDevices: Device[] = [
  {
    id: "1",
    name: "거실 리더기",
    model: "MPK-Reader-Alpha",
    serial: "MPS-2026-A001",
    status: "online",
    battery: 85,
    firmware: "v2.1.0",
    lastSync: "방금 전",
    registeredAt: "2025-12-15",
    signalStrength: 92,
  },
  {
    id: "2",
    name: "침실 리더기",
    model: "MPK-Reader-Alpha",
    serial: "MPS-2026-A002",
    status: "online",
    battery: 62,
    firmware: "v2.1.0",
    lastSync: "5분 전",
    registeredAt: "2025-12-20",
    signalStrength: 78,
  },
  {
    id: "3",
    name: "사무실 리더기",
    model: "MPK-Reader-Beta",
    serial: "MPS-2026-B001",
    status: "offline",
    battery: 23,
    firmware: "v2.0.5",
    lastSync: "3일 전",
    registeredAt: "2026-01-02",
    signalStrength: 0,
  },
  {
    id: "4",
    name: "휴대용 리더기",
    model: "MPK-Reader-Mini",
    serial: "MPS-2026-M001",
    status: "error",
    battery: 45,
    firmware: "v1.9.8",
    lastSync: "1주일 전",
    registeredAt: "2026-01-05",
    signalStrength: 15,
  },
];

// 상태 설정
const statusConfig = {
  online: {
    label: "온라인",
    color: "text-green-400",
    bg: "bg-green-500",
    bgLight: "bg-green-500/20",
    icon: Wifi,
  },
  offline: {
    label: "오프라인",
    color: "text-gray-400",
    bg: "bg-gray-500",
    bgLight: "bg-gray-500/20",
    icon: WifiOff,
  },
  error: {
    label: "오류",
    color: "text-red-400",
    bg: "bg-red-500",
    bgLight: "bg-red-500/20",
    icon: XCircle,
  },
};

// 배터리 아이콘
const getBatteryIcon = (level: number) => {
  if (level <= 20) return BatteryLow;
  if (level <= 50) return BatteryMedium;
  return BatteryFull;
};

const getBatteryColor = (level: number) => {
  if (level <= 20) return "text-red-400";
  if (level <= 50) return "text-yellow-400";
  return "text-green-400";
};

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>(mockDevices);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSerial, setNewSerial] = useState("");
  const [newName, setNewName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // 새 기기 등록
  const handleRegisterDevice = async () => {
    if (!newSerial.trim()) return;

    setIsRegistering(true);
    
    // 시뮬레이션 딜레이
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newDevice: Device = {
      id: Date.now().toString(),
      name: newName || "새 리더기",
      model: "MPK-Reader-Alpha",
      serial: newSerial.toUpperCase(),
      status: "online",
      battery: 100,
      firmware: "v2.1.0",
      lastSync: "방금 전",
      registeredAt: new Date().toISOString().split("T")[0],
      signalStrength: 95,
    };

    setDevices([newDevice, ...devices]);
    setIsModalOpen(false);
    setNewSerial("");
    setNewName("");
    setIsRegistering(false);
  };

  // 기기 삭제
  const handleDeleteDevice = (id: string) => {
    setDevices(devices.filter((d) => d.id !== id));
    setActiveDropdown(null);
  };

  const onlineCount = devices.filter((d) => d.status === "online").length;
  const offlineCount = devices.filter((d) => d.status !== "online").length;

  return (
    <div className="p-4 lg:p-8">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">
            기기 관리
          </h1>
          <p className="text-gray-400">
            만파식 리더기를 등록하고 관리하세요
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-5 h-5" />}
        >
          새 기기 등록
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[var(--manpasik-primary)]/20 flex items-center justify-center">
              <Cpu className="w-6 h-6 text-[var(--manpasik-primary)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{devices.length}</p>
              <p className="text-sm text-gray-400">전체 기기</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Wifi className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{onlineCount}</p>
              <p className="text-sm text-gray-400">온라인</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gray-500/20 flex items-center justify-center">
              <WifiOff className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{offlineCount}</p>
              <p className="text-sm text-gray-400">오프라인</p>
            </div>
          </div>
        </div>
      </div>

      {/* 기기 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {devices.map((device) => {
          const status = statusConfig[device.status];
          const StatusIcon = status.icon;
          const BatteryIcon = getBatteryIcon(device.battery);

          return (
            <div
              key={device.id}
              className="relative rounded-2xl bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] overflow-hidden group"
            >
              {/* 기기 이미지 영역 */}
              <div className="relative h-40 bg-gradient-to-br from-[var(--manpasik-primary)]/20 to-[var(--manpasik-secondary)]/20 flex items-center justify-center overflow-hidden">
                {/* 배경 패턴 */}
                <div className="absolute inset-0 opacity-10">
                  <svg width="100%" height="100%">
                    <pattern id={`grid-${device.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
                    </pattern>
                    <rect width="100%" height="100%" fill={`url(#grid-${device.id})`} />
                  </svg>
                </div>

                {/* 기기 아이콘 */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-manpasik-gradient flex items-center justify-center shadow-2xl shadow-[var(--manpasik-primary)]/30">
                    <Cpu className="w-10 h-10 text-white" />
                  </div>
                  {/* 상태 인디케이터 */}
                  <div
                    className={cn(
                      "absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center",
                      status.bg,
                      device.status === "online" && "animate-pulse"
                    )}
                  >
                    <StatusIcon className="w-3 h-3 text-white" />
                  </div>
                </div>

                {/* 신호 강도 */}
                {device.status === "online" && device.signalStrength && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 text-xs text-white">
                    <Signal className="w-3 h-3" />
                    {device.signalStrength}%
                  </div>
                )}

                {/* 드롭다운 메뉴 버튼 */}
                <div className="absolute top-3 left-3">
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === device.id ? null : device.id)}
                    className="p-2 rounded-xl bg-black/40 text-white/70 hover:text-white hover:bg-black/60 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* 드롭다운 메뉴 */}
                  {activeDropdown === device.id && (
                    <div className="absolute top-10 left-0 w-40 py-2 rounded-xl bg-[var(--manpasik-deep-ocean)] border border-white/10 shadow-xl z-10">
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        동기화
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        설정
                      </button>
                      <hr className="my-2 border-white/10" />
                      <button
                        onClick={() => handleDeleteDevice(device.id)}
                        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 기기 정보 */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-white">{device.name}</h3>
                    <p className="text-sm text-gray-400">{device.model}</p>
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
                      status.color,
                      status.bgLight
                    )}
                  >
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        status.bg,
                        device.status === "online" && "animate-pulse"
                      )}
                    />
                    {status.label}
                  </div>
                </div>

                <p className="text-xs text-gray-500 mb-4 font-mono">{device.serial}</p>

                {/* 상태 그리드 */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-lg bg-white/5 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <BatteryIcon className={cn("w-3 h-3", getBatteryColor(device.battery))} />
                    </div>
                    <p className={cn("text-sm font-bold", getBatteryColor(device.battery))}>
                      {device.battery}%
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 text-center">
                    <p className="text-xs text-gray-500 mb-1">펌웨어</p>
                    <p className="text-sm font-bold text-white">{device.firmware}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 text-center">
                    <p className="text-xs text-gray-500 mb-1">동기화</p>
                    <p className="text-sm font-bold text-white truncate">{device.lastSync}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* 빈 카드 - 기기 추가 유도 */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="min-h-[300px] rounded-2xl border-2 border-dashed border-white/20 hover:border-[var(--manpasik-primary)]/50 flex flex-col items-center justify-center gap-4 transition-colors group"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/5 group-hover:bg-[var(--manpasik-primary)]/20 flex items-center justify-center transition-colors">
            <Plus className="w-8 h-8 text-gray-400 group-hover:text-[var(--manpasik-primary)]" />
          </div>
          <div className="text-center">
            <p className="font-medium text-gray-400 group-hover:text-white">새 기기 등록</p>
            <p className="text-sm text-gray-500">클릭하여 리더기 추가</p>
          </div>
        </button>
      </div>

      {/* 기기 등록 모달 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !isRegistering && setIsModalOpen(false)}
        title="새 기기 등록"
        description="만파식 리더기의 시리얼 번호를 입력하세요"
      >
        <div className="space-y-4">
          <Input
            label="기기 이름 (선택)"
            placeholder="예: 거실 리더기"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            leftIcon={<Cpu className="w-5 h-5" />}
          />
          <Input
            label="시리얼 번호"
            placeholder="예: MPS-2026-X001"
            value={newSerial}
            onChange={(e) => setNewSerial(e.target.value.toUpperCase())}
            leftIcon={<Zap className="w-5 h-5" />}
          />

          <div className="p-4 rounded-xl bg-[var(--manpasik-primary)]/10 border border-[var(--manpasik-primary)]/20">
            <p className="text-sm text-gray-300">
              <strong className="text-[var(--manpasik-primary)]">시리얼 번호</strong>는 
              기기 뒷면 또는 포장 박스에서 확인할 수 있습니다.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
              disabled={isRegistering}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              onClick={handleRegisterDevice}
              isLoading={isRegistering}
              disabled={!newSerial.trim()}
              className="flex-1"
              leftIcon={<CheckCircle className="w-5 h-5" />}
            >
              등록하기
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


