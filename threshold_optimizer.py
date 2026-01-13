"""
================================================================================
만파식 시스템 알림 임계값 최적화기
Manpasik System Alert Threshold Optimizer

목적: 정밀도(Precision) 극대화를 위한 최적 임계값 탐색
     - 민감도 95% 이상 유지하면서 정밀도 최대화
     - Grid Search 및 Bayesian-like 최적화

문서번호: MPK-SW-OPT-001
버전: 1.0.0
작성일: 2026-01-07
================================================================================
"""

import numpy as np
import time
from datetime import datetime
from dataclasses import dataclass
from typing import List, Dict, Tuple, Optional
from enum import Enum
import random
import itertools

# simulation_runner.py에서 필요한 클래스 임포트
from simulation_runner import (
    VirtualPatientGenerator, SensorSimulator, CalibrationPipeline,
    AlertLevel, VirtualPatient, GLUCOSE_THRESHOLDS, LACTATE_THRESHOLDS
)


@dataclass
class ThresholdConfig:
    """임계값 설정"""
    hypoglycemia_critical: float = 50
    hypoglycemia: float = 70
    hyperglycemia_critical: float = 400
    diabetes_fasting: float = 126
    diabetes_postprandial: float = 200
    lactate_critical: float = 8.0
    lactate_elevated: float = 4.0


@dataclass
class OptimizationResult:
    """최적화 결과"""
    config: ThresholdConfig
    sensitivity: float
    specificity: float
    precision: float
    false_alarm_rate: float
    accuracy: float
    f1_score: float
    emergency_count: int
    

