import 'dart:async';
import 'dart:math';

import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:injectable/injectable.dart';
import 'package:uuid/uuid.dart';

import '../../../../data/datasources/local/measurement_local_datasource.dart';
import '../../../../domain/entities/ai_analysis_result.dart';
import '../../../../domain/entities/cartridge.dart';
import '../../../../domain/entities/measurement_data.dart';
import '../../../../domain/entities/measurement_result.dart';
import '../../../../domain/entities/reader_device.dart';
import '../../../../domain/repositories/ai_repository.dart';
import '../../../../domain/repositories/bluetooth_repository.dart';
import '../../../../domain/repositories/nfc_repository.dart';

part 'measurement_event.dart';
part 'measurement_state.dart';

/// 측정 BLoC (State Machine 기반)
/// 
/// ## State Flow
/// ```
/// MeasurementInitial
///       │ StartFlow
///       ▼
/// CartridgeScanning ──────► MeasurementError
///       │ (NFC 성공)
///       ▼
/// CartridgeVerified
///       │ (Smart Connection Check)
///       ├─► (이미 연결됨) ──► CheckReady
///       └─► ReaderConnecting ──► CheckReady
///                   │
///                   ▼
/// MeasurementReady (시료 주입 대기)
///       │ ExecuteMeasurement
///       ▼
/// Measuring (isAnalyzing: false)
///       │ WaveformDataReceived (반복)
///       │ CompleteMeasurement
///       ▼
/// Measuring (isAnalyzing: true)
///       │ AI 분석
///       ▼
/// MeasurementSuccess
/// ```
@injectable
class MeasurementBloc extends Bloc<MeasurementEvent, MeasurementState> {
  final BluetoothRepository _bluetoothRepository;
  final NfcRepository _nfcRepository;
  final MeasurementLocalDataSource _localDataSource;
  final AIRepository _aiRepository;
  final Uuid _uuid = const Uuid();

  // ============================================================
  // Stream Subscriptions (메모리 누수 방지)
  // ============================================================
  StreamSubscription<MeasurementData>? _measurementSubscription;
  StreamSubscription<BluetoothConnectionState>? _connectionStateSubscription;

  // ============================================================
  // Timers
  // ============================================================
  Timer? _measurementTimer;

  // ============================================================
  // Configuration
  // ============================================================
  static const Duration _measurementDuration = Duration(seconds: 30);
  static const Duration _connectionTimeout = Duration(seconds: 15);
  static const Duration _nfcScanTimeout = Duration(seconds: 30);

  MeasurementBloc({
    required BluetoothRepository bluetoothRepository,
    required NfcRepository nfcRepository,
    required MeasurementLocalDataSource localDataSource,
    required AIRepository aiRepository,
  })  : _bluetoothRepository = bluetoothRepository,
        _nfcRepository = nfcRepository,
        _localDataSource = localDataSource,
        _aiRepository = aiRepository,
        super(const MeasurementInitial()) {
    // Event Handlers 등록
    on<StartFlow>(_onStartFlow);
    on<CheckReady>(_onCheckReady);
    on<ConnectToReader>(_onConnectToReader);
    on<ExecuteMeasurement>(_onExecuteMeasurement);
    on<WaveformDataReceived>(_onWaveformDataReceived);
    on<CompleteMeasurement>(_onCompleteMeasurement);
    on<CancelMeasurement>(_onCancelMeasurement);
    on<ResetMeasurement>(_onResetMeasurement);
    on<_StreamError>(_onStreamError);
    on<_ConnectionStateChanged>(_onConnectionStateChanged);
  }

  // ============================================================
  // PHASE 1: 인증 및 연결
  // ============================================================

