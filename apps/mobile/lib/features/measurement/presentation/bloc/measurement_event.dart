part of 'measurement_bloc.dart';

// ============================================================
// EVENT DEFINITIONS
// ============================================================

/// 측정 이벤트 기본 클래스
sealed class MeasurementEvent extends Equatable {
  const MeasurementEvent();

  @override
  List<Object?> get props => [];
}

// ------------------------------------------------------------
// Phase 1: 인증 및 연결
// ------------------------------------------------------------

/// 전체 측정 플로우 시작
/// 
/// NFC 카트리지 스캔부터 시작합니다.
/// 1. NFC 스캔 → CartridgeVerified
/// 2. Smart Connection Check
/// 3. MeasurementReady
class StartFlow extends MeasurementEvent {
  const StartFlow();
}

/// 준비 상태 확인 이벤트 (내부 사용)
/// 
/// 카트리지 인증 + 리더기 연결이 완료되었을 때 트리거됩니다.
class CheckReady extends MeasurementEvent {
  final Cartridge cartridge;
  final ReaderDevice connectedReader;

  const CheckReady({
    required this.cartridge,
    required this.connectedReader,
  });

  @override
  List<Object?> get props => [cartridge, connectedReader];
}

/// 특정 리더기에 연결 요청
class ConnectToReader extends MeasurementEvent {
  final ReaderDevice device;
  final Cartridge cartridge;

  const ConnectToReader({
    required this.device,
    required this.cartridge,
  });

  @override
  List<Object?> get props => [device, cartridge];
}

// ------------------------------------------------------------
// Phase 2: 측정 및 분석
// ------------------------------------------------------------

/// 측정 실행
/// 
/// MeasurementReady 상태에서 사용자가 시료 주입 후 호출합니다.
class ExecuteMeasurement extends MeasurementEvent {
  const ExecuteMeasurement();
}

/// 파형 데이터 수신 (내부 사용)
/// 
/// BluetoothRepository의 measureStream에서 데이터가 수신될 때마다 발생합니다.
class WaveformDataReceived extends MeasurementEvent {
  final List<double> data;

  const WaveformDataReceived(this.data);

  @override
  List<Object?> get props => [data];
}

/// 측정 완료 및 분석 시작
/// 
/// 타이머 만료 또는 펌웨어 신호로 트리거됩니다.
class CompleteMeasurement extends MeasurementEvent {
  const CompleteMeasurement();
}

// ------------------------------------------------------------
// 제어 이벤트
// ------------------------------------------------------------

/// 측정 취소
class CancelMeasurement extends MeasurementEvent {
  const CancelMeasurement();
}

/// 측정 리셋 (초기 상태로)
class ResetMeasurement extends MeasurementEvent {
  const ResetMeasurement();
}

// ------------------------------------------------------------
// 내부 이벤트 (스트림 관리용)
// ------------------------------------------------------------

/// 스트림 에러 발생 (내부 사용)
class _StreamError extends MeasurementEvent {
  final Object error;
  final StackTrace? stackTrace;

  const _StreamError(this.error, [this.stackTrace]);

  @override
  List<Object?> get props => [error];
}

/// 연결 상태 변경 (내부 사용)
class _ConnectionStateChanged extends MeasurementEvent {
  final BluetoothConnectionState connectionState;

  const _ConnectionStateChanged(this.connectionState);

  @override
  List<Object?> get props => [connectionState];
}
