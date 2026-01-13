import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:injectable/injectable.dart';
import 'package:nfc_manager/nfc_manager.dart';
import 'package:rxdart/rxdart.dart';

import '../../domain/entities/cartridge.dart';
import '../../domain/repositories/nfc_repository.dart';

/// NFC 서비스 (nfc_manager 래퍼)
/// 
/// 실제 NFC 통신을 담당하는 싱글톤 서비스입니다.
/// Clean Architecture의 Data Layer에 위치합니다.
@singleton
class NfcService {
  NfcService();

  // NFC Manager 인스턴스
  final NfcManager _nfcManager = NfcManager.instance;

  // 세션 상태 컨트롤러
  final _sessionStateController = BehaviorSubject<NfcSessionState>.seeded(
    NfcSessionState.idle,
  );

  // 스캔 완료 컴플리터
  Completer<Cartridge?>? _scanCompleter;

  // 타임아웃 타이머
  Timer? _timeoutTimer;

  /// 세션 상태 스트림
  Stream<NfcSessionState> get sessionState => _sessionStateController.stream;

  /// 현재 세션 상태
  NfcSessionState get currentSessionState => _sessionStateController.value;

  /// NFC 지원 여부 확인
  Future<bool> get isNfcSupported async {
    try {
      return await _nfcManager.isAvailable();
    } catch (e) {
      return false;
    }
  }

  /// NFC 활성화 여부 확인 (Android에서만 구분 가능)
  Future<bool> get isNfcEnabled async {
    try {
      // nfc_manager는 isAvailable()이 지원+활성화를 모두 체크
      return await _nfcManager.isAvailable();
    } catch (e) {
      return false;
    }
  }

  /// 카트리지 스캔 시작
  /// 
  /// NFC 태그를 감지하면 NDEF 데이터를 읽어 Cartridge 객체로 변환합니다.
  Future<Cartridge?> scanCartridge({
    Duration timeout = const Duration(seconds: 30),
  }) async {
    // 이미 스캔 중이면 중단
    if (_scanCompleter != null && !_scanCompleter!.isCompleted) {
      return null;
    }

    // NFC 지원 확인
    final isAvailable = await isNfcSupported;
    if (!isAvailable) {
      throw NfcNotSupportedException();
    }

    _scanCompleter = Completer<Cartridge?>();
    _sessionStateController.add(NfcSessionState.scanning);

    // 타임아웃 설정
    _timeoutTimer?.cancel();
    _timeoutTimer = Timer(timeout, () {
      if (!_scanCompleter!.isCompleted) {
        _scanCompleter!.completeError(NfcTimeoutException());
        stopSession();
      }
    });

    try {
      await _nfcManager.startSession(
        onDiscovered: _handleTagDiscovered,
        onError: _handleSessionError,
        alertMessage: Platform.isIOS ? 'MPS 카트리지를 기기에 가까이 대주세요' : null,
      );

      return await _scanCompleter!.future;
    } catch (e) {
      _sessionStateController.add(NfcSessionState.error);
      rethrow;
    }
  }

  /// NFC 태그 발견 핸들러
  Future<void> _handleTagDiscovered(NfcTag tag) async {
    _sessionStateController.add(NfcSessionState.reading);

    try {
      final cartridge = await _readCartridgeFromTag(tag);
      
      _sessionStateController.add(NfcSessionState.completed);
      
      if (!_scanCompleter!.isCompleted) {
        _scanCompleter!.complete(cartridge);
      }
    } catch (e) {
      _sessionStateController.add(NfcSessionState.error);
      
      if (!_scanCompleter!.isCompleted) {
        _scanCompleter!.completeError(e);
      }
    } finally {
      await stopSession();
    }
  }

  /// 태그에서 카트리지 정보 읽기
  Future<Cartridge> _readCartridgeFromTag(NfcTag tag) async {
    // 태그 UID 추출
    final uid = _extractTagUid(tag);
    
    // NDEF 데이터 읽기
    final ndef = Ndef.from(tag);
    if (ndef == null) {
      throw NfcNotNdefException();
    }

    final ndefMessage = await ndef.read();
    if (ndefMessage.records.isEmpty) {
      throw NfcInvalidFormatException();
    }

    // 첫 번째 레코드에서 페이로드 추출
    final record = ndefMessage.records.first;
    final payload = _decodeNdefPayload(record);

    // MPS 형식 검증
    if (!payload.startsWith('MPS|')) {
      throw NfcNotMpsCartridgeException();
    }

    return Cartridge.fromNdefPayload(uid, payload);
  }

  /// 태그 UID 추출
  String _extractTagUid(NfcTag tag) {
    // NfcA (Android)
    final nfcA = NfcA.from(tag);
    if (nfcA != null) {
      return _bytesToHex(nfcA.identifier);
    }

    // NfcB (Android)
    final nfcB = NfcB.from(tag);
    if (nfcB != null) {
      return _bytesToHex(nfcB.identifier);
    }

    // NfcF (Android)
    final nfcF = NfcF.from(tag);
    if (nfcF != null) {
      return _bytesToHex(nfcF.identifier);
    }

    // NfcV (Android)
    final nfcV = NfcV.from(tag);
    if (nfcV != null) {
      return _bytesToHex(nfcV.identifier);
    }

    // MiFare (iOS)
    final mifare = MiFare.from(tag);
    if (mifare != null) {
      return _bytesToHex(mifare.identifier);
    }

    // ISO7816 (iOS)
    final iso7816 = Iso7816.from(tag);
    if (iso7816 != null) {
      return _bytesToHex(iso7816.identifier);
    }

    return 'unknown';
  }