  /// [StartFlow] - 전체 측정 플로우 시작
  Future<void> _onStartFlow(
    StartFlow event,
    Emitter<MeasurementState> emit,
  ) async {
    try {
      // Step 1: NFC 지원 확인
      final isNfcSupported = await _nfcRepository.isNfcSupported;
      if (!isNfcSupported) {
        emit(MeasurementError.fromType(MeasurementErrorType.nfcNotSupported));
        return;
      }

      // Step 2: NFC 활성화 확인
      final isNfcEnabled = await _nfcRepository.isNfcEnabled;
      if (!isNfcEnabled) {
        emit(MeasurementError.fromType(MeasurementErrorType.nfcDisabled));
        return;
      }

      // Step 3: 카트리지 스캔 상태로 전환
      emit(const CartridgeScanning());

      // Step 4: NFC 스캔 실행
      final result = await _nfcRepository.scanCartridge(
        timeout: _nfcScanTimeout,
      );

      switch (result) {
        case NfcSuccess(data: final cartridge):
          // Step 5: 카트리지 유효성 검증
          final validationError = _validateCartridge(cartridge);
          if (validationError != null) {
            emit(validationError);
            return;
          }

          // Step 6: 카트리지 인증 완료
          emit(CartridgeVerified(cartridge: cartridge));

          // Step 7: Smart Connection Check
          await _smartConnectionCheck(cartridge, emit);

        case NfcFailure(error: final error):
          emit(MeasurementError.fromType(_mapNfcError(error)));
      }
    } catch (e, stackTrace) {
      emit(MeasurementError(
        message: '측정 시작 중 오류: ${e.toString()}',
        errorType: MeasurementErrorType.unknown,
        originalError: e,
        stackTrace: stackTrace,
      ));
    }
  }

  /// Smart Connection Check
  /// 
  /// 이미 연결되어 있으면 바로 CheckReady, 아니면 연결 시도
  Future<void> _smartConnectionCheck(
    Cartridge cartridge,
    Emitter<MeasurementState> emit,
  ) async {
    // 이미 연결된 디바이스가 있는지 확인
    final connectedDevice = _bluetoothRepository.connectedDevice;
    
    if (connectedDevice != null) {
      // ✅ 이미 연결됨 → 바로 CheckReady
      add(CheckReady(
        cartridge: cartridge,
        connectedReader: connectedDevice,
      ));
    } else {
      // ❌ 연결 안됨 → 자동 연결 시도
      emit(ReaderConnecting(cartridge: cartridge));
      
      try {
        // 블루투스 활성화 확인
        final isBluetoothEnabled = await _bluetoothRepository.isBluetoothEnabled.first;
        if (!isBluetoothEnabled) {
          emit(MeasurementError.fromType(MeasurementErrorType.bluetoothDisabled));
          return;
        }

        // 디바이스 스캔 및 자동 연결
        await _scanAndConnect(cartridge, emit);
      } catch (e, stackTrace) {
        emit(MeasurementError(
          message: '리더기 연결 중 오류: ${e.toString()}',
          errorType: MeasurementErrorType.readerConnectionFailed,
          originalError: e,
          stackTrace: stackTrace,
        ));
      }
    }
  }

  /// 디바이스 스캔 및 자동 연결
  Future<void> _scanAndConnect(
    Cartridge cartridge,
    Emitter<MeasurementState> emit,
  ) async {
    // 스캔 시작 (10초)
    final scanStream = _bluetoothRepository.scanDevices(
      timeout: const Duration(seconds: 10),
    );

    ReaderDevice? bestDevice;

    await for (final result in scanStream) {
      switch (result) {
        case BluetoothSuccess(data: final devices):
          if (devices.isNotEmpty) {
            // 가장 신호가 강한 디바이스 선택
            bestDevice = devices.first;
            await _bluetoothRepository.stopScan();
            break;
          }
        case BluetoothFailure(error: final error):
          emit(MeasurementError.fromType(
            MeasurementErrorType.readerConnectionFailed,
            customMessage: '리더기 검색 실패: $error',
          ));
          return;
      }
    }

    if (bestDevice == null) {
      emit(MeasurementError.fromType(
        MeasurementErrorType.readerConnectionFailed,
        customMessage: '주변에서 MPS 리더기를 찾을 수 없습니다.',
      ));
      return;
    }

    // 연결 시도
    emit(ReaderConnecting(cartridge: cartridge, targetDevice: bestDevice));

    final connectResult = await _bluetoothRepository.connect(
      bestDevice,
      timeout: _connectionTimeout,
    );

    switch (connectResult) {
      case BluetoothSuccess(data: final device):
        _startConnectionMonitoring();
        add(CheckReady(cartridge: cartridge, connectedReader: device));

      case BluetoothFailure(error: final error):
        emit(MeasurementError.fromType(
          MeasurementErrorType.readerConnectionFailed,
          customMessage: '리더기 연결 실패: $error',
        ));
    }
  }

