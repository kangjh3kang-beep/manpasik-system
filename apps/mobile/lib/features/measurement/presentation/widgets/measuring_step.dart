import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../../../domain/entities/cartridge.dart';
import '../../../../domain/entities/measurement_data.dart';

/// Step 4: 측정 중 (실시간 파형) 위젯
class MeasuringStep extends StatelessWidget {
  final List<MeasurementData> waveformData;
  final MeasurementData? latestData;
  final double progress;
  final int elapsedSeconds;
  final Cartridge cartridge;
  final bool isAnalyzing;

  const MeasuringStep({
    super.key,
    required this.waveformData,
    this.latestData,
    required this.progress,
    required this.elapsedSeconds,
    required this.cartridge,
    this.isAnalyzing = false,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          // 측정 타입 및 시간
          _MeasurementHeader(
            cartridgeType: cartridge.type,
            elapsedSeconds: elapsedSeconds,
          ),
          
          const SizedBox(height: 24),
          
          // 실시간 파형 차트
          Expanded(
            child: _WaveformChart(
              waveformData: waveformData,
              latestData: latestData,
            ),
          ),
          
          const SizedBox(height: 24),
          
          // 현재 수치
          _CurrentValueDisplay(
            voltage: latestData?.voltage ?? 0,
            sampleCount: waveformData.fold(0, (sum, d) => sum + d.rawValues.length),
          ),
          
          const SizedBox(height: 24),
          
          // 진행률 바
          _ProgressBar(progress: progress),
          
          const SizedBox(height: 16),
          
          if (isAnalyzing)
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.cyan.shade400,
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  '결과 분석 중...',
                  style: TextStyle(
                    color: Colors.cyan.shade300,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            )
          else
            Text(
              '측정 중... ${(progress * 100).toInt()}%',
              style: TextStyle(
                color: Colors.white.withOpacity(0.7),
                fontSize: 14,
              ),
            ),
        ],
      ),
    );
  }
}

class _MeasurementHeader extends StatelessWidget {
  final CartridgeType cartridgeType;
  final int elapsedSeconds;

  const _MeasurementHeader({
    required this.cartridgeType,
    required this.elapsedSeconds,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${cartridgeType.displayName} 측정',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              '단위: ${cartridgeType.unit}',
              style: TextStyle(
                color: Colors.white.withOpacity(0.5),
                fontSize: 12,
              ),
            ),
          ],
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: const Color(0xFF1A1F38),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              const Icon(Icons.timer_outlined, color: Colors.cyan, size: 20),
              const SizedBox(width: 8),
              Text(
                _formatTime(elapsedSeconds),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  fontFamily: 'monospace',
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  String _formatTime(int seconds) {
    final mins = seconds ~/ 60;
    final secs = seconds % 60;
    return '${mins.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
  }
}

class _WaveformChart extends StatelessWidget {
  final List<MeasurementData> waveformData;
  final MeasurementData? latestData;

  const _WaveformChart({
    required this.waveformData,
    this.latestData,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF0D1220),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.cyan.withOpacity(0.2),
        ),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: CustomPaint(
          painter: _WaveformPainter(
            waveformData: waveformData,
            latestData: latestData,
          ),
          size: Size.infinite,
        ),
      ),
    );
  }
}

class _WaveformPainter extends CustomPainter {
  final List<MeasurementData> waveformData;
  final MeasurementData? latestData;

