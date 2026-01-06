"use client";

import { useState } from "react";
import Link from "next/link";

// 커뮤니티 카테고리
const categories = [
  { id: "health-tips", name: "건강 팁", icon: "💪", count: 128 },
  { id: "success-stories", name: "성공 사례", icon: "🎉", count: 86 },
  { id: "qna", name: "Q&A", icon: "❓", count: 234 },
  { id: "environment", name: "환경 이야기", icon: "🌿", count: 45 },
  { id: "recipes", name: "건강 레시피", icon: "🥗", count: 67 },
];

// 인기 게시글
const popularPosts = [
  {
    id: "1",
    title: "혈당 관리 3개월 후기 - 98에서 92로 낮췄어요!",
    author: "건강지킴이",
    category: "성공 사례",
    likes: 234,
    comments: 45,
    createdAt: "3시간 전",
  },
  {
    id: "2",
    title: "라돈 측정 결과 해석하는 방법 알려드립니다",
    author: "환경전문가",
    category: "환경 이야기",
    likes: 189,
    comments: 32,
    createdAt: "5시간 전",
  },
  {
    id: "3",
    title: "저탄고지 식단 1주일 혈당 변화 공유",
    author: "다이어터",
    category: "건강 팁",
    likes: 156,
    comments: 28,
    createdAt: "8시간 전",
  },
  {
    id: "4",
    title: "콜레스테롤 낮추는 아침 루틴 공유해요",
    author: "morning_routine",
    category: "건강 팁",
    likes: 143,
    comments: 19,
    createdAt: "12시간 전",
  },
];

// 진행 중인 챌린지
const activeChallenges = [
  {
    id: "challenge-1",
    title: "30일 혈당 관리 챌린지",
    participants: 1243,
    daysLeft: 12,
    prize: "카트리지 10팩",
    progress: 60,
  },
  {
    id: "challenge-2",
    title: "실내 공기질 개선 프로젝트",
    participants: 567,
    daysLeft: 25,
    prize: "공기청정기",
    progress: 20,
  },
];

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<"feed" | "challenges" | "qna">("feed");

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">커뮤니티</h1>
          <p className="text-gray-400">건강 정보를 나누고 함께 성장해요</p>
        </div>
        <button className="px-4 py-2 rounded-xl bg-manpasik-primary text-white font-medium hover:bg-manpasik-primary/80 transition-colors">
          + 글쓰기
        </button>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-8">
        {[
          { id: "feed", label: "피드", icon: "📰" },
          { id: "challenges", label: "챌린지", icon: "🏆" },
          { id: "qna", label: "전문가 Q&A", icon: "👨‍⚕️" },
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 메인 컨텐츠 */}
        <div className="lg:col-span-2">
          {/* 피드 */}
          {activeTab === "feed" && (
            <div className="space-y-4">
              {popularPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/dashboard/community/post/${post.id}`}
                  className="glass rounded-xl p-6 block hover:border-manpasik-primary/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-gray-400">
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-500">{post.createdAt}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 hover:text-manpasik-primary transition-colors">
                    {post.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">@{post.author}</span>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {post.comments}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* 챌린지 */}
          {activeTab === "challenges" && (
            <div className="space-y-4">
              {activeChallenges.map((challenge) => (
                <div key={challenge.id} className="glass rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {challenge.title}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {challenge.participants.toLocaleString()}명 참여 중
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-sm">
                      D-{challenge.daysLeft}
                    </span>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">진행률</span>
                      <span className="text-white">{challenge.progress}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-manpasik-primary to-manpasik-secondary"
                        style={{ width: `${challenge.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      🎁 상품: {challenge.prize}
                    </span>
                    <button className="px-4 py-2 rounded-lg bg-manpasik-primary/20 text-manpasik-primary text-sm hover:bg-manpasik-primary/30 transition-colors">
                      참여하기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Q&A */}
          {activeTab === "qna" && (
            <div className="glass rounded-xl p-6 text-center">
              <div className="text-5xl mb-4">👨‍⚕️</div>
              <h3 className="text-xl font-bold text-white mb-2">전문가 Q&A</h3>
              <p className="text-gray-400 mb-6">
                의사, 영양사, 환경 전문가에게 직접 질문하세요
              </p>
              <button className="px-6 py-3 rounded-xl bg-manpasik-primary text-white font-medium hover:bg-manpasik-primary/80 transition-colors">
                질문하기
              </button>
            </div>
          )}
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 카테고리 */}
          <div className="glass rounded-xl p-6">
            <h2 className="font-bold text-white mb-4">카테고리</h2>
            <div className="space-y-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/dashboard/community/category/${cat.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-gray-300 group-hover:text-white transition-colors">
                      {cat.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{cat.count}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* 인기 태그 */}
          <div className="glass rounded-xl p-6">
            <h2 className="font-bold text-white mb-4">인기 태그</h2>
            <div className="flex flex-wrap gap-2">
              {["#혈당관리", "#다이어트", "#라돈", "#저탄고지", "#운동", "#수면", "#스트레스", "#공기질"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-white/5 text-sm text-gray-400 hover:bg-white/10 hover:text-white cursor-pointer transition-colors"
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
          </div>

          {/* 이벤트 배너 */}
          <div className="rounded-xl p-6 bg-gradient-to-br from-manpasik-primary to-manpasik-secondary text-white">
            <h3 className="font-bold mb-2">🎉 신규 챌린지 오픈!</h3>
            <p className="text-sm text-white/80 mb-4">
              7일 연속 측정 챌린지에 참여하고 카트리지를 받으세요
            </p>
            <button className="w-full py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-sm font-medium">
              자세히 보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
