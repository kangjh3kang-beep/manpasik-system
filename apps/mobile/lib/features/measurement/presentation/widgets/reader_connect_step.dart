import 'package:flutter/material.dart';

import '../../../../domain/entities/reader_device.dart';

/// Step 1: 리더기 연결 위젯
class ReaderConnectStep extends StatelessWidget {
  final List<ReaderDevice> devices;
  final bool isScanning;
  final bool isConnecting;
  final bool isConnected;
  final ReaderDevice? selectedDevice;
  final void Function(ReaderDevice)? onDeviceSelected;
  final VoidCallback? onRescan;

  const ReaderConnectStep({
    super.key,
    required this.devices,
    this.isScanning = false,
    this.isConnecting = false,
    this.isConnected = false,
    this.selectedDevice,
    this.onDeviceSelected,
    this.onRescan,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          // 헤더
          _buildHeader(),
          const SizedBox(height: 32),
          
          // 상태 표시
          if (isConnecting) _buildConnectingView(),
          if (isConnected) _buildConnectedView(),
          if (!isConnecting && !isConnected) _buildDeviceList(),
          
          const Spacer(),
          
          // 다시 검색 버튼
          if (!isConnecting && !isConnected)
            TextButton.icon(
              onPressed: onRescan,
              icon: const Icon(Icons.refresh),
              label: const Text('다시 검색'),
              style: TextButton.styleFrom(
                foregroundColor: Colors.cyan,
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    final title = isConnected 
        ? '리더기 연결됨' 
        : isConnecting 
            ? '연결 중...' 
            : '리더기 검색';
    final subtitle = isConnected
        ? '카트리지를 스캔해주세요'
        : isConnecting
            ? '잠시만 기다려주세요'
            : 'MPS 리더기를 선택하세요';

    return Column(
      children: [
        Icon(
          isConnected 
              ? Icons.bluetooth_connected 
              : Icons.bluetooth_searching,
          size: 64,
          color: isConnected ? Colors.green : Colors.cyan,
        ),
        const SizedBox(height: 16),
        Text(
          title,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          subtitle,
          style: TextStyle(
            color: Colors.white.withOpacity(0.6),
            fontSize: 14,
          ),
        ),
      ],
    );
  }

  Widget _buildConnectingView() {
    return Column(
      children: [
        const SizedBox(height: 32),
        const CircularProgressIndicator(color: Colors.cyan),
        const SizedBox(height: 24),
        if (selectedDevice != null)
          Text(
            selectedDevice!.name,
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 16,
            ),
          ),
      ],
    );
  }

  Widget _buildConnectedView() {
    return Column(
      children: [
        const SizedBox(height: 32),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.green.withOpacity(0.1),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.green.withOpacity(0.3)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.check_circle, color: Colors.green, size: 32),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    selectedDevice?.name ?? 'MPS Reader',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Text(
                    '신호 강도: ${_getSignalText(selectedDevice?.signalLevel ?? 0)}',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.6),
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDeviceList() {
    if (isScanning && devices.isEmpty) {
      return Column(
        children: [
          const SizedBox(height: 32),
          const CircularProgressIndicator(color: Colors.cyan),
          const SizedBox(height: 16),
          Text(
            '주변 리더기를 검색 중...',
            style: TextStyle(
              color: Colors.white.withOpacity(0.6),
            ),
          ),
        ],
      );
    }

    if (devices.isEmpty) {
      return Column(
        children: [
          const SizedBox(height: 32),
          Icon(
            Icons.bluetooth_disabled,
            size: 48,
            color: Colors.grey.shade600,
          ),
          const SizedBox(height: 16),
          Text(
            '리더기를 찾을 수 없습니다',
            style: TextStyle(
              color: Colors.white.withOpacity(0.6),
            ),
          ),
        ],
      );
    }

    return Expanded(
      child: ListView.builder(
        itemCount: devices.length,
        itemBuilder: (context, index) {
          final device = devices[index];
          return _DeviceListTile(
            device: device,
            onTap: () => onDeviceSelected?.call(device),
          );
        },
      ),
    );
  }

  String _getSignalText(int level) {
    return switch (level) {
      4 => '매우 강함',
      3 => '강함',
      2 => '보통',
      1 => '약함',
      _ => '매우 약함',
    };
  }
}

class _DeviceListTile extends StatelessWidget {
  final ReaderDevice device;
  final VoidCallback onTap;

  const _DeviceListTile({
    required this.device,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      color: const Color(0xFF1A1F38),
      margin: const EdgeInsets.symmetric(vertical: 6),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: ListTile(
        onTap: onTap,
        leading: _buildSignalIcon(),
        title: Text(
          device.name,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w500,
          ),
        ),
        subtitle: Text(
          'RSSI: ${device.rssi} dBm',
          style: TextStyle(
            color: Colors.white.withOpacity(0.5),
            fontSize: 12,
          ),
        ),
        trailing: const Icon(
          Icons.chevron_right,
          color: Colors.cyan,
        ),
      ),
    );
  }

  Widget _buildSignalIcon() {
    final color = switch (device.signalLevel) {
      >= 3 => Colors.green,
      2 => Colors.orange,
      _ => Colors.red,
    };

    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Icon(
        Icons.bluetooth,
        color: color,
      ),
    );
  }
}

