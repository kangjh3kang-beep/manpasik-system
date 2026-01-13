import 'package:hive/hive.dart';

import '../../core/database/hive_setup.dart';
import '../../domain/entities/cartridge.dart';
import '../../domain/entities/measurement_data.dart';
import '../../domain/entities/measurement_result.dart';
import 'measurement_data_model.dart';

part 'measurement_result_model.g.dart';

/// ResultStatus의 Hive 저장용 Adapter
@HiveType(typeId: HiveSetup.resultStatusTypeId)
enum ResultStatusModel {
  @HiveField(0)
  normal,

  @HiveField(1)
  warning,

  @HiveField(2)
  danger,

  @HiveField(3)
  invalid;

  /// Domain Enum으로부터 생성
  static ResultStatusModel fromEntity(ResultStatus status) {
    return switch (status) {
      ResultStatus.normal => ResultStatusModel.normal,
      ResultStatus.warning => ResultStatusModel.warning,
      ResultStatus.danger => ResultStatusModel.danger,
      ResultStatus.invalid => ResultStatusModel.invalid,
    };
  }

  /// Domain Enum으로 변환
  ResultStatus toEntity() {
    return switch (this) {
      ResultStatusModel.normal => ResultStatus.normal,
      ResultStatusModel.warning => ResultStatus.warning,
      ResultStatusModel.danger => ResultStatus.danger,
      ResultStatusModel.invalid => ResultStatus.invalid,
    };
  }
}

/// CartridgeType의 Hive 저장용 Adapter
@HiveType(typeId: HiveSetup.cartridgeTypeTypeId)
enum CartridgeTypeModel {
  @HiveField(0)
  glucose,

  @HiveField(1)
  radon,

  @HiveField(2)
  cholesterol,

  @HiveField(3)
  uricAcid,

  @HiveField(4)
  hemoglobin,

  @HiveField(5)
  lactate,

  @HiveField(6)
  ketone,

  @HiveField(7)
  unknown;

  /// Domain Enum으로부터 생성
  static CartridgeTypeModel fromEntity(CartridgeType type) {
    return switch (type) {
      CartridgeType.glucose => CartridgeTypeModel.glucose,
      CartridgeType.radon => CartridgeTypeModel.radon,
      CartridgeType.cholesterol => CartridgeTypeModel.cholesterol,
      CartridgeType.uricAcid => CartridgeTypeModel.uricAcid,
      CartridgeType.hemoglobin => CartridgeTypeModel.hemoglobin,
      CartridgeType.lactate => CartridgeTypeModel.lactate,
      CartridgeType.ketone => CartridgeTypeModel.ketone,
      CartridgeType.unknown => CartridgeTypeModel.unknown,
    };
  }

  /// Domain Enum으로 변환
  CartridgeType toEntity() {
    return switch (this) {
      CartridgeTypeModel.glucose => CartridgeType.glucose,
      CartridgeTypeModel.radon => CartridgeType.radon,
      CartridgeTypeModel.cholesterol => CartridgeType.cholesterol,
      CartridgeTypeModel.uricAcid => CartridgeType.uricAcid,
      CartridgeTypeModel.hemoglobin => CartridgeType.hemoglobin,
      CartridgeTypeModel.lactate => CartridgeType.lactate,
      CartridgeTypeModel.ketone => CartridgeType.ketone,
      CartridgeTypeModel.unknown => CartridgeType.unknown,
    };
  }
}

