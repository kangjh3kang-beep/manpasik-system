import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/di/injection.dart';
import '../../../../domain/entities/measurement_data.dart';
import '../bloc/measurement_bloc.dart';
import '../widgets/cartridge_scan_step.dart';
import '../widgets/measurement_error_view.dart';
import '../widgets/measuring_step.dart';
import '../widgets/result_step.dart';
import '../widgets/sample_inject_step.dart';

/// 측정 프로세스 페이지
/// 
/// State Machine Flow:
/// 1. Initial → StartFlow → CartridgeScanning
/// 2. CartridgeScanning → CartridgeVerified
/// 3. CartridgeVerified → ReaderConnecting → MeasurementReady
/// 4. MeasurementReady → ExecuteMeasurement → Measuring
/// 5. Measuring → CompleteMeasurement → MeasurementSuccess
class MeasurementProcessPage extends StatelessWidget {
  const MeasurementProcessPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => inject<MeasurementBloc>(),
      child: const _MeasurementProcessView(),
    );
  }
}

class _MeasurementProcessView extends StatelessWidget {
  const _MeasurementProcessView();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0E21),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: BlocBuilder<MeasurementBloc, MeasurementState>(
          builder: (context, state) {
            return Text(
              _getAppBarTitle(state),
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w600,
              ),
            );
          },
        ),
        leading: IconButton(
          icon: const Icon(Icons.close, color: Colors.white),
          onPressed: () => _showCancelDialog(context),
        ),
        actions: [
          BlocBuilder<MeasurementBloc, MeasurementState>(
            builder: (context, state) {
              final canReset = state is! Measuring || state.isAnalyzing;
              return IconButton(
                icon: Icon(
                  Icons.refresh,
                  color: canReset ? Colors.white70 : Colors.white24,
                ),
                onPressed: canReset
                    ? () => context.read<MeasurementBloc>().add(const ResetMeasurement())
                    : null,
              );
            },
          ),
        ],
      ),
      body: BlocConsumer<MeasurementBloc, MeasurementState>(
        listener: _blocListener,
        builder: (context, state) {
          return Column(
            children: [
              // 진행 단계 표시
              _StepIndicator(currentStep: _getCurrentStep(state)),
              
              // 메인 컨텐츠
              Expanded(
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 300),
                  switchInCurve: Curves.easeOut,
                  switchOutCurve: Curves.easeIn,
                  child: _buildContent(context, state),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  String _getAppBarTitle(MeasurementState state) {
    return switch (state) {
      MeasurementInitial() => '건강 측정',
      CartridgeScanning() => '카트리지 스캔',
      CartridgeVerified() => '카트리지 인증',
      ReaderConnecting() => '리더기 연결',
      MeasurementReady() => '측정 준비',
      Measuring(:final isAnalyzing) => isAnalyzing ? '결과 분석' : '측정 중',
      MeasurementSuccess() => '측정 완료',
      MeasurementError() => '오류 발생',
    };
  }

  void _blocListener(BuildContext context, MeasurementState state) {
    // 에러 발생 시 스낵바 표시
    if (state is MeasurementError && state.errorType != MeasurementErrorType.cancelled) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(state.message),
          backgroundColor: Colors.red.shade700,
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 4),
          action: state.isRetryable
              ? SnackBarAction(
                  label: '다시 시도',
                  textColor: Colors.white,
                  onPressed: () {
                    context.read<MeasurementBloc>().add(const ResetMeasurement());
                    context.read<MeasurementBloc>().add(const StartFlow());
                  },
                )
              : null,
        ),
      );
    }

    // 측정 성공 시 햅틱 피드백
    if (state is MeasurementSuccess) {
      HapticFeedback.mediumImpact();
    }
  }

  int _getCurrentStep(MeasurementState state) {
    return switch (state) {
      MeasurementInitial() => 0,
      CartridgeScanning() => 1,
      CartridgeVerified() => 2,
      ReaderConnecting() => 2,
      MeasurementReady() => 3,
      Measuring() => 4,
      MeasurementSuccess() => 5,
      MeasurementError() => 0,
    };
  }

  Widget _buildContent(BuildContext context, MeasurementState state) {
    return switch (state) {
      // 초기 상태: 시작 버튼
      MeasurementInitial() => _InitialView(
        key: const ValueKey('initial'),
        onStart: () => context.read<MeasurementBloc>().add(const StartFlow()),
      ),

      // NFC 카트리지 스캔 중
      CartridgeScanning() => CartridgeScanStep(
        key: const ValueKey('scanning'),
        onCancel: () => context.read<MeasurementBloc>().add(const CancelMeasurement()),
      ),

      // 카트리지 인증 완료 (리더기 연결 대기)
      CartridgeVerified(:final cartridge) => _CartridgeVerifiedView(
        key: const ValueKey('verified'),
        cartridge: cartridge,
      ),

      // 리더기 연결 중
      ReaderConnecting(:final targetDevice) => _ReaderConnectingView(
        key: const ValueKey('connecting'),
        targetDevice: targetDevice,
      ),

      // 측정 준비 완료 (시료 주입 대기)
      MeasurementReady(:final cartridge, :final connectedReader) => SampleInjectStep(
        key: const ValueKey('ready'),
        cartridge: cartridge,
        reader: connectedReader,
        onStartMeasurement: () {
          context.read<MeasurementBloc>().add(const ExecuteMeasurement());
        },
      ),

      // 측정 중 (실시간 파형)
      Measuring(:final waveform, :final progress, :final elapsedSeconds, :final cartridge, :final isAnalyzing) =>
        MeasuringStep(
          key: const ValueKey('measuring'),
          waveformData: _convertToMeasurementData(waveform),
          latestData: waveform.isNotEmpty ? _createLatestData(waveform) : null,
          progress: progress,
          elapsedSeconds: elapsedSeconds,
          cartridge: cartridge,
          isAnalyzing: isAnalyzing,
        ),

      // 측정 성공
      MeasurementSuccess(:final result, :final aiAnalysis, :final isOfflineMode) => ResultStep(
        key: const ValueKey('success'),
        result: result,
        aiAnalysis: aiAnalysis,
        isOfflineMode: isOfflineMode,
        onNewMeasurement: () {
          context.read<MeasurementBloc>().add(const ResetMeasurement());
        },
        onSaveAndExit: () {
          Navigator.of(context).pop(result);
        },
      ),

      // 에러 발생
      MeasurementError(:final message, :final errorType, :final isRetryable) => MeasurementErrorView(
        key: const ValueKey('error'),
        message: message,
        errorType: errorType,
        onRetry: isRetryable
            ? () {
                context.read<MeasurementBloc>().add(const ResetMeasurement());
                context.read<MeasurementBloc>().add(const StartFlow());
              }
            : null,
        onCancel: () => Navigator.of(context).pop(),
      ),
    };
  }

  /// List<double>을 List<MeasurementData>로 변환 (UI 호환성)
  List<MeasurementData> _convertToMeasurementData(List<double> waveform) {
    if (waveform.isEmpty) return [];
    
    // 100개씩 묶어서 MeasurementData 생성
    final result = <MeasurementData>[];
    for (int i = 0; i < waveform.length; i += 100) {
      final end = (i + 100 < waveform.length) ? i + 100 : waveform.length;
      final chunk = waveform.sublist(i, end);
      final avgVoltage = chunk.reduce((a, b) => a + b) / chunk.length / 1000; // mV to V
      result.add(MeasurementData(
        rawValues: chunk,
        timestamp: DateTime.now(),
        voltage: avgVoltage,
      ));
    }
    return result;
  }

  /// 최신 데이터 생성
  MeasurementData? _createLatestData(List<double> waveform) {
    if (waveform.isEmpty) return null;
    final recent = waveform.length > 50 ? waveform.sublist(waveform.length - 50) : waveform;
    final avgVoltage = recent.reduce((a, b) => a + b) / recent.length / 1000;
    return MeasurementData(
      rawValues: recent,
      timestamp: DateTime.now(),
      voltage: avgVoltage,
    );
  }

  void _showCancelDialog(BuildContext context) {
    final bloc = context.read<MeasurementBloc>();
    final state = bloc.state;
    
    final isMeasuring = state is Measuring && !state.isAnalyzing;
    
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        backgroundColor: const Color(0xFF1A1F38),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          isMeasuring ? '측정 중단' : '측정 취소',
          style: const TextStyle(color: Colors.white),
        ),
        content: Text(
          isMeasuring
              ? '측정이 진행 중입니다.\n중단하면 진행 중인 데이터가 저장되지 않습니다.'
              : '측정을 취소하시겠습니까?',
          style: const TextStyle(color: Colors.white70, height: 1.5),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('계속하기'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(dialogContext);
              bloc.add(const CancelMeasurement());
              Navigator.pop(context);
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: Text(isMeasuring ? '중단하기' : '취소하기'),
          ),
        ],
      ),
    );
  }
}

