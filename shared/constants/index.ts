// MPS 생태계 공유 상수

// ============================================
// 측정 기준값
// ============================================
export const MEASUREMENT_RANGES = {
  glucose: {
    unit: 'mg/dL',
    normal: { min: 70, max: 100 },
    preDiabetic: { min: 100, max: 125 },
    diabetic: { min: 126, max: Infinity },
    low: { min: 0, max: 70 },
  },
  ketone: {
    unit: 'mmol/L',
    normal: { min: 0, max: 0.6 },
    optimal: { min: 0.5, max: 3.0 },
    high: { min: 3.0, max: 10 },
    dangerous: { min: 10, max: Infinity },
  },
  cholesterol: {
    unit: 'mg/dL',
    total: {
      desirable: { min: 0, max: 200 },
      borderline: { min: 200, max: 239 },
      high: { min: 240, max: Infinity },
    },
    ldl: {
      optimal: { min: 0, max: 100 },
      nearOptimal: { min: 100, max: 129 },
      borderline: { min: 130, max: 159 },
      high: { min: 160, max: 189 },
      veryHigh: { min: 190, max: Infinity },
    },
    hdl: {
      low: { min: 0, max: 40 },
      acceptable: { min: 40, max: 59 },
      high: { min: 60, max: Infinity },
    },
  },
  lactate: {
    unit: 'mmol/L',
    rest: { min: 0, max: 2 },
    exercise: { min: 2, max: 4 },
    anaerobic: { min: 4, max: 8 },
    dangerous: { min: 8, max: Infinity },
  },
  uricAcid: {
    unit: 'mg/dL',
    male: {
      normal: { min: 3.4, max: 7.0 },
      high: { min: 7.0, max: Infinity },
    },
    female: {
      normal: { min: 2.4, max: 6.0 },
      high: { min: 6.0, max: Infinity },
    },
  },
  radon: {
    unit: 'Bq/m³',
    safe: { min: 0, max: 100 },
    acceptable: { min: 100, max: 148 },
    actionLevel: { min: 148, max: 300 },
    high: { min: 300, max: Infinity },
  },
  co2: {
    unit: 'ppm',
    excellent: { min: 0, max: 400 },
    good: { min: 400, max: 1000 },
    moderate: { min: 1000, max: 2000 },
    poor: { min: 2000, max: 5000 },
    dangerous: { min: 5000, max: Infinity },
  },
  vocs: {
    unit: 'ppb',
    excellent: { min: 0, max: 50 },
    good: { min: 50, max: 150 },
    moderate: { min: 150, max: 500 },
    poor: { min: 500, max: 1000 },
    dangerous: { min: 1000, max: Infinity },
  },
  ph: {
    unit: 'pH',
    acidic: { min: 0, max: 6.5 },
    neutral: { min: 6.5, max: 8.5 },
    alkaline: { min: 8.5, max: 14 },
  },
} as const;

