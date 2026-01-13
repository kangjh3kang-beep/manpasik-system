import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

part 'ai_analysis_result.g.dart';

/// AI 분석 위험 레벨
enum RiskLevel {
  @JsonValue('low')
  low('low', '낮음', 0),
  
  @JsonValue('moderate')
  moderate('moderate', '보통', 1),
  
  @JsonValue('high')
  high('high', '높음', 2),
  
  @JsonValue('critical')
  critical('critical', '위험', 3);

  const RiskLevel(this.code, this.displayName, this.severity);
  
  final String code;
  final String displayName;
  final int severity;

  /// 심각도에 따른 색상 코드
  String get colorHex => switch (this) {
    RiskLevel.low => '#4CAF50',
    RiskLevel.moderate => '#FFC107',
    RiskLevel.high => '#FF9800',
    RiskLevel.critical => '#F44336',
  };
}

/// AI 분석 결과 엔티티
/// 
/// 서버에서 측정 데이터를 분석한 결과를 담는 도메인 엔티티입니다.
@JsonSerializable()
class AIAnalysisResult extends Equatable {
  /// 분석 요약 메시지
  @JsonKey(name: 'summary')
  final String summary;

  /// 건강 점수 (0-100)
  @JsonKey(name: 'score')
  final int score;

  /// 위험 레벨
  @JsonKey(name: 'risk_level')
  final RiskLevel riskLevel;

  /// AI 추천 사항 목록
  @JsonKey(name: 'recommendations')
  final List<String> recommendations;

  /// 분석 상세 데이터 (선택적)
  @JsonKey(name: 'details')
  final Map<String, dynamic>? details;

  /// 분석 모델 버전
  @JsonKey(name: 'model_version')
  final String? modelVersion;

  /// 분석 신뢰도 (0-100)
  @JsonKey(name: 'confidence')
  final int? confidence;

  /// 분석 완료 시간
  @JsonKey(name: 'analyzed_at')
  final DateTime? analyzedAt;

  const AIAnalysisResult({
    required this.summary,
    required this.score,
    required this.riskLevel,
    required this.recommendations,
    this.details,
    this.modelVersion,
    this.confidence,
    this.analyzedAt,
  });

  /// JSON에서 생성
  factory AIAnalysisResult.fromJson(Map<String, dynamic> json) =>
      _$AIAnalysisResultFromJson(json);

  /// JSON으로 변환
  Map<String, dynamic> toJson() => _$AIAnalysisResultToJson(this);

  /// 빈 결과 생성 (오프라인 fallback용)
  factory AIAnalysisResult.empty() {
    return const AIAnalysisResult(
      summary: '분석 결과를 가져올 수 없습니다.',
      score: 0,
      riskLevel: RiskLevel.low,
      recommendations: [],
    );
  }

  /// 점수에 따른 등급 텍스트
  String get scoreGrade {
    if (score >= 90) return '매우 좋음';
    if (score >= 70) return '좋음';
    if (score >= 50) return '보통';
    if (score >= 30) return '주의';
    return '위험';
  }

  /// 점수가 양호한지 여부
  bool get isHealthy => score >= 70;

  AIAnalysisResult copyWith({
    String? summary,
    int? score,
    RiskLevel? riskLevel,
    List<String>? recommendations,
    Map<String, dynamic>? details,
    String? modelVersion,
    int? confidence,
    DateTime? analyzedAt,
  }) {
    return AIAnalysisResult(
      summary: summary ?? this.summary,
      score: score ?? this.score,
      riskLevel: riskLevel ?? this.riskLevel,
      recommendations: recommendations ?? this.recommendations,
      details: details ?? this.details,
      modelVersion: modelVersion ?? this.modelVersion,
      confidence: confidence ?? this.confidence,
      analyzedAt: analyzedAt ?? this.analyzedAt,
    );
  }

  @override
  List<Object?> get props => [
        summary,
        score,
        riskLevel,
        recommendations,
        details,
        modelVersion,
        confidence,
        analyzedAt,
      ];

  @override
  String toString() =>
      'AIAnalysisResult(score: $score, riskLevel: ${riskLevel.displayName})';
}







