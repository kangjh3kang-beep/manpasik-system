// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'ai_analysis_result.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AIAnalysisResult _$AIAnalysisResultFromJson(Map<String, dynamic> json) =>
    AIAnalysisResult(
      summary: json['summary'] as String,
      score: (json['score'] as num).toInt(),
      riskLevel: $enumDecode(_$RiskLevelEnumMap, json['risk_level']),
      recommendations: (json['recommendations'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      details: json['details'] as Map<String, dynamic>?,
      modelVersion: json['model_version'] as String?,
      confidence: (json['confidence'] as num?)?.toInt(),
      analyzedAt: json['analyzed_at'] == null
          ? null
          : DateTime.parse(json['analyzed_at'] as String),
    );

Map<String, dynamic> _$AIAnalysisResultToJson(AIAnalysisResult instance) =>
    <String, dynamic>{
      'summary': instance.summary,
      'score': instance.score,
      'risk_level': _$RiskLevelEnumMap[instance.riskLevel]!,
      'recommendations': instance.recommendations,
      'details': instance.details,
      'model_version': instance.modelVersion,
      'confidence': instance.confidence,
      'analyzed_at': instance.analyzedAt?.toIso8601String(),
    };

const _$RiskLevelEnumMap = {
  RiskLevel.low: 'low',
  RiskLevel.moderate: 'moderate',
  RiskLevel.high: 'high',
  RiskLevel.critical: 'critical',
};