  /// [CheckReady] - 준비 상태 확인
  void _onCheckReady(
    CheckReady event,
    Emitter<MeasurementState> emit,
  ) {
    emit(MeasurementReady(
      cartridge: event.cartridge,
      connectedReader: event.connectedReader,
    ));
  }

  /// [ConnectToReader] - 특정 리더기에 연결
  Future<void> _onConnectToReader(
    ConnectToReader event,
    Emitter<MeasurementState> emit,
  ) async {
    try {
      emit(ReaderConnecting(
        cartridge: event.cartridge,
        targetDevice: event.device,
      ));

      final result = await _bluetoothRepository.connect(
        event.device,
        timeout: _connectionTimeout,
      );

      switch (result) {
        case BluetoothSuccess(data: final device):
          _startConnectionMonitoring();
          add(CheckReady(
            cartridge: event.cartridge,
            connectedReader: device,
          ));

        case BluetoothFailure(error: final error):
          emit(MeasurementError.fromType(
            MeasurementErrorType.readerConnectionFailed,
            customMessage: '연결 실패: $error',
          ));
      }
    } catch (e, stackTrace) {
      emit(MeasurementError(
        message: '리더기 연결 중 오류: ${e.toString()}',
        errorType: MeasurementErrorType.readerConnectionFailed,
        originalError: e,
        stackTrace: stackTrace,
      ));
    }
  }

  // ============================================================
  // PHASE 2: 측정 및 분석
  // ============================================================

  /// [ExecuteMeasurement] - 측정 실행
  Future<void> _onExecuteMeasurement(
    ExecuteMeasurement event,
    Emitter<MeasurementState> emit,
  ) async {
    final currentState = state;

    if (currentState is! MeasurementReady) {
      emit(MeasurementError.fromType(
        MeasurementErrorType.measurementFailed,
        customMessage: '측정 준비가 완료되지 않았습니다.',
      ));
      return;
    }

    try {
      // Step 1: 기존 리소스 정리
      await _cleanupMeasurementResources();

      final startTime = DateTime.now();

      // Step 2: 측정 중 상태로 전환 (isAnalyzing: false)
      emit(Measuring(
        cartridge: currentState.cartridge,
        connectedReader: currentState.connectedReader,
        waveform: const [],
        isAnalyzing: false,
        startTime: startTime,
      ));

      // Step 3: 측정 시작 명령 전송
      final startResult = await _bluetoothRepository.startMeasurement();

      if (startResult is BluetoothFailure) {
        emit(MeasurementError.fromType(
          MeasurementErrorType.measurementFailed,
          customMessage: '측정 시작 명령 전송 실패',
        ));
        return;
      }

      // Step 4: 파형 데이터 스트림 구독
      _measurementSubscription = _bluetoothRepository.measureStream.listen(
        (data) {
          // 전압값을 double 리스트로 변환하여 이벤트 발생
          add(WaveformDataReceived(data.rawValues));
        },
        onError: (error, stackTrace) {
          add(_StreamError(error, stackTrace));
        },
        onDone: () {
          // 스트림 완료 시 측정 완료
          add(const CompleteMeasurement());
        },
        cancelOnError: false,
      );

      // Step 5: 측정 완료 타이머 설정
      _measurementTimer = Timer(_measurementDuration, () {
        add(const CompleteMeasurement());
      });

    } catch (e, stackTrace) {
      await _cleanupMeasurementResources();
      emit(MeasurementError(
        message: '측정 시작 중 오류: ${e.toString()}',
        errorType: MeasurementErrorType.measurementFailed,
        originalError: e,
        stackTrace: stackTrace,
      ));
    }
  }

