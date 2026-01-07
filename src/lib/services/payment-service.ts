/**
 * 결제 서비스
 * 구독, 상품 결제, 화상진료 비용 처리
 */

export interface PaymentMethod {
  id: string;
  type: "card" | "bank" | "kakao" | "naver" | "apple_pay" | "google_pay";
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface Subscription {
  id: string;
  planId: string;
  planName: string;
  status: "active" | "paused" | "cancelled" | "expired";
  price: number;
  billingCycle: "monthly" | "yearly";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  features: string[];
}

export interface Order {
  id: string;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled" | "refunded";
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  paymentMethodId: string;
  shippingAddress?: Address;
  createdAt: Date;
  paidAt?: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface Address {
  name: string;
  phone: string;
  zipCode: string;
  address1: string;
  address2?: string;
  isDefault: boolean;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  receiptUrl?: string;
}

class PaymentService {
  private paymentMethods: PaymentMethod[] = [];
  private subscriptions: Subscription[] = [];
  private orders: Order[] = [];

  constructor() {
    // 초기 데모 데이터
    this.paymentMethods = [
      {
        id: "pm-001",
        type: "card",
        last4: "1234",
        brand: "Visa",
        expiryMonth: 12,
        expiryYear: 2028,
        isDefault: true,
      },
      {
        id: "pm-002",
        type: "kakao",
        isDefault: false,
      },
    ];

    this.subscriptions = [
      {
        id: "sub-001",
        planId: "bio_optimization",
        planName: "바이오 최적화",
        status: "active",
        price: 29900,
        billingCycle: "monthly",
        currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
        features: ["월 12회 카트리지", "고급 AI 코칭", "맞춤 식단/운동", "환경 모니터링", "무제한 저장"],
      },
    ];
  }

  /**
   * 결제 수단
   */
  getPaymentMethods(): PaymentMethod[] {
    return this.paymentMethods;
  }

  async addPaymentMethod(method: Omit<PaymentMethod, "id">): Promise<PaymentMethod> {
    console.log("💳 결제 수단 추가 중...");
    await this.delay(1500);

    const newMethod: PaymentMethod = {
      ...method,
      id: `pm-${Date.now()}`,
    };

    // 새 결제 수단이 기본이면 기존 기본 해제
    if (newMethod.isDefault) {
      this.paymentMethods.forEach(m => (m.isDefault = false));
    }

    this.paymentMethods.push(newMethod);
    console.log("✅ 결제 수단 추가 완료");
    return newMethod;
  }

  async removePaymentMethod(methodId: string): Promise<void> {
    this.paymentMethods = this.paymentMethods.filter(m => m.id !== methodId);
  }

  async setDefaultPaymentMethod(methodId: string): Promise<void> {
    this.paymentMethods.forEach(m => {
      m.isDefault = m.id === methodId;
    });
  }

  /**
   * 구독 관리
   */
  getSubscriptions(): Subscription[] {
    return this.subscriptions;
  }

  async subscribe(planId: string, billingCycle: "monthly" | "yearly"): Promise<Subscription> {
    console.log(`📋 구독 시작: ${planId} (${billingCycle})`);
    await this.delay(2000);

    const plans: Record<string, { name: string; monthlyPrice: number; yearlyPrice: number; features: string[] }> = {
      basic_safety: {
        name: "기본 안심 케어",
        monthlyPrice: 9900,
        yearlyPrice: 99000,
        features: ["월 4회 카트리지", "기본 AI 분석", "1년 데이터 저장", "건강 트렌드 리포트"],
      },
      bio_optimization: {
        name: "바이오 최적화",
        monthlyPrice: 29900,
        yearlyPrice: 299000,
        features: ["월 12회 카트리지", "고급 AI 코칭", "맞춤 식단/운동", "환경 모니터링", "무제한 저장"],
      },
      clinical_guard: {
        name: "클리니컬 가드",
        monthlyPrice: 59900,
        yearlyPrice: 599000,
        features: ["월 30회 카트리지", "프리미엄 AI", "월 2회 화상진료", "긴급 상담", "처방전"],
      },
    };

    const plan = plans[planId];
    if (!plan) throw new Error("존재하지 않는 플랜입니다.");

    const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice / 12;
    const periodDays = billingCycle === "monthly" ? 30 : 365;

    const subscription: Subscription = {
      id: `sub-${Date.now()}`,
      planId,
      planName: plan.name,
      status: "active",
      price,
      billingCycle,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
      features: plan.features,
    };

    // 기존 구독 취소
    this.subscriptions.forEach(s => {
      if (s.status === "active") s.status = "cancelled";
    });

    this.subscriptions.push(subscription);
    console.log("✅ 구독 완료");
    return subscription;
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    const sub = this.subscriptions.find(s => s.id === subscriptionId);
    if (sub) {
      sub.cancelAtPeriodEnd = true;
      console.log(`📋 구독 취소 예약: ${sub.planName} (기간 종료 시 해지)`);
    }
  }

