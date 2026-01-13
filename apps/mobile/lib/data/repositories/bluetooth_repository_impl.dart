import 'dart:async';

import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'package:injectable/injectable.dart';

import '../../domain/entities/reader_device.dart';
import '../../domain/entities/measurement_data.dart';
import '../../domain/repositories/bluetooth_repository.dart';
import '../../services/bluetooth/bluetooth_service.dart';

/// BluetoothRepository 구현체
/// 
/// BluetoothService를 주입받아 Domain 레이어의 인터페이스를 구현합니다.
@Injectable(as: BluetoothRepository)
class BluetoothRepositoryImpl implements BluetoothRepository {
  final BluetoothService _bluetoothService;

  BluetoothRepositoryImpl(this._bluetoothService);

  @override
  Stream<bool> get isBluetoothEnabled => _bluetoothService.isBluetoothEnabled;

  @override
  Stream<BluetoothConnectionState> get connectionState => _bluetoothService.connectionState;

  @override
  ReaderDevice? get connectedDevice => _bluetoothService.connectedReaderDevice;

  @override
  Stream<MeasurementData> get measureStream => _bluetoothService.measureStream;

  @override
  Stream<BluetoothResult<List<ReaderDevice>>> scanDevices({
    Duration timeout = const Duration(seconds: 10),
  }) async* {
    try {
      // 블루투스 활성화 확인
      final isEnabled = await _bluetoothService.isEnabled;
      if (!isEnabled) {
        yield const BluetoothFailure(BluetoothError.bluetoothDisabled);
        return;
      }

      // 스캔 시작
      final stream = await _bluetoothService.startScan(timeout: timeout);
      
      await for (final devices in stream) {
        yield BluetoothSuccess(devices);
      }
    } catch (e) {
      yield BluetoothFailure(_mapException(e));
    }
  }

  @override
  Future<void> stopScan() async {
    await _bluetoothService.stopScan();
  }

  @override
  Future<BluetoothResult<ReaderDevice>> connect(
    ReaderDevice device, {
    Duration timeout = const Duration(seconds: 15),
  }) async {
    try {
      // 블루투스 활성화 확인
      final isEnabled = await _bluetoothService.isEnabled;
      if (!isEnabled) {
        return const BluetoothFailure(BluetoothError.bluetoothDisabled);
      }

      await _bluetoothService.connect(device, timeout: timeout);
      
      // 연결된 디바이스 반환
      final connectedDevice = _bluetoothService.connectedReaderDevice;
      if (connectedDevice != null) {
        return BluetoothSuccess(connectedDevice);
      } else {
        return const BluetoothFailure(BluetoothError.connectionFailed);
      }
    } on TimeoutException {
      return const BluetoothFailure(BluetoothError.connectionTimeout);
    } catch (e) {
      return BluetoothFailure(_mapException(e));
    }
  }

  @override
  Future<BluetoothResult<void>> disconnect() async {
    try {
      await _bluetoothService.disconnect();
      return const BluetoothSuccess(null);
    } catch (e) {
      return BluetoothFailure(_mapException(e));
    }
  }

  @override
  Future<BluetoothResult<void>> startMeasurement() async {
    try {
      await _bluetoothService.startMeasurement();
      return const BluetoothSuccess(null);
    } catch (e) {
      return BluetoothFailure(_mapException(e));
    }
  }

  @override
  Future<BluetoothResult<void>> stopMeasurement() async {
    try {
      await _bluetoothService.stopMeasurement();
      return const BluetoothSuccess(null);
    } catch (e) {
      return BluetoothFailure(_mapException(e));
    }
  }

  @override
  Future<BluetoothResult<void>> sendCommand(List<int> command) async {
    try {
      await _bluetoothService.sendCommand(command);
      return const BluetoothSuccess(null);
    } catch (e) {
      return BluetoothFailure(_mapException(e));
    }
  }

  @override
  Future<BluetoothResult<String>> readFirmwareVersion() async {
    try {
      final version = await _bluetoothService.readFirmwareVersion();
      return BluetoothSuccess(version);
    } catch (e) {
      return BluetoothFailure(_mapException(e));
    }
  }

  @override
  Future<BluetoothResult<int>> readBatteryLevel() async {
    try {
      final level = await _bluetoothService.readBatteryLevel();
      return BluetoothSuccess(level);
    } catch (e) {
      return BluetoothFailure(_mapException(e));
    }
  }

  @override
  Future<void> dispose() async {
    await _bluetoothService.dispose();
  }

  /// 예외를 BluetoothError로 매핑
  BluetoothError _mapException(dynamic exception) {
    final message = exception.toString().toLowerCase();

    if (message.contains('timeout')) {
      return BluetoothError.connectionTimeout;
    }
    if (message.contains('disconnect')) {
      return BluetoothError.disconnected;
    }
    if (message.contains('service') && message.contains('not found')) {
      return BluetoothError.serviceNotFound;
    }
    if (message.contains('characteristic') && message.contains('not found')) {
      return BluetoothError.characteristicNotFound;
    }
    if (message.contains('permission')) {
      if (message.contains('location')) {
        return BluetoothError.locationPermissionDenied;
      }
      return BluetoothError.bluetoothPermissionDenied;
    }
    if (message.contains('connect')) {
      return BluetoothError.connectionFailed;
    }

    return BluetoothError.unknown;
  }
}








