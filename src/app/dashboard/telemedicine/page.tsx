"use client";

import { useState } from "react";
import Link from "next/link";

// 의사 목록
const doctors = [
  {
    id: "dr-kim",
    name: "김영희 전문의",
    specialty: "내분비내과",
    hospital: "서울대학교병원",
    rating: 4.9,
    reviews: 234,
    price: 35000,
    image: "👩‍⚕️",
    languages: ["한국어", "영어"],
    available: true,
    nextSlot: "오늘 15:00",
  },
  {
    id: "dr-park",
    name: "박철수 전문의",
    specialty: "가정의학과",
    hospital: "삼성서울병원",
    rating: 4.8,
    reviews: 189,
    price: 30000,
    image: "👨‍⚕️",
    languages: ["한국어"],
    available: true,
    nextSlot: "오늘 16:30",
  },
  {
    id: "dr-lee",
    name: "이지은 전문의",
    specialty: "심장내과",
    hospital: "아산병원",
    rating: 4.9,
    reviews: 312,
    price: 40000,
    image: "👩‍⚕️",
    languages: ["한국어", "영어", "일본어"],
    available: false,
    nextSlot: "내일 10:00",
  },
];

// 전문가 카테고리
const expertCategories = [
  { id: "nutritionist", name: "영양사", icon: "🥗", count: 15 },
  { id: "trainer", name: "피트니스 트레이너", icon: "🏋️", count: 22 },
  { id: "counselor", name: "심리 상담사", icon: "🧠", count: 18 },
  { id: "environment", name: "환경 전문가", icon: "🌿", count: 8 },
];

export default function TelemedicinePage() {
  const [activeTab, setActiveTab] = useState<"doctors" | "experts" | "appointments">("doctors");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

  const specialties = ["전체", "내분비내과", "가정의학과", "심장내과", "소화기내과", "호흡기내과"];

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">화상 진료</h1>
        <p className="text-gray-400">
          전문의와 실시간 화상 상담을 진행하세요
        </p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex gap-2 mb-8">
        {[
          { id: "doctors", label: "전문의 상담", icon: "🏥" },
          { id: "experts", label: "전문가 상담", icon: "👥" },
          { id: "appointments", label: "내 예약", icon: "📅" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === tab.id
                ? "bg-manpasik-primary text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 전문의 상담 */}
      {activeTab === "doctors" && (
        <div>
          {/* 진료과 필터 */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {specialties.map((specialty) => (
              <button
                key={specialty}
                onClick={() => setSelectedSpecialty(specialty === "전체" ? null : specialty)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  (specialty === "전체" && !selectedSpecialty) || selectedSpecialty === specialty
                    ? "bg-manpasik-primary text-white"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {specialty}
              </button>
            ))}
          </div>

          {/* 의사 목록 */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors
              .filter((doc) => !selectedSpecialty || doc.specialty === selectedSpecialty)
              .map((doctor) => (
                <div key={doctor.id} className="glass rounded-xl p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-manpasik-primary to-manpasik-secondary flex items-center justify-center text-3xl">
                      {doctor.image}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white">{doctor.name}</h3>
                      <p className="text-sm text-manpasik-primary">{doctor.specialty}</p>
                      <p className="text-sm text-gray-400">{doctor.hospital}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-white">{doctor.rating}</span>
                      <span className="text-gray-400">({doctor.reviews})</span>
                    </div>
                    <div className="flex gap-1">
                      {doctor.languages.map((lang) => (
                        <span key={lang} className="px-2 py-0.5 rounded bg-white/5 text-gray-400 text-xs">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div>
                      <p className="text-lg font-bold text-white">₩{doctor.price.toLocaleString()}</p>
                      <p className={`text-sm ${doctor.available ? "text-green-400" : "text-gray-400"}`}>
                        {doctor.nextSlot}
                      </p>
                    </div>
                    <button
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        doctor.available
                          ? "bg-manpasik-primary text-white hover:bg-manpasik-primary/80"
                          : "bg-white/10 text-gray-400"
                      }`}
                    >
                      {doctor.available ? "예약하기" : "대기 신청"}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 전문가 상담 */}
      {activeTab === "experts" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {expertCategories.map((category) => (
            <Link
              key={category.id}
              href={`/dashboard/telemedicine/experts/${category.id}`}
              className="glass rounded-xl p-6 text-center hover:border-manpasik-primary/50 transition-all group"
            >
              <div className="text-5xl mb-4">{category.icon}</div>
              <h3 className="font-bold text-white group-hover:text-manpasik-primary transition-colors mb-2">
                {category.name}
              </h3>
              <p className="text-gray-400">{category.count}명 활동 중</p>
            </Link>
          ))}
        </div>
      )}

      {/* 내 예약 */}
      {activeTab === "appointments" && (
        <div>
          {/* 예정된 예약 */}
          <div className="glass rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">예정된 상담</h2>
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
                1건
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-manpasik-primary to-manpasik-secondary flex items-center justify-center text-xl">
                  👩‍⚕️
                </div>
                <div>
                  <p className="font-medium text-white">김영희 전문의</p>
                  <p className="text-sm text-gray-400">내분비내과 • 오늘 15:00</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-lg bg-manpasik-primary text-white hover:bg-manpasik-primary/80 transition-colors">
                  입장하기
                </button>
                <button className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
                  취소
                </button>
              </div>
            </div>
          </div>

          {/* 지난 상담 */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">지난 상담</h2>
            <div className="space-y-4">
              {[
                { doctor: "박철수 전문의", specialty: "가정의학과", date: "2026-01-03", hasPrescription: true },
                { doctor: "이지은 전문의", specialty: "심장내과", date: "2025-12-28", hasPrescription: false },
              ].map((appointment, index) => (
                <div key={index} className="p-4 rounded-xl bg-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg">
                      👨‍⚕️
                    </div>
                    <div>
                      <p className="font-medium text-white">{appointment.doctor}</p>
                      <p className="text-sm text-gray-400">{appointment.specialty} • {appointment.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {appointment.hasPrescription && (
                      <button className="px-3 py-1.5 rounded-lg bg-white/5 text-manpasik-primary hover:bg-white/10 transition-colors text-sm">
                        처방전 보기
                      </button>
                    )}
                    <button className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors text-sm">
                      상담 기록
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
