"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Home,
  Activity,
  Cpu,
  Users,
  Settings,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { name: "홈", href: "/dashboard", icon: Home },
  { name: "측정하기", href: "/dashboard/measure", icon: Activity },
  { name: "기기 관리", href: "/dashboard/devices", icon: Cpu },
  { name: "커뮤니티", href: "/dashboard/community", icon: Users },
  { name: "설정", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Supabase가 설정되지 않은 경우 데모 모드로 실행
      if (!isSupabaseConfigured) {
        setUserEmail("demo@manpasik.com");
        setUserName("데모 사용자");
        setIsLoading(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth");
      } else {
        setUserEmail(session.user.email || null);
        setUserName(session.user.user_metadata?.name || session.user.email?.split("@")[0] || null);
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // 사이드바 외부 클릭 시 닫기
  const closeSidebar = () => setIsSidebarOpen(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[var(--manpasik-primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* 모바일 오버레이 */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* 사이드바 */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50",
          "w-72 lg:w-64 flex flex-col",
          "bg-[var(--manpasik-deep-ocean)]/95 backdrop-blur-xl",
          "border-r border-white/10",
          "transform transition-transform duration-300 ease-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* 로고 */}
        <div className="p-6 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={closeSidebar}>
            <div className="w-10 h-10 rounded-xl bg-manpasik-gradient flex items-center justify-center shadow-lg shadow-[var(--manpasik-primary)]/30">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-manpasik-gradient bg-clip-text text-transparent">
              만파식
            </span>
          </Link>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeSidebar}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                      "group relative overflow-hidden",
                      isActive
                        ? "bg-[var(--manpasik-primary)]/20 text-[var(--manpasik-primary)]"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--manpasik-primary)] rounded-r-full" />
                    )}
                    <Icon className={cn("w-5 h-5", isActive && "text-[var(--manpasik-primary)]")} />
                    <span className="font-medium">{item.name}</span>
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 유저 섹션 */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/5">
            <div className="w-10 h-10 rounded-full bg-manpasik-gradient flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">
                {userName?.charAt(0).toUpperCase() || userEmail?.charAt(0).toUpperCase() || "?"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {userName || "사용자"}
              </p>
              <p className="text-xs text-gray-400 truncate">{userEmail}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* 헤더 */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 lg:px-8 bg-[var(--manpasik-deep-ocean)]/80 backdrop-blur-xl border-b border-white/10">
          {/* 모바일 메뉴 버튼 */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* 페이지 타이틀 (모바일) */}
          <div className="lg:hidden">
            <span className="text-lg font-bold bg-manpasik-gradient bg-clip-text text-transparent">
              만파식
            </span>
          </div>

          {/* 검색바 (데스크탑) */}
          <div className="hidden lg:flex flex-1 max-w-md">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="검색..."
                className="w-full px-4 py-2 pl-10 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--manpasik-primary)] transition-colors"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* 우측 아이콘들 */}
          <div className="flex items-center gap-2">
            {/* 알림 */}
            <button className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>

            {/* 프로필 (데스크탑) */}
            <div className="hidden lg:flex items-center gap-3 ml-4 pl-4 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-manpasik-gradient flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {userName?.charAt(0).toUpperCase() || "?"}
                </span>
              </div>
              <span className="text-sm font-medium text-white">
                {userName || "사용자"}
              </span>
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
