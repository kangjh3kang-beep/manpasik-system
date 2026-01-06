// MPS 생태계 공유 타입 정의

// ============================================
// 사용자 및 인증
// ============================================
export interface User {
  id: string;
  email: string;
  nickname: string | null;
  healthScore: number;
  role: 'user' | 'admin' | 'researcher' | 'doctor';
  createdAt: string;
  updatedAt: string;
}

export interface Profile extends User {
  phone?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  bloodType?: 'A' | 'B' | 'O' | 'AB';
  emergencyContacts?: EmergencyContact[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

// ============================================
// 기기 및 카트리지
// ============================================
export interface Device {
  id: string;
  deviceSerial: string;
  ownerId: string | null;
  firmwareVersion: string;
  status: 'online' | 'offline' | 'error';
  batteryLevel?: number;
  lastSyncAt: string | null;
  createdAt: string;
}

export interface Cartridge {
  id: string;
  deviceId: string;
  cartridgeType: CartridgeType;
  remainingUses: number;
  maxUses: number;
  manufacturedAt: string;
  expiredAt: string;
  lotNumber: string;
  calibrationData?: Record<string, number>;
  createdAt: string;
}

export type CartridgeType = 
  // 건강 측정
  | 'glucose' 
  | 'ketone' 
  | 'cholesterol' 
  | 'lactate' 
  | 'uric_acid'
  | 'hemoglobin'
  // 환경 측정
  | 'radon' 
  | 'vocs' 
  | 'co2' 
  | 'dust'
  | 'formaldehyde'
  // 수질 측정
  | 'ph' 
  | 'heavy_metals' 
  | 'chlorine'
  | 'bacteria'
  // 식품 안전
  | 'pesticide' 
  | 'pathogen' 
  | 'allergen'
  | 'freshness'
  // 약물
  | 'drug_detection';

export const CartridgeCategories = {
  health: ['glucose', 'ketone', 'cholesterol', 'lactate', 'uric_acid', 'hemoglobin'],
  environment: ['radon', 'vocs', 'co2', 'dust', 'formaldehyde'],
  water: ['ph', 'heavy_metals', 'chlorine', 'bacteria'],
  food: ['pesticide', 'pathogen', 'allergen', 'freshness'],
  safety: ['drug_detection'],
} as const;

// ============================================
// 측정 데이터
// ============================================
export interface Measurement {
  id: string;
  userId: string;
  deviceId: string | null;
  cartridgeId: string | null;
  measurementType: string;
  value: number;
  unit: string;
  measuredAt: string;
  locationLat?: number;
  locationLng?: number;
  environmentalData?: EnvironmentalData;
  aiAnalysis?: AIAnalysis;
  rawSignalData?: RawSignalData;
  qualityScore?: number;
  createdAt: string;
}

export interface EnvironmentalData {
  temperature?: number;
  humidity?: number;
  pressure?: number;
  altitude?: number;
}

export interface AIAnalysis {
  interpretation: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  predictedTrend?: 'improving' | 'stable' | 'worsening';
  confidence: number;
}

export interface RawSignalData {
  waveform: number[];
  samplingRate: number;
  gain: number;
  offset: number;
}

// ============================================
// 건강 점수 및 분석
// ============================================
export interface HealthScore {
  overall: number;
  categories: {
    bloodHealth: number;
    metabolic: number;
    cardiovascular: number;
    hydration: number;
    stress: number;
  };
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: string;
}

export interface HealthInsight {
  id: string;
  userId: string;
  type: 'daily' | 'weekly' | 'monthly' | 'alert';
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  actionRequired: boolean;
  actions?: InsightAction[];
  createdAt: string;
}

export interface InsightAction {
  type: 'measurement' | 'coaching' | 'consultation' | 'purchase';
  label: string;
  route: string;
  params?: Record<string, string>;
}

// ============================================
// AI 코칭
// ============================================
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  actions?: ChatAction[];
}

export interface ChatAction {
  type: 'start_measurement' | 'view_coaching' | 'book_appointment' | 'view_product';
  label: string;
  params: Record<string, string>;
}

export interface CoachingPlan {
  id: string;
  userId: string;
  type: 'diet' | 'exercise' | 'sleep' | 'stress' | 'environment';
  title: string;
  description: string;
  goals: CoachingGoal[];
  schedule: CoachingSchedule[];
  progress: number;
  startDate: string;
  endDate?: string;
  status: 'active' | 'paused' | 'completed';
}

export interface CoachingGoal {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: string;
}

export interface CoachingSchedule {
  dayOfWeek: number;
  time: string;
  activity: string;
  duration: number;
}

// ============================================
// 마켓플레이스
// ============================================
export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  subcategory: string;
  price: number;
  currency: string;
  images: string[];
  inStock: boolean;
  stockQuantity: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  createdAt: string;
}

export type ProductCategory = 
  | 'cartridge' 
  | 'supplement' 
  | 'health_food' 
  | 'medical_device' 
  | 'sports_equipment' 
  | 'environment_product';

export interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Address {
  name: string;
  phone: string;
  postalCode: string;
  address1: string;
  address2?: string;
  city: string;
  country: string;
}

// ============================================
// 구독
// ============================================
export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  plan: SubscriptionPlan;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  nextBillingDate?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  tier: 'basic_safety' | 'bio_optimization' | 'clinical_guard' | 'family' | 'enterprise';
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  features: string[];
  cartridgeAllowance: number;
  aiCoachingLevel: 'basic' | 'advanced' | 'premium';
  telemedicineIncluded: boolean;
  familyMembers?: number;
}

// ============================================
// 화상진료
// ============================================
export interface Doctor {
  id: string;
  name: string;
  profileImage: string;
  specialty: string;
  hospital: string;
  rating: number;
  reviewCount: number;
  languages: string[];
  availableSlots: TimeSlot[];
  consultationFee: number;
  currency: string;
  bio: string;
}

export interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  doctor: Doctor;
  scheduledAt: string;
  duration: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  sessionId?: string;
  notes?: string;
  prescription?: Prescription;
  createdAt: string;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  doctorId: string;
  medications: Medication[];
  instructions: string;
  validUntil: string;
  issuedAt: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

// ============================================
// 알림
// ============================================
export interface Notification {
  id: string;
  userId: string;
  type: 'measurement_reminder' | 'health_alert' | 'coaching' | 'order' | 'appointment' | 'system';
  title: string;
  body: string;
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: string;
}

// ============================================
// API 응답
// ============================================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}
