part of 'measurement_bloc.dart';

/// 측정 에러 타입
enum MeasurementErrorType {
  bluetoothDisabled('bluetooth_disabled', '블루투스가 꺼져 있습니다'),
  nfcDisabled('nfc_disabled', 'NFC가 꺼져 있습니다'),
  nfcNotSupported('nfc_not_supported', '이 기기는 NFC를 지원하지 않습니다'),
  readerConnectionFailed('reader_connection_failed', '리더기 연결에 실패했습니다'),
  readerDisconnected('reader_disconnected', '리더기 연결이 끊어졌습니다'),
  cartridgeScanFailed('cartridge_scan_failed', '카트리지 스캔에 실패했습니다'),
  cartridgeExpired('cartridge_expired', '카트리지 유효기한이 만료되었습니다'),
  cartridgeAlreadyUsed('cartridge_already_used', '이미 사용된 카트리지입니다'),
  cartridgeInvalid('cartridge_invalid', '유효하지 않은 카트리지입니다'),
  measurementFailed('measurement_failed', '측정에 실패했습니다'),
  dataReceiveFailed('data_receive_failed', '데이터 수신에 실패했습니다'),
  analysisFailed('analysis_failed', '결과 분석에 실패했습니다'),
  timeout('timeout', '시간이 초과되었습니다'),
  cancelled('cancelled', '측정이 취소되었습니다'),
  unknown('unknown', '알 수 없는 오류가 발생했습니다');

  const MeasurementErrorType(this.code, this.defaultMessage);
  final String code;
  final String defaultMessage;
}

// ============================================================
// STATE DEFINITIONS
// ============================================================

/// 측정 상태 기본 클래스
sealed class MeasurementState extends Equatable {
  const MeasurementState();

  @override
  List<Object?> get props => [];
}

/// 초기 상태
/// 
/// 사용자가 '측정 시작' 버튼을 누르기 전 상태입니다.
class MeasurementInitial extends MeasurementState {
  const MeasurementInitial();
}

/// 카트리지 스캔 중 (NFC 태그 대기)
/// 
/// NFC를 통해 카트리지 정보를 읽는 중입니다.
class CartridgeScanning extends MeasurementState {
  const CartridgeScanning();
}

/// 카트리지 인증 완료
/// 
/// NFC 스캔이 성공하고 카트리지 유효성이 확인된 상태입니다.
/// [cartridge]에 보정 데이터가 포함되어 있습니다.
class CartridgeVerified extends MeasurementState {
  final Cartridge cartridge;

  const CartridgeVerified({required this.cartridge});

  @override
  List<Object?> get props => [cartridge];
}

/// 리더기 연결 시도 중
/// 
/// 블루투스를 통해 MPS 리더기에 연결 중입니다.
class ReaderConnecting extends MeasurementState {
  final Cartridge cartridge;
  final ReaderDevice? targetDevice;

  const ReaderConnecting({
    required this.cartridge,
    this.targetDevice,
  });

  @override
  List<Object?> get props => [cartridge, targetDevice];
}

/// 측정 준비 완료 (시료 주입 대기)
/// 
/// 리더기 연결 완료, 카트리지 인증 완료.
/// 사용자가 시료를 주입하고 측정을 시작할 수 있습니다.
class MeasurementReady extends MeasurementState {
  final Cartridge cartridge;
  final ReaderDevice connectedReader;

  const MeasurementReady({
    required this.cartridge,
    required this.connectedReader,
  });

  @override
  List<Object?> get props => [cartridge, connectedReader];
}

/// 측정 중
/// 
/// 실시간 파형 데이터를 수신 중입니다.
/// [isAnalyzing]이 true면 측정 완료 후 AI 분석 중입니다.
class Measuring extends MeasurementState {
  final Cartridge cartridge;
  final ReaderDevice connectedReader;
  final List<double> waveform;
  final bool isAnalyzing;
  final DateTime startTime;
  final int elapsedSeconds;
  final double progress;

  const Measuring({
    required this.cartridge,
    required this.connectedReader,
    required this.waveform,
    this.isAnalyzing = false,
    required this.startTime,
    this.elapsedSeconds = 0,
    this.progress = 0.0,
  });

  /// 새 데이터를 추가한 상태 반환
  Measuring addData(List<double> newData, {Duration? measurementDuration}) {
    final newWaveform = List<double>.from(waveform)..addAll(newData);
    final elapsed = DateTime.now().difference(startTime);
    final duration = measurementDuration ?? const Duration(seconds: 30);
    final newProgress = (elapsed.inMilliseconds / duration.inMilliseconds).clamp(0.0, 1.0);
    
    return Measuring(
      cartridge: cartridge,
      connectedReader: connectedReader,
      waveform: newWaveform,
      isAnalyzing: isAnalyzing,
      startTime: startTime,
      elapsedSeconds: elapsed.inSeconds,
      progress: newProgress,
    );
  }

  /// 분석 중 상태로 전환
  Measuring toAnalyzing() {
    return Measuring(
      cartridge: cartridge,
      connectedReader: connectedReader,
      waveform: waveform,
      isAnalyzing: true,
      startTime: startTime,
      elapsedSeconds: elapsedSeconds,
      progress: 1.0,
    );
  }

  /// 평균값 계산
  double get average {
    if (waveform.isEmpty) return 0.0;
    return waveform.reduce((a, b) => a + b) / waveform.length;
  }

  /// 샘플 수
  int get sampleCount => waveform.length;

  @override
  List<Object?> get props => [
        cartridge,
        connectedReader,
        waveform,
        isAnalyzing,
        startTime,
        elapsedSeconds,
        progress,
      ];
}

/// 측정 성공 (결과 도출 완료)
/// 
/// AI 분석이 완료되고 최종 결과가 도출된 상태입니다.
/// [aiAnalysis]가 null이면 오프라인 모드로 로컬 결과만 표시됩니다.
class MeasurementSuccess extends MeasurementState {
  final MeasurementResult result;
  final AIAnalysisResult? aiAnalysis;
  final bool isOfflineMode;

  const MeasurementSuccess({
    required this.result,
    this.aiAnalysis,
    this.isOfflineMode = false,
  });

  /// AI 분석 결과가 있는지 여부
  bool get hasAiAnalysis => aiAnalysis != null;

  @override
  List<Object?> get props => [result, aiAnalysis, isOfflineMode];
}

/// 에러 발생
/// 
/// 측정 과정 중 오류가 발생한 상태입니다.
/// [isRetryable]로 재시도 가능 여부를 확인할 수 있습니다.
class MeasurementError extends MeasurementState {
  final String message;
  final MeasurementErrorType errorType;
  final MeasurementState? previousState;
  final Object? originalError;
  final StackTrace? stackTrace;

  const MeasurementError({
    required this.message,
    required this.errorType,
    this.previousState,
    this.originalError,
    this.stackTrace,
  });

  factory MeasurementError.fromType(
    MeasurementErrorType type, {
    String? customMessage,
    MeasurementState? previousState,
    Object? originalError,
    StackTrace? stackTrace,
  }) {
    return MeasurementError(
      message: customMessage ?? type.defaultMessage,
      errorType: type,
      previousState: previousState,
      originalError: originalError,
      stackTrace: stackTrace,
    );
  }

  /// 재시도 가능 여부
  bool get isRetryable {
    return switch (errorType) {
      MeasurementErrorType.cartridgeExpired => false,
      MeasurementErrorType.cartridgeAlreadyUsed => false,
      MeasurementErrorType.nfcNotSupported => false,
      _ => true,
    };
  }

  @override
  List<Object?> get props => [message, errorType, previousState];
}
