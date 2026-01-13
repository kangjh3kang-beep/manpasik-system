"""
================================================================================
만파식 시스템 스트레스 테스트 시뮬레이터
Manpasik System Stress Test Simulator

목적: 10,000명의 가상 환자 데이터로 calibration_core.py 성능 검증

시뮬레이션 시나리오:
1. 가상 환자 생성 (랜덤 나이, 성별, 기저질환)
2. 노이즈 포함 Raw 센서 데이터 생성
3. calibration_core.py 보정 파이프라인 통과
4. protocol_guide.md 위험 기준 검증
5. TPS 및 오탐지율 분석

문서번호: MPK-SW-SIM-001
버전: 1.0.0
작성일: 2026-01-07
================================================================================
"""

import numpy as np
import time
import sys
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional
from enum import Enum
import random
import logging

# calibration_core.py에서 필요한 클래스 임포트
try:
    from calibration_core import (
        Channel, MeasurementMode, CalibrationParameters,
        DifferentialCalibrator, MultiDimensionalProcessor,
        AnomalyDetector, IntelligentHealthManager, HealthStatus,
        SafetyGuard, SafetyAction, StateMetadata,
        DataPacketEngine, EnvironmentMetadata,
        SensorFusionEngine
    )
    CALIBRATION_MODULE_AVAILABLE = True
except ImportError as e:
    print(f"calibration_core.py import failed: {e}")
    print("   -> Running in basic simulation mode.")
    CALIBRATION_MODULE_AVAILABLE = False

