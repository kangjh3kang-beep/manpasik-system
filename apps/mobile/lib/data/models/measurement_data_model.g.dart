// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'measurement_data_model.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class MeasurementDataModelAdapter extends TypeAdapter<MeasurementDataModel> {
  @override
  final int typeId = 1;

  @override
  MeasurementDataModel read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return MeasurementDataModel(
      rawValues: (fields[0] as List).cast<double>(),
      timestamp: fields[1] as DateTime,
      voltage: fields[2] as double,
      samplingRate: fields[3] as int,
      channel: fields[4] as int,
    );
  }

  @override
  void write(BinaryWriter writer, MeasurementDataModel obj) {
    writer
      ..writeByte(5)
      ..writeByte(0)
      ..write(obj.rawValues)
      ..writeByte(1)
      ..write(obj.timestamp)
      ..writeByte(2)
      ..write(obj.voltage)
      ..writeByte(3)
      ..write(obj.samplingRate)
      ..writeByte(4)
      ..write(obj.channel);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is MeasurementDataModelAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}






