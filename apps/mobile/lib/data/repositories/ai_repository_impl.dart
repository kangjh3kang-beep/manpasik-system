import 'package:dio/dio.dart';
import 'package:injectable/injectable.dart';

import '../../domain/entities/measurement_data.dart';
import '../../domain/entities/measurement_result.dart';
import '../../domain/repositories/ai_repository.dart';
import '../datasources/remote/ai_remote_datasource.dart';

/// AI Repository 구현체
/// 
/// `AIRemoteDataSource`를 사용하여 AI 분석 API를 호출합니다.
@Injectable(as: AIRepository)
class AIRepositoryImpl implements AIRepository {
  final AIRemoteDataSource _remoteDataSource;

  AIRepositoryImpl(this._remoteDataSource);

  @override
  Future<AIAnalysisResponse> analyzeMeasurement(MeasurementData data) async {
    try {
      final request = AnalyzeRequest(
        rawValues: data.rawValues,
        voltage: data.voltage,
        samplingRate: data.samplingRate,
        measurementType: 'unknown', // MeasurementData에는 타입 정보 없음
        timestamp: data.timestamp,
      );

      final result = await _remoteDataSource.analyze(request.toJson());
      return AIAnalysisSuccess(result);
    } on DioException catch (e) {
      return AIAnalysisFailure(
        _mapDioError(e),
        customMessage: e.message,
        originalError: e,
      );
    } catch (e) {
      return AIAnalysisFailure(
        AIAnalysisError.unknown,
        originalError: e,
      );
    }
  }

  @override
  Future<AIAnalysisResponse> analyzeMeasurementResult(
    MeasurementResult result,
  ) async {
    try {
      // waveformData에서 모든 rawValues를 평탄화
      final allRawValues = result.waveformData
          .expand((data) => data.rawValues)
          .toList();

      // 평균 전압 계산
      final avgVoltage = result.waveformData.isEmpty
          ? 0.0
          : result.waveformData.map((d) => d.voltage).reduce((a, b) => a + b) /
              result.waveformData.length;

      final request = AnalyzeRequest(
        rawValues: allRawValues,
        voltage: avgVoltage,
        samplingRate: result.waveformData.isNotEmpty
            ? result.waveformData.first.samplingRate
            : 500,
        measurementType: result.measurementType.name,
        cartridgeId: result.cartridge.id,
        calibrationFactor: result.cartridge.calibrationFactor,
        timestamp: result.startTime,
      );

      final analysisResult = await _remoteDataSource.analyze(request.toJson());
      return AIAnalysisSuccess(analysisResult);
    } on DioException catch (e) {
      return AIAnalysisFailure(
        _mapDioError(e),
        customMessage: e.message,
        originalError: e,
      );
    } catch (e) {
      return AIAnalysisFailure(
        AIAnalysisError.unknown,
        originalError: e,
      );
    }
  }

  @override
  Future<AIAnalysisResponse> analyzeBatch(List<MeasurementData> dataList) async {
    try {
      final requests = dataList.map((data) => AnalyzeRequest(
            rawValues: data.rawValues,
            voltage: data.voltage,
            samplingRate: data.samplingRate,
            measurementType: 'unknown',
            timestamp: data.timestamp,
          ));

      final batchRequest = BatchAnalyzeRequest(measurements: requests.toList());

      final result = await _remoteDataSource.analyzeBatch(batchRequest.toJson());
      return AIAnalysisSuccess(result);
    } on DioException catch (e) {
      return AIAnalysisFailure(
        _mapDioError(e),
        customMessage: e.message,
        originalError: e,
      );
    } catch (e) {
      return AIAnalysisFailure(
        AIAnalysisError.unknown,
        originalError: e,
      );
    }
  }

  @override
  Future<bool> isServiceAvailable() async {
    try {
      final response = await _remoteDataSource.healthCheck();
      return response['status'] == 'ok' || response['status'] == 'healthy';
    } catch (_) {
      return false;
    }
  }

  /// DioException을 AIAnalysisError로 매핑
  AIAnalysisError _mapDioError(DioException e) {
    return switch (e.type) {
      DioExceptionType.connectionTimeout ||
      DioExceptionType.sendTimeout ||
      DioExceptionType.receiveTimeout =>
        AIAnalysisError.timeout,
      DioExceptionType.connectionError => AIAnalysisError.networkError,
      DioExceptionType.badResponse => _mapStatusCode(e.response?.statusCode),
      DioExceptionType.cancel => AIAnalysisError.unknown,
      _ => AIAnalysisError.unknown,
    };
  }

  /// HTTP 상태 코드를 AIAnalysisError로 매핑
  AIAnalysisError _mapStatusCode(int? statusCode) {
    if (statusCode == null) return AIAnalysisError.unknown;

    return switch (statusCode) {
      401 || 403 => AIAnalysisError.unauthorized,
      400 || 422 => AIAnalysisError.invalidData,
      429 => AIAnalysisError.rateLimitExceeded,
      >= 500 => AIAnalysisError.serverError,
      _ => AIAnalysisError.unknown,
    };
  }
}

