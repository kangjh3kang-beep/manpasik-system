"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  PenSquare,
  Lightbulb,
  HelpCircle,
  Coffee,
  TrendingUp,
  Clock,
  ThumbsUp,
  Eye,
  X,
} from "lucide-react";
import { Button, Input, Modal } from "@/components/ui";

type PostCategory = "all" | "tips" | "qna" | "free";

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    level: string;
  };
  category: Exclude<PostCategory, "all">;
  title: string;
  content: string;
  likes: number;
  comments: number;
  views: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
  tags?: string[];
}

// 카테고리 설정
const categories = [
  { id: "all" as const, label: "전체글", icon: TrendingUp },
  { id: "tips" as const, label: "팁 & 노하우", icon: Lightbulb },
  { id: "qna" as const, label: "질문/답변", icon: HelpCircle },
  { id: "free" as const, label: "자유게시판", icon: Coffee },
];

const categoryConfig = {
  tips: {
    label: "팁 & 노하우",
    color: "text-[var(--manpasik-primary)]",
    bg: "bg-[var(--manpasik-primary)]/20",
  },
  qna: {
    label: "질문/답변",
    color: "text-[var(--manpasik-secondary)]",
    bg: "bg-[var(--manpasik-secondary)]/20",
  },
  free: {
    label: "자유게시판",
    color: "text-[var(--manpasik-bio-green)]",
    bg: "bg-[var(--manpasik-bio-green)]/20",
  },
};

// 더미 게시글 데이터
const mockPosts: Post[] = [
  {
    id: "1",
    author: {
      name: "건강지킴이",
      avatar: "H",
      level: "Gold",
    },
    category: "tips",
    title: "식후 혈당 관리의 황금 법칙 5가지",
    content:
      "오랜 시간 혈당 관리를 하면서 터득한 노하우를 공유합니다. 첫째, 식사 후 15분 산책은 혈당 스파이크를 25% 줄여줍니다. 둘째, 단백질을 먼저 먹고 탄수화물을 나중에...",
    likes: 342,
    comments: 45,
    views: 2341,
    isLiked: false,
    isBookmarked: true,
    createdAt: "2시간 전",
    tags: ["혈당관리", "식이요법", "꿀팁"],
  },
  {
    id: "2",
    author: {
      name: "당뇨초보",
      avatar: "D",
      level: "Silver",
    },
    category: "qna",
    title: "MPK-Reader 펌웨어 업데이트 방법 문의드립니다",
    content:
      "안녕하세요, 최근에 만파식 리더기를 구매했는데요. 앱에서 펌웨어 업데이트가 있다고 뜨는데 어떻게 하는 건가요? 혹시 업데이트 중에 전원이 꺼지면 어떻게 되나요?",
    likes: 23,
    comments: 8,
    views: 156,
    isLiked: true,
    isBookmarked: false,
    createdAt: "5시간 전",
    tags: ["질문", "펌웨어", "초보"],
  },
  {
    id: "3",
    author: {
      name: "웰빙라이프",
      avatar: "W",
      level: "Platinum",
    },
    category: "tips",
    title: "만파식 리더기 정확도를 높이는 측정 팁",
    content:
      "측정 전 손을 따뜻하게 하면 혈액 순환이 좋아져서 더 정확한 측정이 가능합니다. 또한 측정 부위를 알코올로 닦은 후 완전히 마를 때까지 기다리세요...",
    likes: 567,
    comments: 89,
    views: 4532,
    isLiked: true,
    isBookmarked: true,
    createdAt: "어제",
    tags: ["측정팁", "정확도", "리더기"],
  },
  {
    id: "4",
    author: {
      name: "운동하는직장인",
      avatar: "U",
      level: "Gold",
    },
    category: "free",
    title: "오늘 드디어 정상 수치 달성했습니다! 🎉",
    content:
      "3개월간의 노력 끝에 드디어 공복 혈당이 정상 범위로 들어왔어요! 식단 조절과 꾸준한 운동이 정말 효과가 있더라구요. 포기하지 않고 함께 해주신 커뮤니티 분들께 감사드립니다.",
    likes: 892,
    comments: 134,
    views: 3210,
    isLiked: false,
    isBookmarked: false,
    createdAt: "어제",
    tags: ["성공후기", "동기부여"],
  },
  {
    id: "5",
    author: {
      name: "의사선생님",
      avatar: "M",
      level: "Expert",
    },
    category: "tips",
    title: "[전문가 칼럼] 당화혈색소(HbA1c) 이해하기",
    content:
      "당화혈색소는 최근 2~3개월간의 평균 혈당 수치를 반영합니다. 공복 혈당만 관리하는 것보다 당화혈색소를 함께 모니터링하는 것이 장기적인 건강 관리에 더 효과적입니다...",
    likes: 1234,
    comments: 67,
    views: 8901,
    isLiked: false,
    isBookmarked: true,
    createdAt: "3일 전",
    tags: ["전문가칼럼", "당화혈색소", "건강지식"],
  },
  {
    id: "6",
    author: {
      name: "자연인",
      avatar: "J",
      level: "Bronze",
    },
    category: "qna",
    title: "리더기 두 개 연동 가능한가요?",
    content:
      "집에 하나, 회사에 하나 두고 싶은데 하나의 앱 계정에 리더기 두 개를 연동해서 사용할 수 있나요? 데이터가 합쳐져서 나오는지 궁금합니다.",
    likes: 45,
    comments: 12,
    views: 289,
    isLiked: false,
    isBookmarked: false,
    createdAt: "3일 전",
    tags: ["질문", "다중기기"],
  },
];

