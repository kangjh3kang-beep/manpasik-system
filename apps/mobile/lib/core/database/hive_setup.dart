import 'package:hive_flutter/hive_flutter.dart';
import 'package:path_provider/path_provider.dart';

import '../../data/models/measurement_result_model.dart';
import '../../data/models/measurement_data_model.dart';

/// Hive 데이터베이스 설정
/// 
/// 앱 시작 시 `HiveSetup.init()`을 호출하여 초기화합니다.
/// 
/// ```dart
/// void main() async {
///   WidgetsFlutterBinding.ensureInitialized();
///   await HiveSetup.init();
///   await configureDependencies();
///   runApp(const MyApp());
/// }
/// ```
class HiveSetup {
  HiveSetup._();

  // Box 이름 상수
  static const String measurementResultsBox = 'measurement_results';
  static const String measurementDataBox = 'measurement_data';
  static const String settingsBox = 'settings';
  static const String cacheBox = 'cache';

  // TypeAdapter ID 상수 (고유해야 함)
  static const int measurementResultModelTypeId = 0;
  static const int measurementDataModelTypeId = 1;
  static const int resultStatusTypeId = 2;
  static const int cartridgeTypeTypeId = 3;

  /// Hive 초기화
  /// 
  /// 앱 시작 시 한 번만 호출합니다.
  static Future<void> init() async {
    // Flutter용 Hive 초기화
    await Hive.initFlutter();

    // TypeAdapter 등록
    _registerAdapters();

    // Box 열기
    await _openBoxes();
  }

  /// TypeAdapter 등록
  static void _registerAdapters() {
    // MeasurementResultModel Adapter
    if (!Hive.isAdapterRegistered(measurementResultModelTypeId)) {
      Hive.registerAdapter(MeasurementResultModelAdapter());
    }

    // MeasurementDataModel Adapter
    if (!Hive.isAdapterRegistered(measurementDataModelTypeId)) {
      Hive.registerAdapter(MeasurementDataModelAdapter());
    }

    // ResultStatus Adapter
    if (!Hive.isAdapterRegistered(resultStatusTypeId)) {
      Hive.registerAdapter(ResultStatusModelAdapter());
    }

    // CartridgeType Adapter
    if (!Hive.isAdapterRegistered(cartridgeTypeTypeId)) {
      Hive.registerAdapter(CartridgeTypeModelAdapter());
    }
  }

  /// Box 열기
  static Future<void> _openBoxes() async {
    await Hive.openBox<MeasurementResultModel>(measurementResultsBox);
    await Hive.openBox<MeasurementDataModel>(measurementDataBox);
    await Hive.openBox<dynamic>(settingsBox);
    await Hive.openBox<dynamic>(cacheBox);
  }

  /// 모든 데이터 삭제 (개발/테스트용)
  static Future<void> clearAll() async {
    await Hive.box<MeasurementResultModel>(measurementResultsBox).clear();
    await Hive.box<MeasurementDataModel>(measurementDataBox).clear();
    await Hive.box<dynamic>(settingsBox).clear();
    await Hive.box<dynamic>(cacheBox).clear();
  }

  /// 특정 Box 가져오기
  static Box<MeasurementResultModel> get measurementResultsBoxInstance =>
      Hive.box<MeasurementResultModel>(measurementResultsBox);

  static Box<MeasurementDataModel> get measurementDataBoxInstance =>
      Hive.box<MeasurementDataModel>(measurementDataBox);

  static Box<dynamic> get settingsBoxInstance =>
      Hive.box<dynamic>(settingsBox);

  /// Hive 종료
  static Future<void> close() async {
    await Hive.close();
  }
}







