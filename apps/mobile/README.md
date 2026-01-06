# Flutter 모바일 앱 (수동 설정 필요)

## Flutter SDK 재설치 필요

현재 Flutter SDK가 손상되어 프로젝트 생성이 불가능합니다.

### 해결 방법

1. **Flutter SDK 재설치**
   - https://docs.flutter.dev/get-started/install/windows 방문
   - 공식 설치 프로그램 다운로드
   - C:\flutter에 설치

2. **프로젝트 생성**
   `ash
   cd apps
   flutter create mobile
   `

3. **패키지 추가**
   pubspec.yaml에 필요한 패키지 추가:
   - flutter_blue_plus
   - nfc_manager
   - flutter_bloc
   - go_router
   - agora_rtc_engine
   - dio
   - hive

4. **코드 복사**
   기존 작성된 Dart 파일들을 새 프로젝트로 복사

---

## 대안: 웹 버전 사용

Flutter 설치가 어려우면, **웹 대시보드만 사용**하는 것을 권장합니다.

`ash
cd d:\2026시스템\manpasik-system
npm run dev
`

웹 버전에서 모든 핵심 기능이 동작합니다.
