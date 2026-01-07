/**
 * 외부 헬스케어 앱 연동 서비스
 * Apple Health, Google Fit, Samsung Health 등과 데이터 동기화
 */

export interface HealthRecord {
  id: string;
  type: HealthRecordType;
  value: number;
  unit: string;
  timestamp: Date;
  source: DataSource;
  metadata?: Record<string, unknown>;
}

export type HealthRecordType = 
  | "glucose"
  | "cholesterol"
  | "ketone"
  | "blood_pressure_systolic"
  | "blood_pressure_diastolic"
  | "heart_rate"
  | "steps"
  | "calories"
  | "sleep_hours"
  | "weight"
  | "height"
  | "body_fat"
  | "water_intake"
  | "oxygen_saturation";

export type DataSource = 
  | "manpasik"
  | "apple_health"
  | "google_fit"
  | "samsung_health"
  | "fitbit"
  | "garmin"
  | "manual";

export interface SyncStatus {
  source: DataSource;
  isConnected: boolean;
  lastSync: Date | null;
  recordCount: number;
  hasPermission: boolean;
}

type SyncCallback = (status: SyncStatus) => void;

class HealthSyncService {
  private syncStatuses: Map<DataSource, SyncStatus> = new Map();
  private syncCallbacks: SyncCallback[] = [];
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    // 초기 상태 설정
    const sources: DataSource[] = [
      "apple_health", "google_fit", "samsung_health", "fitbit", "garmin"
    ];
    