  /// 바이트 배열을 16진수 문자열로 변환
  String _bytesToHex(List<int> bytes) {
    return bytes.map((b) => b.toRadixString(16).padLeft(2, '0')).join(':').toUpperCase();
  }

  /// NDEF 레코드 페이로드 디코딩
  String _decodeNdefPayload(NdefRecord record) {
    final payload = record.payload;
    
    if (payload.isEmpty) {
      return '';
    }

    // 텍스트 레코드인 경우 (TNF 0x01, RTD 'T')
    if (record.typeNameFormat == NdefTypeNameFormat.nfcWellknown &&
        record.type.isNotEmpty &&
        record.type.first == 0x54) { // 'T' = 텍스트
      // 첫 바이트는 언어 코드 길이
      final langCodeLength = payload.first & 0x3F;
      // 언어 코드 이후가 실제 텍스트
      return utf8.decode(payload.sublist(1 + langCodeLength));
    }

    // 그 외의 경우 전체 페이로드를 UTF-8로 디코딩
    try {
      return utf8.decode(payload);
    } catch (e) {
      return String.fromCharCodes(payload);
    }
  }

  /// 세션 에러 핸들러
  void _handleSessionError(dynamic error) {
    _sessionStateController.add(NfcSessionState.error);
    
    if (_scanCompleter != null && !_scanCompleter!.isCompleted) {
      _scanCompleter!.completeError(error);
    }
  }

  /// NFC 세션 중지
  Future<void> stopSession() async {
    _timeoutTimer?.cancel();
    _timeoutTimer = null;

    try {
      await _nfcManager.stopSession();
    } catch (e) {
      // 세션이 이미 종료된 경우 무시
    }

    _sessionStateController.add(NfcSessionState.idle);
  }

  /// 카트리지 사용 완료 표시 (태그에 쓰기)
  Future<void> markCartridgeAsUsed(Cartridge cartridge) async {
    final isAvailable = await isNfcSupported;
    if (!isAvailable) {
      throw NfcNotSupportedException();
    }

    final completer = Completer<void>();
    _sessionStateController.add(NfcSessionState.scanning);

    await _nfcManager.startSession(
      onDiscovered: (NfcTag tag) async {
        _sessionStateController.add(NfcSessionState.writing);

        try {
          final ndef = Ndef.from(tag);
          if (ndef == null || !ndef.isWritable) {
            throw NfcWriteFailedException();
          }

          // 사용 완료 플래그 추가된 새 페이로드 생성
          final newPayload = 'MPS|${cartridge.type.code}|'
              '${_formatDate(cartridge.expiryDate)}|'
              '${cartridge.lotNumber ?? ""}|'
              '${cartridge.calibrationFactor ?? ""}|'
              'USED';

          final ndefMessage = NdefMessage([
            NdefRecord.createText(newPayload),
          ]);

          await ndef.write(ndefMessage);
          
          _sessionStateController.add(NfcSessionState.completed);
          completer.complete();
        } catch (e) {
          _sessionStateController.add(NfcSessionState.error);
          completer.completeError(e);
        } finally {
          await stopSession();
        }
      },
      onError: (error) {
        _sessionStateController.add(NfcSessionState.error);
        completer.completeError(error);
      },
      alertMessage: Platform.isIOS ? '카트리지를 다시 태그해주세요' : null,
    );

    return completer.future;
  }

  /// 날짜를 yyyyMMdd 형식으로 포맷
  String _formatDate(DateTime date) {
    return '${date.year}${date.month.toString().padLeft(2, '0')}${date.day.toString().padLeft(2, '0')}';
  }

  /// NFC 설정 화면 열기
  Future<void> openNfcSettings() async {
    // Platform-specific implementation would go here
    // Android: Intent to NFC settings
    // iOS: No direct way to open NFC settings
  }

  /// 리소스 해제
  @disposeMethod
  Future<void> dispose() async {
    await stopSession();
    await _sessionStateController.close();
  }
}

/// NFC 미지원 예외
class NfcNotSupportedException implements Exception {
  @override
  String toString() => 'NFC is not supported on this device';
}

/// NFC 비활성화 예외
class NfcDisabledException implements Exception {
  @override
  String toString() => 'NFC is disabled';
}

/// NFC 타임아웃 예외
class NfcTimeoutException implements Exception {
  @override
  String toString() => 'NFC session timeout';
}

/// NDEF 형식이 아님 예외
class NfcNotNdefException implements Exception {
  @override
  String toString() => 'Tag is not NDEF formatted';
}

/// 잘못된 데이터 형식 예외
class NfcInvalidFormatException implements Exception {
  @override
  String toString() => 'Invalid NDEF data format';
}

/// MPS 카트리지가 아님 예외
class NfcNotMpsCartridgeException implements Exception {
  @override
  String toString() => 'Not an MPS cartridge';
}

/// NFC 쓰기 실패 예외
class NfcWriteFailedException implements Exception {
  @override
  String toString() => 'Failed to write to NFC tag';
}








