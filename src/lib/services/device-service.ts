/**
 * 만파식 기기 연결 서비스
 * BLE/NFC 시뮬레이션 및 기기 관리
 */

export interface DeviceInfo {
  id: string;
  name: string;
  type: "ble" | "nfc";
  serial: string;
  firmware: string;
  battery: number;
  signalStrength: number;
  status: "connected" | "disconnected" | "connecting" | "error";
  lastSync: Date;
}

export interface CartridgeInfo {
  id: string;
  type: "glucose" | "cholesterol" | "ketone" | "radon" | "co2" | "vocs" | "water" | "food";
  name: string;
  expiryDate: Date;
  usesRemaining: number;
  lotNumber: string;
  calibrationCode: string;
}

export interface SensorData {
  timestamp: number;
  current: number; // µA
  temperature: number; // °C
  rawValue: number;
  processedValue: number;
}

type ConnectionCallback = (device: DeviceInfo) => void;
type DataCallback = (data: SensorData) => void;
type ErrorCallback = (error: Error) => void;

class DeviceService {
  private connectedDevice: DeviceInfo | null = null;
  private insertedCartridge: CartridgeInfo | null = null;
  private connectionCallbacks: ConnectionCallback[] = [];
  private dataCallbacks: DataCallback[] = [];
  private errorCallbacks: ErrorCallback[] = [];
  private sensorInterval: NodeJS.Timeout | null = null;

