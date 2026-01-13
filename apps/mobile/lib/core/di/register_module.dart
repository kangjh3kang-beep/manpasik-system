import 'package:dio/dio.dart';
import 'package:injectable/injectable.dart';
import 'package:pretty_dio_logger/pretty_dio_logger.dart';

import '../config/app_config.dart';

/// 외부 의존성 모듈 등록
/// 
/// Dio, SharedPreferences 등 외부 패키지의 싱글톤 인스턴스를 등록합니다.
@module
abstract class RegisterModule {
  /// Dio HTTP 클라이언트
  /// 
  /// - 기본 URL: AppConfig.apiBaseUrl
  /// - 타임아웃: 30초
  /// - 로거: Debug 모드에서만 활성화
  @singleton
  Dio get dio {
    final dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.apiBaseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        sendTimeout: const Duration(seconds: 30),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // 인터셉터 추가
    dio.interceptors.addAll([
      // 인증 토큰 인터셉터
      _AuthInterceptor(),

      // 로깅 (디버그 모드에서만)
      if (AppConfig.isDebug)
        PrettyDioLogger(
          requestHeader: true,
          requestBody: true,
          responseHeader: false,
          responseBody: true,
          error: true,
          compact: true,
        ),

      // 에러 핸들링 인터셉터
      _ErrorInterceptor(),
    ]);

    return dio;
  }
}

/// 인증 토큰 인터셉터
/// 
/// 모든 요청에 Authorization 헤더를 자동으로 추가합니다.
class _AuthInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    // TODO: 실제 토큰 저장소에서 토큰 가져오기
    final token = _getAuthToken();
    
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    
    handler.next(options);
  }

  String? _getAuthToken() {
    // TODO: SecureStorage 또는 다른 저장소에서 토큰 가져오기
    return null;
  }
}

/// 에러 핸들링 인터셉터
/// 
/// 공통 에러 처리 로직을 수행합니다.
class _ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    // 401 에러 시 토큰 갱신 또는 로그아웃 처리
    if (err.response?.statusCode == 401) {
      // TODO: 토큰 갱신 로직 또는 로그아웃 처리
    }

    handler.next(err);
  }
}







