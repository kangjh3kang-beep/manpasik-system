"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { Download, X } from "lucide-react";

export default function PWARegister() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Service Worker 등록
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[PWA] Service Worker 등록 완료:", registration.scope);
        })
        .catch((error) => {
          console.error("[PWA] Service Worker 등록 실패:", error);
        });
    }

    // PWA 설치 프롬프트 이벤트 캡처
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // 이미 설치되지 않은 경우에만 프롬프트 표시
      if (!isInstalled) {
        setShowInstallPrompt(true);
      }
    };

    // 이미 설치된 경우 감지
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      console.log("[PWA] 앱 설치 완료!");
    };

    // 독립 실행 모드 확인
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // 설치 프롬프트 표시
    deferredPrompt.prompt();

    // 사용자 선택 대기
    const { outcome } = await deferredPrompt.userChoice;
    console.log("[PWA] 사용자 선택:", outcome);

    // 프롬프트 초기화
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // 24시간 후 다시 표시
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
  };

  // 설치 프롬프트가 없거나 이미 설치된 경우 렌더링하지 않음
  if (!showInstallPrompt || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="bg-[var(--manpasik-deep-ocean)] border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start gap-4">
          {/* 아이콘 */}
          <div className="w-12 h-12 rounded-xl bg-manpasik-gradient flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6 text-white" />
          </div>

          {/* 내용 */}
          <div className="flex-1">
            <h3 className="font-bold text-white mb-1">앱으로 설치하기</h3>
            <p className="text-sm text-gray-400 mb-3">
              홈 화면에 만파식을 추가하면 더 빠르게 접근할 수 있습니다.
            </p>

            <div className="flex gap-2">
              <Button size="sm" onClick={handleInstall}>
                설치하기
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                나중에
              </Button>
            </div>
          </div>

          {/* 닫기 버튼 */}
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

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
    </div>
  );
}


