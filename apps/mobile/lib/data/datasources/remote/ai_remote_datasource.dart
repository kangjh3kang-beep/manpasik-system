import 'package:dio/dio.dart';
import 'package:injectable/injectable.dart';
import 'package:retrofit/retrofit.dart';

import '../../../domain/entities/ai_analysis_result.dart';

part 'ai_remote_datasource.g.dart';

/// AI 분석 요청 DTO
class AnalyzeRequest {
  final List<double> rawValues;
  final double voltage;
  final int samplingRate;
  final String measurementType;
  final String? cartridgeId;
  final double? calibrationFactor;
  final DateTime timestamp;

  AnalyzeRequest({
    required this.rawValues,
    required this.voltage,
    required this.samplingRate,
    required this.measurementType,
    this.cartridgeId,
    this.calibrationFactor,
    required this.timestamp,
  });

  Map<String, dynamic> toJson() => {
        'raw_values': rawValues,
        'voltage': voltage,
        'sampling_rate': samplingRate,
        'measurement_type': measurementType,
        'cartridge_id': cartridgeId,
        'calibration_factor': calibrationFactor,
        'timestamp': timestamp.toIso8601String(),
      };
}

/// 배치 분석 요청 DTO
class BatchAnalyzeRequest {
  final List<AnalyzeRequest> measurements;

  BatchAnalyzeRequest({required this.measurements});

  Map<String, dynamic> toJson() => {
        'measurements': measurements.map((m) => m.toJson()).toList(),
      };
}

/// AI 원격 데이터 소스 (Retrofit Client)
/// 
/// REST API를 통해 AI 분석 서버와 통신합니다.
@RestApi()
abstract class AIRemoteDataSource {
  factory AIRemoteDataSource(Dio dio, {String baseUrl}) = _AIRemoteDataSource;

  /// 단일 측정 데이터 분석
  /// 
  /// POST /api/v1/analyze
  @POST('/api/v1/analyze')
  Future<AIAnalysisResult> analyze(@Body() Map<String, dynamic> request);

  /// 배치 분석
  /// 
  /// POST /api/v1/analyze/batch
  @POST('/api/v1/analyze/batch')
  Future<AIAnalysisResult> analyzeBatch(@Body() Map<String, dynamic> request);

  /// 서버 상태 확인
  /// 
  /// GET /api/v1/health
  @GET('/api/v1/health')
  Future<Map<String, dynamic>> healthCheck();
}

/// AIRemoteDataSource 팩토리
/// 
/// DI를 통해 Dio 인스턴스를 주입받아 생성합니다.
@module
abstract class AIRemoteDataSourceModule {
  @singleton
  AIRemoteDataSource provideAIRemoteDataSource(Dio dio) {
    return AIRemoteDataSource(dio);
  }
}







