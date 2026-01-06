"use client";

import { useState } from "react";
import Link from "next/link";

// 측정 카테고리 정의
const measurementCategories = [
  {
    id: "health",
    name: "건강 측정",
    icon: "❤️",
    color: "from-red-500 to-pink-500",
    items: [
      { id: "glucose", name: "혈당", unit: "mg/dL", time: "5초" },
      { id: "ketone", name: "케톤체", unit: "mmol/L", time: "10초" },
      { id: "cholesterol", name: "콜레스테롤", unit: "mg/dL", time: "3분" },
      { id: "lactate", name: "젖산", unit: "mmol/L", time: "15초" },
      { id: "uric-acid", name: "요산", unit: "mg/dL", time: "30초" },
      { id: "hemoglobin", name: "헤모글로빈", unit: "g/dL", time: "1분" },
    ],
  },
  {
    id: "environment",
    name: "환경 측정",
    icon: "🌿",
    color: "from-green-500 to-emerald-500",
    items: [
      { id: "radon", name: "라돈", unit: "Bq/m³", time: "1시간" },
      { id: "vocs", name: "VOCs", unit: "ppb", time: "5분" },
      { id: "co2", name: "이산화탄소", unit: "ppm", time: "1분" },
      { id: "dust", name: "미세먼지", unit: "㎍/m³", time: "30초" },
      { id: "formaldehyde", name: "포름알데히드", unit: "ppm", time: "10분" },
    ],
  },
  {
    id: "water",
    name: "수질 측정",
    icon: "💧",
    color: "from-blue-500 to-cyan-500",
    items: [
      { id: "ph", name: "pH", unit: "pH", time: "30초" },
      { id: "heavy-metals", name: "중금속", unit: "ppb", time: "5분" },
      { id: "chlorine", name: "잔류염소", unit: "mg/L", time: "1분" },
      { id: "bacteria", name: "세균", unit: "CFU/mL", time: "15분" },
    ],
  },
  {
    id: "food",
    name: "식품 안전",
    icon: "🍎",
    color: "from-orange-500 to-amber-500",
    items: [
      { id: "pesticide", name: "잔류농약", unit: "ppb", time: "10분" },
      { id: "pathogen", name: "병원균", unit: "-", time: "20분" },
      { id: "allergen", name: "알레르겐", unit: "-", time: "15분" },
      { id: "freshness", name: "신선도", unit: "Grade", time: "5분" },
    ],
  },
  {
    id: "safety",
    name: "안전 검사",
    icon: "🛡️",
    color: "from-purple-500 to-violet-500",
    items: [
      { id: "drug-detection", name: "약물 검출", unit: "-", time: "5분" },
    ],
  },
];

export default function MeasurementPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">측정</h1>
        <p className="text-gray-400">
          카트리지를 선택하고 측정을 시작하세요
        </p>
      </div>

      {/* 연결된 리더기 상태 */}
      <div className="glass rounded-xl p-4 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-white">만파식 리더기 #1</p>
            <p className="text-sm text-green-400">연결됨 • 배터리 85%</p>
          </div>
        </div>
        <Link
          href="/dashboard/settings/devices"
          className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors text-sm"
        >
          기기 관리
        </Link>
      </div>

      {/* 측정 카테고리 */}
      <div className="grid gap-6">
        {measurementCategories.map((category) => (
          <div key={category.id} className="glass rounded-2xl overflow-hidden">
            {/* 카테고리 헤더 */}
            <button
              onClick={() => setSelectedCategory(
                selectedCategory === category.id ? null : category.id
              )}
              className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-2xl`}>
                  {category.icon}
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-bold text-white">{category.name}</h2>
                  <p className="text-gray-400 text-sm">
                    {category.items.length}개 측정 항목
                  </p>
                </div>
              </div>
              <svg
                className={`w-6 h-6 text-gray-400 transition-transform ${
                  selectedCategory === category.id ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* 측정 항목 목록 */}
            {selectedCategory === category.id && (
              <div className="px-6 pb-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.items.map((item) => (
                    <Link
                      key={item.id}
                      href={`/dashboard/measurement/process/${item.id}`}
                      className={`p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 border border-transparent hover:border-white/20 group ${
                        hoveredItem === item.id ? "scale-[1.02]" : ""
                      }`}
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-white group-hover:text-manpasik-primary transition-colors">
                          {item.name}
                        </h3>
                        <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        단위: <span className="text-gray-300">{item.unit}</span>
                      </p>
                      <div className="mt-3 flex items-center text-manpasik-primary text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>측정 시작</span>
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 최근 측정 결과 */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-4">최근 측정 결과</h2>
        <div className="glass rounded-xl overflow-hidden">
          <div className="divide-y divide-white/10">
            {[
              { type: "혈당", value: 98, unit: "mg/dL", status: "정상", time: "오늘 08:30" },
              { type: "라돈", value: 45, unit: "Bq/m³", status: "안전", time: "어제 22:00" },
              { type: "pH", value: 7.2, unit: "pH", status: "정상", time: "3일 전" },
            ].map((result, index) => (
              <div key={index} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-white">{result.type}</p>
                    <p className="text-sm text-gray-400">{result.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">
                    {result.value} <span className="text-gray-400 font-normal text-sm">{result.unit}</span>
                  </p>
                  <p className="text-sm text-green-400">{result.status}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/dashboard/analysis"
            className="block p-4 text-center text-manpasik-primary hover:bg-white/5 transition-colors"
          >
            전체 기록 보기 →
          </Link>
        </div>
      </div>
    </div>
  );
}
