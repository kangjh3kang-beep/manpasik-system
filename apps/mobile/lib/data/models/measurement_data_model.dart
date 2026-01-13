import 'package:hive/hive.dart';

import '../../core/database/hive_setup.dart';
import '../../domain/entities/measurement_data.dart';

part 'measurement_data_model.g.dart';

/// MeasurementData의 Hive 저장용 모델
@HiveType(typeId: HiveSetup.measurementDataModelTypeId)
class MeasurementDataModel extends HiveObject {
  @HiveField(0)
  final List<double> rawValues;

  @HiveField(1)
  final DateTime timestamp;

  @HiveField(2)
  final double voltage;

  @HiveField(3)
  final int samplingRate;

  @HiveField(4)
  final int channel;

  MeasurementDataModel({
    required this.rawValues,
    required this.timestamp,
    required this.voltage,
    this.samplingRate = 500,
    this.channel = 0,
  });

  /// Domain Entity로부터 생성
  factory MeasurementDataModel.fromEntity(MeasurementData entity) {
    return MeasurementDataModel(
      rawValues: entity.rawValues,
      timestamp: entity.timestamp,
      voltage: entity.voltage,
      samplingRate: entity.samplingRate,
      channel: entity.channel,
    );
  }

  /// Domain Entity로 변환
  MeasurementData toEntity() {
    return MeasurementData(
      rawValues: rawValues,
      timestamp: timestamp,
      voltage: voltage,
      samplingRate: samplingRate,
      channel: channel,
    );
  }
}







