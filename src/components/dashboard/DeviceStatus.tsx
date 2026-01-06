"use client";

import { cn } from "@/lib/utils";
import {
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  BatteryCharging,
  RefreshCw,
  Settings,
  Cpu,
  Zap,
} from "lucide-react";
import { useState } from "react";

interface Device {
  id: string;
  name: string;
  serial: string;
  status: "online" | "offline" | "syncing";
  battery: number;
  isCharging?: boolean;
  firmware: string;
  lastSync: string;
  signalStrength?: number; // 0-100
}

interface DeviceStatusProps {
  className?: string;
}

// 배터리 아이콘 선택
const getBatteryIcon = (level: number, isCharging?: boolean) => {
  if (isCharging) return BatteryCharging;
  if (level <= 20) return BatteryLow;
  if (level <= 50) return BatteryMedium;
  return BatteryFull;
};

// 배터리 색상
const getBatteryColor = (level: number) => {
  if (level <= 20) return "text-red-400";
  if (level <= 50) return "text-yellow-400";
  return "text-green-400";
};

export default function DeviceStatus({ className }: DeviceStatusProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 샘플 데이터
  const device: Device = {
    id: "1",
    name: "MPK-Reader-Alpha",
    serial: "MPS-2026-A001",
    status: "online",
    battery: 85,
    isCharging: false,
    firmware: "v2.1.0",
    lastSync: "방금 전",
    signalStrength: 92,
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const statusConfig = {
    online: {
      label: "온라인",
      color: "text-green-400",
      bg: "bg-green-500",
      icon: Wifi,
    },
    offline: {
      label: "오프라인",
      color: "text-gray-400",
      bg: "bg-gray-500",
      icon: WifiOff,
    },
    syncing: {
      label: "동기화 중",
      color: "text-blue-400",
      bg: "bg-blue-500",
      icon: RefreshCw,
    },
  };

  const status = statusConfig[device.status];
  const BatteryIcon = getBatteryIcon(device.battery, device.isCharging);
  const StatusIcon = status.icon;

  return (
    <div
      className={cn(
        "p-6 rounded-2xl",
        "bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]",
        className
      )}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">연결된 기기</h3>
          <p className="text-sm text-gray-400">만파식 리더기 상태</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
        >
          <RefreshCw className={cn("w-5 h-5", isRefreshing && "animate-spin")} />
        </button>
      </div>

      {/* 기기 이미지 & 상태 */}
      <div className="relative mb-6">
        {/* 기기 일러스트 */}
        <div className="relative w-full h-40 rounded-2xl bg-gradient-to-br from-[var(--manpasik-primary)]/20 to-[var(--manpasik-secondary)]/20 border border-white/10 flex items-center justify-center overflow-hidden">
          {/* 배경 그리드 패턴 */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* 기기 아이콘 */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-manpasik-gradient flex items-center justify-center shadow-2xl shadow-[var(--manpasik-primary)]/40">
              <Cpu className="w-12 h-12 text-white" />
            </div>
            {/* 연결 상태 인디케이터 */}
            <div
              className={cn(
                "absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center",
                device.status === "online" ? "bg-green-500" : "bg-gray-500",
                device.status === "online" && "animate-pulse"
              )}
            >
              <StatusIcon className="w-3 h-3 text-white" />
            </div>
          </div>

          {/* 신호 강도 표시 */}
          {device.signalStrength && device.status === "online" && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/30 text-xs text-white">
              <Wifi className="w-3 h-3" />
              {device.signalStrength}%
            </div>
          )}
        </div>
      </div>

      {/* 기기 정보 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-white">{device.name}</h4>
          <div
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
              status.color,
              `${status.bg}/20`
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", status.bg, device.status === "online" && "animate-pulse")} />
            {status.label}
          </div>
        </div>
        <p className="text-sm text-gray-400">{device.serial}</p>
      </div>

      {/* 상태 그리드 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {/* 배터리 */}
        <div className="p-3 rounded-xl bg-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">배터리</span>
            <BatteryIcon className={cn("w-4 h-4", getBatteryColor(device.battery))} />
          </div>
          <p className={cn("text-xl font-bold", getBatteryColor(device.battery))}>
            {device.battery}%
          </p>
          {device.isCharging && (
            <div className="flex items-center gap-1 text-xs text-green-400 mt-1">
              <Zap className="w-3 h-3" />
              충전 중
            </div>
          )}
        </div>

        {/* 펌웨어 */}
        <div className="p-3 rounded-xl bg-white/5">
          <span className="text-xs text-gray-400 block mb-2">펌웨어</span>
          <p className="text-lg font-bold text-white">{device.firmware}</p>
          <p className="text-xs text-green-400 mt-1">최신</p>
        </div>

        {/* 마지막 동기화 */}
        <div className="p-3 rounded-xl bg-white/5">
          <span className="text-xs text-gray-400 block mb-2">동기화</span>
          <p className="text-lg font-bold text-white">{device.lastSync}</p>
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div className="flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--manpasik-primary)]/20 text-[var(--manpasik-primary)] hover:bg-[var(--manpasik-primary)]/30 transition-colors text-sm font-medium">
          <RefreshCw className="w-4 h-4" />
          동기화
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium">
          <Settings className="w-4 h-4" />
          설정
        </button>
      </div>
    </div>
  );
}
