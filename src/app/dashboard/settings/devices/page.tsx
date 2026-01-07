"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  Plus,
  Settings,
  Battery,
  Wifi,
  WifiOff,
  RefreshCw,
  Trash2,
  Download,
  Bluetooth,
  Info,
} from "lucide-react";

// 연결된 기기 데이터
const mockDevices = [
  {
    id: "mps-001",
    name: "만파식 리더기 #1",
    serial: "MPS-2024-001234",
    model: "MPS-PRO",
    firmware: "v2.3.1",
    battery: 85,
    status: "online" as const,
    lastSync: "2분 전",
    capabilities: ["혈당", "케톤", "콜레스테롤", "라돈", "VOCs"],
    purchaseDate: "2024-06-15",
    warrantyUntil: "2026-06-15",
  },
  {
    id: "mps-002",
    name: "만파식 리더기 #2",
    serial: "MPS-2024-005678",
    model: "MPS-LITE",
    firmware: "v2.3.0",
    battery: 42,
    status: "offline" as const,
    lastSync: "3시간 전",
    capabilities: ["혈당", "케톤"],
    purchaseDate: "2024-12-01",
    warrantyUntil: "2026-12-01",
  },
];

type DeviceStatus = "online" | "offline";

export default function DevicesSettingsPage() {
  const [devices, setDevices] = useState(mockDevices);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const handleSync = (deviceId: string) => {
    // 동기화 시뮬레이션
    console.log("Syncing device:", deviceId);
  };

  const handleRemove = (deviceId: string) => {
    if (confirm("정말로 이 기기를 삭제하시겠습니까?")) {
      setDevices(devices.filter((d) => d.id !== deviceId));
    }
  };

  const startScanning = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      alert("새 기기가 발견되지 않았습니다. 리더기의 전원이 켜져있는지 확인해주세요.");
    }, 3000);
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
            <h1 className="text-3xl font-bold text-white mb-2">연결된 기기</h1>
            <p className="text-gray-400">
              만파식 리더기를 관리하고 설정하세요
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-manpasik-primary text-white font-medium flex items-center gap-2 hover:bg-manpasik-primary/80 transition-colors"
          >
            <Plus className="w-5 h-5" />
            새 기기 추가
          </button>
        </div>
      </div>

      {/* 기기 목록 */}
      <div className="space-y-4 mb-8">
        {devices.map((device) => (
          <div
            key={device.id}
            className={cn(
              "glass rounded-2xl overflow-hidden transition-all",
              selectedDevice === device.id && "ring-2 ring-manpasik-primary"
            )}
          >
            {/* 기기 기본 정보 */}
            <div
              className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() =>
                setSelectedDevice(
                  selectedDevice === device.id ? null : device.id
                )
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center",
                      device.status === "online"
                        ? "bg-green-500/20"
                        : "bg-gray-500/20"
                    )}
                  >
                    <Bluetooth
                      className={cn(
                        "w-7 h-7",
                        device.status === "online"
                          ? "text-green-400"
                          : "text-gray-400"
                      )}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {device.name}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {device.serial} • {device.model}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    {device.status === "online" ? (
                      <Wifi className="w-4 h-4 text-green-400" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-gray-400" />
                    )}
                    <span
                      className={
                        device.status === "online"
                          ? "text-green-400"
                          : "text-gray-400"
                      }
                    >
                      {device.status === "online" ? "온라인" : "오프라인"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Battery
                      className={cn(
                        "w-4 h-4",
                        device.battery > 20 ? "text-green-400" : "text-red-400"
                      )}
                    />
                    <span className="text-gray-300">{device.battery}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 기기 상세 정보 */}
            {selectedDevice === device.id && (
              <div className="px-6 pb-6 border-t border-white/10">
                <div className="pt-6 grid md:grid-cols-2 gap-6">
                  {/* 왼쪽: 정보 */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">
                        기기 정보
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">펌웨어 버전</span>
                          <span className="text-white">{device.firmware}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">마지막 동기화</span>
                          <span className="text-white">{device.lastSync}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">구매일</span>
                          <span className="text-white">
                            {device.purchaseDate}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">보증 만료일</span>
                          <span className="text-white">
                            {device.warrantyUntil}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">
                        지원 측정 항목
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {device.capabilities.map((cap) => (
                          <span
                            key={cap}
                            className="px-3 py-1 rounded-lg bg-manpasik-primary/20 text-manpasik-primary text-sm"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 오른쪽: 액션 */}
                  <div className="space-y-3">
                    <button
                      onClick={() => handleSync(device.id)}
                      className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center gap-3 transition-colors"
                    >
                      <RefreshCw className="w-5 h-5 text-manpasik-primary" />
                      <span>데이터 동기화</span>
                    </button>
                    <button className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center gap-3 transition-colors">
                      <Download className="w-5 h-5 text-manpasik-secondary" />
                      <span>펌웨어 업데이트</span>
                    </button>
                    <button className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center gap-3 transition-colors">
                      <Settings className="w-5 h-5 text-gray-400" />
                      <span>기기 설정</span>
                    </button>
                    <button className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center gap-3 transition-colors">
                      <Info className="w-5 h-5 text-gray-400" />
                      <span>진단 로그</span>
                    </button>
                    <button
                      onClick={() => handleRemove(device.id)}
                      className="w-full p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center gap-3 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                      <span>기기 삭제</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 기기 추가 안내 */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          새 리더기 연결하기
        </h3>
        <div className="space-y-4 text-gray-300">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-manpasik-primary/20 text-manpasik-primary flex items-center justify-center text-sm font-bold">
              1
            </span>
            <p>만파식 리더기의 전원을 켜고 Bluetooth를 활성화하세요.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-manpasik-primary/20 text-manpasik-primary flex items-center justify-center text-sm font-bold">
              2
            </span>
            <p>스마트폰의 Bluetooth가 활성화되어 있는지 확인하세요.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-manpasik-primary/20 text-manpasik-primary flex items-center justify-center text-sm font-bold">
              3
            </span>
            <p>&quot;새 기기 추가&quot; 버튼을 누르고 화면의 안내를 따라주세요.</p>
          </div>
        </div>
        <button
          onClick={startScanning}
          disabled={isScanning}
          className="mt-6 w-full py-3 rounded-xl bg-manpasik-primary text-white font-medium flex items-center justify-center gap-2 hover:bg-manpasik-primary/80 transition-colors disabled:opacity-50"
        >
          {isScanning ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              기기 검색 중...
            </>
          ) : (
            <>
              <Bluetooth className="w-5 h-5" />
              주변 기기 검색
            </>
          )}
        </button>
      </div>
    </div>
  );
}

