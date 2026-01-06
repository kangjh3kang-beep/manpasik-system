"use client";

import { useState } from "react";
import Link from "next/link";

// 구독 플랜
const subscriptionPlans = [
  {
    id: "basic_safety",
    name: "기본 안심 케어",
    price: 9900,
    yearlyPrice: 99000,
    features: ["월 4회 카트리지", "기본 AI 분석", "1년 데이터 저장", "건강 트렌드 리포트"],
    color: "from-gray-500 to-gray-600",
    popular: false,
  },
  {
    id: "bio_optimization",
    name: "바이오 최적화",
    price: 29900,
    yearlyPrice: 299000,
    features: ["월 12회 카트리지", "고급 AI 코칭", "맞춤 식단/운동", "환경 모니터링", "무제한 저장"],
    color: "from-manpasik-primary to-manpasik-secondary",
    popular: true,
  },
  {
    id: "clinical_guard",
    name: "클리니컬 가드",
    price: 59900,
    yearlyPrice: 599000,
    features: ["월 30회 카트리지", "프리미엄 AI", "월 2회 화상진료", "긴급 상담", "처방전"],
    color: "from-purple-500 to-violet-500",
    popular: false,
  },
];

// 카트리지 카테고리
const cartridgeCategories = [
  { id: "health", name: "건강", icon: "❤️", count: 6 },
  { id: "environment", name: "환경", icon: "🌿", count: 5 },
  { id: "water", name: "수질", icon: "💧", count: 4 },
  { id: "food", name: "식품", icon: "🍎", count: 4 },
  { id: "safety", name: "안전", icon: "🛡️", count: 1 },
  { id: "research", name: "연구용", icon: "🔬", count: 10 },
  { id: "third-party", name: "서드파티", icon: "🔌", count: 25 },
];

// 인기 상품
const popularProducts = [
  {
    id: "glucose-pack",
    name: "혈당 카트리지 10팩",
    price: 22500,
    originalPrice: 25000,
    image: "🩸",
    rating: 4.8,
    reviews: 1234,
    badge: "베스트셀러",
  },
  {
    id: "radon-single",
    name: "라돈 측정 카트리지",
    price: 15000,
    originalPrice: 15000,
    image: "☢️",
    rating: 4.9,
    reviews: 567,
    badge: null,
  },
  {
    id: "cholesterol-kit",
    name: "콜레스테롤 종합 키트",
    price: 45000,
    originalPrice: 50000,
    image: "🫀",
    rating: 4.7,
    reviews: 892,
    badge: "10% 할인",
  },
  {
    id: "water-test",
    name: "수질 검사 풀세트",
    price: 35000,
    originalPrice: 40000,
    image: "💧",
    rating: 4.6,
    reviews: 345,
    badge: null,
  },
];

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<"cartridge" | "subscription" | "health">("cartridge");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">마켓플레이스</h1>
          <p className="text-gray-400">
            카트리지, 구독, 건강용품을 한 곳에서
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/marketplace/cart"
            className="relative p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-manpasik-primary text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </Link>
          <Link
            href="/dashboard/marketplace/orders"
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors text-sm"
          >
            주문 내역
          </Link>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex gap-2 mb-8">
        {[
          { id: "cartridge", label: "카트리지몰", icon: "🧪" },
          { id: "subscription", label: "구독 서비스", icon: "⭐" },
          { id: "health", label: "헬스몰", icon: "💊" },
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

      {/* 카트리지몰 */}
      {activeTab === "cartridge" && (
        <div>
          {/* 카테고리 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            {cartridgeCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/dashboard/marketplace/cartridge/${cat.id}`}
                className="glass rounded-xl p-4 text-center hover:border-manpasik-primary/50 transition-all group"
              >
                <div className="text-3xl mb-2">{cat.icon}</div>
                <p className="font-medium text-white group-hover:text-manpasik-primary transition-colors">
                  {cat.name}
                </p>
                <p className="text-xs text-gray-400">{cat.count}개</p>
              </Link>
            ))}
          </div>

          {/* 인기 상품 */}
          <h2 className="text-xl font-bold text-white mb-4">인기 상품</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularProducts.map((product) => (
              <Link
                key={product.id}
                href={`/dashboard/marketplace/product/${product.id}`}
                className="glass rounded-xl overflow-hidden hover:border-manpasik-primary/50 transition-all group"
              >
                <div className="relative p-6 bg-white/5 text-center">
                  <div className="text-5xl">{product.image}</div>
                  {product.badge && (
                    <span className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium bg-manpasik-primary text-white">
                      {product.badge}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-white group-hover:text-manpasik-primary transition-colors mb-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-400">★</span>
                    <span className="text-white">{product.rating}</span>
                    <span className="text-gray-400 text-sm">({product.reviews})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white">₩{product.price.toLocaleString()}</span>
                    {product.price < product.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        ₩{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 구독 서비스 */}
      {activeTab === "subscription" && (
        <div>
          {/* 결제 주기 토글 */}
          <div className="flex justify-center mb-8">
            <div className="glass rounded-full p-1 flex">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-full transition-all ${
                  billingCycle === "monthly"
                    ? "bg-manpasik-primary text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                월간 결제
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-6 py-2 rounded-full transition-all ${
                  billingCycle === "yearly"
                    ? "bg-manpasik-primary text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                연간 결제
                <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                  2개월 무료
                </span>
              </button>
            </div>
          </div>

          {/* 플랜 카드 */}
          <div className="grid md:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                className={`glass rounded-2xl p-6 relative ${
                  plan.popular ? "border-2 border-manpasik-primary" : ""
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-manpasik-primary text-white text-sm font-medium rounded-full">
                    가장 인기
                  </span>
                )}
                
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-2xl mb-4`}>
                  ⭐
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                
                <div className="mb-4">
                  <span className="text-3xl font-bold text-white">
                    ₩{(billingCycle === "monthly" ? plan.price : Math.round(plan.yearlyPrice / 12)).toLocaleString()}
                  </span>
                  <span className="text-gray-400">/월</span>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-300">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button
                  className={`w-full py-3 rounded-xl font-medium transition-all ${
                    plan.popular
                      ? "bg-manpasik-primary text-white hover:bg-manpasik-primary/80"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  구독하기
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 헬스몰 */}
      {activeTab === "health" && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏥</div>
          <h2 className="text-2xl font-bold text-white mb-2">헬스몰 준비 중</h2>
          <p className="text-gray-400 mb-6">
            건강식품, 의료기기, 스포츠용품을 곧 만나보실 수 있습니다
          </p>
          <button className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            오픈 알림 받기
          </button>
        </div>
      )}
    </div>
  );
}
