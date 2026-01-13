"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import AIInsight from "@/components/measure/AIInsight";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Radio,
  ScanLine,
  Activity,
  CheckCircle,
  ArrowRight,
  RotateCcw,
  Download,
  Share2,
  Cpu,
  Zap,
  Waves,
} from "lucide-react";

type MeasurementStep = "idle" | "scanning" | "calibration" | "analyzing" | "result";

interface DataPoint {
  time: number;
  value: number;
}

// 시뮬레이션된 센서 데이터 생성
const generateSensorData = (index: number): number => {
  // 실제 혈당 측정처럼 보이는 곡선 생성
  const baseValue = 85 + Math.sin(index * 0.3) * 15;
  const noise = (Math.random() - 0.5) * 8;
  return Math.round((baseValue + noise) * 10) / 10;
};

// 최종 결과 생성 (정상 범위 내)
const generateFinalResult = (): number => {
  return Math.floor(Math.random() * 20) + 88; // 88-107 사이
};

export default function MeasurePage() {
  const [step, setStep] = useState<MeasurementStep>("idle");
  const [progress, setProgress] = useState(0);
  const [chartData, setChartData] = useState<DataPoint[]>([]);
  const [sensorText, setSensorText] = useState("");
  const [finalResult, setFinalResult] = useState(0);
  const [isResultNormal, setIsResultNormal] = useState(true);

  // 측정 시작
  const startMeasurement = useCallback(() => {
    setStep("scanning");
    setProgress(0);
    setChartData([]);
    setFinalResult(0);
  }, []);

  // 다시 측정
  const resetMeasurement = () => {
    setStep("idle");
    setProgress(0);
    setChartData([]);
    setFinalResult(0);
  };

  // Step 진행 로직
  useEffect(() => {
    if (step === "idle" || step === "result") return;

    let timer: NodeJS.Timeout;

    if (step === "scanning") {
      // 3초 후 다음 단계
      timer = setTimeout(() => {
        setStep("calibration");
      }, 3000);
    } else if (step === "calibration") {
      // 2초 후 다음 단계
      timer = setTimeout(() => {
        setStep("analyzing");
      }, 2000);
    } else if (step === "analyzing") {
      // 10초 동안 실시간 데이터 생성
      let dataIndex = 0;
      const interval = setInterval(() => {
        if (dataIndex >= 50) {
          clearInterval(interval);
          // 결과 계산
          const result = generateFinalResult();
          setFinalResult(result);
          setIsResultNormal(result >= 70 && result <= 100);
          setStep("result");
          return;
        }

        // 데이터 포인트 추가
        setChartData((prev) => [
          ...prev,
          { time: dataIndex * 0.2, value: generateSensorData(dataIndex) },
        ]);

        // 센서 텍스트 업데이트
        const current = (1.0 + Math.random() * 0.5).toFixed(2);
        setSensorText(`전류: ${current}µA | 온도: 36.${Math.floor(Math.random() * 9)}°C`);

        // 진행률 업데이트
        setProgress(Math.min((dataIndex / 50) * 100, 100));
        dataIndex++;
      }, 200);

      return () => clearInterval(interval);
    }

    return () => clearTimeout(timer);
  }, [step]);

  // 스텝 설정
  const steps = [
    { id: "scanning", label: "기기 연결", icon: Radio },
    { id: "calibration", label: "카트리지 인식", icon: ScanLine },
    { id: "analyzing", label: "실시간 분석", icon: Activity },
    { id: "result", label: "결과 확인", icon: CheckCircle },
  ];

  const getCurrentStepIndex = () => {
    const stepOrder: MeasurementStep[] = ["scanning", "calibration", "analyzing", "result"];
    return stepOrder.indexOf(step);
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
          건강 측정
        </h1>
        <p className="text-gray-400">
          만파식 리더기로 건강 상태를 측정하세요
        </p>
      </div>

      {/* 진행 단계 표시 */}
      {step !== "idle" && (
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {/* 연결선 */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/10" />
            <div
              className="absolute top-5 left-0 h-0.5 bg-manpasik-gradient transition-all duration-500"
              style={{ width: `${(getCurrentStepIndex() / 3) * 100}%` }}
            />

            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = getCurrentStepIndex() >= i;
              const isCurrent = steps[getCurrentStepIndex()]?.id === s.id;
              return (
                <div key={s.id} className="relative z-10 flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                      isActive
                        ? "bg-manpasik-gradient shadow-lg shadow-[var(--manpasik-primary)]/30"
                        : "bg-white/10",
                      isCurrent && "animate-pulse"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-500")} />
                  </div>
                  <span
                    className={cn(
                      "mt-2 text-xs font-medium",
                      isActive ? "text-white" : "text-gray-500"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 메인 컨텐츠 영역 */}
      <div className="rounded-2xl bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] overflow-hidden">
        {/* IDLE 상태 - 시작 화면 */}
        {step === "idle" && (
          <div className="p-8 text-center">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--manpasik-primary)]/20 to-[var(--manpasik-secondary)]/20 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-manpasik-gradient flex items-center justify-center shadow-2xl shadow-[var(--manpasik-primary)]/40">
                <Cpu className="w-12 h-12 text-white" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">측정 준비 완료</h2>
            <p className="text-gray-400 mb-8 max-w-sm mx-auto">
              리더기에 카트리지를 장착하고 아래 버튼을 눌러 측정을 시작하세요
            </p>
            <Button onClick={startMeasurement} size="lg" leftIcon={<Zap className="w-5 h-5" />}>
              측정 시작
            </Button>
          </div>
        )}

        {/* STEP 1: 기기 연결 */}
        {step === "scanning" && (
          <div className="p-8 text-center">
            {/* 레이더 애니메이션 */}
            <div className="relative w-48 h-48 mx-auto mb-8">
              {/* 동심원 */}
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="absolute inset-0 rounded-full border border-[var(--manpasik-primary)]/30"
                  style={{
                    animation: `ping ${2 + i * 0.5}s cubic-bezier(0, 0, 0.2, 1) infinite`,
                    animationDelay: `${i * 0.3}s`,
                  }}
                />
              ))}
              {/* 레이더 스윕 */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div
                  className="absolute inset-0 origin-center"
                  style={{
                    background: `conic-gradient(from 0deg, transparent 0deg, var(--manpasik-primary) 30deg, transparent 60deg)`,
                    animation: "spin 2s linear infinite",
                    opacity: 0.3,
                  }}
                />
              </div>
              {/* 중앙 아이콘 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-[var(--manpasik-deep-ocean)] border-2 border-[var(--manpasik-primary)] flex items-center justify-center">
                  <Radio className="w-8 h-8 text-[var(--manpasik-primary)]" />
                </div>
              </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-2">리더기를 찾는 중...</h2>
            <p className="text-gray-400">주변의 만파식 리더기를 스캔하고 있습니다</p>

            {/* 진행 표시 */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--manpasik-primary)] animate-bounce" style={{ animationDelay: "0s" }} />
              <div className="w-2 h-2 rounded-full bg-[var(--manpasik-primary)] animate-bounce" style={{ animationDelay: "0.2s" }} />
              <div className="w-2 h-2 rounded-full bg-[var(--manpasik-primary)] animate-bounce" style={{ animationDelay: "0.4s" }} />
            </div>
          </div>
        )}

        {/* STEP 2: 카트리지 인식 */}
        {step === "calibration" && (
          <div className="p-8 text-center">
            {/* QR 스캔 애니메이션 */}
            <div className="relative w-48 h-48 mx-auto mb-8 rounded-2xl border-2 border-dashed border-[var(--manpasik-secondary)] flex items-center justify-center overflow-hidden">
              {/* 스캔 라인 */}
              <div
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--manpasik-secondary)] to-transparent"
                style={{ animation: "scan 1.5s ease-in-out infinite" }}
              />
              {/* QR 코드 모양 */}
              <div className="grid grid-cols-3 gap-2">
                {Array(9)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-8 h-8 rounded",
                        [0, 2, 6, 8].includes(i)
                          ? "bg-[var(--manpasik-secondary)]"
                          : i === 4
                          ? "bg-[var(--manpasik-primary)]"
                          : "bg-white/20"
                      )}
                    />
                  ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-bold text-white">MPK-Reader 연결됨</h2>
            </div>
            <p className="text-gray-400 mb-4">카트리지 QR 코드 스캔 중...</p>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--manpasik-secondary)]/20 text-[var(--manpasik-secondary)]">
              <ScanLine className="w-4 h-4" />
              <span className="font-medium">혈당(Glucose) 카트리지 인식 완료</span>
            </div>
          </div>
        )}

        {/* STEP 3: 실시간 분석 */}
        {step === "analyzing" && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">실시간 분석 중</h2>
                <p className="text-gray-400 text-sm">센서 데이터를 수집하고 있습니다</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[var(--manpasik-primary)]">{Math.round(progress)}%</p>
                <p className="text-xs text-gray-400">완료</p>
              </div>
            </div>

            {/* 진행 바 */}
            <div className="h-2 bg-white/10 rounded-full mb-6 overflow-hidden">
              <div
                className="h-full bg-manpasik-gradient rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* 실시간 차트 */}
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "rgb(156, 163, 175)", fontSize: 10 }}
                    tickFormatter={(v) => `${v.toFixed(1)}s`}
                  />
                  <YAxis
                    domain={[60, 120]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "rgb(156, 163, 175)", fontSize: 10 }}
                  />
                  <ReferenceLine y={70} stroke="rgba(239, 68, 68, 0.3)" strokeDasharray="3 3" />
                  <ReferenceLine y={100} stroke="rgba(239, 68, 68, 0.3)" strokeDasharray="3 3" />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--manpasik-primary)"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 센서 데이터 */}
            <div className="flex items-center justify-center gap-4 p-3 rounded-xl bg-white/5 font-mono text-sm">
              <div className="flex items-center gap-2">
                <Waves className="w-4 h-4 text-[var(--manpasik-primary)] animate-pulse" />
                <span className="text-gray-400">센서 데이터 수신 중...</span>
              </div>
              <span className="text-[var(--manpasik-bio-green)]">{sensorText}</span>
            </div>
          </div>
        )}

        {/* STEP 4: 결과 */}
        {step === "result" && (
          <div className="p-6">
            {/* 결과 카드 */}
            <div className="text-center mb-8">
              <div
                className={cn(
                  "w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center",
                  isResultNormal
                    ? "bg-green-500/20 border-2 border-green-500"
                    : "bg-yellow-500/20 border-2 border-yellow-500"
                )}
              >
                <CheckCircle
                  className={cn("w-16 h-16", isResultNormal ? "text-green-400" : "text-yellow-400")}
                />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">측정 완료!</h2>

              <div className="inline-block p-6 rounded-2xl bg-white/5 border border-white/10 mb-4">
                <p className="text-gray-400 mb-2">혈당 수치</p>
                <p className="text-5xl font-bold text-white mb-1">
                  {finalResult}
                  <span className="text-xl text-gray-400 ml-2">mg/dL</span>
                </p>
                <span
                  className={cn(
                    "inline-flex px-3 py-1 rounded-full text-sm font-medium",
                    isResultNormal
                      ? "bg-green-500/20 text-green-400"
                      : finalResult < 70
                      ? "bg-red-500/20 text-red-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  )}
                >
                  {isResultNormal ? "정상" : finalResult < 70 ? "저혈당 주의" : "높음 주의"}
                </span>
              </div>
            </div>

            {/* AI 인사이트 */}
            <AIInsight glucoseValue={finalResult} previousAverage={103} className="mb-8" />

            {/* 액션 버튼 */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={resetMeasurement} className="flex-1" leftIcon={<RotateCcw className="w-5 h-5" />}>
                다시 측정
              </Button>
              <Button variant="ghost" className="flex-1" leftIcon={<Download className="w-5 h-5" />}>
                결과 저장
              </Button>
              <Button className="flex-1" leftIcon={<Share2 className="w-5 h-5" />}>
                공유하기
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 스캔 애니메이션 CSS */}
      <style jsx global>{`
        @keyframes scan {
          0%, 100% {
            transform: translateY(-100px);
          }
          50% {
            transform: translateY(100px);
          }
        }
      `}</style>
    </div>
  );
}











