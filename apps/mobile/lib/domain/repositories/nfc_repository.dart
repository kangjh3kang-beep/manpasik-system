import '../entities/cartridge.dart';

/// NFC 통신 결과 타입
sealed class NfcResult<T> {
  const NfcResult();
}

/// 성공 결과
class NfcSuccess<T> extends NfcResult<T> {
  final T data;
  const NfcSuccess(this.data);
}

/// 실패 결과
class NfcFailure<T> extends NfcResult<T> {
  final NfcError error;
  const NfcFailure(this.error);
}

/// NFC 에러 타입
enum NfcError {
  /// NFC 미지원 기기
  notSupported,
  
  /// NFC 비활성화
  disabled,
  
  /// 태그를 찾을 수 없음
  tagNotFound,
  
  /// NDEF 형식이 아님
  notNdef,
  
  /// 읽기 실패
  readFailed,
  
  /// 쓰기 실패
  writeFailed,
  
  /// 잘못된 데이터 형식
  invalidFormat,
  
  /// MPS 카트리지가 아님
  notMpsCartridge,
  
  /// 세션 타임아웃
  sessionTimeout,
  
  /// 사용자 취소
  cancelled,
  
  /// 알 수 없는 에러
  unknown,
}

/// NFC 세션 상태
enum NfcSessionState {
  /// 대기 중
  idle,
  
  /// 스캔 중 (태그 대기)
  scanning,
  
  /// 태그 읽는 중
  reading,
  
  /// 태그 쓰는 중
  writing,
  
  /// 완료
  completed,
  
  /// 에러 발생
  error,
}

/// NFC 리포지토리 추상 클래스
/// 
/// Domain 레이어에서 정의하는 NFC 통신 인터페이스입니다.
/// Data 레이어에서 구체적인 구현을 제공합니다.
abstract class NfcRepository {
  /// NFC 지원 여부 확인
  Future<bool> get isNfcSupported;

  /// NFC 활성화 여부 확인
  Future<bool> get isNfcEnabled;

  /// 현재 세션 상태 스트림
  Stream<NfcSessionState> get sessionState;

  /// 카트리지 스캔
  /// 
  /// NFC 태그를 읽어 카트리지 정보를 반환합니다.
  /// 사용자가 태그에 기기를 갖다 대면 자동으로 읽기가 수행됩니다.
  /// 
  /// [timeout]: 스캔 타임아웃 (기본 30초)
  Future<NfcResult<Cartridge>> scanCartridge({
    Duration timeout = const Duration(seconds: 30),
  });

  /// NFC 세션 중지
  Future<void> stopSession();

  /// 카트리지 사용 완료 표시 (태그에 쓰기)
  /// 
  /// 카트리지 사용 후 태그에 사용 완료 플래그를 기록합니다.
  Future<NfcResult<void>> markCartridgeAsUsed(Cartridge cartridge);

  /// NFC 설정 화면 열기
  Future<void> openNfcSettings();

  /// 리소스 해제
  Future<void> dispose();
}








