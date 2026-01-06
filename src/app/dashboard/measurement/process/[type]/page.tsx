"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// 측정 타입별 정보
const measurementInfo: Record<string, {
  name: string;
  icon: string;
  unit: string;
  time: number;
  instructions: string[];
  normalRange: { min: number; max: number };
}> = {
  glucose: {
    name: "혈당",
    icon: "🩸",
    unit: "mg/dL",
    time: 5,
    instructions: [
      "깨끗한 손으로 혈당 카트리지를 리더기에 삽입하세요",
      "손가락 끝을 알코올 솜으로 소독하세요",
      "채혈침으로 손가락 끝을 가볍게 찔러 혈액을 채취하세요",
      "혈액 한 방울을 카트리지의 시료 투입구에 떨어뜨리세요",
    ],
    normalRange: { min: 70, max: 100 },
  },
  ketone: {
    name: "케톤체",
    icon: "⚡",
    unit: "mmol/L",
    time: 10,
    instructions: [
      "케톤체 카트리지를 리더기에 삽입하세요",
      "손가락 끝을 소독 후 채혈하세요",
      "혈액 한 방울을 시료 투입구에 떨어뜨리세요",
    ],
    normalRange: { min: 0, max: 0.6 },
  },
  cholesterol: {
    name: "콜레스테롤",
    icon: "🫀",
    unit: "mg/dL",
    time: 180,
    instructions: [
      "콜레스테롤 카트리지를 삽입하세요",
      "12시간 공복 상태를 권장합니다",
      "채혈 후 시료를 투입하세요",
    ],
    normalRange: { min: 0, max: 200 },
  },
  radon: {
    name: "라돈",
    icon: "☢️",
    unit: "Bq/m³",
    time: 3600,
    instructions: [
      "라돈 카트리지를 리더기에 삽입하세요",
      "리더기를 측정하려는 공간에 놓으세요",
      "1시간 동안 공기 샘플링이 진행됩니다",
      "측정 중에는 환기를 자제해 주세요",
    ],
    normalRange: { min: 0, max: 148 },
  },
  vocs: {
    name: "휘발성 유기화합물",
    icon: "💨",
    unit: "ppb",
    time: 300,
    instructions: [
      "VOCs 카트리지를 삽입하세요",
      "리더기를 측정 공간에 놓으세요",
      "5분간 공기질을 분석합니다",
    ],
    normalRange: { min: 0, max: 150 },
  },
  co2: {
    name: "이산화탄소",
    icon: "🌫️",
    unit: "ppm",
    time: 60,
    instructions: [
      "CO2 카트리지를 삽입하세요",
      "실내 중앙부에 리더기를 놓으세요",
      "1분간 측정이 진행됩니다",
    ],
    normalRange: { min: 0, max: 1000 },
  },
  ph: {
    name: "pH",
    icon: "💧",
    unit: "pH",
    time: 30,
    instructions: [
      "pH 카트리지를 삽입하세요",
      "깨끗한 용기에 물 샘플을 준비하세요",
      "카트리지를 물에 담갔다가 리더기에 삽입하세요",
    ],
    normalRange: { min: 6.5, max: 8.5 },
  },
};

type MeasurementStep = "prepare" | "insert" | "sample" | "measuring" | "result";

