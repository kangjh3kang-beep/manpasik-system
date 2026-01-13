import 'package:equatable/equatable.dart';

import 'cartridge.dart';
import 'measurement_data.dart';

/// 측정 결과 상태
enum ResultStatus {
  /// 정상 범위
  normal('normal', '정상'),
  
  /// 주의 필요
  warning('warning', '주의'),
  
  /// 위험 수준
  danger('danger', '위험'),
  
  /// 측정 실패
  invalid('invalid', '측정 실패');

  const ResultStatus(this.code, this.displayName);
  
  final String code;
  final String displayName;
}

/// 측정 결과 엔티티
/// 
/// 전체 측정 세션의 최종 결과를 담는 도메인 엔티티입니다.
class MeasurementResult extends Equatable {
  /// 결과 고유 ID
  final String id;

  /// 사용된 카트리지
  final Cartridge cartridge;

  /// 측정 타입
  final CartridgeType measurementType;

  /// 최종 측정값
  final double value;

  /// 측정 단위
  final String unit;

  /// 결과 상태
  final ResultStatus status;

  /// 측정 시작 시간
  final DateTime startTime;

  /// 측정 종료 시간
  final DateTime endTime;

  /// 원시 파형 데이터 (분석용)
  final List<MeasurementData> waveformData;

  /// 정상 범위 최소값
  final double? normalRangeMin;

  /// 정상 범위 최대값
  final double? normalRangeMax;

  /// AI 분석 코멘트
  final String? aiComment;

  /// 신뢰도 점수 (0-100)
  final int confidenceScore;

  const MeasurementResult({
    required this.id,
    required this.cartridge,
    required this.measurementType,
    required this.value,
    required this.unit,
    required this.status,
    required this.startTime,
    required this.endTime,
    required this.waveformData,
    this.normalRangeMin,
    this.normalRangeMax,
    this.aiComment,
    this.confidenceScore = 100,
  });

  /// 측정 소요 시간 (초)
  int get durationSeconds => endTime.difference(startTime).inSeconds;

  /// 정상 범위 내 여부
  bool get isInNormalRange {
    if (normalRangeMin == null || normalRangeMax == null) return true;
    return value >= normalRangeMin! && value <= normalRangeMax!;
  }

  /// 결과값 포맷팅 (소수점 1자리)
  String get formattedValue => '${value.toStringAsFixed(1)} $unit';

  /// 정상 범위 포맷팅
  String get normalRangeText {
    if (normalRangeMin == null || normalRangeMax == null) return '-';
    return '${normalRangeMin!.toStringAsFixed(1)} ~ ${normalRangeMax!.toStringAsFixed(1)} $unit';
  }

  MeasurementResult copyWith({
    String? id,
    Cartridge? cartridge,
    CartridgeType? measurementType,
    double? value,
    String? unit,
    ResultStatus? status,
    DateTime? startTime,
    DateTime? endTime,
    List<MeasurementData>? waveformData,
    double? normalRangeMin,
    double? normalRangeMax,
    String? aiComment,
    int? confidenceScore,
  }) {
    return MeasurementResult(
      id: id ?? this.id,
      cartridge: cartridge ?? this.cartridge,
      measurementType: measurementType ?? this.measurementType,
      value: value ?? this.value,
      unit: unit ?? this.unit,
      status: status ?? this.status,
      startTime: startTime ?? this.startTime,
      endTime: endTime ?? this.endTime,
      waveformData: waveformData ?? this.waveformData,
      normalRangeMin: normalRangeMin ?? this.normalRangeMin,
      normalRangeMax: normalRangeMax ?? this.normalRangeMax,
      aiComment: aiComment ?? this.aiComment,
      confidenceScore: confidenceScore ?? this.confidenceScore,
    );
  }

  @override
  List<Object?> get props => [
        id,
        cartridge,
        measurementType,
        value,
        unit,
        status,
        startTime,
        endTime,
        waveformData,
        normalRangeMin,
        normalRangeMax,
        aiComment,
        confidenceScore,
      ];

  @override
  String toString() =>
      'MeasurementResult(type: ${measurementType.displayName}, value: $formattedValue, status: ${status.displayName})';
}








