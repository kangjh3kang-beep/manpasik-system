import 'package:flutter/material.dart';

import '../bloc/measurement_bloc.dart';

/// 측정 에러 뷰
class MeasurementErrorView extends StatelessWidget {
  final String message;
  final MeasurementErrorType errorType;
  final VoidCallback? onRetry;
  final VoidCallback? onCancel;

  const MeasurementErrorView({
    super.key,
    required this.message,
    required this.errorType,
    this.onRetry,
    this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
    final canRetry = onRetry != null;
    
    return Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // 에러 아이콘
          Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              color: _getErrorColor().withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              _getErrorIcon(),
              size: 48,
              color: _getErrorColor(),
            ),
          ),
          
          const SizedBox(height: 32),
          
          // 에러 제목
          Text(
            _getErrorTitle(),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.bold,
            ),
          ),
          
          const SizedBox(height: 12),
          
          // 에러 메시지
          Text(
            message,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.white.withOpacity(0.6),
              fontSize: 14,
              height: 1.5,
            ),
          ),
          
          const SizedBox(height: 16),
          
          // 해결 방법
          if (_getSolutionText() != null)
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
                children: [
                  const Icon(
                    Icons.lightbulb_outline,
                    color: Colors.cyan,
                    size: 20,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      _getSolutionText()!,
                      style: TextStyle(
                        color: Colors.cyan.shade300,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          
          const Spacer(),
          
          // 버튼들
          if (canRetry)
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: onCancel,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white70,
                      side: const BorderSide(color: Colors.white24),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text('나가기'),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  flex: 2,
                  child: ElevatedButton(
                    onPressed: onRetry,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.cyan.shade600,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.refresh, size: 20),
                        SizedBox(width: 8),
                        Text('다시 시도'),
                      ],
                    ),
                  ),
                ),
              ],
            )
          else
            // 재시도 불가능한 경우 (만료된 카트리지 등)
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: onCancel,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.grey.shade700,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text('확인'),
              ),
            ),
        ],
      ),
    );
  }

  Color _getErrorColor() {
    return switch (errorType) {
      MeasurementErrorType.bluetoothDisabled => Colors.blue,
      MeasurementErrorType.nfcDisabled => Colors.orange,
      MeasurementErrorType.nfcNotSupported => Colors.orange,
      MeasurementErrorType.cartridgeExpired => Colors.amber,
      MeasurementErrorType.cartridgeAlreadyUsed => Colors.amber,
      MeasurementErrorType.cartridgeInvalid => Colors.amber,
      MeasurementErrorType.cancelled => Colors.grey,
      _ => Colors.red,
    };
  }

  IconData _getErrorIcon() {
    return switch (errorType) {
      MeasurementErrorType.bluetoothDisabled => Icons.bluetooth_disabled,
      MeasurementErrorType.nfcDisabled => Icons.nfc,
      MeasurementErrorType.nfcNotSupported => Icons.phonelink_erase,
      MeasurementErrorType.readerConnectionFailed => Icons.bluetooth_searching,
      MeasurementErrorType.readerDisconnected => Icons.link_off,
      MeasurementErrorType.cartridgeScanFailed => Icons.qr_code_scanner,
      MeasurementErrorType.cartridgeExpired => Icons.event_busy,
      MeasurementErrorType.cartridgeAlreadyUsed => Icons.do_not_disturb_alt,
      MeasurementErrorType.cartridgeInvalid => Icons.warning_amber,
      MeasurementErrorType.measurementFailed => Icons.show_chart,
      MeasurementErrorType.dataReceiveFailed => Icons.sync_problem,
      MeasurementErrorType.timeout => Icons.timer_off,
      MeasurementErrorType.cancelled => Icons.cancel_outlined,
      MeasurementErrorType.unknown => Icons.error_outline,
    };
  }

  String _getErrorTitle() {
    return switch (errorType) {
      MeasurementErrorType.bluetoothDisabled => '블루투스 비활성화',
      MeasurementErrorType.nfcDisabled => 'NFC 비활성화',
      MeasurementErrorType.nfcNotSupported => 'NFC 미지원',
      MeasurementErrorType.readerConnectionFailed => '리더기 연결 실패',
      MeasurementErrorType.readerDisconnected => '리더기 연결 끊김',
      MeasurementErrorType.cartridgeScanFailed => '카트리지 스캔 실패',
      MeasurementErrorType.cartridgeExpired => '카트리지 만료',
      MeasurementErrorType.cartridgeAlreadyUsed => '사용된 카트리지',
      MeasurementErrorType.cartridgeInvalid => '잘못된 카트리지',
      MeasurementErrorType.measurementFailed => '측정 실패',
      MeasurementErrorType.dataReceiveFailed => '데이터 수신 실패',
      MeasurementErrorType.timeout => '시간 초과',
      MeasurementErrorType.cancelled => '측정 취소됨',
      MeasurementErrorType.unknown => '오류 발생',
    };
  }

  String? _getSolutionText() {
    return switch (errorType) {
      MeasurementErrorType.bluetoothDisabled => 
        '설정에서 블루투스를 켜주세요.',
      MeasurementErrorType.nfcDisabled => 
        '설정에서 NFC를 켜주세요.',
      MeasurementErrorType.nfcNotSupported => 
        '이 기기는 NFC를 지원하지 않습니다. NFC 지원 기기에서 사용해주세요.',
      MeasurementErrorType.readerConnectionFailed => 
        '리더기가 켜져 있는지 확인하고 가까이 위치시켜 주세요.',
      MeasurementErrorType.readerDisconnected => 
        '리더기와의 연결이 끊어졌습니다. 다시 연결해주세요.',
      MeasurementErrorType.cartridgeScanFailed => 
        '카트리지의 NFC 태그를 휴대폰 뒷면에 대주세요.',
      MeasurementErrorType.cartridgeExpired => 
        '유효기한이 지난 카트리지입니다. 새 카트리지를 사용해주세요.',
      MeasurementErrorType.cartridgeAlreadyUsed => 
        '이미 사용된 카트리지입니다. 새 카트리지를 사용해주세요.',
      MeasurementErrorType.cartridgeInvalid => 
        'MPS 인증 카트리지가 아닙니다. 정품 카트리지를 사용해주세요.',
      MeasurementErrorType.measurementFailed => 
        '리더기와 카트리지 상태를 확인해주세요.',
      MeasurementErrorType.dataReceiveFailed => 
        '리더기와의 통신에 문제가 있습니다. 거리를 확인해주세요.',
      MeasurementErrorType.timeout => 
        '응답 시간이 초과되었습니다. 다시 시도해주세요.',
      MeasurementErrorType.cancelled => null,
      MeasurementErrorType.unknown => null,
    };
  }
}