    sources.forEach(source => {
      this.syncStatuses.set(source, {
        source,
        isConnected: false,
        lastSync: null,
        recordCount: 0,
        hasPermission: false,
      });
    });
  }

  /**
   * 외부 서비스 연결
   */
  async connect(source: DataSource): Promise<SyncStatus> {
    console.log(`🔗 ${source} 연결 시도...`);
    
    // 시뮬레이션: 권한 요청 및 연결
    await this.delay(1500);
    
    // 90% 확률로 성공
    if (Math.random() > 0.1) {
      const status: SyncStatus = {
        source,
        isConnected: true,
        lastSync: null,
        recordCount: 0,
        hasPermission: true,
      };
      this.syncStatuses.set(source, status);
      this.notifyCallbacks(status);
      console.log(`✅ ${source} 연결 완료`);
      return status;
    } else {
      throw new Error(`${source} 연결에 실패했습니다. 다시 시도해주세요.`);
    }
  }

  /**
   * 외부 서비스 연결 해제
   */
  async disconnect(source: DataSource): Promise<void> {
    console.log(`🔌 ${source} 연결 해제...`);
    
    const status = this.syncStatuses.get(source);
    if (status) {
      status.isConnected = false;
      status.hasPermission = false;
      this.notifyCallbacks(status);
    }
  }

  /**
   * 데이터 동기화 (가져오기)
   */
  async syncFromSource(source: DataSource, options?: {
    startDate?: Date;
    endDate?: Date;
    types?: HealthRecordType[];
  }): Promise<HealthRecord[]> {
    const status = this.syncStatuses.get(source);
    if (!status?.isConnected) {
      throw new Error(`${source}에 먼저 연결해주세요.`);
    }

    console.log(`📥 ${source}에서 데이터 동기화 중...`);
    await this.delay(2000);

    // 시뮬레이션: 가상 데이터 생성
    const types = options?.types || ["heart_rate", "steps", "sleep_hours"];
    const records: HealthRecord[] = [];
    
    const startDate = options?.startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = options?.endDate || new Date();
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      types.forEach(type => {
        records.push(this.generateMockRecord(type, source, new Date(d)));
      });
    }

    // 상태 업데이트
    status.lastSync = new Date();
    status.recordCount += records.length;
    this.syncStatuses.set(source, status);
    this.notifyCallbacks(status);

    console.log(`✅ ${records.length}개의 레코드 동기화 완료`);
    return records;
  }

  /**
   * 데이터 내보내기 (업로드)
   */
  async syncToSource(source: DataSource, records: HealthRecord[]): Promise<number> {
    const status = this.syncStatuses.get(source);
    if (!status?.isConnected) {
      throw new Error(`${source}에 먼저 연결해주세요.`);
    }

    console.log(`📤 ${source}로 ${records.length}개 데이터 내보내기 중...`);
    await this.delay(1500);

    // 시뮬레이션: 95% 성공률
    const successCount = Math.floor(records.length * 0.95);
    console.log(`✅ ${successCount}개 레코드 내보내기 완료`);
    
    return successCount;
  }

  /**
   * 자동 동기화 시작
   */
  startAutoSync(intervalMs: number = 30 * 60 * 1000): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    console.log(`🔄 자동 동기화 시작 (${intervalMs / 60000}분 간격)`);
    
    this.syncInterval = setInterval(async () => {
      for (const [source, status] of this.syncStatuses) {
        if (status.isConnected) {
          try {
            await this.syncFromSource(source);
          } catch (error) {
            console.error(`자동 동기화 실패 (${source}):`, error);
          }
        }
      }
    }, intervalMs);
  }

  /**
   * 자동 동기화 중지
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log("🛑 자동 동기화 중지");
    }
  }

  /**
   * 연결 상태 조회
   */
  getStatus(source: DataSource): SyncStatus | undefined {
    return this.syncStatuses.get(source);
  }

  getAllStatuses(): SyncStatus[] {
    return Array.from(this.syncStatuses.values());
  }

  /**
   * 상태 변경 리스너
   */
  onStatusChange(callback: SyncCallback): () => void {
    this.syncCallbacks.push(callback);
    return () => {
      this.syncCallbacks = this.syncCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * 데이터 분석
   */
  analyzeRecords(records: HealthRecord[]): {
    averages: Record<string, number>;
    trends: Record<string, "up" | "down" | "stable">;
    insights: string[];
  } {
    const averages: Record<string, number> = {};
    const trends: Record<string, "up" | "down" | "stable"> = {};
    const insights: string[] = [];

    // 타입별 그룹화
    const grouped: Record<string, HealthRecord[]> = {};
    records.forEach(r => {
      if (!grouped[r.type]) grouped[r.type] = [];
      grouped[r.type].push(r);
    });

    // 평균 및 트렌드 계산
    Object.entries(grouped).forEach(([type, recs]) => {
      const sorted = recs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      const values = sorted.map(r => r.value);
      
      averages[type] = values.reduce((a, b) => a + b, 0) / values.length;
      
      // 트렌드 계산 (최근 vs 이전)
      if (values.length >= 4) {
        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        
        if (secondAvg > firstAvg * 1.05) trends[type] = "up";
        else if (secondAvg < firstAvg * 0.95) trends[type] = "down";
        else trends[type] = "stable";
      } else {
        trends[type] = "stable";
      }
    });

    // 인사이트 생성
    if (trends["steps"] === "down") {
      insights.push("최근 걸음 수가 감소하고 있습니다. 가벼운 산책을 추천합니다.");
    }
    if (trends["sleep_hours"] === "down") {
      insights.push("수면 시간이 줄어들고 있습니다. 일정한 취침 시간을 유지해보세요.");
    }
    if (averages["heart_rate"] > 80) {
      insights.push("평균 심박수가 높은 편입니다. 스트레스 관리에 신경 써주세요.");
    }

    return { averages, trends, insights };
  }

  /**
   * 가상 레코드 생성
   */
  private generateMockRecord(
    type: HealthRecordType,
    source: DataSource,
    date: Date
  ): HealthRecord {
    const configs: Record<HealthRecordType, { min: number; max: number; unit: string }> = {
      glucose: { min: 70, max: 120, unit: "mg/dL" },
      cholesterol: { min: 150, max: 220, unit: "mg/dL" },
      ketone: { min: 0.1, max: 0.8, unit: "mmol/L" },
      blood_pressure_systolic: { min: 100, max: 140, unit: "mmHg" },
      blood_pressure_diastolic: { min: 60, max: 90, unit: "mmHg" },
      heart_rate: { min: 55, max: 100, unit: "bpm" },
      steps: { min: 3000, max: 15000, unit: "steps" },
      calories: { min: 1500, max: 3000, unit: "kcal" },
      sleep_hours: { min: 4, max: 9, unit: "hours" },
      weight: { min: 50, max: 90, unit: "kg" },
      height: { min: 150, max: 190, unit: "cm" },
      body_fat: { min: 10, max: 35, unit: "%" },
      water_intake: { min: 1000, max: 3000, unit: "ml" },
      oxygen_saturation: { min: 95, max: 100, unit: "%" },
    };

    const config = configs[type];
    const value = Math.round((config.min + Math.random() * (config.max - config.min)) * 10) / 10;

    return {
      id: `${source}-${type}-${date.getTime()}`,
      type,
      value,
      unit: config.unit,
      timestamp: date,
      source,
    };
  }

  private notifyCallbacks(status: SyncStatus): void {
    this.syncCallbacks.forEach(cb => cb(status));
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 싱글톤 인스턴스
export const healthSyncService = new HealthSyncService();

