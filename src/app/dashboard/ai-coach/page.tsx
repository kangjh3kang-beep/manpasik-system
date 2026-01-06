"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  actions?: {
    type: string;
    label: string;
    route: string;
  }[];
}

const quickActions = [
  { label: "오늘 건강 상태", icon: "❤️" },
  { label: "식단 추천해줘", icon: "🍽️" },
  { label: "운동 추천해줘", icon: "🏃" },
  { label: "수면 분석해줘", icon: "😴" },
  { label: "환경 점검해줘", icon: "🌿" },
];

export default function AICoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "안녕하세요! 저는 만파, 당신의 AI 건강 코치입니다. 🌟\n\n오늘 어떤 도움이 필요하신가요? 건강 상담, 식단 추천, 운동 코칭, 환경 분석 등 무엇이든 물어보세요!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // AI 응답 시뮬레이션
    setTimeout(() => {
      const aiResponse = generateAIResponse(messageText);
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("건강") || lowerMessage.includes("상태")) {
      return {
        id: Date.now().toString(),
        role: "assistant",
        content: "최근 건강 데이터를 분석했습니다! 📊\n\n**종합 건강 점수: 85점** (양호)\n\n✅ **혈당**: 98 mg/dL - 정상 범위입니다\n✅ **콜레스테롤**: 185 mg/dL - 양호합니다\n⚠️ **수면**: 평균 6.2시간 - 7시간 이상 권장\n\n수면 시간이 조금 부족해 보여요. 오늘 밤은 일찍 주무시는 건 어떨까요?",
        timestamp: new Date(),
        actions: [
          { type: "measurement", label: "건강 측정하기", route: "/dashboard/measurement" },
          { type: "coaching", label: "수면 코칭 받기", route: "/dashboard/ai-coach/sleep" },
        ],
      };
    }
    
    if (lowerMessage.includes("식단") || lowerMessage.includes("음식")) {
      return {
        id: Date.now().toString(),
        role: "assistant",
        content: "오늘의 맞춤 식단을 준비했어요! 🥗\n\n**아침 (추천)**\n- 통곡물 오트밀 + 블루베리\n- 삶은 달걀 2개\n- 녹차\n\n**점심 (추천)**\n- 현미밥 + 닭가슴살 구이\n- 브로콜리, 당근 샐러드\n- 미소된장국\n\n**저녁 (추천)**\n- 연어 스테이크\n- 구운 채소\n- 아보카도 샐러드\n\n혈당 관리를 위해 탄수화물은 통곡물 위주로 구성했어요!",
        timestamp: new Date(),
        actions: [
          { type: "product", label: "건강식품 구매", route: "/dashboard/marketplace" },
        ],
      };
    }
    
    if (lowerMessage.includes("운동")) {
      return {
        id: Date.now().toString(),
        role: "assistant",
        content: "오늘의 맞춤 운동을 추천해드릴게요! 💪\n\n**워밍업** (5분)\n- 가벼운 스트레칭\n- 제자리 걷기\n\n**메인 운동** (30분)\n1. 스쿼트 15회 x 3세트\n2. 런지 12회 x 3세트\n3. 플랭크 30초 x 3세트\n4. 버피 10회 x 2세트\n\n**쿨다운** (5분)\n- 전신 스트레칭\n- 심호흡\n\n최근 활동량이 적었으니, 오늘부터 가볍게 시작해볼까요?",
        timestamp: new Date(),
      };
    }
    
    if (lowerMessage.includes("환경") || lowerMessage.includes("공기")) {
      return {
        id: Date.now().toString(),
        role: "assistant",
        content: "현재 환경 상태를 분석했습니다! 🏠\n\n**실내 공기질: 양호** 🟢\n\n- CO2: 650 ppm (좋음)\n- VOCs: 120 ppb (보통)\n- 미세먼지: 25 ㎍/m³ (좋음)\n- 습도: 45% (적정)\n\n⚠️ **권장사항**\n환기를 1시간마다 10분씩 해주세요. VOCs 수치가 조금 높아지는 추세입니다.\n\n라돈 측정은 마지막으로 7일 전에 하셨네요. 주기적인 측정을 권장합니다!",
        timestamp: new Date(),
        actions: [
          { type: "measurement", label: "라돈 측정하기", route: "/dashboard/measurement/process/radon" },
        ],
      };
    }
    
    if (lowerMessage.includes("수면") || lowerMessage.includes("잠")) {
      return {
        id: Date.now().toString(),
        role: "assistant",
        content: "수면 패턴을 분석했어요! 😴\n\n**최근 7일 평균**\n- 수면 시간: 6.2시간 (목표: 7-8시간)\n- 취침 시간: 오전 1:30\n- 기상 시간: 오전 7:45\n- 수면 품질: 72점\n\n💡 **개선 포인트**\n1. 취침 시간을 23:00로 앞당겨보세요\n2. 취침 1시간 전 스마트폰 사용 자제\n3. 저녁 식사는 취침 3시간 전에\n4. 침실 온도 18-20°C 유지\n\n오늘부터 수면 일기를 써보시는 건 어떨까요?",
        timestamp: new Date(),
      };
    }

    return {
      id: Date.now().toString(),
      role: "assistant",
      content: "네, 말씀해 주신 내용을 이해했습니다! 😊\n\n더 자세한 상담이 필요하시면 아래 항목 중 선택해주세요:\n\n1. 🩺 건강 상태 분석\n2. 🥗 맞춤 식단 추천\n3. 🏃 운동 코칭\n4. 😴 수면 개선\n5. 🌿 환경 분석\n\n또는 화상 진료를 통해 전문의와 상담하실 수도 있어요!",
      timestamp: new Date(),
      actions: [
        { type: "telemedicine", label: "화상 진료 예약", route: "/dashboard/telemedicine" },
      ],
    };
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      {/* 헤더 */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-manpasik-primary to-manpasik-secondary flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">만파 AI 코치</h1>
            <p className="text-gray-400">개인 맞춤형 건강 관리 파트너</p>
          </div>
        </div>
      </div>

      {/* 빠른 액션 */}
      {messages.length <= 1 && (
        <div className="p-4 border-b border-white/10">
          <p className="text-sm text-gray-400 mb-3">빠른 질문</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => handleSend(action.label)}
                className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white text-sm transition-colors flex items-center gap-2"
              >
                <span>{action.icon}</span>
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 ${
                message.role === "user"
                  ? "bg-manpasik-primary text-white"
                  : "glass text-white"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              
              {/* 액션 버튼 */}
              {message.actions && message.actions.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {message.actions.map((action, index) => (
                    <a
                      key={index}
                      href={action.route}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition-colors"
                    >
                      {action.label}
                    </a>
                  ))}
                </div>
              )}
              
              <p className="text-xs opacity-60 mt-2">
                {message.timestamp.toLocaleTimeString("ko-KR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        
        {/* 타이핑 인디케이터 */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="glass rounded-2xl p-4">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-3">
          <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="만파에게 물어보세요..."
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-manpasik-primary transition-colors"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="px-6 py-3 rounded-xl bg-manpasik-primary hover:bg-manpasik-primary/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
}
