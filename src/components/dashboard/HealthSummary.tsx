export default function HealthSummary() {
  // 샘플 데이터 (실제로는 Supabase에서 가져옴)
  const healthMetrics = [
    {
      name: "혈당",
      value: 98,
      unit: "mg/dL",
      status: "정상",
      statusColor: "text-green-400",
      bgColor: "bg-green-500/20",
      trend: "+2%",
      trendUp: true,
    },
    {
      name: "콜레스테롤",
      value: 185,
      unit: "mg/dL",
      status: "정상",
      statusColor: "text-green-400",
      bgColor: "bg-green-500/20",
      trend: "-5%",
      trendUp: false,
    },
    {
      name: "헤모글로빈",
      value: 14.2,
      unit: "g/dL",
      status: "정상",
      statusColor: "text-green-400",
      bgColor: "bg-green-500/20",
      trend: "0%",
      trendUp: false,
    },
  ];

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">오늘의 건강 요약</h2>
          <p className="text-gray-400 text-sm">2026년 1월 6일 기준</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          전체 정상
        </div>
      </div>

      {/* Health Score */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-manpasik-primary/20 to-manpasik-secondary/20 border border-manpasik-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-1">건강 점수</p>
            <p className="text-4xl font-bold bg-manpasik-gradient bg-clip-text text-transparent">
              85
            </p>
          </div>
          <div className="w-20 h-20 relative">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="35"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="35"
                stroke="url(#gradient)"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${85 * 2.2} 220`}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">
              85
            </span>
          </div>
        </div>
      </div>

      {/* Metrics List */}
      <div className="space-y-4">
        {healthMetrics.map((metric) => (
          <div
            key={metric.name}
            className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${metric.bgColor} flex items-center justify-center`}>
                <svg className={`w-5 h-5 ${metric.statusColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-white">{metric.name}</p>
                <p className={`text-sm ${metric.statusColor}`}>{metric.status}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-white">
                {metric.value} <span className="text-gray-400 font-normal text-sm">{metric.unit}</span>
              </p>
              <p className={`text-sm ${metric.trendUp ? "text-red-400" : "text-green-400"}`}>
                {metric.trend}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* View More Button */}
      <button className="w-full mt-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-200 font-medium">
        전체 기록 보기
      </button>
    </div>
  );
}
