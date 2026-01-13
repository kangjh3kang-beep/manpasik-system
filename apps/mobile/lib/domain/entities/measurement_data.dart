import 'package:equatable/equatable.dart';

/// 측정 데이터 엔티티
/// 
/// MPS 리더기에서 수신한 파형/측정 데이터를 담는 도메인 엔티티입니다.
class MeasurementData extends Equatable {
  /// 원시 측정값 리스트 (mV 단위)
  final List<double> rawValues;

  /// 측정 타임스탬프
  final DateTime timestamp;

  /// 현재 전압값 (V)
  final double voltage;

  /// 샘플링 레이트 (Hz)
  final int samplingRate;

  /// 채널 번호
  final int channel;

  const MeasurementData({
    required this.rawValues,
    required this.timestamp,
    required this.voltage,
    this.samplingRate = 500,
    this.channel = 0,
  });

  /// 빈 데이터 생성
  factory MeasurementData.empty() {
    return MeasurementData(
      rawValues: const [],
      timestamp: DateTime.now(),
      voltage: 0.0,
    );
  }

  /// 바이트 데이터로부터 MeasurementData 생성
  /// 
  /// [bytes]: 리더기에서 수신한 원시 바이트 데이터
  /// [referenceVoltage]: 기준 전압 (기본값 3.3V)
  /// [adcResolution]: ADC 해상도 (기본값 12비트 = 4096)
  factory MeasurementData.fromBytes(
    List<int> bytes, {
    double referenceVoltage = 3.3,
    int adcResolution = 4096,
  }) {
    if (bytes.isEmpty) {
      return MeasurementData.empty();
    }

    final List<double> values = [];
    double sumVoltage = 0.0;

    // 2바이트씩 읽어 전압값으로 변환 (Little Endian)
    for (int i = 0; i < bytes.length - 1; i += 2) {
      final int rawValue = bytes[i] | (bytes[i + 1] << 8);
      final double voltage = (rawValue / adcResolution) * referenceVoltage;
      final double milliVoltage = voltage * 1000; // mV로 변환
      values.add(milliVoltage);
      sumVoltage += voltage;
    }

    final double avgVoltage = values.isNotEmpty ? sumVoltage / values.length : 0.0;

    return MeasurementData(
      rawValues: values,
      timestamp: DateTime.now(),
      voltage: avgVoltage,
    );
  }

  /// 평균값 계산
  double get average {
    if (rawValues.isEmpty) return 0.0;
    return rawValues.reduce((a, b) => a + b) / rawValues.length;
  }

  /// 최대값
  double get maxValue {
    if (rawValues.isEmpty) return 0.0;
    return rawValues.reduce((a, b) => a > b ? a : b);
  }

  /// 최소값
  double get minValue {
    if (rawValues.isEmpty) return 0.0;
    return rawValues.reduce((a, b) => a < b ? a : b);
  }

  /// 피크-투-피크 값
  double get peakToPeak => maxValue - minValue;

  /// 데이터 유효성 검사
  bool get isValid => rawValues.isNotEmpty && voltage > 0;

  MeasurementData copyWith({
    List<double>? rawValues,
    DateTime? timestamp,
    double? voltage,
    int? samplingRate,
    int? channel,
  }) {
    return MeasurementData(
      rawValues: rawValues ?? this.rawValues,
      timestamp: timestamp ?? this.timestamp,
      voltage: voltage ?? this.voltage,
      samplingRate: samplingRate ?? this.samplingRate,
      channel: channel ?? this.channel,
    );
  }

  @override
  List<Object?> get props => [rawValues, timestamp, voltage, samplingRate, channel];

  @override
  String toString() => 'MeasurementData(samples: ${rawValues.length}, voltage: ${voltage.toStringAsFixed(3)}V, time: $timestamp)';
}








