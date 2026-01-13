import 'dart:async';

import 'package:injectable/injectable.dart';
import 'package:app_settings/app_settings.dart';

import '../../domain/entities/cartridge.dart';
import '../../domain/repositories/nfc_repository.dart';
import '../../services/nfc/nfc_service.dart';

/// NfcRepository 구현체
/// 
/// NfcService를 주입받아 Domain 레이어의 인터페이스를 구현합니다.
@Injectable(as: NfcRepository)
class NfcRepositoryImpl implements NfcRepository {
  final NfcService _nfcService;

  NfcRepositoryImpl(this._nfcService);

  @override
  Future<bool> get isNfcSupported => _nfcService.isNfcSupported;

  @override
  Future<bool> get isNfcEnabled => _nfcService.isNfcEnabled;

  @override
  Stream<NfcSessionState> get sessionState => _nfcService.sessionState;

  @override
  Future<NfcResult<Cartridge>> scanCartridge({
    Duration timeout = const Duration(seconds: 30),
  }) async {
    try {
      // NFC 지원 확인
      final isSupported = await isNfcSupported;
      if (!isSupported) {
        return const NfcFailure(NfcError.notSupported);
      }

      // NFC 활성화 확인
      final isEnabled = await isNfcEnabled;
      if (!isEnabled) {
        return const NfcFailure(NfcError.disabled);
      }

      // 스캔 시작
      final cartridge = await _nfcService.scanCartridge(timeout: timeout);
      
      if (cartridge == null) {
        return const NfcFailure(NfcError.tagNotFound);
      }

      // 빈 카트리지 확인
      if (cartridge.id.isEmpty) {
        return const NfcFailure(NfcError.invalidFormat);
      }

      return NfcSuccess(cartridge);
    } on NfcNotSupportedException {
      return const NfcFailure(NfcError.notSupported);
    } on NfcDisabledException {
      return const NfcFailure(NfcError.disabled);
    } on NfcTimeoutException {
      return const NfcFailure(NfcError.sessionTimeout);
    } on NfcNotNdefException {
      return const NfcFailure(NfcError.notNdef);
    } on NfcInvalidFormatException {
      return const NfcFailure(NfcError.invalidFormat);
    } on NfcNotMpsCartridgeException {
      return const NfcFailure(NfcError.notMpsCartridge);
    } catch (e) {
      return NfcFailure(_mapException(e));
    }
  }

  @override
  Future<void> stopSession() async {
    await _nfcService.stopSession();
  }

  @override
  Future<NfcResult<void>> markCartridgeAsUsed(Cartridge cartridge) async {
    try {
      // NFC 지원 확인
      final isSupported = await isNfcSupported;
      if (!isSupported) {
        return const NfcFailure(NfcError.notSupported);
      }

      await _nfcService.markCartridgeAsUsed(cartridge);
      return const NfcSuccess(null);
    } on NfcWriteFailedException {
      return const NfcFailure(NfcError.writeFailed);
    } catch (e) {
      return NfcFailure(_mapException(e));
    }
  }

  @override
  Future<void> openNfcSettings() async {
    await AppSettings.openAppSettings(type: AppSettingsType.nfc);
  }

  @override
  Future<void> dispose() async {
    await _nfcService.dispose();
  }

  /// 예외를 NfcError로 매핑
  NfcError _mapException(dynamic exception) {
    final message = exception.toString().toLowerCase();

    if (message.contains('timeout')) {
      return NfcError.sessionTimeout;
    }
    if (message.contains('cancel')) {
      return NfcError.cancelled;
    }
    if (message.contains('not supported') || message.contains('unavailable')) {
      return NfcError.notSupported;
    }
    if (message.contains('disabled') || message.contains('off')) {
      return NfcError.disabled;
    }
    if (message.contains('ndef')) {
      return NfcError.notNdef;
    }
    if (message.contains('write')) {
      return NfcError.writeFailed;
    }
    if (message.contains('read')) {
      return NfcError.readFailed;
    }

    return NfcError.unknown;
  }
}








