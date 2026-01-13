import 'package:flutter/material.dart';

import '../../../../domain/entities/ai_analysis_result.dart';
import '../../../../domain/entities/measurement_result.dart';

/// Step 5: 결과 표시 위젯
class ResultStep extends StatelessWidget {
  final MeasurementResult result;
  final AIAnalysisResult? aiAnalysis;
  final bool isOfflineMode;
  final VoidCallback? onNewMeasurement;
  final VoidCallback? onSaveAndExit;

  const ResultStep({
    super.key,
    required this.result,
    this.aiAnalysis,
    this.isOfflineMode = false,
    this.onNewMeasurement,
    this.onSaveAndExit,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          // 오프라인 모드 배너
          if (isOfflineMode) _OfflineBanner(),
          
          // 결과 카드
          _ResultCard(result: result),
          
          const SizedBox(height: 16),
          
          // AI 분석 결과 카드 (있을 경우)
          if (aiAnalysis != null) ...[
            _AIAnalysisCard(aiAnalysis: aiAnalysis!),
            const SizedBox(height: 16),
          ],
          
          // 상세 정보
          Expanded(
            child: _DetailSection(result: result, aiAnalysis: aiAnalysis),
          ),
          
          // 버튼들
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: onNewMeasurement,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.cyan,
                    side: const BorderSide(color: Colors.cyan),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text('새 측정'),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                flex: 2,
                child: ElevatedButton(
                  onPressed: onSaveAndExit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.cyan.shade600,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text('저장 후 종료'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// 오프라인 모드 배너
class _OfflineBanner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.orange.withOpacity(0.15),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.orange.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Icon(Icons.cloud_off, color: Colors.orange.shade300, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              '오프라인 모드: 로컬 결과만 표시됩니다',
              style: TextStyle(
                color: Colors.orange.shade300,
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// AI 분석 결과 카드
class _AIAnalysisCard extends StatelessWidget {
  final AIAnalysisResult aiAnalysis;

  const _AIAnalysisCard({required this.aiAnalysis});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.purple.shade900.withOpacity(0.5),
            Colors.indigo.shade900.withOpacity(0.5),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.purple.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 헤더
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.purple.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.auto_awesome,
                  color: Colors.purple,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              const Text(
                'AI 건강 분석',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const Spacer(),
              // 점수 뱃지
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: _getScoreColor(aiAnalysis.score).withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: _getScoreColor(aiAnalysis.score).withOpacity(0.5),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.favorite,
                      size: 16,
                      color: _getScoreColor(aiAnalysis.score),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '${aiAnalysis.score}점',
                      style: TextStyle(
                        color: _getScoreColor(aiAnalysis.score),
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 16),
          
          // 요약
          Text(
            aiAnalysis.summary,
            style: TextStyle(
              color: Colors.white.withOpacity(0.9),
              fontSize: 14,
              height: 1.6,
            ),
          ),
          
          const SizedBox(height: 16),
          
          // 위험 레벨
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: _getRiskColor(aiAnalysis.riskLevel).withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '위험도: ${aiAnalysis.riskLevel.displayName}',
                  style: TextStyle(
                    color: _getRiskColor(aiAnalysis.riskLevel),
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              if (aiAnalysis.confidence != null) ...[
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.blue.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '신뢰도: ${aiAnalysis.confidence}%',
                    style: TextStyle(
                      color: Colors.blue.shade300,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ],
          ),
          
          // 추천사항
          if (aiAnalysis.recommendations.isNotEmpty) ...[
            const SizedBox(height: 16),
            const Text(
              '추천사항',
              style: TextStyle(
                color: Colors.white70,
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            ...aiAnalysis.recommendations.take(3).map((rec) => Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    margin: const EdgeInsets.only(top: 6),
                    width: 4,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.cyan.shade400,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      rec,
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.8),
                        fontSize: 13,
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
            )),
          ],
        ],
      ),
    );
  }

  Color _getScoreColor(int score) {
    if (score >= 80) return Colors.green;
    if (score >= 60) return Colors.orange;
    return Colors.red;
  }

  Color _getRiskColor(RiskLevel level) {
    return switch (level) {
      RiskLevel.low => Colors.green,
      RiskLevel.moderate => Colors.yellow,
      RiskLevel.high => Colors.orange,
      RiskLevel.critical => Colors.red,
    };
  }
}

class _ResultCard extends StatelessWidget {
  final MeasurementResult result;

  const _ResultCard({required this.result});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            _getStatusColor().withOpacity(0.2),
            const Color(0xFF1A1F38),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: _getStatusColor().withOpacity(0.3),
          width: 2,
        ),
      ),
      child: Column(
        children: [
          // 상태 아이콘
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: _getStatusColor().withOpacity(0.2),
              shape: BoxShape.circle,
            ),
            child: Icon(
              _getStatusIcon(),
              size: 40,
              color: _getStatusColor(),
            ),
          ),
          
          const SizedBox(height: 16),
          
          // 측정 타입
          Text(
            result.measurementType.displayName,
            style: TextStyle(
              color: Colors.white.withOpacity(0.7),
              fontSize: 14,
            ),
          ),
          
          const SizedBox(height: 8),
          
          // 결과값
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                result.value.toStringAsFixed(1),
                style: TextStyle(
                  color: _getStatusColor(),
                  fontSize: 56,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(bottom: 10, left: 8),
                child: Text(
                  result.unit,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.7),
                    fontSize: 18,
                  ),
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 12),
          
          // 상태 뱃지
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: _getStatusColor().withOpacity(0.2),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              result.status.displayName,
              style: TextStyle(
                color: _getStatusColor(),
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor() {
    return switch (result.status) {
      ResultStatus.normal => Colors.green,
      ResultStatus.warning => Colors.orange,
      ResultStatus.danger => Colors.red,
      ResultStatus.invalid => Colors.grey,
    };
  }

  IconData _getStatusIcon() {
    return switch (result.status) {
      ResultStatus.normal => Icons.check_circle_outline,
      ResultStatus.warning => Icons.warning_amber_outlined,
      ResultStatus.danger => Icons.error_outline,
      ResultStatus.invalid => Icons.help_outline,
    };
  }
}

class _DetailSection extends StatelessWidget {
  final MeasurementResult result;
  final AIAnalysisResult? aiAnalysis;

  const _DetailSection({required this.result, this.aiAnalysis});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: const Color(0xFF1A1F38),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              '상세 정보',
              style: TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
            
            _DetailRow(
              label: '정상 범위',
              value: result.normalRangeText,
            ),
            const Divider(color: Colors.white12, height: 24),
            
            _DetailRow(
              label: '측정 시간',
              value: '${result.durationSeconds}초',
            ),
            const Divider(color: Colors.white12, height: 24),
            
            _DetailRow(
              label: '신뢰도',
              value: '${result.confidenceScore}%',
              valueColor: result.confidenceScore >= 80 
                  ? Colors.green 
                  : Colors.orange,
            ),
            const Divider(color: Colors.white12, height: 24),
            
            _DetailRow(
              label: '측정 완료',
              value: _formatDateTime(result.endTime),
            ),
            const Divider(color: Colors.white12, height: 24),
            
            _DetailRow(
              label: '카트리지 ID',
              value: result.cartridge.id.length > 16
                  ? '${result.cartridge.id.substring(0, 16)}...'
                  : result.cartridge.id,
            ),
            
            // AI 분석이 없을 때 기본 코멘트 표시
            if (aiAnalysis == null && result.aiComment != null) ...[
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.cyan.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: Colors.cyan.withOpacity(0.2),
                  ),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(
                      Icons.info_outline,
                      color: Colors.cyan,
                      size: 20,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            '로컬 분석',
                            style: TextStyle(
                              color: Colors.cyan,
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            result.aiComment!,
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.8),
                              fontSize: 13,
                              height: 1.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  String _formatDateTime(DateTime dt) {
    return '${dt.year}.${dt.month.toString().padLeft(2, '0')}.${dt.day.toString().padLeft(2, '0')} '
        '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  final Color? valueColor;

  const _DetailRow({
    required this.label,
    required this.value,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            color: Colors.white.withOpacity(0.5),
            fontSize: 14,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            color: valueColor ?? Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}