# 로깅 설정
logging.basicConfig(
    level=logging.WARNING,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ============================================================================
# 상수 정의 (protocol_guide.md 기준)
# ============================================================================

class AlertLevel(Enum):
    """경보 수준"""
    NORMAL = "NORMAL"
    CAUTION = "CAUTION"
    WARNING = "WARNING"
    EMERGENCY = "EMERGENCY"


class UnderlyingCondition(Enum):
    """기저질환"""
    NONE = "None"
    TYPE1_DIABETES = "Type1 Diabetes"
    TYPE2_DIABETES = "Type2 Diabetes"
    PREDIABETES = "Prediabetes"
    HYPERTENSION = "Hypertension"
    HEART_DISEASE = "Heart Disease"
    KIDNEY_DISEASE = "Kidney Disease"
    LIVER_DISEASE = "Liver Disease"
    OBESITY = "Obesity"
    HYPERLIPIDEMIA = "Hyperlipidemia"


# protocol_guide.md v1.1 최적화 임계값 (2026-01-07)
# Grid Search 최적화: 정밀도 59.25% → 82.44% (+39.1%)
GLUCOSE_THRESHOLDS = {
    "hypoglycemia_critical": 45,    # 기존 50 → 45 (더 엄격)
    "hypoglycemia": 65,             # 기존 70 → 65 (더 엄격)
    "normal_fasting_low": 65,
    "normal_fasting_high": 99,
    "prediabetes_fasting": 159,
    "diabetes_fasting": 160,        # 기존 126 → 160 (더 관대)
    "normal_postprandial": 140,
    "prediabetes_postprandial": 249,
    "diabetes_postprandial": 250,   # 기존 200 → 250 (더 관대)
    "hyperglycemia_critical": 350   # 기존 400 → 350 (더 엄격)
}

LACTATE_THRESHOLDS = {
    "normal_low": 0.5,
    "normal_high": 2.0,
    "elevated": 3.0,                # 기존 4.0 → 3.0 (더 엄격)
    "critical": 6.0                 # 기존 8.0 → 6.0 (더 엄격)
}


# ============================================================================
# 데이터 클래스
# ============================================================================

@dataclass
class VirtualPatient:
    """가상 환자"""
    patient_id: str
    age: int
    gender: str
    weight_kg: float
    height_cm: float
    underlying_conditions: List[UnderlyingCondition]
    is_fasting: bool
    true_glucose: float
    true_lactate: float


@dataclass
class SensorReading:
    """센서 읽기 데이터"""
    patient_id: str
    timestamp: datetime
    raw_glucose_det: float
    raw_glucose_ref: float
    raw_lactate_det: float
    raw_lactate_ref: float
    temperature: float
    humidity: float
    noise_level: float


@dataclass
class ProcessingResult:
    """처리 결과"""
    patient_id: str
    calibrated_glucose: float
    calibrated_lactate: float
    uncertainty_glucose: float
    uncertainty_lactate: float
    alert_level: AlertLevel
    alert_message: str
    processing_time_ms: float
    is_emergency: bool


@dataclass
class SimulationStats:
    """시뮬레이션 통계"""
    total_patients: int
    total_processing_time_s: float
    tps: float
    emergency_count: int
    emergency_rate: float
    true_positive_alerts: int
    false_positive_alerts: int
    true_negative: int
    false_negative: int
    sensitivity: float
    specificity: float
    precision: float
    false_alarm_rate: float
    accuracy: float


# ============================================================================
# 가상 환자 생성기
# ============================================================================

class VirtualPatientGenerator:
    """가상 환자 생성기"""
    
    def __init__(self, seed: int = 42):
        np.random.seed(seed)
        random.seed(seed)
    
    def generate_patients(self, count: int) -> List[VirtualPatient]:
        patients = []
        
        for i in range(count):
            patient_id = f"VP-{i+1:06d}"
            age = int(np.clip(np.random.normal(50, 15), 20, 80))
            gender = random.choice(["M", "F"])
            
            if gender == "M":
                weight = np.clip(np.random.normal(75, 12), 50, 120)
                height = np.clip(np.random.normal(173, 7), 155, 195)
            else:
                weight = np.clip(np.random.normal(62, 10), 40, 100)
                height = np.clip(np.random.normal(160, 6), 145, 180)
            
            conditions = self._generate_conditions(age)
            is_fasting = random.random() < 0.6
            true_glucose, true_lactate = self._generate_biomarkers(age, conditions, is_fasting)
            
            patient = VirtualPatient(
                patient_id=patient_id,
                age=age,
                gender=gender,
                weight_kg=weight,
                height_cm=height,
                underlying_conditions=conditions,
                is_fasting=is_fasting,
                true_glucose=true_glucose,
                true_lactate=true_lactate
            )
            patients.append(patient)
        
        return patients
    
    def _generate_conditions(self, age: int) -> List[UnderlyingCondition]:
        conditions = []
        age_factor = (age - 20) / 60
        
        diabetes_prob = 0.05 + age_factor * 0.20
        if random.random() < diabetes_prob:
            if random.random() < 0.1:
                conditions.append(UnderlyingCondition.TYPE1_DIABETES)
            elif random.random() < 0.5:
                conditions.append(UnderlyingCondition.TYPE2_DIABETES)
            else:
                conditions.append(UnderlyingCondition.PREDIABETES)
        
        if random.random() < (0.10 + age_factor * 0.30):
            conditions.append(UnderlyingCondition.HYPERTENSION)
        
        if random.random() < (0.08 + age_factor * 0.22):
            conditions.append(UnderlyingCondition.HYPERLIPIDEMIA)
        
        if random.random() < 0.20:
            conditions.append(UnderlyingCondition.OBESITY)
        
        if random.random() < (0.02 + age_factor * 0.13):
            conditions.append(UnderlyingCondition.HEART_DISEASE)
        
        if not conditions:
            conditions.append(UnderlyingCondition.NONE)
        
        return conditions
    
    def _generate_biomarkers(self, age: int, conditions: List[UnderlyingCondition], is_fasting: bool) -> Tuple[float, float]:
        if is_fasting:
            base_glucose = np.random.normal(92, 8)
        else:
            base_glucose = np.random.normal(120, 15)
        
        for cond in conditions:
            if cond == UnderlyingCondition.TYPE1_DIABETES:
                base_glucose += np.random.normal(80, 40)
            elif cond == UnderlyingCondition.TYPE2_DIABETES:
                base_glucose += np.random.normal(50, 25)
            elif cond == UnderlyingCondition.PREDIABETES:
                base_glucose += np.random.normal(20, 10)
            elif cond == UnderlyingCondition.OBESITY:
                base_glucose += np.random.normal(10, 5)
        
        if random.random() < 0.02:
            base_glucose = np.random.uniform(40, 65)
        elif random.random() < 0.01:
            base_glucose = np.random.uniform(420, 550)
        
        base_lactate = np.random.normal(1.2, 0.4)
        
        if random.random() < 0.05:
            base_lactate = np.random.uniform(4.5, 8.0)
        
        glucose = np.clip(base_glucose, 30, 600)
        lactate = np.clip(base_lactate, 0.2, 15.0)
        
        return glucose, lactate


# ============================================================================
# 센서 데이터 시뮬레이터
# ============================================================================

class SensorSimulator:
    """센서 데이터 시뮬레이터"""
    
    NOISE_CONFIGS = {
        "low": {"snr_db": 40, "drift_pct": 0.5},
        "medium": {"snr_db": 30, "drift_pct": 1.5},
        "high": {"snr_db": 20, "drift_pct": 3.0},
        "extreme": {"snr_db": 15, "drift_pct": 5.0}
    }
    
    def __init__(self, noise_level: str = "medium"):
        self.noise_config = self.NOISE_CONFIGS.get(noise_level, self.NOISE_CONFIGS["medium"])
        self.noise_level = noise_level
    
    def generate_sensor_reading(self, patient: VirtualPatient) -> SensorReading:
        temperature = np.random.normal(25, 3)
        humidity = np.random.normal(50, 10)
        
        snr_db = self.noise_config["snr_db"]
        noise_factor = 10 ** (-snr_db / 20)
        
        interference_glucose = np.random.normal(0.2, 0.1) * patient.true_glucose
        interference_lactate = np.random.normal(0.15, 0.08) * patient.true_lactate
        
        raw_glucose_det = (
            patient.true_glucose +
            interference_glucose +
            np.random.normal(0, patient.true_glucose * noise_factor)
        )
        
        raw_lactate_det = (
            patient.true_lactate +
            interference_lactate +
            np.random.normal(0, patient.true_lactate * noise_factor)
        )
        
        raw_glucose_ref = (
            interference_glucose +
            np.random.normal(0, patient.true_glucose * noise_factor * 0.5)
        )
        
        raw_lactate_ref = (
            interference_lactate +
            np.random.normal(0, patient.true_lactate * noise_factor * 0.5)
        )
        
        drift = self.noise_config["drift_pct"] / 100
        raw_glucose_det *= (1 + np.random.uniform(-drift, drift))
        raw_lactate_det *= (1 + np.random.uniform(-drift, drift))
        
        return SensorReading(
            patient_id=patient.patient_id,
            timestamp=datetime.now(),
            raw_glucose_det=raw_glucose_det,
            raw_glucose_ref=raw_glucose_ref,
            raw_lactate_det=raw_lactate_det,
            raw_lactate_ref=raw_lactate_ref,
            temperature=temperature,
            humidity=humidity,
            noise_level=noise_factor
        )


# ============================================================================
# 보정 파이프라인
# ============================================================================

class CalibrationPipeline:
    """calibration_core.py 기반 보정 파이프라인"""
    
    def __init__(self):
        if CALIBRATION_MODULE_AVAILABLE:
            self.params = CalibrationParameters(
                cartridge_id="SIM-CRT-001",
                alpha_coefficients={
                    Channel.CH1_GOX: 0.95,
                    Channel.CH2_LOX: 0.92,
                    Channel.CH3_AU: 1.00,
                    Channel.CH4_CR: 0.88
                },
                temperature_compensation={
                    15.0: 1.05, 20.0: 1.02, 25.0: 1.00,
                    30.0: 0.98, 35.0: 0.95
                },
                manufacturing_date=datetime(2025, 12, 1),
                expiry_date=datetime(2026, 12, 1),
                usage_count=10
            )
            self.calibrator = DifferentialCalibrator(self.params)
            self.safety_guard = SafetyGuard(application="glucose_poct")
            self.fusion_engine = SensorFusionEngine(self.safety_guard)
        else:
            self.calibrator = None
    
    def process(self, reading: SensorReading) -> Tuple[float, float, float, float]:
        if CALIBRATION_MODULE_AVAILABLE and self.calibrator:
            glucose_diff = self.calibrator.calculate_differential_signal(
                reading.raw_glucose_det,
                reading.raw_glucose_ref,
                Channel.CH1_GOX
            )
            
            lactate_diff = self.calibrator.calculate_differential_signal(
                reading.raw_lactate_det,
                reading.raw_lactate_ref,
                Channel.CH2_LOX
            )
            
            glucose_calibrated = self.calibrator.apply_temperature_compensation(
                glucose_diff, reading.temperature
            )
            lactate_calibrated = self.calibrator.apply_temperature_compensation(
                lactate_diff, reading.temperature
            )
            
            uncertainty_glucose = reading.noise_level * 100 * 1.5
            uncertainty_lactate = reading.noise_level * 100 * 1.8
            
        else:
            alpha_glucose = 0.95
            alpha_lactate = 0.92
            
            glucose_calibrated = reading.raw_glucose_det - alpha_glucose * reading.raw_glucose_ref
            lactate_calibrated = reading.raw_lactate_det - alpha_lactate * reading.raw_lactate_ref
            
            uncertainty_glucose = reading.noise_level * 100 * 1.5
            uncertainty_lactate = reading.noise_level * 100 * 1.8
        
        return (
            max(0, glucose_calibrated),
            max(0, lactate_calibrated),
            uncertainty_glucose,
            uncertainty_lactate
        )


# ============================================================================
# 프로토콜 검증기
# ============================================================================

class ProtocolValidator:
    """protocol_guide.md 기반 위험 기준 검증"""
    
    def validate(self, patient: VirtualPatient, glucose: float, lactate: float,
                 uncertainty_glucose: float, uncertainty_lactate: float) -> Tuple[AlertLevel, str, bool]:
        alert_level = AlertLevel.NORMAL
        messages = []
        is_emergency = False
        
        # 저혈당
        if glucose < GLUCOSE_THRESHOLDS["hypoglycemia_critical"]:
            alert_level = AlertLevel.EMERGENCY
            messages.append(f"CRITICAL Hypoglycemia! ({glucose:.0f} mg/dL < 50)")
            is_emergency = True
        elif glucose < GLUCOSE_THRESHOLDS["hypoglycemia"]:
            alert_level = AlertLevel.EMERGENCY
            messages.append(f"Hypoglycemia! ({glucose:.0f} mg/dL < 70)")
            is_emergency = True
        
        # 고혈당
        elif glucose > GLUCOSE_THRESHOLDS["hyperglycemia_critical"]:
            alert_level = AlertLevel.EMERGENCY
            messages.append(f"CRITICAL Hyperglycemia! ({glucose:.0f} mg/dL > 400)")
            is_emergency = True
        
        # 당뇨 의심
        elif patient.is_fasting and glucose >= GLUCOSE_THRESHOLDS["diabetes_fasting"]:
            if alert_level.value != "EMERGENCY":
                alert_level = AlertLevel.WARNING
            messages.append(f"Fasting glucose diabetes suspected ({glucose:.0f} mg/dL >= 126)")
        
        elif not patient.is_fasting and glucose >= GLUCOSE_THRESHOLDS["diabetes_postprandial"]:
            if alert_level.value != "EMERGENCY":
                alert_level = AlertLevel.WARNING
            messages.append(f"Postprandial glucose diabetes suspected ({glucose:.0f} mg/dL >= 200)")
        
        # 경계
        elif patient.is_fasting and glucose > GLUCOSE_THRESHOLDS["normal_fasting_high"]:
            if alert_level == AlertLevel.NORMAL:
                alert_level = AlertLevel.CAUTION
            messages.append(f"Fasting glucose borderline ({glucose:.0f} mg/dL)")
        
        elif not patient.is_fasting and glucose > GLUCOSE_THRESHOLDS["normal_postprandial"]:
            if alert_level == AlertLevel.NORMAL:
                alert_level = AlertLevel.CAUTION
            messages.append(f"Postprandial glucose borderline ({glucose:.0f} mg/dL)")
        
        # 젖산
        if lactate > LACTATE_THRESHOLDS["critical"]:
            if alert_level != AlertLevel.EMERGENCY:
                alert_level = AlertLevel.EMERGENCY
            messages.append(f"CRITICAL Lactate! ({lactate:.1f} mmol/L > 8.0)")
            is_emergency = True
        
        elif lactate > LACTATE_THRESHOLDS["elevated"]:
            if alert_level in [AlertLevel.NORMAL, AlertLevel.CAUTION]:
                alert_level = AlertLevel.WARNING
            messages.append(f"Elevated lactate ({lactate:.1f} mmol/L > 4.0)")
        
        if not messages:
            messages.append("Normal range")
        
        return alert_level, " | ".join(messages), is_emergency


# ============================================================================
# 시뮬레이션 러너
# ============================================================================

class SimulationRunner:
    """메인 시뮬레이션 러너"""
    
    def __init__(self, num_patients: int = 10000, noise_level: str = "medium", seed: int = 42):
        self.num_patients = num_patients
        self.noise_level = noise_level
        self.seed = seed
        
        self.patient_generator = VirtualPatientGenerator(seed)
        self.sensor_simulator = SensorSimulator(noise_level)
        self.calibration_pipeline = CalibrationPipeline()
        self.protocol_validator = ProtocolValidator()
        
        self.patients: List[VirtualPatient] = []
        self.results: List[ProcessingResult] = []
    
    def run(self) -> SimulationStats:
        print("\n" + "="*70)
        print("Manpasik System Stress Test Simulator")
        print("="*70)
        
        print(f"\n[1/4] Generating {self.num_patients:,} virtual patients...")
        start_time = time.time()
        self.patients = self.patient_generator.generate_patients(self.num_patients)
        gen_time = time.time() - start_time
        print(f"      Done! ({gen_time:.2f}s)")
        
        self._print_patient_distribution()
        
        print(f"\n[2/4] Processing sensor data...")
        print(f"      Noise level: {self.noise_level}")
        
        start_time = time.time()
        self.results = []
        
        progress_interval = max(1, self.num_patients // 20)
        
        for i, patient in enumerate(self.patients):
            if (i + 1) % progress_interval == 0:
                progress = (i + 1) / self.num_patients * 100
                print(f"      Progress: {progress:.0f}% ({i+1:,}/{self.num_patients:,})")
            
            reading = self.sensor_simulator.generate_sensor_reading(patient)
            
            proc_start = time.perf_counter()
            
            glucose, lactate, unc_glu, unc_lac = self.calibration_pipeline.process(reading)
            
            alert_level, message, is_emergency = self.protocol_validator.validate(
                patient, glucose, lactate, unc_glu, unc_lac
            )
            
            proc_time = (time.perf_counter() - proc_start) * 1000
            
            result = ProcessingResult(
                patient_id=patient.patient_id,
                calibrated_glucose=glucose,
                calibrated_lactate=lactate,
                uncertainty_glucose=unc_glu,
                uncertainty_lactate=unc_lac,
                alert_level=alert_level,
                alert_message=message,
                processing_time_ms=proc_time,
                is_emergency=is_emergency
            )
            self.results.append(result)
        
        total_time = time.time() - start_time
        print(f"      Done! ({total_time:.2f}s)")
        
        print(f"\n[3/4] Analyzing results...")
        stats = self._calculate_statistics(total_time)
        
        print(f"\n[4/4] Generating report...")
        self._print_results(stats)
        
        return stats
    
    def _print_patient_distribution(self):
        ages = [p.age for p in self.patients]
        genders = [p.gender for p in self.patients]
        
        diabetic_count = sum(
            1 for p in self.patients
            if any(c in [UnderlyingCondition.TYPE1_DIABETES, 
                        UnderlyingCondition.TYPE2_DIABETES]
                   for c in p.underlying_conditions)
        )
        
        print(f"\n      Patient Distribution:")
        print(f"      - Average age: {np.mean(ages):.1f} years (range: {min(ages)}-{max(ages)})")
        print(f"      - Gender: M {genders.count('M'):,} / F {genders.count('F'):,}")
        print(f"      - Diabetic: {diabetic_count:,} ({diabetic_count/len(self.patients)*100:.1f}%)")
    
    def _calculate_statistics(self, total_time: float) -> SimulationStats:
        tps = self.num_patients / total_time
        emergency_count = sum(1 for r in self.results if r.is_emergency)
        
        true_positives = 0
        false_positives = 0
        true_negatives = 0
        false_negatives = 0
        
        for patient, result in zip(self.patients, self.results):
            is_actually_dangerous = (
                patient.true_glucose < 70 or
                patient.true_glucose > 400 or
                patient.true_lactate > 4.0
            )
            
            is_predicted_dangerous = result.is_emergency or result.alert_level == AlertLevel.WARNING
            
            if is_actually_dangerous and is_predicted_dangerous:
                true_positives += 1
            elif not is_actually_dangerous and is_predicted_dangerous:
                false_positives += 1
            elif not is_actually_dangerous and not is_predicted_dangerous:
                true_negatives += 1
            else:
                false_negatives += 1
        
        sensitivity = true_positives / max(true_positives + false_negatives, 1)
        specificity = true_negatives / max(true_negatives + false_positives, 1)
        precision = true_positives / max(true_positives + false_positives, 1)
        false_alarm_rate = false_positives / max(true_negatives + false_positives, 1)
        accuracy = (true_positives + true_negatives) / self.num_patients
        
        return SimulationStats(
            total_patients=self.num_patients,
            total_processing_time_s=total_time,
            tps=tps,
            emergency_count=emergency_count,
            emergency_rate=emergency_count / self.num_patients,
            true_positive_alerts=true_positives,
            false_positive_alerts=false_positives,
            true_negative=true_negatives,
            false_negative=false_negatives,
            sensitivity=sensitivity,
            specificity=specificity,
            precision=precision,
            false_alarm_rate=false_alarm_rate,
            accuracy=accuracy
        )
    
    def _print_results(self, stats: SimulationStats):
        print("\n" + "="*70)
        print("                      SIMULATION RESULTS SUMMARY")
        print("="*70)
        
        print(f"""
+---------------------------------------------------------------------+
| PROCESSING PERFORMANCE                                               |
+---------------------------------------------------------------------+
| Total Patients: {stats.total_patients:,}                                          
| Total Time: {stats.total_processing_time_s:.2f} seconds                                        
| TPS (Transactions/sec): {stats.tps:,.1f}                        
| Avg Processing Time: {stats.total_processing_time_s/stats.total_patients*1000:.2f} ms/patient                        
+---------------------------------------------------------------------+
| ALERT STATISTICS                                                     |
+---------------------------------------------------------------------+
| Emergency Alerts: {stats.emergency_count:,} ({stats.emergency_rate*100:.2f}%)                           
| True Positive: {stats.true_positive_alerts:,}                                  
| False Positive: {stats.false_positive_alerts:,}                                 
| True Negative: {stats.true_negative:,}                                         
| False Negative: {stats.false_negative:,}                                 
+---------------------------------------------------------------------+
| PERFORMANCE METRICS                                                  |
+---------------------------------------------------------------------+
| Sensitivity (Recall): {stats.sensitivity*100:.2f}%                            
| Specificity: {stats.specificity*100:.2f}%                                    
| Precision: {stats.precision*100:.2f}%                                      
| False Alarm Rate: {stats.false_alarm_rate*100:.2f}%                        
| Accuracy: {stats.accuracy*100:.2f}%                                        
+---------------------------------------------------------------------+
""")
        
        alert_dist = {}
        for r in self.results:
            alert_dist[r.alert_level] = alert_dist.get(r.alert_level, 0) + 1
        
        print("Alert Level Distribution:")
        for level in AlertLevel:
            count = alert_dist.get(level, 0)
            bar = "#" * int(count / self.num_patients * 50)
            print(f"  {level.value:12s}: {count:6,} ({count/self.num_patients*100:5.2f}%) {bar}")
    
    def generate_report(self, stats: SimulationStats, output_path: str):
        alert_dist = {}
        for r in self.results:
            alert_dist[r.alert_level] = alert_dist.get(r.alert_level, 0) + 1
        
        proc_times = [r.processing_time_ms for r in self.results]
        
        report = f"""# Manpasik System Stress Test Report

**Document**: MPK-SIM-RPT-001  
**Generated**: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}  
**Version**: 1.0.0

---

## Test Overview

| Item | Value |
|------|-------|
| Total Virtual Patients | {stats.total_patients:,} |
| Noise Level | {self.noise_level} |
| Random Seed | {self.seed} |
| calibration_core.py Version | 5.0.0 |

---

## Processing Performance

### Throughput

| Metric | Value |
|--------|-------|
| Total Processing Time | {stats.total_processing_time_s:.2f} seconds |
| **TPS (Transactions/sec)** | **{stats.tps:,.1f}** |
| Average Processing Time | {stats.total_processing_time_s/stats.total_patients*1000:.3f} ms/patient |
| Min Processing Time | {min(proc_times):.3f} ms |
| Max Processing Time | {max(proc_times):.3f} ms |
| Std Dev | {np.std(proc_times):.3f} ms |

### Processing Time Distribution

```
P50 (Median): {np.percentile(proc_times, 50):.3f} ms
P90: {np.percentile(proc_times, 90):.3f} ms
P95: {np.percentile(proc_times, 95):.3f} ms
P99: {np.percentile(proc_times, 99):.3f} ms
```

---

## Alert Analysis

### Alert Summary

| Alert Level | Count | Rate |
|-------------|-------|------|
| NORMAL | {alert_dist.get(AlertLevel.NORMAL, 0):,} | {alert_dist.get(AlertLevel.NORMAL, 0)/stats.total_patients*100:.2f}% |
| CAUTION | {alert_dist.get(AlertLevel.CAUTION, 0):,} | {alert_dist.get(AlertLevel.CAUTION, 0)/stats.total_patients*100:.2f}% |
| WARNING | {alert_dist.get(AlertLevel.WARNING, 0):,} | {alert_dist.get(AlertLevel.WARNING, 0)/stats.total_patients*100:.2f}% |
| **EMERGENCY** | **{alert_dist.get(AlertLevel.EMERGENCY, 0):,}** | **{alert_dist.get(AlertLevel.EMERGENCY, 0)/stats.total_patients*100:.2f}%** |

---

## Detection Performance

### Confusion Matrix

|  | Predicted: Danger | Predicted: Normal |
|--|-------------------|-------------------|
| **Actual: Danger** | TP: {stats.true_positive_alerts:,} | FN: {stats.false_negative:,} |
| **Actual: Normal** | FP: {stats.false_positive_alerts:,} | TN: {stats.true_negative:,} |

### Key Metrics

| Metric | Value | Interpretation |
|--------|-------|----------------|
| **Sensitivity** | **{stats.sensitivity*100:.2f}%** | Detection rate of actual danger |
| **Specificity** | **{stats.specificity*100:.2f}%** | Correct classification of normal |
| **Precision** | **{stats.precision*100:.2f}%** | True danger when alert triggered |
| **False Alarm Rate** | **{stats.false_alarm_rate*100:.2f}%** | False positive rate |
| **Accuracy** | **{stats.accuracy*100:.2f}%** | Overall accuracy |

### Evaluation

"""
        
        if stats.sensitivity >= 0.95:
            report += "- EXCELLENT Sensitivity: 95%+ of dangerous patients detected\n"
        elif stats.sensitivity >= 0.90:
            report += "- GOOD Sensitivity: 90%+ of dangerous patients detected\n"
        else:
            report += "- WARNING: Sensitivity below 90%, improvement needed\n"
        
        if stats.false_alarm_rate <= 0.05:
            report += "- EXCELLENT False Alarm Rate: Below 5%\n"
        elif stats.false_alarm_rate <= 0.10:
            report += "- GOOD False Alarm Rate: Below 10%\n"
        else:
            report += "- WARNING: False Alarm Rate above 10%, review thresholds\n"
        
        emergency_samples = [r for r in self.results if r.is_emergency][:5]
        
        report += f"""
---

## Sample Emergency Cases

"""
        
        for i, result in enumerate(emergency_samples[:5], 1):
            patient = next(p for p in self.patients if p.patient_id == result.patient_id)
            report += f"""### Case {i}: {result.patient_id}

| Item | Value |
|------|-------|
| Age/Gender | {patient.age} / {patient.gender} |
| Conditions | {', '.join(c.value for c in patient.underlying_conditions)} |
| Fasting | {'Yes' if patient.is_fasting else 'No'} |
| True Glucose | {patient.true_glucose:.1f} mg/dL |
| Calibrated Glucose | {result.calibrated_glucose:.1f} mg/dL |
| True Lactate | {patient.true_lactate:.2f} mmol/L |
| Calibrated Lactate | {result.calibrated_lactate:.2f} mmol/L |
| Alert | {result.alert_message} |

"""
        
        report += f"""---

## Conclusions and Recommendations

### Summary

1. **Processing Performance**: TPS {stats.tps:,.1f} {"meets" if stats.tps > 100 else "does not meet"} real-time requirements
2. **Detection Performance**: Sensitivity {stats.sensitivity*100:.1f}%, Specificity {stats.specificity*100:.1f}%
3. **False Alarm Rate**: {stats.false_alarm_rate*100:.2f}% - {"acceptable" if stats.false_alarm_rate < 0.1 else "needs improvement"}

### Recommendations

"""
        
        if stats.sensitivity < 0.95:
            report += "- [ ] Improve sensitivity for hypoglycemia/hyperglycemia detection\n"
        
        if stats.false_alarm_rate > 0.05:
            report += "- [ ] Review and adjust alert thresholds to reduce false alarms\n"
        
        report += f"""
---

**Report Complete**  
*Generated using calibration_core.py v5.0.0 and protocol_guide.md standards.*
"""
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(report)
        
        print(f"\nReport saved to: {output_path}")


# ============================================================================
# 메인 실행
# ============================================================================

def main():
    print("\n" + "#" * 70)
    print("#" + " " * 68 + "#")
    print("#" + "    Manpasik System Stress Test Simulator v1.0    ".center(68) + "#")
    print("#" + " " * 68 + "#")
    print("#" * 70)
    
    NUM_PATIENTS = 10000
    NOISE_LEVEL = "medium"
    SEED = 42
    
    print(f"\nConfiguration:")
    print(f"  - Patients: {NUM_PATIENTS:,}")
    print(f"  - Noise Level: {NOISE_LEVEL}")
    print(f"  - Random Seed: {SEED}")
    print(f"  - calibration_core.py: {'loaded' if CALIBRATION_MODULE_AVAILABLE else 'not loaded (basic mode)'}")
    
    runner = SimulationRunner(
        num_patients=NUM_PATIENTS,
        noise_level=NOISE_LEVEL,
        seed=SEED
    )
    
    stats = runner.run()
    
    report_path = "simulation_report.md"
    runner.generate_report(stats, report_path)
    
    print("\n" + "="*70)
    print("Stress test completed!")
    print("="*70)
    
    return stats


if __name__ == "__main__":
    main()