  /// [WaveformDataReceived] - 파형 데이터 수신
  void _onWaveformDataReceived(
    WaveformDataReceived event,
    Emitter<MeasurementState> emit,
  ) {
    final currentState = state;

    if (currentState is Measuring && !currentState.isAnalyzing) {
      // 기존 waveform에 새 데이터 append
      emit(currentState.addData(
        event.data,
        measurementDuration: _measurementDuration,
      ));
    }
  }

  /// [CompleteMeasurement] - 측정 완료 및 분석 시작
  Future<void> _onCompleteMeasurement(
    CompleteMeasurement event,
    Emitter<MeasurementState> emit,
  ) async {
    final currentState = state;

    if (currentState is! Measuring) return;

    try {
      // Step 1: 분석 중 상태로 전환 (UI에 '분석 중' 표시)
      emit(currentState.toAnalyzing());

      // Step 2: 측정 중지 명령
      await _bluetoothRepository.stopMeasurement();

      // Step 3: 리소스 정리
      await _measurementSubscription?.cancel();
      _measurementSubscription = null;
      _measurementTimer?.cancel();
      _measurementTimer = null;

      // Step 4: 로컬 분석 로직 수행 (기본 결과 생성)
      final measurementResult = await _performLocalAnalysis(currentState);

      // Step 5: 로컬 DB에 저장 (네트워크 실패해도 로컬 데이터는 보존)
      try {
        await _localDataSource.saveMeasurement(measurementResult);
      } catch (e) {
        // 저장 실패는 로깅만 하고 진행
        // TODO: Analytics로 저장 실패 로깅
      }

      // Step 6: 서버 AI 분석 요청 (실패해도 로컬 결과는 표시)
      AIAnalysisResult? aiAnalysis;
      bool isOfflineMode = false;

      try {
        final aiResponse = await _aiRepository.analyzeMeasurementResult(measurementResult);
        
        switch (aiResponse) {
          case AIAnalysisSuccess(result: final result):
            aiAnalysis = result;
          case AIAnalysisFailure():
            isOfflineMode = true;
        }
      } catch (_) {
        isOfflineMode = true;
      }

      // Step 7: 카트리지 사용 완료 표시 (실패해도 무시)
      try {
        await _nfcRepository.markCartridgeAsUsed(currentState.cartridge);
      } catch (_) {}

      // Step 8: 성공 상태로 전환 (AI 분석 결과 포함)
      emit(MeasurementSuccess(
        result: measurementResult,
        aiAnalysis: aiAnalysis,
        isOfflineMode: isOfflineMode,
      ));

    } catch (e, stackTrace) {
      await _cleanupMeasurementResources();
      emit(MeasurementError(
        message: '결과 분석 중 오류: ${e.toString()}',
        errorType: MeasurementErrorType.analysisFailed,
        previousState: currentState,
        originalError: e,
        stackTrace: stackTrace,
      ));
    }
  }

  // ============================================================
  // 제어 이벤트 핸들러
  // ============================================================

  /// [CancelMeasurement] - 측정 취소
  Future<void> _onCancelMeasurement(
    CancelMeasurement event,
    Emitter<MeasurementState> emit,
  ) async {
    await _cleanupAllResources();
    emit(MeasurementError.fromType(MeasurementErrorType.cancelled));
  }

  /// [ResetMeasurement] - 초기 상태로 리셋
  Future<void> _onResetMeasurement(
    ResetMeasurement event,
    Emitter<MeasurementState> emit,
  ) async {
    await _cleanupAllResources();
    emit(const MeasurementInitial());
  }