export default function MeasurementProcessPage({ 
  params 
}: { 
  params: { type: string } 
}) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<MeasurementStep>("prepare");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [cartridgeDetected, setCartridgeDetected] = useState(false);

  const info = measurementInfo[params.type] || measurementInfo.glucose;

  // 측정 프로세스 시뮬레이션
  useEffect(() => {
    if (currentStep === "measuring") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            // 랜덤 결과 생성
            const min = info.normalRange.min * 0.8;
            const max = info.normalRange.max * 1.2;
            const randomResult = Math.round((Math.random() * (max - min) + min) * 10) / 10;
            setResult(randomResult);
            setCurrentStep("result");
            return 100;
          }
          return prev + (100 / (info.time));
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentStep, info]);

  const steps = [
    { id: "prepare", label: "준비" },
    { id: "insert", label: "카트리지" },
    { id: "sample", label: "시료" },
    { id: "measuring", label: "측정" },
    { id: "result", label: "결과" },
  ];

  const getStepIndex = (step: MeasurementStep) => 
    steps.findIndex((s) => s.id === step);

  const isNormal = result !== null && 
    result >= info.normalRange.min && 
    result <= info.normalRange.max;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-3xl">{info.icon}</span>
              {info.name} 측정
            </h1>
            <p className="text-gray-400">예상 소요시간: {info.time}초</p>
          </div>
        </div>
        {currentStep !== "result" && (
          <button
            onClick={() => router.push("/dashboard/measurement")}
            className="text-gray-400 hover:text-white"
          >
            취소
          </button>
        )}
      </div>

      {/* 단계 인디케이터 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    getStepIndex(currentStep) >= index
                      ? "bg-manpasik-primary text-white"
                      : "bg-white/10 text-gray-400"
                  }`}
                >
                  {getStepIndex(currentStep) > index ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`text-xs mt-2 ${
                  getStepIndex(currentStep) >= index ? "text-manpasik-primary" : "text-gray-500"
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-0.5 mx-2 ${
                    getStepIndex(currentStep) > index ? "bg-manpasik-primary" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 단계별 컨텐츠 */}
      <div className="glass rounded-2xl p-8">
        {/* 준비 단계 */}
        {currentStep === "prepare" && (
          <div className="text-center">
            <div className="text-6xl mb-6">{info.icon}</div>
            <h2 className="text-2xl font-bold text-white mb-4">{info.name} 측정 준비</h2>
            <p className="text-gray-400 mb-8">측정을 시작하기 전에 아래 사항을 확인하세요</p>
            <div className="text-left space-y-4 mb-8">
              {info.instructions.map((instruction, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-white/5">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-manpasik-primary/20 text-manpasik-primary flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <p className="text-gray-300">{instruction}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setCurrentStep("insert")}
              className="px-8 py-3 rounded-xl bg-manpasik-primary text-white font-medium hover:bg-manpasik-primary/80 transition-colors"
            >
              시작하기
            </button>
          </div>
        )}

        {/* 카트리지 삽입 */}
        {currentStep === "insert" && (
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-manpasik-primary/20 to-manpasik-secondary/20 flex items-center justify-center">
              {cartridgeDetected ? (
                <svg className="w-16 h-16 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-16 h-16 text-gray-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              )}
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              {cartridgeDetected ? "카트리지 인식 완료" : "카트리지를 삽입하세요"}
            </h2>
            <p className="text-gray-400 mb-8">
              {cartridgeDetected 
                ? `${info.name} 카트리지가 정상적으로 인식되었습니다`
                : "NFC 태그를 리더기에 가까이 대세요"}
            </p>
            {!cartridgeDetected ? (
              <button
                onClick={() => setCartridgeDetected(true)}
                className="px-8 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
              >
                시뮬레이션: 카트리지 인식
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep("sample")}
                className="px-8 py-3 rounded-xl bg-manpasik-primary text-white font-medium hover:bg-manpasik-primary/80 transition-colors"
              >
                다음 단계
              </button>
            )}
          </div>
        )}

        {/* 시료 준비 */}
        {currentStep === "sample" && (
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
              <span className="text-5xl">💉</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">시료 준비</h2>
            <p className="text-gray-400 mb-8">
              {params.type.includes("radon") || params.type.includes("vocs") || params.type.includes("co2")
                ? "리더기를 측정 위치에 놓으세요"
                : "시료를 카트리지에 투입하세요"}
            </p>
            <button
              onClick={() => {
                setCurrentStep("measuring");
                setProgress(0);
              }}
              className="px-8 py-3 rounded-xl bg-manpasik-primary text-white font-medium hover:bg-manpasik-primary/80 transition-colors"
            >
              측정 시작
            </button>
          </div>
        )}

        {/* 측정 중 */}
        {currentStep === "measuring" && (
          <div className="text-center">
            <div className="relative w-48 h-48 mx-auto mb-6">
              {/* 원형 프로그레스 */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={553}
                  strokeDashoffset={553 - (553 * progress) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00BFFF" />
                    <stop offset="100%" stopColor="#00FA9A" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">{Math.round(progress)}%</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">측정 중...</h2>
            <p className="text-gray-400">
              {info.name}을(를) 분석하고 있습니다. 잠시만 기다려주세요.
            </p>
            <div className="mt-8 h-16 flex items-center justify-center gap-1">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-manpasik-primary rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 40 + 20}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* 결과 */}
        {currentStep === "result" && result !== null && (
          <div className="text-center">
            <div className={`w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center ${
              isNormal 
                ? "bg-green-500/20" 
                : "bg-amber-500/20"
            }`}>
              <span className="text-5xl">{isNormal ? "✅" : "⚠️"}</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">측정 완료</h2>
            <div className="mb-6">
              <p className="text-5xl font-bold text-white mb-2">
                {result} <span className="text-2xl text-gray-400">{info.unit}</span>
              </p>
              <p className={`text-lg font-medium ${isNormal ? "text-green-400" : "text-amber-400"}`}>
                {isNormal ? "정상 범위" : "주의 필요"}
              </p>
            </div>
            
            <div className="mb-8 p-4 rounded-xl bg-white/5">
              <p className="text-gray-400 text-sm mb-2">정상 범위</p>
              <p className="text-white">
                {info.normalRange.min} - {info.normalRange.max} {info.unit}
              </p>
            </div>

            {/* AI 분석 */}
            <div className="mb-8 p-4 rounded-xl bg-manpasik-primary/10 border border-manpasik-primary/20 text-left">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-manpasik-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="font-medium text-white">AI 분석</span>
              </div>
              <p className="text-gray-300">
                {isNormal 
                  ? `${info.name} 수치가 정상 범위 내에 있습니다. 현재 건강 상태를 잘 유지하고 계세요!`
                  : `${info.name} 수치가 정상 범위를 벗어났습니다. 전문의 상담을 권장드립니다.`}
              </p>
            </div>

            <div className="flex gap-4">
              <Link
                href="/dashboard/measurement"
                className="flex-1 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
              >
                측정 목록
              </Link>
              <Link
                href="/dashboard/analysis"
                className="flex-1 py-3 rounded-xl bg-manpasik-primary text-white font-medium hover:bg-manpasik-primary/80 transition-colors"
              >
                상세 분석
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
