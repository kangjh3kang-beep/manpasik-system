import 'dart:async';
import 'dart:typed_data';

import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'package:injectable/injectable.dart';
import 'package:rxdart/rxdart.dart';

import '../../domain/entities/reader_device.dart';
import '../../domain/entities/measurement_data.dart';

/// MPS 리더기 BLE UUID 상수
class MpsUuids {
  MpsUuids._();

  /// MPS 서비스 UUID
  static final Guid serviceUuid = Guid('0000fff0-0000-1000-8000-00805f9b34fb');

  /// 측정 데이터 특성 UUID (Notify)
  static final Guid measureCharUuid = Guid('0000fff1-0000-1000-8000-00805f9b34fb');

  /// 명령 전송 특성 UUID (Write)
  static final Guid commandCharUuid = Guid('0000fff2-0000-1000-8000-00805f9b34fb');

  /// 펌웨어 버전 특성 UUID (Read)
  static final Guid firmwareCharUuid = Guid('0000fff3-0000-1000-8000-00805f9b34fb');

  /// 배터리 레벨 특성 UUID (Read/Notify)
  static final Guid batteryCharUuid = Guid('0000fff4-0000-1000-8000-00805f9b34fb');
}

/// MPS 리더기 명령어
class MpsCommands {
  MpsCommands._();

  /// 측정 시작 명령
  static const List<int> startMeasure = [0xAA, 0x01, 0x00, 0x55];

  /// 측정 중지 명령
  static const List<int> stopMeasure = [0xAA, 0x02, 0x00, 0x55];

  /// 디바이스 리셋 명령
  static const List<int> reset = [0xAA, 0xFF, 0x00, 0x55];
}

/// 블루투스 서비스 (flutter_blue_plus 래퍼)
/// 
/// 실제 BLE 통신을 담당하는 싱글톤 서비스입니다.
/// Clean Architecture의 Data Layer에 위치합니다.
@singleton
class BluetoothService {
  BluetoothService() {
    _initializeService();
  }

  // 현재 연결된 디바이스
  BluetoothDevice? _connectedDevice;
  
  // 발견된 특성들
  BluetoothCharacteristic? _measureCharacteristic;
  BluetoothCharacteristic? _commandCharacteristic;
  BluetoothCharacteristic? _firmwareCharacteristic;
  BluetoothCharacteristic? _batteryCharacteristic;

  // 스트림 컨트롤러
  final _connectionStateController = BehaviorSubject<BluetoothConnectionState>.seeded(
    BluetoothConnectionState.disconnected,
  );
  final _measureDataController = BehaviorSubject<MeasurementData>();
  final _scannedDevicesController = BehaviorSubject<List<ReaderDevice>>.seeded([]);

  // 구독 관리
  StreamSubscription<BluetoothConnectionState>? _connectionSubscription;
  StreamSubscription<List<int>>? _measureSubscription;

  // ADC 설정
  static const double _referenceVoltage = 3.3;
  static const int _adcResolution = 4096; // 12-bit ADC

  /// 서비스 초기화
  void _initializeService() {
    // 블루투스 어댑터 상태 모니터링은 외부에서 처리
  }

  /// 블루투스 활성화 여부 스트림
  Stream<bool> get isBluetoothEnabled => FlutterBluePlus.adapterState.map(
    (state) => state == BluetoothAdapterState.on,
  );

  /// 블루투스 활성화 여부 확인
  Future<bool> get isEnabled async {
    final state = await FlutterBluePlus.adapterState.first;
    return state == BluetoothAdapterState.on;
  }

  /// 연결 상태 스트림
  Stream<BluetoothConnectionState> get connectionState => _connectionStateController.stream;

  /// 측정 데이터 스트림
  Stream<MeasurementData> get measureStream => _measureDataController.stream;

  /// 스캔된 디바이스 목록 스트림
  Stream<List<ReaderDevice>> get scannedDevices => _scannedDevicesController.stream;

  /// 현재 연결된 디바이스
  BluetoothDevice? get connectedDevice => _connectedDevice;

  /// 현재 연결된 ReaderDevice
  ReaderDevice? get connectedReaderDevice {
    if (_connectedDevice == null) return null;
    return ReaderDevice(
      id: _connectedDevice!.remoteId.str,
      name: _connectedDevice!.platformName,
      rssi: 0,
      isConnected: true,
    );
  }

  /// MPS 디바이스 스캔 시작
  /// 
  /// 'MPS-' 접두사를 가진 디바이스만 필터링합니다.
  Future<Stream<List<ReaderDevice>>> startScan({
    Duration timeout = const Duration(seconds: 10),
  }) async {
    // 기존 스캔 결과 초기화
    _scannedDevicesController.add([]);

    // 스캔 시작
    await FlutterBluePlus.startScan(
      timeout: timeout,
      androidScanMode: AndroidScanMode.lowLatency,
    );

    // 스캔 결과를 ReaderDevice로 변환하여 스트리밍
    return FlutterBluePlus.scanResults.map((results) {
      final devices = results
          .where((r) => r.device.platformName.startsWith('MPS-'))
          .map((r) => ReaderDevice(
                id: r.device.remoteId.str,
                name: r.device.platformName,
                rssi: r.rssi,
                isConnected: false,
              ))
          .toList();
      
      // 중복 제거 및 RSSI 기준 정렬
      final uniqueDevices = <String, ReaderDevice>{};
      for (final device in devices) {
        if (!uniqueDevices.containsKey(device.id) ||
            uniqueDevices[device.id]!.rssi < device.rssi) {
          uniqueDevices[device.id] = device;
        }
      }

      final sortedDevices = uniqueDevices.values.toList()
        ..sort((a, b) => b.rssi.compareTo(a.rssi));
      
      _scannedDevicesController.add(sortedDevices);
      return sortedDevices;
    });
  }