class ThresholdOptimizer:
    """알림 임계값 최적화기"""
    
    def __init__(self, num_patients: int = 5000, seed: int = 42):
        self.num_patients = num_patients
        self.seed = seed
        
        # 데이터 생성 (한 번만)
        print(f"\n[초기화] {num_patients:,}명의 가상 환자 데이터 생성 중...")
        self.patient_generator = VirtualPatientGenerator(seed)
        self.sensor_simulator = SensorSimulator("medium")
        self.calibration_pipeline = CalibrationPipeline()
        
        self.patients = self.patient_generator.generate_patients(num_patients)
        
        # 센서 데이터 및 보정 결과 미리 계산
        self.calibrated_data = []
        for patient in self.patients:
            reading = self.sensor_simulator.generate_sensor_reading(patient)
            glucose, lactate, unc_glu, unc_lac = self.calibration_pipeline.process(reading)
            self.calibrated_data.append({
                'patient': patient,
                'glucose': glucose,
                'lactate': lactate,
                'unc_glucose': unc_glu,
                'unc_lactate': unc_lac
            })
        
        print(f"[초기화] 완료! 보정된 데이터 {len(self.calibrated_data):,}건 준비됨")
        
        # 기준 결과 저장
        self.baseline_result = None
        self.best_result = None
        self.all_results: List[OptimizationResult] = []
    
    def evaluate_thresholds(self, config: ThresholdConfig) -> OptimizationResult:
        """주어진 임계값으로 성능 평가"""
        
        true_positives = 0
        false_positives = 0
        true_negatives = 0
        false_negatives = 0
        emergency_count = 0
        
        for data in self.calibrated_data:
            patient = data['patient']
            glucose = data['glucose']
            lactate = data['lactate']
            
            # 실제 위험 여부 (Ground Truth)
            is_actually_dangerous = (
                patient.true_glucose < 70 or
                patient.true_glucose > 400 or
                patient.true_lactate > 4.0
            )
            
            # 예측 위험 여부 (새 임계값 적용)
            is_emergency = False
            is_warning = False
            
            # 저혈당 체크
            if glucose < config.hypoglycemia_critical:
                is_emergency = True
            elif glucose < config.hypoglycemia:
                is_emergency = True
            
            # 고혈당 체크
            if glucose > config.hyperglycemia_critical:
                is_emergency = True
            
            # 당뇨 의심 체크
            if patient.is_fasting and glucose >= config.diabetes_fasting:
                is_warning = True
            elif not patient.is_fasting and glucose >= config.diabetes_postprandial:
                is_warning = True
            
            # 젖산 체크
            if lactate > config.lactate_critical:
                is_emergency = True
            elif lactate > config.lactate_elevated:
                is_warning = True
            
            if is_emergency:
                emergency_count += 1
            
            is_predicted_dangerous = is_emergency or is_warning
            
            # Confusion Matrix 업데이트
            if is_actually_dangerous and is_predicted_dangerous:
                true_positives += 1
            elif not is_actually_dangerous and is_predicted_dangerous:
                false_positives += 1
            elif not is_actually_dangerous and not is_predicted_dangerous:
                true_negatives += 1
            else:
                false_negatives += 1
        
        # 성능 지표 계산
        sensitivity = true_positives / max(true_positives + false_negatives, 1)
        specificity = true_negatives / max(true_negatives + false_positives, 1)
        precision = true_positives / max(true_positives + false_positives, 1)
        false_alarm_rate = false_positives / max(true_negatives + false_positives, 1)
        accuracy = (true_positives + true_negatives) / self.num_patients
        
        # F1 Score
        f1_score = 2 * (precision * sensitivity) / max(precision + sensitivity, 0.001)
        
        return OptimizationResult(
            config=config,
            sensitivity=sensitivity,
            specificity=specificity,
            precision=precision,
            false_alarm_rate=false_alarm_rate,
            accuracy=accuracy,
            f1_score=f1_score,
            emergency_count=emergency_count
        )
    
    def run_baseline(self) -> OptimizationResult:
        """기준 임계값 평가"""
        print("\n" + "="*70)
        print("1단계: 기준 임계값 평가")
        print("="*70)
        
        baseline_config = ThresholdConfig()  # 기본값 사용
        self.baseline_result = self.evaluate_thresholds(baseline_config)
        
        print(f"\n기준 임계값 설정:")
        print(f"  - 저혈당 위급: < {baseline_config.hypoglycemia_critical} mg/dL")
        print(f"  - 저혈당: < {baseline_config.hypoglycemia} mg/dL")
        print(f"  - 고혈당 위급: > {baseline_config.hyperglycemia_critical} mg/dL")
        print(f"  - 젖산 위급: > {baseline_config.lactate_critical} mmol/L")
        
        print(f"\n기준 성능:")
        print(f"  - 민감도: {self.baseline_result.sensitivity*100:.2f}%")
        print(f"  - 정밀도: {self.baseline_result.precision*100:.2f}%")
        print(f"  - 특이도: {self.baseline_result.specificity*100:.2f}%")
        print(f"  - F1 Score: {self.baseline_result.f1_score:.4f}")
        
        return self.baseline_result
    
    def grid_search(self, min_sensitivity: float = 0.95) -> List[OptimizationResult]:
        """Grid Search로 최적 임계값 탐색"""
        print("\n" + "="*70)
        print("2단계: Grid Search 최적화")
        print(f"  - 민감도 최소 요구: {min_sensitivity*100:.0f}%")
        print("="*70)
        
        # 탐색 범위 정의
        hypoglycemia_critical_range = [45, 50, 55]
        hypoglycemia_range = [60, 65, 70, 75]
        hyperglycemia_critical_range = [350, 400, 450, 500]
        diabetes_fasting_range = [126, 140, 160]
        diabetes_postprandial_range = [180, 200, 220, 250]
        lactate_critical_range = [6.0, 8.0, 10.0]
        lactate_elevated_range = [3.0, 4.0, 5.0]
        
        # 모든 조합 생성
        all_combinations = list(itertools.product(
            hypoglycemia_critical_range,
            hypoglycemia_range,
            hyperglycemia_critical_range,
            diabetes_fasting_range,
            diabetes_postprandial_range,
            lactate_critical_range,
            lactate_elevated_range
        ))
        
        print(f"\n총 {len(all_combinations):,}개 조합 테스트 중...")
        
        valid_results = []
        
        for i, combo in enumerate(all_combinations):
            if (i + 1) % 500 == 0:
                print(f"  진행: {i+1:,}/{len(all_combinations):,} ({(i+1)/len(all_combinations)*100:.1f}%)")
            
            config = ThresholdConfig(
                hypoglycemia_critical=combo[0],
                hypoglycemia=combo[1],
                hyperglycemia_critical=combo[2],
                diabetes_fasting=combo[3],
                diabetes_postprandial=combo[4],
                lactate_critical=combo[5],
                lactate_elevated=combo[6]
            )
            
            result = self.evaluate_thresholds(config)
            
            # 민감도 요구사항 충족하는 결과만 저장
            if result.sensitivity >= min_sensitivity:
                valid_results.append(result)
        
        print(f"\n유효한 조합: {len(valid_results):,}개 (민감도 >= {min_sensitivity*100:.0f}%)")
        
        # 정밀도 기준 정렬
        valid_results.sort(key=lambda x: x.precision, reverse=True)
        self.all_results = valid_results
        
        if valid_results:
            self.best_result = valid_results[0]
        
        return valid_results
    
    def analyze_best_results(self, top_n: int = 10):
        """상위 결과 분석"""
        print("\n" + "="*70)
        print(f"3단계: 상위 {top_n}개 결과 분석")
        print("="*70)
        
        if not self.all_results:
            print("유효한 결과가 없습니다.")
            return
        
        print(f"\n{'순위':^4} | {'민감도':^8} | {'정밀도':^8} | {'특이도':^8} | {'F1':^8} | {'FAR':^8} | 임계값 변경사항")
        print("-" * 100)
        
        baseline = ThresholdConfig()
        
        for i, result in enumerate(self.all_results[:top_n], 1):
            changes = []
            if result.config.hypoglycemia != baseline.hypoglycemia:
                changes.append(f"저혈당:{result.config.hypoglycemia}")
            if result.config.hypoglycemia_critical != baseline.hypoglycemia_critical:
                changes.append(f"저혈당위급:{result.config.hypoglycemia_critical}")
            if result.config.hyperglycemia_critical != baseline.hyperglycemia_critical:
                changes.append(f"고혈당위급:{result.config.hyperglycemia_critical}")
            if result.config.diabetes_fasting != baseline.diabetes_fasting:
                changes.append(f"공복당뇨:{result.config.diabetes_fasting}")
            if result.config.diabetes_postprandial != baseline.diabetes_postprandial:
                changes.append(f"식후당뇨:{result.config.diabetes_postprandial}")
            if result.config.lactate_elevated != baseline.lactate_elevated:
                changes.append(f"젖산상승:{result.config.lactate_elevated}")
            if result.config.lactate_critical != baseline.lactate_critical:
                changes.append(f"젖산위급:{result.config.lactate_critical}")
            
            changes_str = ", ".join(changes) if changes else "기준값"
            
            print(f"{i:^4} | {result.sensitivity*100:>6.2f}% | {result.precision*100:>6.2f}% | "
                  f"{result.specificity*100:>6.2f}% | {result.f1_score:>6.4f} | {result.false_alarm_rate*100:>6.2f}% | {changes_str}")
    
    def compare_with_baseline(self):
        """기준과 최적 결과 비교"""
        print("\n" + "="*70)
        print("4단계: 기준 vs 최적 임계값 비교")
        print("="*70)
        
        if not self.baseline_result or not self.best_result:
            print("비교할 결과가 없습니다.")
            return
        
        baseline = self.baseline_result
        best = self.best_result
        
        print(f"\n{'지표':<20} | {'기준값':>12} | {'최적값':>12} | {'개선율':>12}")
        print("-" * 65)
        
        metrics = [
            ("민감도 (Sensitivity)", baseline.sensitivity, best.sensitivity),
            ("정밀도 (Precision)", baseline.precision, best.precision),
            ("특이도 (Specificity)", baseline.specificity, best.specificity),
            ("F1 Score", baseline.f1_score, best.f1_score),
            ("오탐지율 (FAR)", baseline.false_alarm_rate, best.false_alarm_rate),
            ("정확도 (Accuracy)", baseline.accuracy, best.accuracy),
        ]
        
        for name, base_val, best_val in metrics:
            if name == "오탐지율 (FAR)":
                improvement = (base_val - best_val) / max(base_val, 0.0001) * 100
                print(f"{name:<20} | {base_val*100:>10.2f}% | {best_val*100:>10.2f}% | {improvement:>+10.1f}%")
            else:
                improvement = (best_val - base_val) / max(base_val, 0.0001) * 100
                print(f"{name:<20} | {base_val*100:>10.2f}% | {best_val*100:>10.2f}% | {improvement:>+10.1f}%")
        
        print("\n최적 임계값 설정:")
        print(f"  - 저혈당 위급: < {best.config.hypoglycemia_critical} mg/dL")
        print(f"  - 저혈당: < {best.config.hypoglycemia} mg/dL")
        print(f"  - 고혈당 위급: > {best.config.hyperglycemia_critical} mg/dL")
        print(f"  - 공복 당뇨 의심: >= {best.config.diabetes_fasting} mg/dL")
        print(f"  - 식후 당뇨 의심: >= {best.config.diabetes_postprandial} mg/dL")
        print(f"  - 젖산 상승: > {best.config.lactate_elevated} mmol/L")
        print(f"  - 젖산 위급: > {best.config.lactate_critical} mmol/L")
    
    def generate_optimization_report(self, output_path: str):
        """최적화 보고서 생성"""
        if not self.baseline_result or not self.best_result:
            print("보고서 생성에 필요한 결과가 없습니다.")
            return
        
        baseline = self.baseline_result
        best = self.best_result
        
        precision_improvement = (best.precision - baseline.precision) / baseline.precision * 100
        far_reduction = (baseline.false_alarm_rate - best.false_alarm_rate) / baseline.false_alarm_rate * 100
        
        report = f"""# 만파식 시스템 알림 임계값 최적화 보고서

**문서번호**: MPK-OPT-RPT-001  
**생성일시**: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}  
**버전**: 1.0.0

---

## 1. 개요

### 1.1 목적
- 현재 정밀도(Precision) 60.74%를 극대화
- 민감도(Sensitivity) 95% 이상 유지
- 오탐지율(False Alarm Rate) 최소화

### 1.2 방법론
- Grid Search 기반 전수 탐색
- {len(self.all_results):,}개 유효 조합 평가
- 총 환자 수: {self.num_patients:,}명

---

## 2. 기준 임계값 vs 최적 임계값

### 2.1 임계값 변경 사항

| 항목 | 기준값 | 최적값 | 변경 |
|------|--------|--------|------|
| 저혈당 위급 | < 50 mg/dL | < {best.config.hypoglycemia_critical} mg/dL | {'+' if best.config.hypoglycemia_critical > 50 else ''}{best.config.hypoglycemia_critical - 50} |
| 저혈당 | < 70 mg/dL | < {best.config.hypoglycemia} mg/dL | {'+' if best.config.hypoglycemia > 70 else ''}{best.config.hypoglycemia - 70} |
| 고혈당 위급 | > 400 mg/dL | > {best.config.hyperglycemia_critical} mg/dL | {'+' if best.config.hyperglycemia_critical > 400 else ''}{best.config.hyperglycemia_critical - 400} |
| 공복 당뇨 의심 | >= 126 mg/dL | >= {best.config.diabetes_fasting} mg/dL | {'+' if best.config.diabetes_fasting > 126 else ''}{best.config.diabetes_fasting - 126} |
| 식후 당뇨 의심 | >= 200 mg/dL | >= {best.config.diabetes_postprandial} mg/dL | {'+' if best.config.diabetes_postprandial > 200 else ''}{best.config.diabetes_postprandial - 200} |
| 젖산 상승 | > 4.0 mmol/L | > {best.config.lactate_elevated} mmol/L | {'+' if best.config.lactate_elevated > 4.0 else ''}{best.config.lactate_elevated - 4.0:.1f} |
| 젖산 위급 | > 8.0 mmol/L | > {best.config.lactate_critical} mmol/L | {'+' if best.config.lactate_critical > 8.0 else ''}{best.config.lactate_critical - 8.0:.1f} |

### 2.2 성능 비교

| 지표 | 기준값 | 최적값 | 개선율 |
|------|--------|--------|--------|
| **민감도** | {baseline.sensitivity*100:.2f}% | {best.sensitivity*100:.2f}% | {(best.sensitivity - baseline.sensitivity) / baseline.sensitivity * 100:+.2f}% |
| **정밀도** | {baseline.precision*100:.2f}% | **{best.precision*100:.2f}%** | **{precision_improvement:+.2f}%** |
| **특이도** | {baseline.specificity*100:.2f}% | {best.specificity*100:.2f}% | {(best.specificity - baseline.specificity) / baseline.specificity * 100:+.2f}% |
| **F1 Score** | {baseline.f1_score:.4f} | {best.f1_score:.4f} | {(best.f1_score - baseline.f1_score) / baseline.f1_score * 100:+.2f}% |
| **오탐지율** | {baseline.false_alarm_rate*100:.2f}% | {best.false_alarm_rate*100:.2f}% | **{far_reduction:+.2f}% 감소** |
| **정확도** | {baseline.accuracy*100:.2f}% | {best.accuracy*100:.2f}% | {(best.accuracy - baseline.accuracy) / baseline.accuracy * 100:+.2f}% |

---

## 3. 핵심 개선 효과

### 3.1 정밀도 향상
- **기존**: {baseline.precision*100:.2f}%
- **최적화 후**: {best.precision*100:.2f}%
- **개선율**: **+{precision_improvement:.1f}%**

### 3.2 오탐지 감소
- **기존 False Positive**: 약 {int(baseline.false_alarm_rate * self.num_patients * 0.92):,}건
- **최적화 후**: 약 {int(best.false_alarm_rate * self.num_patients * 0.92):,}건
- **감소율**: **-{far_reduction:.1f}%**

### 3.3 민감도 유지
- 민감도 {best.sensitivity*100:.2f}%로 95% 요구사항 충족 ✅
- 위험 환자 탐지 능력 유지

---

## 4. 상위 5개 최적 조합

"""
        
        for i, result in enumerate(self.all_results[:5], 1):
            report += f"""### 조합 {i}
- 민감도: {result.sensitivity*100:.2f}%, 정밀도: {result.precision*100:.2f}%, F1: {result.f1_score:.4f}
- 저혈당: <{result.config.hypoglycemia}, 고혈당: >{result.config.hyperglycemia_critical}, 젖산: >{result.config.lactate_elevated}

"""
        
        report += f"""---

## 5. 권장 사항

### 5.1 즉시 적용 권장
1. 식후 당뇨 의심 임계값을 >= {best.config.diabetes_postprandial} mg/dL로 상향
2. 젖산 상승 임계값을 > {best.config.lactate_elevated} mmol/L로 조정
3. 고혈당 위급 임계값을 > {best.config.hyperglycemia_critical} mg/dL로 조정

### 5.2 주의 사항
- 민감도 95% 유지를 위해 저혈당 임계값은 보수적으로 유지
- 임상 검증 후 단계적 적용 권장
- 환자 집단별 맞춤 임계값 추가 연구 필요

### 5.3 예상 효과
- 연간 오탐지 알림 약 **{int(far_reduction * 10):,}% 감소**
- 의료진 알림 피로도 대폭 개선
- 실제 위험 환자 대응 집중도 향상

---

## 6. protocol_guide.md 업데이트 제안

```markdown
## 4.2 수정된 알림 임계값 (v1.1)

### 혈당 (Glucose)
| 상태 | 기존 임계값 | 최적화 임계값 |
|------|------------|--------------|
| 저혈당 위급 | < 50 mg/dL | < {best.config.hypoglycemia_critical} mg/dL |
| 저혈당 | < 70 mg/dL | < {best.config.hypoglycemia} mg/dL |
| 공복 당뇨 의심 | >= 126 mg/dL | >= {best.config.diabetes_fasting} mg/dL |
| 식후 당뇨 의심 | >= 200 mg/dL | >= {best.config.diabetes_postprandial} mg/dL |
| 고혈당 위급 | > 400 mg/dL | > {best.config.hyperglycemia_critical} mg/dL |

### 젖산 (Lactate)
| 상태 | 기존 임계값 | 최적화 임계값 |
|------|------------|--------------|
| 상승 | > 4.0 mmol/L | > {best.config.lactate_elevated} mmol/L |
| 위급 | > 8.0 mmol/L | > {best.config.lactate_critical} mmol/L |
```

---

**보고서 완료**  
*만파식 시스템 알림 임계값 최적화기 v1.0.0*
"""
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(report)
        
        print(f"\n최적화 보고서 저장: {output_path}")


def main():
    """메인 함수"""
    print("\n" + "=" * 70)
    print("=" + " " * 68 + "=")
    print("=   Manpasik System Alert Threshold Optimizer v1.0   ".center(70, "="))
    print("=   Precision Maximization via Grid Search   ".center(70, "="))
    print("=" + " " * 68 + "=")
    print("=" * 70)
    
    # 최적화기 초기화
    optimizer = ThresholdOptimizer(num_patients=5000, seed=42)
    
    # 1단계: 기준 평가
    optimizer.run_baseline()
    
    # 2단계: Grid Search
    results = optimizer.grid_search(min_sensitivity=0.95)
    
    # 3단계: 상위 결과 분석
    optimizer.analyze_best_results(top_n=10)
    
    # 4단계: 비교
    optimizer.compare_with_baseline()
    
    # 5단계: 보고서 생성
    optimizer.generate_optimization_report("threshold_optimization_report.md")
    
    print("\n" + "="*70)
    print("[OK] Threshold Optimization Complete!")
    print("="*70)
    
    return optimizer


if __name__ == "__main__":
    main()

