import HealthSummary from "@/components/dashboard/HealthSummary";
import DeviceStatus from "@/components/dashboard/DeviceStatus";

export default function DashboardPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">관제 센터</h1>
        <p className="text-gray-400">
          오늘의 건강 상태와 연결된 기기를 확인하세요
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Health Summary Panel */}
        <HealthSummary />

        {/* Device Status Panel */}
        <DeviceStatus />
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-4">빠른 작업</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="glass rounded-xl p-4 text-left hover:border-manpasik-primary/50 transition-all duration-200 group">
            <div className="w-10 h-10 rounded-lg bg-manpasik-primary/20 flex items-center justify-center mb-3 group-hover:bg-manpasik-primary/30 transition-colors">
              <svg className="w-5 h-5 text-manpasik-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="font-medium text-white">새 측정 시작</p>
            <p className="text-sm text-gray-400">리더기로 측정을 시작합니다</p>
          </button>

          <button className="glass rounded-xl p-4 text-left hover:border-manpasik-secondary/50 transition-all duration-200 group">
            <div className="w-10 h-10 rounded-lg bg-manpasik-secondary/20 flex items-center justify-center mb-3 group-hover:bg-manpasik-secondary/30 transition-colors">
              <svg className="w-5 h-5 text-manpasik-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="font-medium text-white">리포트 보기</p>
            <p className="text-sm text-gray-400">상세 건강 분석 리포트</p>
          </button>

          <button className="glass rounded-xl p-4 text-left hover:border-manpasik-accent/50 transition-all duration-200 group">
            <div className="w-10 h-10 rounded-lg bg-manpasik-accent/20 flex items-center justify-center mb-3 group-hover:bg-manpasik-accent/30 transition-colors">
              <svg className="w-5 h-5 text-manpasik-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <p className="font-medium text-white">기기 연결</p>
            <p className="text-sm text-gray-400">새 리더기를 등록합니다</p>
          </button>

          <button className="glass rounded-xl p-4 text-left hover:border-amber-500/50 transition-all duration-200 group">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center mb-3 group-hover:bg-amber-500/30 transition-colors">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="font-medium text-white">알림 설정</p>
            <p className="text-sm text-gray-400">맞춤 알림을 설정합니다</p>
          </button>
        </div>
      </div>
    </div>
  );
}
