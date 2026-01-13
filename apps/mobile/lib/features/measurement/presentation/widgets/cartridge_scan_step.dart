import 'package:flutter/material.dart';

/// Step 2: 카트리지 NFC 스캔 위젯
class CartridgeScanStep extends StatefulWidget {
  final VoidCallback? onCancel;

  const CartridgeScanStep({
    super.key,
    this.onCancel,
  });

  @override
  State<CartridgeScanStep> createState() => _CartridgeScanStepState();
}

class _CartridgeScanStepState extends State<CartridgeScanStep>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.15).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: Curves.easeInOut,
      ),
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // NFC 아이콘 애니메이션
          AnimatedBuilder(
            animation: _pulseAnimation,
            builder: (context, child) {
              return Transform.scale(
                scale: _pulseAnimation.value,
                child: child,
              );
            },
            child: Container(
              width: 160,
              height: 160,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    Colors.cyan.withOpacity(0.3),
                    Colors.cyan.withOpacity(0.1),
                    Colors.transparent,
                  ],
                ),
              ),
              child: Center(
                child: Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: const Color(0xFF1A1F38),
                    border: Border.all(
                      color: Colors.cyan.withOpacity(0.5),
                      width: 2,
                    ),
                  ),
                  child: const Icon(
                    Icons.nfc_rounded,
                    size: 48,
                    color: Colors.cyan,
                  ),
                ),
              ),
            ),
          ),
          
          const SizedBox(height: 48),
          
          // 안내 텍스트
          const Text(
            '카트리지를 스캔하세요',
            style: TextStyle(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            '카트리지의 NFC 태그를\n휴대폰 뒷면에 가까이 대주세요',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.white.withOpacity(0.6),
              fontSize: 14,
              height: 1.5,
            ),
          ),
          
          const SizedBox(height: 48),
          
          // 스캔 중 인디케이터
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: Colors.cyan.shade400,
                ),
              ),
              const SizedBox(width: 12),
              Text(
                'NFC 태그 대기 중...',
                style: TextStyle(
                  color: Colors.cyan.shade400,
                  fontSize: 14,
                ),
              ),
            ],
          ),
          
          const Spacer(),
          
          // 취소 버튼
          TextButton(
            onPressed: widget.onCancel,
            child: Text(
              '취소',
              style: TextStyle(
                color: Colors.white.withOpacity(0.6),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