// ============================================
// 구독 플랜
// ============================================
export const SUBSCRIPTION_PLANS = {
  basic_safety: {
    id: 'basic_safety',
    name: '기본 안심 케어',
    priceMonthly: 9900,
    priceYearly: 99000,
    cartridgeAllowance: 4,
    aiCoachingLevel: 'basic',
    telemedicineIncluded: false,
    features: [
      '월 4회 카트리지 제공',
      '기본 AI 건강 분석',
      '측정 데이터 저장 (1년)',
      '건강 트렌드 리포트',
    ],
  },
  bio_optimization: {
    id: 'bio_optimization',
    name: '바이오 최적화',
    priceMonthly: 29900,
    priceYearly: 299000,
    cartridgeAllowance: 12,
    aiCoachingLevel: 'advanced',
    telemedicineIncluded: false,
    features: [
      '월 12회 카트리지 제공',
      '고급 AI 건강 코칭',
      '맞춤형 식단/운동 추천',
      '실시간 환경 모니터링',
      '무제한 데이터 저장',
    ],
  },
  clinical_guard: {
    id: 'clinical_guard',
    name: '클리니컬 가드',
    priceMonthly: 59900,
    priceYearly: 599000,
    cartridgeAllowance: 30,
    aiCoachingLevel: 'premium',
    telemedicineIncluded: true,
    features: [
      '월 30회 카트리지 제공',
      '프리미엄 AI 코칭',
      '월 2회 화상 진료',
      '긴급 상담 핫라인',
      '의료진 직접 연결',
      '처방전 발행',
    ],
  },
  family: {
    id: 'family',
    name: '패밀리 케어',
    priceMonthly: 99900,
    priceYearly: 999000,
    cartridgeAllowance: 50,
    aiCoachingLevel: 'premium',
    telemedicineIncluded: true,
    familyMembers: 5,
    features: [
      '최대 5명 가족 공유',
      '월 50회 카트리지',
      '가족별 맞춤 코칭',
      '보호자 모드',
      '가족 건강 대시보드',
      '월 5회 화상 진료',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: '기업/기관용',
    priceMonthly: 0, // 맞춤 견적
    priceYearly: 0,
    cartridgeAllowance: -1, // 무제한
    aiCoachingLevel: 'premium',
    telemedicineIncluded: true,
    features: [
      '맞춤형 계약',
      '무제한 사용자',
      '전용 서버',
      'API 연동',
      '전담 매니저',
      '온사이트 교육',
    ],
  },
} as const;

// ============================================
// 카트리지 정보
// ============================================
export const CARTRIDGE_INFO = {
  glucose: {
    name: '혈당 카트리지',
    category: 'health',
    description: '공복 혈당 및 식후 혈당 측정',
    measurementTime: 5,
    sampleType: 'blood',
    sampleVolume: 0.3,
    pricePerUnit: 2500,
  },
  ketone: {
    name: '케톤체 카트리지',
    category: 'health',
    description: '혈중 케톤체 농도 측정',
    measurementTime: 10,
    sampleType: 'blood',
    sampleVolume: 0.5,
    pricePerUnit: 3500,
  },
  cholesterol: {
    name: '콜레스테롤 카트리지',
    category: 'health',
    description: '총 콜레스테롤, HDL, LDL 측정',
    measurementTime: 180,
    sampleType: 'blood',
    sampleVolume: 15,
    pricePerUnit: 5000,
  },
  radon: {
    name: '라돈 카트리지',
    category: 'environment',
    description: '실내 라돈 농도 측정',
    measurementTime: 3600,
    sampleType: 'air',
    sampleVolume: 1000,
    pricePerUnit: 15000,
  },
  vocs: {
    name: 'VOCs 카트리지',
    category: 'environment',
    description: '휘발성 유기화합물 측정',
    measurementTime: 300,
    sampleType: 'air',
    sampleVolume: 500,
    pricePerUnit: 8000,
  },
  ph: {
    name: 'pH 카트리지',
    category: 'water',
    description: '수질 pH 측정',
    measurementTime: 30,
    sampleType: 'water',
    sampleVolume: 5,
    pricePerUnit: 3000,
  },
  pesticide: {
    name: '잔류농약 카트리지',
    category: 'food',
    description: '농산물 잔류농약 검출',
    measurementTime: 600,
    sampleType: 'extract',
    sampleVolume: 2,
    pricePerUnit: 12000,
  },
} as const;

// ============================================
// 앱 설정
// ============================================
export const APP_CONFIG = {
  appName: '만파식',
  appNameEn: 'Manpasik',
  version: '1.0.0',
  supportEmail: 'support@manpasik.com',
  privacyPolicyUrl: 'https://manpasik.com/privacy',
  termsOfServiceUrl: 'https://manpasik.com/terms',
  defaultLanguage: 'ko',
  supportedLanguages: ['ko', 'en', 'ja', 'zh-CN', 'zh-TW'],
} as const;

// ============================================
// 네비게이션
// ============================================
export const NAV_ITEMS = {
  main: [
    { key: 'home', label: '홈', icon: 'home', path: '/dashboard' },
    { key: 'measurement', label: '측정', icon: 'activity', path: '/dashboard/measurement' },
    { key: 'analysis', label: '분석', icon: 'chart', path: '/dashboard/analysis' },
    { key: 'ai-coach', label: 'AI 코치', icon: 'brain', path: '/dashboard/ai-coach' },
    { key: 'more', label: '더보기', icon: 'menu', path: '/dashboard/more' },
  ],
  more: [
    { key: 'marketplace', label: '마켓플레이스', icon: 'shop', path: '/dashboard/marketplace' },
    { key: 'telemedicine', label: '화상진료', icon: 'video', path: '/dashboard/telemedicine' },
    { key: 'community', label: '커뮤니티', icon: 'users', path: '/dashboard/community' },
    { key: 'family', label: '가족관리', icon: 'family', path: '/dashboard/family' },
    { key: 'settings', label: '설정', icon: 'settings', path: '/dashboard/settings' },
  ],
} as const;
