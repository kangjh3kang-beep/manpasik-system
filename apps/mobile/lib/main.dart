import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'core/database/hive_setup.dart';
import 'core/di/injection.dart';

/// 앱 진입점
/// 
/// Hive 초기화 → DI 설정 → 앱 실행 순서로 진행됩니다.
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // 1. Hive 데이터베이스 초기화
  await HiveSetup.init();
  
  // 2. 의존성 주입 설정
  await configureDependencies();
  
  // 3. 앱 실행
  runApp(const ManpasikApp());
}

/// 만파식(MPS) 앱
class ManpasikApp extends StatelessWidget {
  const ManpasikApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '만파식',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF2196F3),
          brightness: Brightness.light,
        ),
        useMaterial3: true,
        fontFamily: 'Pretendard',
      ),
      darkTheme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF2196F3),
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
        fontFamily: 'Pretendard',
      ),
      themeMode: ThemeMode.system,
      home: const Scaffold(
        body: Center(
          child: Text(
            '만파식 건강 모니터링',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
        ),
      ),
    );
  }
}







