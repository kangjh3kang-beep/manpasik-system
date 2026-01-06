"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          홈으로 돌아가기
        </Link>

        {/* Auth Card */}
        <div className="glass rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-manpasik-gradient flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">만파식에 오신 것을 환영합니다</h1>
            <p className="text-gray-400">계정에 로그인하거나 새로 가입하세요</p>
          </div>

          {/* Supabase Auth UI */}
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "#0ea5e9",
                    brandAccent: "#0284c7",
                    inputBackground: "rgba(255, 255, 255, 0.05)",
                    inputText: "white",
                    inputPlaceholder: "rgb(156, 163, 175)",
                    inputBorder: "rgba(255, 255, 255, 0.1)",
                    inputBorderHover: "rgba(14, 165, 233, 0.5)",
                    inputBorderFocus: "#0ea5e9",
                  },
                  borderWidths: {
                    buttonBorderWidth: "0px",
                    inputBorderWidth: "1px",
                  },
                  radii: {
                    borderRadiusButton: "12px",
                    buttonBorderRadius: "12px",
                    inputBorderRadius: "12px",
                  },
                },
              },
              className: {
                button: "!font-semibold",
                input: "!bg-white/5",
                label: "!text-gray-300",
                anchor: "!text-manpasik-primary hover:!text-manpasik-secondary",
              },
            }}
            providers={["google", "github"]}
            redirectTo={`${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`}
            localization={{
              variables: {
                sign_in: {
                  email_label: "이메일",
                  password_label: "비밀번호",
                  button_label: "로그인",
                  social_provider_text: "{{provider}}로 로그인",
                  link_text: "이미 계정이 있으신가요? 로그인",
                },
                sign_up: {
                  email_label: "이메일",
                  password_label: "비밀번호",
                  button_label: "회원가입",
                  social_provider_text: "{{provider}}로 회원가입",
                  link_text: "계정이 없으신가요? 회원가입",
                },
              },
            }}
          />
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-8">
          로그인하면 만파식의{" "}
          <a href="#" className="text-manpasik-primary hover:underline">
            이용약관
          </a>{" "}
          및{" "}
          <a href="#" className="text-manpasik-primary hover:underline">
            개인정보 처리방침
          </a>
          에 동의하게 됩니다.
        </p>
      </div>
    </main>
  );
}