/// MeasurementResult의 Hive 저장용 모델
@HiveType(typeId: HiveSetup.measurementResultModelTypeId)
class MeasurementResultModel extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String cartridgeId;

  @HiveField(2)
  final CartridgeTypeModel measurementType;

  @HiveField(3)
  final double value;

  @HiveField(4)
  final String unit;

  @HiveField(5)
  final ResultStatusModel status;

  @HiveField(6)
  final DateTime startTime;

  @HiveField(7)
  final DateTime endTime;

  @HiveField(8)
  final double? normalRangeMin;

  @HiveField(9)
  final double? normalRangeMax;

  @HiveField(10)
  final String? aiComment;

  @HiveField(11)
  final int confidenceScore;

  @HiveField(12)
  final List<double>? waveformSummary; // 전체 waveform 대신 요약 데이터만 저장

  @HiveField(13)
  final DateTime createdAt;

  @HiveField(14)
  final bool isSynced; // 서버 동기화 여부

  MeasurementResultModel({
    required this.id,
    required this.cartridgeId,
    required this.measurementType,
    required this.value,
    required this.unit,
    required this.status,
    required this.startTime,
    required this.endTime,
    this.normalRangeMin,
    this.normalRangeMax,
    this.aiComment,
    this.confidenceScore = 100,
    this.waveformSummary,
    DateTime? createdAt,
    this.isSynced = false,
  }) : createdAt = createdAt ?? DateTime.now();

  /// Domain Entity로부터 생성
  factory MeasurementResultModel.fromEntity(MeasurementResult entity) {
    // waveform 데이터 요약 (평균값들만 저장하여 용량 절약)
    final waveformSummary = entity.waveformData.isNotEmpty
        ? entity.waveformData.map((d) => d.voltage).toList()
        : <double>[];

    return MeasurementResultModel(
      id: entity.id,
      cartridgeId: entity.cartridge.id,
      measurementType: CartridgeTypeModel.fromEntity(entity.measurementType),
      value: entity.value,
      unit: entity.unit,
      status: ResultStatusModel.fromEntity(entity.status),
      startTime: entity.startTime,
      endTime: entity.endTime,
      normalRangeMin: entity.normalRangeMin,
      normalRangeMax: entity.normalRangeMax,
      aiComment: entity.aiComment,
      confidenceScore: entity.confidenceScore,
      waveformSummary: waveformSummary,
    );
  }

  /// 간소화된 Entity로 변환 (waveformData 제외)
  /// 
  /// 전체 MeasurementResult로 변환하려면 Cartridge 정보가 필요합니다.
  MeasurementResultSummary toSummary() {
    return MeasurementResultSummary(
      id: id,
      cartridgeId: cartridgeId,
      measurementType: measurementType.toEntity(),
      value: value,
      unit: unit,
      status: status.toEntity(),
      startTime: startTime,
      endTime: endTime,
      normalRangeMin: normalRangeMin,
      normalRangeMax: normalRangeMax,
      aiComment: aiComment,
      confidenceScore: confidenceScore,
      isSynced: isSynced,
      createdAt: createdAt,
    );
  }

  /// 동기화 상태 업데이트
  MeasurementResultModel markAsSynced() {
    return MeasurementResultModel(
      id: id,
      cartridgeId: cartridgeId,
      measurementType: measurementType,
      value: value,
      unit: unit,
      status: status,
      startTime: startTime,
      endTime: endTime,
      normalRangeMin: normalRangeMin,
      normalRangeMax: normalRangeMax,
      aiComment: aiComment,
      confidenceScore: confidenceScore,
      waveformSummary: waveformSummary,
      createdAt: createdAt,
      isSynced: true,
    );
  }
}

/// 측정 결과 요약 (UI 표시용)
/// 
/// 전체 MeasurementResult에서 필수 정보만 추출한 경량 버전입니다.
class MeasurementResultSummary {
  final String id;
  final String cartridgeId;
  final CartridgeType measurementType;
  final double value;
  final String unit;
  final ResultStatus status;
  final DateTime startTime;
  final DateTime endTime;
  final double? normalRangeMin;
  final double? normalRangeMax;
  final String? aiComment;
  final int confidenceScore;
  final bool isSynced;
  final DateTime createdAt;

  const MeasurementResultSummary({
    required this.id,
    required this.cartridgeId,
    required this.measurementType,
    required this.value,
    required this.unit,
    required this.status,
    required this.startTime,
    required this.endTime,
    this.normalRangeMin,
    this.normalRangeMax,
    this.aiComment,
    required this.confidenceScore,
    required this.isSynced,
    required this.createdAt,
  });

  /// 측정 소요 시간 (초)
  int get durationSeconds => endTime.difference(startTime).inSeconds;

  /// 결과값 포맷팅
  String get formattedValue => '${value.toStringAsFixed(1)} $unit';

  /// 정상 범위 포맷팅
  String get normalRangeText {
    if (normalRangeMin == null || normalRangeMax == null) return '-';
    return '${normalRangeMin!.toStringAsFixed(1)} ~ ${normalRangeMax!.toStringAsFixed(1)} $unit';
  }
}







