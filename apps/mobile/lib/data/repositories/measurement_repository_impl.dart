import 'package:injectable/injectable.dart';

import '../../domain/entities/measurement_result.dart';
import '../datasources/local/measurement_local_datasource.dart';
import '../models/measurement_result_model.dart';

/// 측정 결과 저장 Result 타입
sealed class SaveResult {
  const SaveResult();
}

class SaveSuccess extends SaveResult {
  const SaveSuccess();
}

class SaveFailure extends SaveResult {
  final String message;
  final Object? error;
  const SaveFailure(this.message, [this.error]);
}

/// 측정 데이터 Repository
/// 
/// 측정 결과의 저장, 조회, 동기화를 담당합니다.
abstract class MeasurementRepository {
  /// 측정 결과 저장
  Future<SaveResult> saveMeasurement(MeasurementResult result);

  /// 최근 측정 결과 조회
  Future<List<MeasurementResultSummary>> getRecentMeasurements({int limit = 10});

  /// 모든 측정 결과 조회
  Future<List<MeasurementResultSummary>> getAllMeasurements();

  /// 특정 측정 결과 조회
  Future<MeasurementResultModel?> getMeasurementById(String id);

  /// 측정 타입별 조회
  Future<List<MeasurementResultSummary>> getMeasurementsByType(
    CartridgeTypeModel type, {
    int? limit,
  });

  /// 기간별 조회
  Future<List<MeasurementResultSummary>> getMeasurementsByDateRange(
    DateTime startDate,
    DateTime endDate,
  );

  /// 동기화되지 않은 결과 조회
  Future<List<MeasurementResultModel>> getUnsyncedMeasurements();

  /// 동기화 완료 표시
  Future<void> markAsSynced(String id);

  /// 측정 결과 삭제
  Future<void> deleteMeasurement(String id);

  /// 총 측정 횟수
  Future<int> getTotalCount();
}

/// MeasurementRepository 구현체
@Injectable(as: MeasurementRepository)
class MeasurementRepositoryImpl implements MeasurementRepository {
  final MeasurementLocalDataSource _localDataSource;

  MeasurementRepositoryImpl(this._localDataSource);

  @override
  Future<SaveResult> saveMeasurement(MeasurementResult result) async {
    try {
      await _localDataSource.saveMeasurement(result);
      return const SaveSuccess();
    } catch (e) {
      return SaveFailure('측정 결과 저장 실패', e);
    }
  }

  @override
  Future<List<MeasurementResultSummary>> getRecentMeasurements({int limit = 10}) {
    return _localDataSource.getRecentMeasurements(limit: limit);
  }

  @override
  Future<List<MeasurementResultSummary>> getAllMeasurements() {
    return _localDataSource.getAllMeasurements();
  }

  @override
  Future<MeasurementResultModel?> getMeasurementById(String id) {
    return _localDataSource.getMeasurementById(id);
  }

  @override
  Future<List<MeasurementResultSummary>> getMeasurementsByType(
    CartridgeTypeModel type, {
    int? limit,
  }) {
    return _localDataSource.getMeasurementsByType(type, limit: limit);
  }

  @override
  Future<List<MeasurementResultSummary>> getMeasurementsByDateRange(
    DateTime startDate,
    DateTime endDate,
  ) {
    return _localDataSource.getMeasurementsByDateRange(startDate, endDate);
  }

  @override
  Future<List<MeasurementResultModel>> getUnsyncedMeasurements() {
    return _localDataSource.getUnsyncedMeasurements();
  }

  @override
  Future<void> markAsSynced(String id) {
    return _localDataSource.markAsSynced(id);
  }

  @override
  Future<void> deleteMeasurement(String id) {
    return _localDataSource.deleteMeasurement(id);
  }

  @override
  Future<int> getTotalCount() {
    return _localDataSource.getTotalCount();
  }
}