  async reactivateSubscription(subscriptionId: string): Promise<void> {
    const sub = this.subscriptions.find(s => s.id === subscriptionId);
    if (sub) {
      sub.cancelAtPeriodEnd = false;
      console.log(`📋 구독 재활성화: ${sub.planName}`);
    }
  }

  /**
   * 주문 및 결제
   */
  getOrders(): Order[] {
    return this.orders;
  }

  async createOrder(items: OrderItem[], shippingAddress: Address): Promise<Order> {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal >= 30000 ? 0 : 3000; // 3만원 이상 무료배송
    const tax = Math.round(subtotal * 0.1); // 부가세 10%

    const order: Order = {
      id: `order-${Date.now()}`,
      status: "pending",
      items,
      subtotal,
      discount: 0,
      shipping,
      tax,
      total: subtotal + shipping + tax,
      paymentMethodId: this.paymentMethods.find(m => m.isDefault)?.id || "",
      shippingAddress,
      createdAt: new Date(),
    };

    this.orders.push(order);
    return order;
  }

  async payOrder(orderId: string): Promise<PaymentResult> {
    console.log(`💰 주문 결제 중: ${orderId}`);
    await this.delay(2000);

    const order = this.orders.find(o => o.id === orderId);
    if (!order) {
      return { success: false, error: "주문을 찾을 수 없습니다." };
    }

    // 95% 성공률 시뮬레이션
    if (Math.random() > 0.05) {
      order.status = "paid";
      order.paidAt = new Date();
      
      console.log("✅ 결제 완료");
      return {
        success: true,
        transactionId: `txn-${Date.now()}`,
        receiptUrl: `https://manpasik.com/receipts/${order.id}`,
      };
    } else {
      return { success: false, error: "결제가 거부되었습니다. 다른 결제 수단을 시도해주세요." };
    }
  }

  async applyDiscount(orderId: string, discountCode: string): Promise<number> {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) throw new Error("주문을 찾을 수 없습니다.");

    // 할인 코드 시뮬레이션
    const discounts: Record<string, number> = {
      WELCOME10: 0.1,
      HEALTH20: 0.2,
      MANPASIK30: 0.3,
    };

    const discountRate = discounts[discountCode.toUpperCase()];
    if (!discountRate) throw new Error("유효하지 않은 할인 코드입니다.");

    order.discount = Math.round(order.subtotal * discountRate);
    order.total = order.subtotal + order.shipping + order.tax - order.discount;

    console.log(`🎫 할인 적용: ${discountRate * 100}% (${order.discount.toLocaleString()}원)`);
    return order.discount;
  }

  /**
   * 화상진료 결제
   */
  async payForTelemedicine(doctorId: string, amount: number): Promise<PaymentResult> {
    console.log(`🏥 화상진료 결제: ${amount.toLocaleString()}원`);
    await this.delay(1500);

    if (Math.random() > 0.05) {
      return {
        success: true,
        transactionId: `telemedicine-${Date.now()}`,
        receiptUrl: `https://manpasik.com/receipts/telemedicine/${doctorId}`,
      };
    } else {
      return { success: false, error: "결제에 실패했습니다." };
    }
  }

  /**
   * 영수증 조회
   */
  async getReceipt(transactionId: string): Promise<{
    transactionId: string;
    date: Date;
    items: { name: string; amount: number }[];
    total: number;
  } | null> {
    await this.delay(500);
    
    // 시뮬레이션
    return {
      transactionId,
      date: new Date(),
      items: [
        { name: "혈당 카트리지 10팩", amount: 22500 },
        { name: "배송비", amount: 0 },
      ],
      total: 22500,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 싱글톤 인스턴스
export const paymentService = new PaymentService();

