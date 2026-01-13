# Manpasik System Stress Test Report

**Document**: MPK-SIM-RPT-001  
**Generated**: 2026-01-07 18:04:44  
**Version**: 1.0.0

---

## Test Overview

| Item | Value |
|------|-------|
| Total Virtual Patients | 10,000 |
| Noise Level | medium |
| Random Seed | 42 |
| calibration_core.py Version | 5.0.0 |

---

## Processing Performance

### Throughput

| Metric | Value |
|--------|-------|
| Total Processing Time | 0.17 seconds |
| **TPS (Transactions/sec)** | **57,822.5** |
| Average Processing Time | 0.017 ms/patient |
| Min Processing Time | 0.001 ms |
| Max Processing Time | 0.063 ms |
| Std Dev | 0.002 ms |

### Processing Time Distribution

```
P50 (Median): 0.002 ms
P90: 0.003 ms
P95: 0.003 ms
P99: 0.007 ms
```

---

## Alert Analysis

### Alert Summary

| Alert Level | Count | Rate |
|-------------|-------|------|
| NORMAL | 6,036 | 60.36% |
| CAUTION | 3,024 | 30.24% |
| WARNING | 359 | 3.59% |
| **EMERGENCY** | **581** | **5.81%** |

---

## Detection Performance

### Confusion Matrix

|  | Predicted: Danger | Predicted: Normal |
|--|-------------------|-------------------|
| **Actual: Danger** | TP: 777 | FN: 20 |
| **Actual: Normal** | FP: 163 | TN: 9,040 |

### Key Metrics

| Metric | Value | Interpretation |
|--------|-------|----------------|
| **Sensitivity** | **97.49%** | Detection rate of actual danger |
| **Specificity** | **98.23%** | Correct classification of normal |
| **Precision** | **82.66%** | True danger when alert triggered |
| **False Alarm Rate** | **1.77%** | False positive rate |
| **Accuracy** | **98.17%** | Overall accuracy |

### Evaluation

- EXCELLENT Sensitivity: 95%+ of dangerous patients detected
- EXCELLENT False Alarm Rate: Below 5%

---

## Sample Emergency Cases

### Case 1: VP-000023

| Item | Value |
|------|-------|
| Age/Gender | 32 / M |
| Conditions | Hypertension, Hyperlipidemia |
| Fasting | No |
| True Glucose | 131.9 mg/dL |
| Calibrated Glucose | 124.2 mg/dL |
| True Lactate | 5.79 mmol/L |
| Calibrated Lactate | 6.21 mmol/L |
| Alert | CRITICAL Lactate! (6.2 mmol/L > 8.0) |

### Case 2: VP-000103

| Item | Value |
|------|-------|
| Age/Gender | 43 / M |
| Conditions | None |
| Fasting | No |
| True Glucose | 125.9 mg/dL |
| Calibrated Glucose | 119.5 mg/dL |
| True Lactate | 6.83 mmol/L |
| Calibrated Lactate | 6.56 mmol/L |
| Alert | CRITICAL Lactate! (6.6 mmol/L > 8.0) |

### Case 3: VP-000136

| Item | Value |
|------|-------|
| Age/Gender | 30 / M |
| Conditions | None |
| Fasting | No |
| True Glucose | 430.8 mg/dL |
| Calibrated Glucose | 463.8 mg/dL |
| True Lactate | 0.91 mmol/L |
| Calibrated Lactate | 0.88 mmol/L |
| Alert | CRITICAL Hyperglycemia! (464 mg/dL > 400) |

### Case 4: VP-000138

| Item | Value |
|------|-------|
| Age/Gender | 36 / F |
| Conditions | Type2 Diabetes |
| Fasting | Yes |
| True Glucose | 63.4 mg/dL |
| Calibrated Glucose | 60.9 mg/dL |
| True Lactate | 0.86 mmol/L |
| Calibrated Lactate | 0.90 mmol/L |
| Alert | Hypoglycemia! (61 mg/dL < 70) |

### Case 5: VP-000165

| Item | Value |
|------|-------|
| Age/Gender | 50 / M |
| Conditions | Type1 Diabetes |
| Fasting | Yes |
| True Glucose | 175.8 mg/dL |
| Calibrated Glucose | 163.3 mg/dL |
| True Lactate | 6.39 mmol/L |
| Calibrated Lactate | 6.39 mmol/L |
| Alert | Fasting glucose diabetes suspected (163 mg/dL >= 126) | CRITICAL Lactate! (6.4 mmol/L > 8.0) |

---

## Conclusions and Recommendations

### Summary

1. **Processing Performance**: TPS 57,822.5 meets real-time requirements
2. **Detection Performance**: Sensitivity 97.5%, Specificity 98.2%
3. **False Alarm Rate**: 1.77% - acceptable

### Recommendations


---

**Report Complete**  
*Generated using calibration_core.py v5.0.0 and protocol_guide.md standards.*
