// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'measurement_result_model.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class MeasurementResultModelAdapter
    extends TypeAdapter<MeasurementResultModel> {
  @override
  final int typeId = 0;

  @override
  MeasurementResultModel read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return MeasurementResultModel(
      id: fields[0] as String,
      cartridgeId: fields[1] as String,
      measurementType: fields[2] as CartridgeTypeModel,
      value: fields[3] as double,
      unit: fields[4] as String,
      status: fields[5] as ResultStatusModel,
      startTime: fields[6] as DateTime,
      endTime: fields[7] as DateTime,
      normalRangeMin: fields[8] as double?,
      normalRangeMax: fields[9] as double?,
      aiComment: fields[10] as String?,
      confidenceScore: fields[11] as int,
      waveformSummary: (fields[12] as List?)?.cast<double>(),
      createdAt: fields[13] as DateTime?,
      isSynced: fields[14] as bool,
    );
  }

  @override
  void write(BinaryWriter writer, MeasurementResultModel obj) {
    writer
      ..writeByte(15)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.cartridgeId)
      ..writeByte(2)
      ..write(obj.measurementType)
      ..writeByte(3)
      ..write(obj.value)
      ..writeByte(4)
      ..write(obj.unit)
      ..writeByte(5)
      ..write(obj.status)
      ..writeByte(6)
      ..write(obj.startTime)
      ..writeByte(7)
      ..write(obj.endTime)
      ..writeByte(8)
      ..write(obj.normalRangeMin)
      ..writeByte(9)
      ..write(obj.normalRangeMax)
      ..writeByte(10)
      ..write(obj.aiComment)
      ..writeByte(11)
      ..write(obj.confidenceScore)
      ..writeByte(12)
      ..write(obj.waveformSummary)
      ..writeByte(13)
      ..write(obj.createdAt)
      ..writeByte(14)
      ..write(obj.isSynced);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is MeasurementResultModelAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class ResultStatusModelAdapter extends TypeAdapter<ResultStatusModel> {
  @override
  final int typeId = 2;

  @override
  ResultStatusModel read(BinaryReader reader) {
    switch (reader.readByte()) {
      case 0:
        return ResultStatusModel.normal;
      case 1:
        return ResultStatusModel.warning;
      case 2:
        return ResultStatusModel.danger;
      case 3:
        return ResultStatusModel.invalid;
      default:
        return ResultStatusModel.normal;
    }
  }

  @override
  void write(BinaryWriter writer, ResultStatusModel obj) {
    switch (obj) {
      case ResultStatusModel.normal:
        writer.writeByte(0);
        break;
      case ResultStatusModel.warning:
        writer.writeByte(1);
        break;
      case ResultStatusModel.danger:
        writer.writeByte(2);
        break;
      case ResultStatusModel.invalid:
        writer.writeByte(3);
        break;
    }
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ResultStatusModelAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class CartridgeTypeModelAdapter extends TypeAdapter<CartridgeTypeModel> {
  @override
  final int typeId = 3;

  @override
  CartridgeTypeModel read(BinaryReader reader) {
    switch (reader.readByte()) {
      case 0:
        return CartridgeTypeModel.glucose;
      case 1:
        return CartridgeTypeModel.radon;
      case 2:
        return CartridgeTypeModel.cholesterol;
      case 3:
        return CartridgeTypeModel.uricAcid;
      case 4:
        return CartridgeTypeModel.hemoglobin;
      case 5:
        return CartridgeTypeModel.lactate;
      case 6:
        return CartridgeTypeModel.ketone;
      case 7:
        return CartridgeTypeModel.unknown;
      default:
        return CartridgeTypeModel.glucose;
    }
  }

  @override
  void write(BinaryWriter writer, CartridgeTypeModel obj) {
    switch (obj) {
      case CartridgeTypeModel.glucose:
        writer.writeByte(0);
        break;
      case CartridgeTypeModel.radon:
        writer.writeByte(1);
        break;
      case CartridgeTypeModel.cholesterol:
        writer.writeByte(2);
        break;
      case CartridgeTypeModel.uricAcid:
        writer.writeByte(3);
        break;
      case CartridgeTypeModel.hemoglobin:
        writer.writeByte(4);
        break;
      case CartridgeTypeModel.lactate:
        writer.writeByte(5);
        break;
      case CartridgeTypeModel.ketone:
        writer.writeByte(6);
        break;
      case CartridgeTypeModel.unknown:
        writer.writeByte(7);
        break;
    }
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CartridgeTypeModelAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}






