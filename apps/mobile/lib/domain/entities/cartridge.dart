import 'package:equatable/equatable.dart';

/// 카트리지 측정 타입
enum CartridgeType {
  /// 혈당 측정
  glucose('glucose', '혈당', 'mg/dL'),
  
  /// 라돈 측정
  radon('radon', '라돈', 'Bq/m³'),
  
  /// 콜레스테롤 측정
  cholesterol('cholesterol', '콜레스테롤', 'mg/dL'),
  
  /// 요산 측정
  uricAcid('uric_acid', '요산', 'mg/dL'),
  
  /// 헤모글로빈 측정
  hemoglobin('hemoglobin', '헤모글로빈', 'g/dL'),
  
  /// 젖산 측정
  lactate('lactate', '젖산', 'mmol/L'),
  
  /// 케톤 측정
  ketone('ketone', '케톤', 'mmol/L'),
  
  /// 알 수 없음
  unknown('unknown', '알 수 없음', '');

  const CartridgeType(this.code, this.displayName, this.unit);

  /// 타입 코드 (NFC 태그에 저장되는 값)
  final String code;
  
  /// 화면 표시용 이름
  final String displayName;
  
  /// 측정 단위
  final String unit;

  /// 코드로부터 CartridgeType 생성
  static CartridgeType fromCode(String code) {
    return CartridgeType.values.firstWhere(
      (type) => type.code == code.toLowerCase(),
      orElse: () => CartridgeType.unknown,
    );
  }
}

/// 카트리지 엔티티
/// 
/// MPS 리더기에 장착되는 일회용 카트리지 정보를 담는 도메인 엔티티입니다.
/// NFC 태그를 통해 카트리지 정보를 읽어옵니다.
class Cartridge extends Equatable {
  /// 카트리지 고유 ID (NFC UID)
  final String id;

  /// 카트리지 측정 타입
  final CartridgeType type;

  /// 유효기한
  final DateTime expiryDate;

  /// 유효성 여부 (유효기한 및 사용 여부 기반)
  final bool isValid;

  /// 제조 일자
  final DateTime? manufactureDate;

  /// 로트 번호
  final String? lotNumber;

  /// 사용 여부
  final bool isUsed;

  /// 보정 계수 (측정값 보정에 사용)
  final double? calibrationFactor;

  const Cartridge({
    required this.id,
    required this.type,
    required this.expiryDate,
    required this.isValid,
    this.manufactureDate,
    this.lotNumber,
    this.isUsed = false,
    this.calibrationFactor,
  });

  /// 빈 카트리지 (스캔 실패 시)
  factory Cartridge.empty() {
    return Cartridge(
      id: '',
      type: CartridgeType.unknown,
      expiryDate: DateTime.now(),
      isValid: false,
    );
  }

  /// NFC NDEF 레코드로부터 Cartridge 생성
  /// 
  /// NDEF 페이로드 형식:
  /// `MPS|{type}|{expiry_yyyyMMdd}|{lot}|{calibration}`
  factory Cartridge.fromNdefPayload(String uid, String payload) {
    try {
      final parts = payload.split('|');
      
      if (parts.length < 3 || parts[0] != 'MPS') {
        return Cartridge.empty();
      }

      final type = CartridgeType.fromCode(parts[1]);
      final expiryDate = _parseDate(parts[2]);
      final lotNumber = parts.length > 3 ? parts[3] : null;
      final calibrationFactor = parts.length > 4 ? double.tryParse(parts[4]) : null;

      final now = DateTime.now();
      final isExpired = expiryDate.isBefore(now);

      return Cartridge(
        id: uid,
        type: type,
        expiryDate: expiryDate,
        isValid: !isExpired && type != CartridgeType.unknown,
        lotNumber: lotNumber,
        calibrationFactor: calibrationFactor,
      );
    } catch (e) {
      return Cartridge.empty();
    }
  }

  /// 날짜 문자열 파싱 (yyyyMMdd 형식)
  static DateTime _parseDate(String dateStr) {
    if (dateStr.length != 8) {
      return DateTime.now();
    }
    
    final year = int.tryParse(dateStr.substring(0, 4)) ?? 2024;
    final month = int.tryParse(dateStr.substring(4, 6)) ?? 1;
    final day = int.tryParse(dateStr.substring(6, 8)) ?? 1;
    
    return DateTime(year, month, day);
  }

  /// 유효기한까지 남은 일수
  int get daysUntilExpiry {
    final now = DateTime.now();
    return expiryDate.difference(now).inDays;
  }

  /// 유효기한 만료 여부
  bool get isExpired => expiryDate.isBefore(DateTime.now());

  /// 사용 가능 여부 (유효하고 미사용)
  bool get isUsable => isValid && !isUsed && !isExpired;

  /// 유효기한 경고 여부 (7일 이내 만료)
  bool get isExpiryWarning => daysUntilExpiry <= 7 && daysUntilExpiry > 0;

  Cartridge copyWith({
    String? id,
    CartridgeType? type,
    DateTime? expiryDate,
    bool? isValid,
    DateTime? manufactureDate,
    String? lotNumber,
    bool? isUsed,
    double? calibrationFactor,
  }) {
    return Cartridge(
      id: id ?? this.id,
      type: type ?? this.type,
      expiryDate: expiryDate ?? this.expiryDate,
      isValid: isValid ?? this.isValid,
      manufactureDate: manufactureDate ?? this.manufactureDate,
      lotNumber: lotNumber ?? this.lotNumber,
      isUsed: isUsed ?? this.isUsed,
      calibrationFactor: calibrationFactor ?? this.calibrationFactor,
    );
  }

  @override
  List<Object?> get props => [
        id,
        type,
        expiryDate,
        isValid,
        manufactureDate,
        lotNumber,
        isUsed,
        calibrationFactor,
      ];

  @override
  String toString() =>
      'Cartridge(id: $id, type: ${type.displayName}, expiry: $expiryDate, valid: $isValid)';
}








