import '../entities/reader_device.dart';
import '../entities/measurement_data.dart';

/// 블루투스 통신 결과 타입
sealed class BluetoothResult<T> {
  const BluetoothResult();
}

/// 성공 결과
class BluetoothSuccess<T> extends BluetoothResult<T> {
  final T data;
  const BluetoothSuccess(this.data);
}

/// 실패 결과
class BluetoothFailure<T> extends BluetoothResult<T> {
  final BluetoothError error;
  const BluetoothFailure(this.error);
}

/// 블루투스 에러 타입
enum BluetoothError {
  /// 블루투스가 비활성화됨
  bluetoothDisabled,
  
  /// 위치 권한 없음
  locationPermissionDenied,
  
  /// 블루투스 권한 없음
  bluetoothPermissionDenied,
  
  /// 디바이스를 찾을 수 없음
  deviceNotFound,
  
  /// 연결 실패
  connectionFailed,
  
  /// 연결 타임아웃
  connectionTimeout,
  
  /// 연결이 끊어짐
  disconnected,
  
  /// 서비스를 찾을 수 없음
  serviceNotFound,
  
  /// 특성(Characteristic)을 찾을 수 없음
  characteristicNotFound,
  
  /// 데이터 읽기 실패
  readFailed,
  
  /// 데이터 쓰기 실패
  writeFailed,
  
  /// 알 수 없는 에러
  unknown,
}

/// 블루투스 연결 상태
enum BluetoothConnectionState {
  disconnected,
  connecting,
  connected,
  disconnecting,
}

/// 블루투스 리포지토리 추상 클래스
/// 
/// Domain 레이어에서 정의하는 블루투스 통신 인터페이스입니다.
/// Data 레이어에서 구체적인 구현을 제공합니다.
abstract class BluetoothRepository {
  /// 블루투스 활성화 여부 스트림
  Stream<bool> get isBluetoothEnabled;

  /// 현재 연결 상태 스트림
  Stream<BluetoothConnectionState> get connectionState;

  /// 현재 연결된 디바이스
  ReaderDevice? get connectedDevice;

  /// 측정 데이터 스트림
  /// 
  /// 리더기에서 실시간으로 수신되는 파형 데이터를 스트리밍합니다.
  Stream<MeasurementData> get measureStream;

  /// 주변 MPS 디바이스 스캔
  /// 
  /// [timeout]: 스캔 타임아웃 (기본 10초)
  /// Returns: 발견된 디바이스 스트림
  Stream<BluetoothResult<List<ReaderDevice>>> scanDevices({
    Duration timeout = const Duration(seconds: 10),
  });

  /// 스캔 중지
  Future<void> stopScan();

  /// 디바이스 연결
  /// 
  /// [device]: 연결할 디바이스
  /// [timeout]: 연결 타임아웃 (기본 15초)
  Future<BluetoothResult<ReaderDevice>> connect(
    ReaderDevice device, {
    Duration timeout = const Duration(seconds: 15),
  });

  /// 현재 연결 해제
  Future<BluetoothResult<void>> disconnect();

  /// 측정 시작
  /// 
  /// 리더기에 측정 시작 명령을 전송합니다.
  Future<BluetoothResult<void>> startMeasurement();

  /// 측정 중지
  Future<BluetoothResult<void>> stopMeasurement();

  /// 디바이스에 명령 전송
  /// 
  /// [command]: 전송할 명령 바이트
  Future<BluetoothResult<void>> sendCommand(List<int> command);

  /// 디바이스 펌웨어 버전 읽기
  Future<BluetoothResult<String>> readFirmwareVersion();

  /// 디바이스 배터리 레벨 읽기 (0-100%)
  Future<BluetoothResult<int>> readBatteryLevel();

  /// 리소스 해제
  Future<void> dispose();
}








