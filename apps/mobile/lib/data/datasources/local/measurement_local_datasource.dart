import 'package:hive/hive.dart';
import 'package:injectable/injectable.dart';

import '../../../core/database/hive_setup.dart';
import '../../../domain/entities/measurement_result.dart';
import '../../models/measurement_result_model.dart';

/// 측정 데이터 로컬 데이터 소스
/// 
/// Hive를 사용하여 측정 결과를 로컬에 저장하고 조회합니다.
abstract class MeasurementLocalDataSource {
  /// 측정 결과 저장
  Future<void> saveMeasurement(MeasurementResult result);

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

  /// 동기화되지 않은 측정 결과 조회
  Future<List<MeasurementResultModel>> getUnsyncedMeasurements();

  /// 동기화 완료 표시
  Future<void> markAsSynced(String id);

  /// 측정 결과 삭제
  Future<void> deleteMeasurement(String id);

  /// 모든 데이터 삭제
  Future<void> clearAll();

  /// 총 측정 횟수
  Future<int> getTotalCount();
}

/// MeasurementLocalDataSource 구현체
@Singleton(as: MeasurementLocalDataSource)
class MeasurementLocalDataSourceImpl implements MeasurementLocalDataSource {
  Box<MeasurementResultModel> get _box => HiveSetup.measurementResultsBoxInstance;

  @override
  Future<void> saveMeasurement(MeasurementResult result) async {
    final model = MeasurementResultModel.fromEntity(result);
    await _box.put(result.id, model);
  }

  @override
  Future<List<MeasurementResultSummary>> getRecentMeasurements({int limit = 10}) async {
    final allValues = _box.values.toList();
    
    // 최신순 정렬
    allValues.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    
    // limit 적용
    final limited = allValues.take(limit).toList();
    
    return limited.map((model) => model.toSummary()).toList();
  }

  @override
  Future<List<MeasurementResultSummary>> getAllMeasurements() async {
    final allValues = _box.values.toList();
    
    // 최신순 정렬
    allValues.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    
    return allValues.map((model) => model.toSummary()).toList();
  }

  @override
  Future<MeasurementResultModel?> getMeasurementById(String id) async {
    return _box.get(id);
  }

  @override
  Future<List<MeasurementResultSummary>> getMeasurementsByType(
    CartridgeTypeModel type, {
    int? limit,
  }) async {
    var filtered = _box.values.where((m) => m.measurementType == type).toList();
    
    // 최신순 정렬
    filtered.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    
    // limit 적용
    if (limit != null) {
      filtered = filtered.take(limit).toList();
    }
    
    return filtered.map((model) => model.toSummary()).toList();
  }

  @override
  Future<List<MeasurementResultSummary>> getMeasurementsByDateRange(
    DateTime startDate,
    DateTime endDate,
  ) async {
    final filtered = _box.values.where((m) {
      return m.createdAt.isAfter(startDate) && m.createdAt.isBefore(endDate);
    }).toList();
    
    // 최신순 정렬
    filtered.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    
    return filtered.map((model) => model.toSummary()).toList();
  }

  @override
  Future<List<MeasurementResultModel>> getUnsyncedMeasurements() async {
    return _box.values.where((m) => !m.isSynced).toList();
  }

  @override
  Future<void> markAsSynced(String id) async {
    final model = _box.get(id);
    if (model != null) {
      final updated = model.markAsSynced();
      await _box.put(id, updated);
    }
  }

  @override
  Future<void> deleteMeasurement(String id) async {
    await _box.delete(id);
  }

  @override
  Future<void> clearAll() async {
    await _box.clear();
  }

  @override
  Future<int> getTotalCount() async {
    return _box.length;
  }
}