  /// [_StreamError] - 스트림 에러 처리
  Future<void> _onStreamError(
    _StreamError event,
    Emitter<MeasurementState> emit,
  ) async {
    final previousState = state;
    await _cleanupMeasurementResources();

    emit(MeasurementError(
      message: '데이터 수신 중 오류: ${event.error}',
      errorType: MeasurementErrorType.dataReceiveFailed,
      previousState: previousState,
      originalError: event.error,
      stackTrace: event.stackTrace,
    ));
  }

  /// [_ConnectionStateChanged] - 연결 상태 변경
  void _onConnectionStateChanged(
    _ConnectionStateChanged event,
    Emitter<MeasurementState> emit,
  ) {
    if (event.connectionState == BluetoothConnectionState.disconnected) {
      final currentState = state;

      if (currentState is Measuring) {
        add(_StreamError(
          Exception('리더기 연결이 끊어졌습니다'),
          StackTrace.current,
        ));
      }
    }
  }

  // ============================================================
  // PRIVATE HELPERS
  // ============================================================

  /// 카트리지 유효성 검증
  MeasurementError? _validateCartridge(Cartridge cartridge) {
    if (cartridge.isExpired) {
      return MeasurementError.fromType(
        MeasurementErrorType.cartridgeExpired,
        customMessage: '유효기한 만료: ${_formatDate(cartridge.expiryDate)}',
      );
    }

    if (cartridge.isUsed) {
      return MeasurementError.fromType(MeasurementErrorType.cartridgeAlreadyUsed);
    }

    if (!cartridge.isValid) {
      return MeasurementError.fromType(MeasurementErrorType.cartridgeInvalid);
    }

    return null;
  }

  /// 연결 상태 모니터링 시작
  void _startConnectionMonitoring() {
    _connectionStateSubscription?.cancel();
    _connectionStateSubscription = _bluetoothRepository.connectionState.listen(
      (state) => add(_ConnectionStateChanged(state)),
    );
  }

  /// 측정 리소스 정리
  Future<void> _cleanupMeasurementResources() async {
    await _measurementSubscription?.cancel();
    _measurementSubscription = null;

    _measurementTimer?.cancel();
    _measurementTimer = null;

    try {
      await _bluetoothRepository.stopMeasurement();
    } catch (_) {}
  }

  /// 모든 리소스 정리
  Future<void> _cleanupAllResources() async {
    await _cleanupMeasurementResources();

    await _connectionStateSubscription?.cancel();
    _connectionStateSubscription = null;

    try {
      await _nfcRepository.stopSession();
    } catch (_) {}
  }

  /// NFC 에러 매핑
  MeasurementErrorType _mapNfcError(NfcError error) {
    return switch (error) {
      NfcError.notSupported => MeasurementErrorType.nfcNotSupported,
      NfcError.disabled => MeasurementErrorType.nfcDisabled,
      NfcError.notMpsCartridge => MeasurementErrorType.cartridgeInvalid,
      NfcError.sessionTimeout => MeasurementErrorType.timeout,
      NfcError.cancelled => MeasurementErrorType.cancelled,
      _ => MeasurementErrorType.cartridgeScanFailed,
    };
  }

  /// 로컬 분석 수행 (기본 결과 생성)
  Future<MeasurementResult> _performLocalAnalysis(Measuring state) async {
    final cartridge = state.cartridge;
    final waveform = state.waveform;
    final endTime = DateTime.now();

    // 평균값 계산
    final avgValue = waveform.isEmpty
        ? 0.0
        : waveform.reduce((a, b) => a + b) / waveform.length;

    // 보정 계수 적용
    final calibratedValue = avgValue * (cartridge.calibrationFactor ?? 1.0);

    // 타입별 결과 계산
    final (value, unit, minRange, maxRange) = _calculateResult(
      cartridge.type,
      calibratedValue,
    );

    // 상태 판정
    final status = _determineStatus(value, minRange, maxRange);

    // 신뢰도 계산
    final confidence = _calculateConfidence(waveform);

    // 기본 AI 코멘트 생성 (로컬)
    final aiComment = _generateLocalAiComment(status, cartridge.type);

    return MeasurementResult(
      id: _uuid.v4(),
      cartridge: cartridge,
      measurementType: cartridge.type,
      value: value,
      unit: unit,
      status: status,
      startTime: state.startTime,
      endTime: endTime,
      waveformData: [], // 원본 MeasurementData가 필요하면 별도 저장
      normalRangeMin: minRange,
      normalRangeMax: maxRange,
      aiComment: aiComment,
      confidenceScore: confidence,
    );
  }