  /**
   * 기기 스캔 시작 (BLE)
   */
  async scanForDevices(timeout: number = 5000): Promise<DeviceInfo[]> {
    console.log("📡 BLE 스캔 시작...");
    
    // 시뮬레이션: 랜덤 딜레이 후 가상 기기 목록 반환
    await this.delay(2000 + Math.random() * 1000);
    
    const mockDevices: DeviceInfo[] = [
      {
        id: "mps-001",
        name: "MPK-Reader-Alpha",
        type: "ble",
        serial: "MPS-2026-A001",
        firmware: "v2.3.1",
        battery: 85 + Math.floor(Math.random() * 15),
        signalStrength: 80 + Math.floor(Math.random() * 20),
        status: "disconnected",
        lastSync: new Date(Date.now() - 1000 * 60 * 5),
      },
      {
        id: "mps-002",
        name: "MPK-Reader-Beta",
        type: "ble",
        serial: "MPS-2026-B002",
        firmware: "v2.3.0",
        battery: 40 + Math.floor(Math.random() * 20),
        signalStrength: 60 + Math.floor(Math.random() * 20),
        status: "disconnected",
        lastSync: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
    ];
    
    console.log(`✅ ${mockDevices.length}개의 기기 발견`);
    return mockDevices;
  }

  /**
   * NFC 태그 스캔
   */
  async scanNFC(timeout: number = 10000): Promise<CartridgeInfo | null> {
    console.log("📲 NFC 스캔 대기 중...");
    
    // 시뮬레이션: NFC 태그 읽기
    await this.delay(1500 + Math.random() * 1000);
    
    const cartridgeTypes: CartridgeInfo["type"][] = [
      "glucose", "cholesterol", "ketone", "radon", "co2"
    ];
    const randomType = cartridgeTypes[Math.floor(Math.random() * cartridgeTypes.length)];
    
    const cartridgeNames: Record<CartridgeInfo["type"], string> = {
      glucose: "혈당 측정 카트리지",
      cholesterol: "콜레스테롤 측정 카트리지",
      ketone: "케톤 측정 카트리지",
      radon: "라돈 측정 카트리지",
      co2: "CO2 측정 카트리지",
      vocs: "VOCs 측정 카트리지",
      water: "수질 검사 카트리지",
      food: "식품 검사 카트리지",
    };
    
    const mockCartridge: CartridgeInfo = {
      id: `cart-${Date.now()}`,
      type: randomType,
      name: cartridgeNames[randomType],
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180), // 6개월 후
      usesRemaining: 5 + Math.floor(Math.random() * 10),
      lotNumber: `LOT-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      calibrationCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
    };
    
    console.log(`✅ NFC 카트리지 인식: ${mockCartridge.name}`);
    this.insertedCartridge = mockCartridge;
    return mockCartridge;
  }

  /**
   * 기기 연결
   */
  async connectDevice(deviceId: string): Promise<DeviceInfo> {
    console.log(`🔗 기기 연결 시도: ${deviceId}`);
    
    // 시뮬레이션: 연결 과정
    await this.delay(2000 + Math.random() * 1500);
    
    // 10% 확률로 연결 실패 시뮬레이션
    if (Math.random() < 0.1) {
      const error = new Error("기기 연결에 실패했습니다. 다시 시도해주세요.");
      this.errorCallbacks.forEach(cb => cb(error));
      throw error;
    }
    
    const device: DeviceInfo = {
      id: deviceId,
      name: "MPK-Reader-Alpha",
      type: "ble",
      serial: "MPS-2026-A001",
      firmware: "v2.3.1",
      battery: 85 + Math.floor(Math.random() * 15),
      signalStrength: 80 + Math.floor(Math.random() * 20),
      status: "connected",
      lastSync: new Date(),
    };
    
    this.connectedDevice = device;
    this.connectionCallbacks.forEach(cb => cb(device));
    console.log(`✅ 기기 연결 완료: ${device.name}`);
    
    return device;
  }

  /**
   * 기기 연결 해제
   */
  async disconnectDevice(): Promise<void> {
    if (!this.connectedDevice) return;
    
    console.log(`🔌 기기 연결 해제: ${this.connectedDevice.name}`);
    this.stopSensorStream();
    this.connectedDevice.status = "disconnected";
    this.connectionCallbacks.forEach(cb => cb(this.connectedDevice!));
    this.connectedDevice = null;
  }

  /**
   * 센서 데이터 스트림 시작
   */
  startSensorStream(intervalMs: number = 200): void {
    if (!this.connectedDevice || !this.insertedCartridge) {
      throw new Error("기기와 카트리지가 모두 필요합니다.");
    }
    
    console.log("📊 센서 데이터 스트림 시작...");
    let dataIndex = 0;
    
    this.sensorInterval = setInterval(() => {
      const sensorData = this.generateSensorData(dataIndex);
      this.dataCallbacks.forEach(cb => cb(sensorData));
      dataIndex++;
    }, intervalMs);
  }

  /**
   * 센서 데이터 스트림 중지
   */
  stopSensorStream(): void {
    if (this.sensorInterval) {
      clearInterval(this.sensorInterval);
      this.sensorInterval = null;
      console.log("🛑 센서 데이터 스트림 중지");
    }
  }

  /**
   * 센서 데이터 생성 (시뮬레이션)
   */
  private generateSensorData(index: number): SensorData {
    const baseValue = 85 + Math.sin(index * 0.3) * 15;
    const noise = (Math.random() - 0.5) * 8;
    const current = 1.0 + Math.random() * 0.5;
    const temperature = 36.0 + Math.random() * 1.0;
    
    return {
      timestamp: Date.now(),
      current: Math.round(current * 100) / 100,
      temperature: Math.round(temperature * 10) / 10,
      rawValue: baseValue + noise,
      processedValue: Math.round((baseValue + noise) * 10) / 10,
    };
  }

  /**
   * 측정 결과 계산
   */
  calculateResult(sensorData: SensorData[]): {
    value: number;
    unit: string;
    status: "normal" | "warning" | "critical";
    reference: { min: number; max: number };
  } {
    if (!this.insertedCartridge) {
      throw new Error("카트리지가 삽입되지 않았습니다.");
    }
    
    // 평균값 계산
    const avgValue = sensorData.reduce((sum, d) => sum + d.processedValue, 0) / sensorData.length;
    
    // 타입별 참조 범위
    const references: Record<CartridgeInfo["type"], { min: number; max: number; unit: string }> = {
      glucose: { min: 70, max: 100, unit: "mg/dL" },
      cholesterol: { min: 0, max: 200, unit: "mg/dL" },
      ketone: { min: 0, max: 0.6, unit: "mmol/L" },
      radon: { min: 0, max: 148, unit: "Bq/m³" },
      co2: { min: 0, max: 1000, unit: "ppm" },
      vocs: { min: 0, max: 150, unit: "ppb" },
      water: { min: 6.5, max: 8.5, unit: "pH" },
      food: { min: 0, max: 100, unit: "CFU/g" },
    };
    
    const ref = references[this.insertedCartridge.type];
    const finalValue = Math.round(avgValue * 10) / 10;
    
    let status: "normal" | "warning" | "critical";
    if (finalValue >= ref.min && finalValue <= ref.max) {
      status = "normal";
    } else if (finalValue < ref.min * 0.8 || finalValue > ref.max * 1.2) {
      status = "critical";
    } else {
      status = "warning";
    }
    
    return {
      value: finalValue,
      unit: ref.unit,
      status,
      reference: { min: ref.min, max: ref.max },
    };
  }

  /**
   * 이벤트 리스너 등록
   */
  onConnection(callback: ConnectionCallback): () => void {
    this.connectionCallbacks.push(callback);
    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter(cb => cb !== callback);
    };
  }

  onData(callback: DataCallback): () => void {
    this.dataCallbacks.push(callback);
    return () => {
      this.dataCallbacks = this.dataCallbacks.filter(cb => cb !== callback);
    };
  }

  onError(callback: ErrorCallback): () => void {
    this.errorCallbacks.push(callback);
    return () => {
      this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * 현재 상태 조회
   */
  getConnectedDevice(): DeviceInfo | null {
    return this.connectedDevice;
  }

  getInsertedCartridge(): CartridgeInfo | null {
    return this.insertedCartridge;
  }

  isConnected(): boolean {
    return this.connectedDevice?.status === "connected";
  }

  /**
   * 유틸리티
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 싱글톤 인스턴스
export const deviceService = new DeviceService();

