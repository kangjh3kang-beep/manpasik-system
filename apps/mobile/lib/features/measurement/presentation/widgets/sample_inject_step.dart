import 'package:flutter/material.dart';

import '../../../../domain/entities/cartridge.dart';
import '../../../../domain/entities/reader_device.dart';

/// Step 3: 시료 주입 대기 위젯
class SampleInjectStep extends StatelessWidget {
  final Cartridge cartridge;
  final ReaderDevice reader;
  final VoidCallback? onStartMeasurement;

  const SampleInjectStep({
    super.key,
    required this.cartridge,
    required this.reader,
    this.onStartMeasurement,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          // 카트리지 정보 카드
          _CartridgeInfoCard(cartridge: cartridge),
          
          const SizedBox(height: 32),
          
          // 주입 안내
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    color: Colors.orange.withOpacity(0.1),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: Colors.orange.withOpacity(0.3),
                      width: 2,
                    ),
                  ),
                  child: const Icon(
                    Icons.water_drop_outlined,
                    size: 56,
                    color: Colors.orange,
                  ),
                ),
                const SizedBox(height: 32),
                const Text(
                  '시료를 주입하세요',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  '카트리지의 시료 주입구에\n혈액 또는 검체를 넣어주세요',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.6),
                    fontSize: 14,
                    height: 1.5,
                  ),
                ),
              ],
            ),
          ),
          
          // 측정 시작 버튼
          SizedBox(
            width: double.infinity,
            height: 56,
            child: ElevatedButton(
              onPressed: onStartMeasurement,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.cyan.shade600,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                elevation: 8,
                shadowColor: Colors.cyan.withOpacity(0.4),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.play_arrow_rounded),
                  SizedBox(width: 8),
                  Text(
                    '측정 시작',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CartridgeInfoCard extends StatelessWidget {
  final Cartridge cartridge;

  const _CartridgeInfoCard({required this.cartridge});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1F38),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.cyan.withOpacity(0.2),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: _getTypeColor().withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  cartridge.type.displayName,
                  style: TextStyle(
                    color: _getTypeColor(),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const Spacer(),
              if (cartridge.isExpiryWarning)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.orange.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: const Text(
                    '유효기한 임박',
                    style: TextStyle(
                      color: Colors.orange,
                      fontSize: 12,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          _InfoRow(
            label: '카트리지 ID',
            value: cartridge.id.length > 12 
                ? '${cartridge.id.substring(0, 12)}...' 
                : cartridge.id,
          ),
          const SizedBox(height: 8),
          _InfoRow(
            label: '유효기한',
            value: _formatDate(cartridge.expiryDate),
          ),
          if (cartridge.lotNumber != null) ...[
            const SizedBox(height: 8),
            _InfoRow(
              label: 'LOT 번호',
              value: cartridge.lotNumber!,
            ),
          ],
        ],
      ),
    );
  }

  Color _getTypeColor() {
    return switch (cartridge.type) {
      CartridgeType.glucose => Colors.red.shade400,
      CartridgeType.radon => Colors.green.shade400,
      CartridgeType.cholesterol => Colors.purple.shade400,
      CartridgeType.uricAcid => Colors.amber.shade400,
      CartridgeType.hemoglobin => Colors.pink.shade400,
      CartridgeType.lactate => Colors.teal.shade400,
      CartridgeType.ketone => Colors.indigo.shade400,
      CartridgeType.unknown => Colors.grey.shade400,
    };
  }

  String _formatDate(DateTime date) {
    return '${date.year}.${date.month.toString().padLeft(2, '0')}.${date.day.toString().padLeft(2, '0')}';
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            color: Colors.white.withOpacity(0.5),
            fontSize: 13,
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 13,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}

