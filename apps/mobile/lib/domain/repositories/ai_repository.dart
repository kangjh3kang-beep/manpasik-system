import '../entities/ai_analysis_result.dart';
import '../entities/measurement_data.dart';
import '../entities/measurement_result.dart';

/// AI 분석 에러 타입
enum AIAnalysisError {
  /// 네트워크 연결 실패
  networkError('network_error', '네트워크 연결에 실패했습니다'),
  
  /// 서버 오류
  serverError('server_error', '서버 오류가 발생했습니다'),
  
  /// 인증 실패
  unauthorized('unauthorized', '인증이 필요합니다'),
  
  /// 요청 제한 초과
  rateLimitExceeded('rate_limit', '요청 제한을 초과했습니다'),
  
  /// 잘못된 데이터 형식
  invalidData('invalid_data', '잘못된 데이터 형식입니다'),
  
  /// 분석 시간 초과
  timeout('timeout', '분석 시간이 초과되었습니다'),
  
  /// 알 수 없는 오류
  unknown('unknown', '알 수 없는 오류가 발생했습니다');

  const AIAnalysisError(this.code, this.message);
  
  final String code;
  final String message;
}

/// AI 분석 결과 타입 (Result Pattern)
sealed class AIAnalysisResponse {
  const AIAnalysisResponse();
}

/// 분석 성공
class AIAnalysisSuccess extends AIAnalysisResponse {
  final AIAnalysisResult result;
  const AIAnalysisSuccess(this.result);
}

/// 분석 실패
class AIAnalysisFailure extends AIAnalysisResponse {
  final AIAnalysisError error;
  final String? customMessage;
  final Object? originalError;
  
  const AIAnalysisFailure(
    this.error, {
    this.customMessage,
    this.originalError,
  });
  
  String get message => customMessage ?? error.message;
}

/// AI Repository 인터페이스
/// 
/// AI 분석 서버와의 통신을 담당하는 Repository입니다.
abstract class AIRepository {
  /// 측정 데이터 분석 요청
  /// 
  /// [data]: 분석할 측정 데이터
  /// Returns: 분석 결과 또는 에러
  Future<AIAnalysisResponse> analyzeMeasurement(MeasurementData data);

  /// 측정 결과 기반 분석 요청
  /// 
  /// [result]: 분석할 측정 결과 (waveform 포함)
  /// Returns: 분석 결과 또는 에러
  Future<AIAnalysisResponse> analyzeMeasurementResult(MeasurementResult result);

  /// 여러 측정 데이터 배치 분석
  /// 
  /// [dataList]: 분석할 측정 데이터 목록
  /// Returns: 분석 결과 또는 에러
  Future<AIAnalysisResponse> analyzeBatch(List<MeasurementData> dataList);

  /// 분석 가능 여부 확인 (서버 상태)
  Future<bool> isServiceAvailable();
}







