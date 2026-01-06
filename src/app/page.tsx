import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        {/* Logo & Title */}
        <div className="mb-8 animate-pulse-slow">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-manpasik-gradient flex items-center justify-center shadow-lg shadow-manpasik-primary/30">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold bg-manpasik-gradient bg-clip-text text-transparent mb-4">
            만파식
            <span className="text-2xl md:text-3xl ml-2 opacity-70">(MPS)</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300">
            Manpasik Healthcare Platform
          </p>
        </div>

        {/* Vision Statement */}
        <p className="max-w-2xl text-lg md:text-xl text-gray-400 mb-12 leading-relaxed">
          <span className="text-manpasik-primary font-semibold">홍익인간(弘益人間)</span>의 이념을 기술로 구현합니다.
          <br />
          전 세계를 연결하는 <span className="text-manpasik-secondary font-semibold">하드웨어 제어</span> 및{" "}
          <span className="text-manpasik-accent font-semibold">헬스케어 플랫폼</span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/auth"
            className="px-8 py-4 rounded-xl bg-manpasik-gradient text-white font-semibold text-lg shadow-lg shadow-manpasik-primary/30 hover:shadow-manpasik-primary/50 transition-all duration-300 hover:scale-105"
          >
            시작하기
          </Link>
          <a
            href="#features"
            className="px-8 py-4 rounded-xl glass glass-hover text-white font-semibold text-lg transition-all duration-300"
          >
            더 알아보기
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-manpasik-gradient bg-clip-text text-transparent">
            핵심 기능
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass rounded-2xl p-8 hover:border-manpasik-primary/50 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-manpasik-primary/20 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-manpasik-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">실시간 건강 모니터링</h3>
              <p className="text-gray-400">
                만파식 리더기와 연동하여 혈당, 콜레스테롤 등 다양한 건강 지표를 실시간으로 측정하고 관리합니다.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass rounded-2xl p-8 hover:border-manpasik-secondary/50 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-manpasik-secondary/20 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-manpasik-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">AI 기반 분석</h3>
              <p className="text-gray-400">
                축적된 데이터를 AI가 분석하여 개인 맞춤형 건강 인사이트와 예측 정보를 제공합니다.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass rounded-2xl p-8 hover:border-manpasik-accent/50 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-manpasik-accent/20 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-manpasik-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">글로벌 커뮤니티</h3>
              <p className="text-gray-400">
                전 세계 사용자들과 건강 정보를 공유하고, 함께 더 건강한 미래를 만들어갑니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center text-gray-500">
          <p>&copy; 2026 만파식(Manpasik). 홍익인간의 기술.</p>
        </div>
      </footer>
    </main>
  );
}
