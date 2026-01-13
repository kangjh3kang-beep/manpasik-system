import 'package:equatable/equatable.dart';

/// 블루투스 리더기 디바이스 엔티티
/// 
/// MPS(만파식) 리더기 장치의 정보를 담는 도메인 엔티티입니다.
class ReaderDevice extends Equatable {
  /// 디바이스 고유 ID (블루투스 MAC 주소)
  final String id;

  /// 디바이스 이름 (예: MPS-001)
  final String name;

  /// 신호 강도 (dBm)
  final int rssi;

  /// 연결 상태
  final bool isConnected;

  const ReaderDevice({
    required this.id,
    required this.name,
    required this.rssi,
    this.isConnected = false,
  });

  /// 연결 상태가 변경된 새 인스턴스 반환
  ReaderDevice copyWith({
    String? id,
    String? name,
    int? rssi,
    bool? isConnected,
  }) {
    return ReaderDevice(
      id: id ?? this.id,
      name: name ?? this.name,
      rssi: rssi ?? this.rssi,
      isConnected: isConnected ?? this.isConnected,
    );
  }

  /// RSSI 기반 신호 강도 레벨 (0-4)
  int get signalLevel {
    if (rssi >= -50) return 4; // 매우 강함
    if (rssi >= -60) return 3; // 강함
    if (rssi >= -70) return 2; // 보통
    if (rssi >= -80) return 1; // 약함
    return 0; // 매우 약함
  }

  /// MPS 디바이스 여부 확인
  bool get isMpsDevice => name.startsWith('MPS-');

  @override
  List<Object?> get props => [id, name, rssi, isConnected];

  @override
  String toString() => 'ReaderDevice(id: $id, name: $name, rssi: $rssi, connected: $isConnected)';
}