// 레벨별 색상
const levelColors: Record<string, string> = {
  Bronze: "text-orange-400",
  Silver: "text-gray-300",
  Gold: "text-yellow-400",
  Platinum: "text-cyan-400",
  Expert: "text-purple-400",
};

export default function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState<PostCategory>("all");
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  // 카테고리 필터링
  const filteredPosts =
    activeCategory === "all"
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  // 좋아요 토글
  const handleLike = (postId: string) => {
    setPosts(
      posts.map((p) =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  // 북마크 토글
  const handleBookmark = (postId: string) => {
    setPosts(
      posts.map((p) =>
        p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p
      )
    );
  };

  return (
    <div className="p-4 lg:p-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">
          커뮤니티
        </h1>
        <p className="text-gray-400">
          건강 정보와 경험을 나누고 함께 성장하세요
        </p>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all",
                activeCategory === cat.id
                  ? "bg-manpasik-gradient text-white shadow-lg"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{cat.label}</span>
              {cat.id === "all" && (
                <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-xs">
                  {posts.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 게시글 피드 */}
      <div className="max-w-2xl mx-auto space-y-4">
        {filteredPosts.map((post) => {
          const catConfig = categoryConfig[post.category];
          return (
            <article
              key={post.id}
              className="rounded-2xl bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] overflow-hidden hover:border-white/20 transition-colors"
            >
              {/* 작성자 정보 */}
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-manpasik-gradient flex items-center justify-center">
                    <span className="text-white font-bold">{post.author.avatar}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{post.author.name}</span>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          levelColors[post.author.level] || "text-gray-400"
                        )}
                      >
                        {post.author.level}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {post.createdAt}
                    </div>
                  </div>
                </div>
                <button className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* 콘텐츠 */}
              <div className="p-4">
                {/* 카테고리 배지 */}
                <span
                  className={cn(
                    "inline-flex px-2 py-1 rounded-lg text-xs font-medium mb-3",
                    catConfig.color,
                    catConfig.bg
                  )}
                >
                  {catConfig.label}
                </span>

                {/* 제목 */}
                <h3 className="text-lg font-bold text-white mb-2 hover:text-[var(--manpasik-primary)] cursor-pointer transition-colors">
                  {post.title}
                </h3>

                {/* 내용 */}
                <p className="text-gray-400 text-sm leading-relaxed mb-3 line-clamp-3">
                  {post.content}
                </p>

                {/* 태그 */}
                {post.tags && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 rounded-lg bg-white/5 text-xs text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 통계 */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {post.views.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl transition-colors",
                      post.isLiked
                        ? "text-red-400 bg-red-500/10"
                        : "text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                    )}
                  >
                    <Heart className={cn("w-5 h-5", post.isLiked && "fill-current")} />
                    <span className="text-sm font-medium">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-400 hover:text-[var(--manpasik-primary)] hover:bg-[var(--manpasik-primary)]/10 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{post.comments}</span>
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-400 hover:text-[var(--manpasik-secondary)] hover:bg-[var(--manpasik-secondary)]/10 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={() => handleBookmark(post.id)}
                  className={cn(
                    "p-2 rounded-xl transition-colors",
                    post.isBookmarked
                      ? "text-yellow-400 bg-yellow-500/10"
                      : "text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10"
                  )}
                >
                  <Bookmark className={cn("w-5 h-5", post.isBookmarked && "fill-current")} />
                </button>
              </div>
            </article>
          );
        })}

        {/* 더 보기 */}
        <div className="text-center py-8">
          <Button variant="ghost">
            더 많은 게시글 불러오기
          </Button>
        </div>
      </div>

      {/* FAB - 글쓰기 버튼 */}
      <button
        onClick={() => setIsWriteModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-manpasik-gradient shadow-lg shadow-[var(--manpasik-primary)]/30 flex items-center justify-center hover:scale-110 transition-transform z-40"
      >
        <PenSquare className="w-6 h-6 text-white" />
      </button>

      {/* 글쓰기 모달 */}
      <Modal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        title="새 글 작성"
        description="커뮤니티에 공유할 내용을 작성하세요"
        size="lg"
      >
        <div className="space-y-4">
          {/* 카테고리 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              카테고리
            </label>
            <div className="flex gap-2">
              {categories.slice(1).map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 제목 */}
          <Input label="제목" placeholder="제목을 입력하세요" />

          {/* 내용 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              내용
            </label>
            <textarea
              placeholder="내용을 입력하세요..."
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-white/5 text-white placeholder-gray-500 border border-white/10 focus:outline-none focus:border-[var(--manpasik-primary)] transition-colors resize-none"
            />
          </div>

          {/* 태그 */}
          <Input label="태그" placeholder="태그를 입력하세요 (쉼표로 구분)" />

          {/* 버튼 */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setIsWriteModalOpen(false)}
              className="flex-1"
            >
              취소
            </Button>
            <Button className="flex-1" leftIcon={<PenSquare className="w-5 h-5" />}>
              게시하기
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