  /// 스캔 중지
  Future<void> stopScan() async {
    await FlutterBluePlus.stopScan();
  }

  /// 디바이스 연결
  Future<void> connect(
    ReaderDevice device, {
    Duration timeout = const Duration(seconds: 15),
  }) async {
    _connectionStateController.add(BluetoothConnectionState.connecting);

    try {
      // BluetoothDevice 객체 생성
      final bluetoothDevice = BluetoothDevice.fromId(device.id);
      
      // 연결
      await bluetoothDevice.connect(
        timeout: timeout,
        autoConnect: false,
      );

      _connectedDevice = bluetoothDevice;

      // 연결 상태 모니터링
      _connectionSubscription?.cancel();
      _connectionSubscription = bluetoothDevice.connectionState.listen((state) {
        _connectionStateController.add(state);
        if (state == BluetoothConnectionState.disconnected) {
          _handleDisconnection();
        }
      });

      // 서비스 탐색
      await _discoverServices();

      _connectionStateController.add(BluetoothConnectionState.connected);
    } catch (e) {
      _connectionStateController.add(BluetoothConnectionState.disconnected);
      rethrow;
    }
  }

  /// 서비스 및 특성 탐색
  Future<void> _discoverServices() async {
    if (_connectedDevice == null) return;

    final services = await _connectedDevice!.discoverServices();

    for (final service in services) {
      if (service.uuid == MpsUuids.serviceUuid) {
        for (final char in service.characteristics) {
          if (char.uuid == MpsUuids.measureCharUuid) {
            _measureCharacteristic = char;
          } else if (char.uuid == MpsUuids.commandCharUuid) {
            _commandCharacteristic = char;
          } else if (char.uuid == MpsUuids.firmwareCharUuid) {
            _firmwareCharacteristic = char;
          } else if (char.uuid == MpsUuids.batteryCharUuid) {
            _batteryCharacteristic = char;
          }
        }
        break;
      }
    }
  }

  /// 연결 해제 처리
  void _handleDisconnection() {
    _measureSubscription?.cancel();
    _measureSubscription = null;
    _connectedDevice = null;
    _measureCharacteristic = null;
    _commandCharacteristic = null;
    _firmwareCharacteristic = null;
    _batteryCharacteristic = null;
  }

  /// 연결 해제
  Future<void> disconnect() async {
    _connectionStateController.add(BluetoothConnectionState.disconnecting);
    
    try {
      await _connectedDevice?.disconnect();
    } finally {
      _handleDisconnection();
      _connectionStateController.add(BluetoothConnectionState.disconnected);
    }
  }

  /// 측정 시작
  Future<void> startMeasurement() async {
    if (_measureCharacteristic == null || _commandCharacteristic == null) {
      throw Exception('서비스가 초기화되지 않았습니다.');
    }

    // 명령 전송
    await _commandCharacteristic!.write(MpsCommands.startMeasure);

    // 알림 활성화 및 데이터 수신
    await _measureCharacteristic!.setNotifyValue(true);
    
    _measureSubscription?.cancel();
    _measureSubscription = _measureCharacteristic!.onValueReceived.listen((bytes) {
      final data = _parseWaveformData(bytes);
      _measureDataController.add(data);
    });
  }

  /// 측정 중지
  Future<void> stopMeasurement() async {
    _measureSubscription?.cancel();
    _measureSubscription = null;

    if (_commandCharacteristic != null) {
      await _commandCharacteristic!.write(MpsCommands.stopMeasure);
    }

    if (_measureCharacteristic != null) {
      await _measureCharacteristic!.setNotifyValue(false);
    }
  }

  /// 명령 전송
  Future<void> sendCommand(List<int> command) async {
    if (_commandCharacteristic == null) {
      throw Exception('명령 특성이 초기화되지 않았습니다.');
    }
    await _commandCharacteristic!.write(command);
  }

  /// 펌웨어 버전 읽기
  Future<String> readFirmwareVersion() async {
    if (_firmwareCharacteristic == null) {
      throw Exception('펌웨어 특성이 초기화되지 않았습니다.');
    }
    
    final bytes = await _firmwareCharacteristic!.read();
    return String.fromCharCodes(bytes);
  }

  /// 배터리 레벨 읽기
  Future<int> readBatteryLevel() async {
    if (_batteryCharacteristic == null) {
      throw Exception('배터리 특성이 초기화되지 않았습니다.');
    }
    
    final bytes = await _batteryCharacteristic!.read();
    return bytes.isNotEmpty ? bytes[0] : 0;
  }

  /// 바이트 데이터를 파형 데이터로 변환
  /// 
  /// 리더기에서 수신한 원시 바이트를 전압값으로 변환합니다.
  MeasurementData _parseWaveformData(List<int> bytes) {
    return MeasurementData.fromBytes(
      bytes,
      referenceVoltage: _referenceVoltage,
      adcResolution: _adcResolution,
    );
  }

  /// 리소스 해제
  @disposeMethod
  Future<void> dispose() async {
    await _measureSubscription?.cancel();
    await _connectionSubscription?.cancel();
    await disconnect();
    await _connectionStateController.close();
    await _measureDataController.close();
    await _scannedDevicesController.close();
  }
}