  _WaveformPainter({
    required this.waveformData,
    this.latestData,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // 그리드 그리기
    _drawGrid(canvas, size);
    
    // 파형 그리기
    _drawWaveform(canvas, size);
  }

  void _drawGrid(Canvas canvas, Size size) {
    final gridPaint = Paint()
      ..color = Colors.cyan.withOpacity(0.1)
      ..strokeWidth = 1;

    // 수평선
    for (int i = 0; i <= 4; i++) {
      final y = size.height * i / 4;
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }

    // 수직선
    for (int i = 0; i <= 8; i++) {
      final x = size.width * i / 8;
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), gridPaint);
    }
  }

  void _drawWaveform(Canvas canvas, Size size) {
    if (waveformData.isEmpty) return;

    // 모든 데이터 포인트 수집
    final allValues = <double>[];
    for (final data in waveformData) {
      allValues.addAll(data.rawValues);
    }

    if (allValues.isEmpty) return;

    // 최대 500 포인트만 표시
    final displayValues = allValues.length > 500 
        ? allValues.sublist(allValues.length - 500) 
        : allValues;

    // 범위 계산
    final minVal = displayValues.reduce(math.min);
    final maxVal = displayValues.reduce(math.max);
    final range = maxVal - minVal;

    // 파형 그리기
    final wavePaint = Paint()
      ..color = Colors.cyan
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final path = Path();
    
    for (int i = 0; i < displayValues.length; i++) {
      final x = size.width * i / (displayValues.length - 1);
      final normalizedY = range > 0 
          ? (displayValues[i] - minVal) / range 
          : 0.5;
      final y = size.height * (1 - normalizedY) * 0.8 + size.height * 0.1;

      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }

    // 그라디언트 효과
    final gradient = Paint()
      ..shader = LinearGradient(
        begin: Alignment.centerLeft,
        end: Alignment.centerRight,
        colors: [
          Colors.cyan.withOpacity(0.3),
          Colors.cyan,
        ],
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height))
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    canvas.drawPath(path, gradient);

    // 현재 포인트 표시
    if (displayValues.isNotEmpty) {
      final lastX = size.width;
      final lastVal = displayValues.last;
      final normalizedY = range > 0 
          ? (lastVal - minVal) / range 
          : 0.5;
      final lastY = size.height * (1 - normalizedY) * 0.8 + size.height * 0.1;

      final dotPaint = Paint()
        ..color = Colors.cyan
        ..style = PaintingStyle.fill;

      canvas.drawCircle(Offset(lastX, lastY), 6, dotPaint);
      
      final glowPaint = Paint()
        ..color = Colors.cyan.withOpacity(0.3)
        ..style = PaintingStyle.fill;
      
      canvas.drawCircle(Offset(lastX, lastY), 12, glowPaint);
    }
  }

  @override
  bool shouldRepaint(covariant _WaveformPainter oldDelegate) {
    return oldDelegate.waveformData != waveformData ||
        oldDelegate.latestData != latestData;
  }
}

class _CurrentValueDisplay extends StatelessWidget {
  final double voltage;
  final int sampleCount;

  const _CurrentValueDisplay({
    required this.voltage,
    required this.sampleCount,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _ValueCard(
            label: '현재 전압',
            value: '${(voltage * 1000).toStringAsFixed(1)} mV',
            icon: Icons.electric_bolt,
            color: Colors.amber,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _ValueCard(
            label: '샘플 수',
            value: '$sampleCount',
            icon: Icons.data_array,
            color: Colors.green,
          ),
        ),
      ],
    );
  }
}

class _ValueCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _ValueCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1F38),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  color: Colors.white.withOpacity(0.5),
                  fontSize: 11,
                ),
              ),
              Text(
                value,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ProgressBar extends StatelessWidget {
  final double progress;

  const _ProgressBar({required this.progress});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 8,
      decoration: BoxDecoration(
        color: const Color(0xFF1A1F38),
        borderRadius: BorderRadius.circular(4),
      ),
      child: FractionallySizedBox(
        alignment: Alignment.centerLeft,
        widthFactor: progress.clamp(0.0, 1.0),
        child: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [Colors.cyan.shade700, Colors.cyan.shade400],
            ),
            borderRadius: BorderRadius.circular(4),
            boxShadow: [
              BoxShadow(
                color: Colors.cyan.withOpacity(0.5),
                blurRadius: 8,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