/// 초기 화면
class _InitialView extends StatelessWidget {
  final VoidCallback onStart;

  const _InitialView({super.key, required this.onStart});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // 아이콘
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [Colors.cyan.shade400, Colors.blue.shade600],
                ),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.cyan.withOpacity(0.3),
                    blurRadius: 30,
                    spreadRadius: 5,
                  ),
                ],
              ),
              child: const Icon(
                Icons.play_arrow_rounded,
                size: 64,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 32),
            
            const Text(
              '건강 측정 시작',
              style: TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            
            Text(
              '카트리지 스캔 → 리더기 연결 → 측정',
              style: TextStyle(
                color: Colors.white.withOpacity(0.6),
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 48),
            
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: onStart,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.cyan.shade600,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 8,
                  shadowColor: Colors.cyan.withOpacity(0.4),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.nfc_rounded),
                    SizedBox(width: 8),
                    Text(
                      '카트리지 스캔',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// 카트리지 인증 완료 뷰
class _CartridgeVerifiedView extends StatelessWidget {
  final dynamic cartridge;

  const _CartridgeVerifiedView({super.key, required this.cartridge});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              color: Colors.green.withOpacity(0.1),
              shape: BoxShape.circle,
              border: Border.all(color: Colors.green.withOpacity(0.3), width: 2),
            ),
            child: const Icon(Icons.check_circle_outline, size: 48, color: Colors.green),
          ),
          const SizedBox(height: 24),
          const Text(
            '카트리지 인증 완료',
            style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            '${cartridge.type.displayName} 측정',
            style: TextStyle(color: Colors.cyan.shade300, fontSize: 16),
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.cyan.shade400),
              ),
              const SizedBox(width: 12),
              Text(
                '리더기 연결 중...',
                style: TextStyle(color: Colors.white.withOpacity(0.6)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// 리더기 연결 중 뷰
class _ReaderConnectingView extends StatelessWidget {
  final dynamic targetDevice;

  const _ReaderConnectingView({super.key, this.targetDevice});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.bluetooth_searching, size: 64, color: Colors.cyan),
          const SizedBox(height: 24),
          const Text(
            '리더기 연결 중',
            style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          if (targetDevice != null)
            Text(
              targetDevice.name,
              style: TextStyle(color: Colors.white.withOpacity(0.6)),
            ),
          const SizedBox(height: 24),
          const CircularProgressIndicator(color: Colors.cyan),
        ],
      ),
    );
  }
}

/// 진행 단계 인디케이터
class _StepIndicator extends StatelessWidget {
  final int currentStep;

  const _StepIndicator({required this.currentStep});

  static const _steps = ['준비', '스캔', '인증', '주입', '측정', '결과'];

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: List.generate(_steps.length, (index) {
          final isActive = index <= currentStep;
          final isCurrent = index == currentStep;
          
          return Expanded(
            child: Row(
              children: [
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isActive 
                        ? (isCurrent ? Colors.cyan : Colors.cyan.shade700)
                        : Colors.grey.shade800,
                    border: isCurrent 
                        ? Border.all(color: Colors.cyan.shade300, width: 2)
                        : null,
                  ),
                  child: Center(
                    child: isActive && !isCurrent
                        ? const Icon(Icons.check, size: 16, color: Colors.white)
                        : Text(
                            '${index + 1}',
                            style: TextStyle(
                              color: isActive ? Colors.white : Colors.grey,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                  ),
                ),
                if (index < _steps.length - 1)
                  Expanded(
                    child: Container(
                      height: 2,
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      color: index < currentStep 
                          ? Colors.cyan.shade700 
                          : Colors.grey.shade800,
                    ),
                  ),
              ],
            ),
          );
        }),
      ),
    );
  }
}