  (double, String, double, double) _calculateResult(
    CartridgeType type,
    double calibratedValue,
  ) {
    return switch (type) {
      CartridgeType.glucose => (calibratedValue * 100, 'mg/dL', 70.0, 100.0),
      CartridgeType.radon => (calibratedValue * 50, 'Bq/m³', 0.0, 148.0),
      CartridgeType.cholesterol => (calibratedValue * 80, 'mg/dL', 0.0, 200.0),
      CartridgeType.uricAcid => (calibratedValue * 3, 'mg/dL', 2.5, 7.0),
      CartridgeType.hemoglobin => (calibratedValue * 6, 'g/dL', 12.0, 17.5),
      CartridgeType.lactate => (calibratedValue * 1.5, 'mmol/L', 0.5, 2.2),
      CartridgeType.ketone => (calibratedValue * 0.8, 'mmol/L', 0.0, 0.6),
      CartridgeType.unknown => (calibratedValue, '', 0.0, 0.0),
    };
  }

  ResultStatus _determineStatus(double value, double minRange, double maxRange) {
    if (minRange == 0 && maxRange == 0) return ResultStatus.normal;

    if (value < minRange * 0.8 || value > maxRange * 1.2) {
      return ResultStatus.danger;
    }
    if (value < minRange || value > maxRange) {
      return ResultStatus.warning;
    }
    return ResultStatus.normal;
  }

  int _calculateConfidence(List<double> waveform) {
    if (waveform.isEmpty) return 0;

    final sampleScore = min(100, waveform.length ~/ 5);

    if (waveform.length < 2) return sampleScore;

    final avg = waveform.reduce((a, b) => a + b) / waveform.length;
    final variance = waveform.map((v) => pow(v - avg, 2)).reduce((a, b) => a + b) / waveform.length;
    final stabilityScore = max(0, 100 - (variance * 10).toInt());

    return ((sampleScore + stabilityScore) / 2).round().clamp(0, 100);
  }

  /// 로컬 AI 코멘트 생성 (오프라인 fallback)
  String _generateLocalAiComment(ResultStatus status, CartridgeType type) {
    return switch (status) {
      ResultStatus.normal => '${type.displayName} 수치가 정상 범위입니다.',
      ResultStatus.warning => '${type.displayName} 수치가 정상 범위를 벗어났습니다.',
      ResultStatus.danger => '${type.displayName} 수치가 주의가 필요한 수준입니다.',
      ResultStatus.invalid => '측정 결과를 분석할 수 없습니다.',
    };
  }

  String _formatDate(DateTime date) {
    return '${date.year}.${date.month.toString().padLeft(2, '0')}.${date.day.toString().padLeft(2, '0')}';
  }

  // ============================================================
  // LIFECYCLE
  // ============================================================

  @override
  Future<void> close() async {
    // ✅ 모든 Subscription 정리 (메모리 누수 방지)
    await _measurementSubscription?.cancel();
    await _connectionStateSubscription?.cancel();

    // ✅ 모든 Timer 정리
    _measurementTimer?.cancel();

    // ✅ 블루투스 연결 해제
    try {
      await _bluetoothRepository.disconnect();
    } catch (_) {}

    // ✅ NFC 세션 정리
    try {
      await _nfcRepository.stopSession();
    } catch (_) {}

    return super.close();
  }
}
