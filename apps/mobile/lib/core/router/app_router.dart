import 'package:flutter/material.dart';

import '../../features/measurement/presentation/pages/measurement_process_page.dart';

/// 앱 라우터 설정
/// 
/// GoRouter 또는 Navigator 2.0을 사용할 수 있지만,
/// 간단한 구조를 위해 기본 Navigator를 사용합니다.
class AppRouter {
  AppRouter._();

  // 라우트 이름 상수
  static const String home = '/';
  static const String measurement = '/measurement';
  static const String measurementProcess = '/measurement/process';
  static const String history = '/history';
  static const String settings = '/settings';

  /// 라우트 생성기
  static Route<dynamic> onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      case measurement:
      case measurementProcess:
        return _buildPageRoute(
          settings: settings,
          builder: (_) => const MeasurementProcessPage(),
        );

      // 기본 라우트
      default:
        return _buildPageRoute(
          settings: settings,
          builder: (_) => const _PlaceholderPage(title: 'Home'),
        );
    }
  }

  /// 페이지 라우트 빌더
  static PageRoute<T> _buildPageRoute<T>({
    required RouteSettings settings,
    required WidgetBuilder builder,
  }) {
    return MaterialPageRoute<T>(
      settings: settings,
      builder: builder,
    );
  }

  /// 측정 화면으로 이동
  /// 
  /// BLoC이 새로 생성되도록 항상 새 라우트를 푸시합니다.
  static Future<T?> navigateToMeasurement<T>(BuildContext context) {
    return Navigator.of(context).push<T>(
      MaterialPageRoute(
        builder: (_) => const MeasurementProcessPage(),
        settings: const RouteSettings(name: measurementProcess),
      ),
    );
  }

  /// 측정 화면으로 이동 (기존 스택 대체)
  static Future<T?> navigateToMeasurementReplacement<T>(BuildContext context) {
    return Navigator.of(context).pushReplacement<T, void>(
      MaterialPageRoute(
        builder: (_) => const MeasurementProcessPage(),
        settings: const RouteSettings(name: measurementProcess),
      ),
    );
  }

  /// 새 측정 시작 (스택 클리어 후 이동)
  /// 
  /// '새 측정 시작' 버튼에서 사용합니다.
  /// 기존 BLoC을 완전히 폐기하고 새로운 인스턴스로 시작합니다.
  static Future<T?> startNewMeasurement<T>(BuildContext context) {
    return Navigator.of(context).pushAndRemoveUntil<T>(
      MaterialPageRoute(
        builder: (_) => const MeasurementProcessPage(),
        settings: const RouteSettings(name: measurementProcess),
      ),
      (route) => route.isFirst, // 첫 번째 라우트(홈)만 유지
    );
  }
}

/// 플레이스홀더 페이지 (개발용)
class _PlaceholderPage extends StatelessWidget {
  final String title;

  const _PlaceholderPage({required this.title});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0E21),
      appBar: AppBar(
        title: Text(title),
        backgroundColor: Colors.transparent,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              title,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 24,
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () => AppRouter.navigateToMeasurement(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.cyan,
              ),
              child: const Text('측정 시작'),
            ),
          ],
        ),
      ),
    );
  }
}

