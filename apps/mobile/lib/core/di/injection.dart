import 'package:get_it/get_it.dart';
import 'package:injectable/injectable.dart';

import 'injection.config.dart';

/// 전역 GetIt 인스턴스
final getIt = GetIt.instance;

/// 의존성 주입 초기화
/// 
/// 앱 시작 시 main() 함수에서 호출합니다.
/// ```dart
/// void main() async {
///   WidgetsFlutterBinding.ensureInitialized();
///   await configureDependencies();
///   runApp(const MyApp());
/// }
/// ```
@InjectableInit(
  initializerName: 'init',
  preferRelativeImports: true,
  asExtension: true,
)
Future<void> configureDependencies() async => getIt.init();

/// 의존성 주입 헬퍼 함수
/// 
/// 타입 안전한 의존성 주입을 위한 헬퍼 함수입니다.
/// ```dart
/// final bluetoothRepo = inject<BluetoothRepository>();
/// ```
T inject<T extends Object>() => getIt<T>();

/// 조건부 의존성 주입
/// 
/// 등록되지 않은 경우 null을 반환합니다.
T? injectOrNull<T extends Object>() {
  if (getIt.isRegistered<T>()) {
    return getIt<T>();
  }
  return null;
}

/// 의존성 등록 여부 확인
bool isRegistered<T extends Object>() => getIt.isRegistered<T>();








