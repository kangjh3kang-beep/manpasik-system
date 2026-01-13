import 'package:flutter/foundation.dart';

/// 앱 환경 설정
/// 
/// 환경별 설정값을 관리합니다.
class AppConfig {
  AppConfig._();

  /// 현재 환경
  static Environment get environment {
    // 실제로는 빌드 시 환경 변수로 설정
    return kDebugMode ? Environment.development : Environment.production;
  }

  /// 디버그 모드 여부
  static bool get isDebug => environment == Environment.development;

  /// API Base URL
  static String get apiBaseUrl {
    return switch (environment) {
      Environment.development => 'http://localhost:8080',
      Environment.staging => 'https://staging-api.manpasik.com',
      Environment.production => 'https://api.manpasik.com',
    };
  }

  /// AI 분석 API Base URL (별도 서버인 경우)
  static String get aiApiBaseUrl {
    return switch (environment) {
      Environment.development => 'http://localhost:8081',
      Environment.staging => 'https://staging-ai.manpasik.com',
      Environment.production => 'https://ai.manpasik.com',
    };
  }

  /// 웹소켓 URL
  static String get wsUrl {
    return switch (environment) {
      Environment.development => 'ws://localhost:8080/ws',
      Environment.staging => 'wss://staging-api.manpasik.com/ws',
      Environment.production => 'wss://api.manpasik.com/ws',
    };
  }

  /// 연결 타임아웃 (초)
  static int get connectionTimeoutSeconds => 30;

  /// 수신 타임아웃 (초)
  static int get receiveTimeoutSeconds => 30;

  /// 측정 시간 (초)
  static int get measurementDurationSeconds => 30;

  /// 최대 재시도 횟수
  static int get maxRetryAttempts => 3;

  /// 앱 버전
  static const String appVersion = '1.0.0';

  /// 빌드 번호
  static const String buildNumber = '1';
}

/// 앱 환경
enum Environment {
  development,
  staging,
  production,
}







