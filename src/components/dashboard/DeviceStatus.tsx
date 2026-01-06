export default function DeviceStatus() {
  // 샘플 데이터 (실제로는 Supabase에서 가져옴)
  const devices = [
    {
      id: "1",
      name: "만파식 리더기 #1",
      serial: "MPS-2026-A001",
      status: "online" as const,
      firmware: "v2.1.0",
      battery: 85,
      lastSync: "방금 전",
      cartridge: {
        type: "혈당",
        remaining: 42,
        total: 50,
      },
    },
    {
      id: "2",
      name: "만파식 리더기 #2",
      serial: "MPS-2026-A002",
      status: "offline" as const,
      firmware: "v2.0.5",
      battery: 23,
      lastSync: "3일 전",
      cartridge: {
        type: "콜레스테롤",
        remaining: 8,
        total: 50,
      },
    },
  ];

  const statusConfig = {
    online: { label: "온라인", color: "text-green-400", bg: "bg-green-500" },
    offline: { label: "오프라인", color: "text-gray-400", bg: "bg-gray-500" },
    error: { label: "오류", color: "text-red-400", bg: "bg-red-500" },
  };

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">연결된 리더기</h2>
          <p className="text-gray-400 text-sm">{devices.length}개의 기기 등록됨</p>
        </div>
        <button className="px-4 py-2 rounded-xl bg-manpasik-primary/20 text-manpasik-primary hover:bg-manpasik-primary/30 transition-colors text-sm font-medium">
          + 기기 추가
        </button>
      </div>

      {/* Device List */}
      <div className="space-y-4">
        {devices.map((device) => {
          const status = statusConfig[device.status];
          const cartridgePercent = (device.cartridge.remaining / device.cartridge.total) * 100;
          const isLowCartridge = cartridgePercent < 20;
          const isLowBattery = device.battery < 30;

          return (
            <div
              key={device.id}
              className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 border border-transparent hover:border-white/10"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-manpasik-gradient flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-white">{device.name}</p>
                    <p className="text-sm text-gray-400">{device.serial}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${status.bg} ${device.status === "online" ? "animate-pulse" : ""}`}></span>
                  <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                {/* Battery */}
                <div className="p-3 rounded-lg bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">배터리</span>
                    {isLowBattery && (
                      <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                  </div>
                  <p className={`text-lg font-bold ${isLowBattery ? "text-amber-400" : "text-white"}`}>
                    {device.battery}%
                  </p>
                </div>

                {/* Cartridge */}
                <div className="p-3 rounded-lg bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">카트리지</span>
                    {isLowCartridge && (
                      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                  </div>
                  <p className={`text-lg font-bold ${isLowCartridge ? "text-red-400" : "text-white"}`}>
                    {device.cartridge.remaining}/{device.cartridge.total}
                  </p>
                  <p className="text-xs text-gray-400">{device.cartridge.type}</p>
                </div>

                {/* Last Sync */}
                <div className="p-3 rounded-lg bg-white/5">
                  <span className="text-xs text-gray-400 block mb-2">마지막 동기화</span>
                  <p className="text-lg font-bold text-white">{device.lastSync}</p>
                  <p className="text-xs text-gray-400">{device.firmware}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <button className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors text-sm font-medium">
                  동기화
                </button>
                <button className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors text-sm font-medium">
                  설정
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State (hidden when devices exist) */}
      {devices.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <p className="text-gray-400 mb-4">연결된 기기가 없습니다</p>
          <button className="px-6 py-2 rounded-xl bg-manpasik-gradient text-white font-medium hover:shadow-lg hover:shadow-manpasik-primary/30 transition-all">
            첫 번째 기기 연결하기
          </button>
        </div>
      )}
    </div>
  );
}
