from typing import Any
import json
import os
from mcp.server.fastmcp import FastMCP
import pandas as pd
import numpy as np
import pydicom
from docx import Document
from scipy.io import loadmat

# 1. MCP 서버 초기화 (서버명: 만파식 연구소)
mcp = FastMCP("Manpasik Lab")

# 2. 엑셀/CSV 데이터 분석 도구
@mcp.tool()
def read_medical_excel(filepath: str) -> str:
    """의료용 엑셀 파일(.xlsx)을 읽어서 주요 통계 및 헤더 정보를 반환합니다."""
    try:
        # 파일 경로 처리 (Windows 역슬래시 호환)
        filepath = os.path.abspath(filepath)
        
        df = pd.read_excel(filepath)
        summary = {
            "file": os.path.basename(filepath),
            "columns": df.columns.tolist(),
            "row_count": len(df),
            "preview": df.head(5).to_dict(orient='records'),
            "statistics": df.describe().to_dict()
        }
        return json.dumps(summary, ensure_ascii=False, indent=2)
    except Exception as e:
        return f"Error reading Excel: {str(e)}"

# 3. 바이너리 센서 데이터(펌웨어 덤프) 분석 도구
@mcp.tool()
def analyze_sensor_binary(filepath: str, dtype: str = 'float32') -> str:
    """
    펌웨어에서 덤프된 바이너리(.bin, .dat) 센서 데이터를 읽고 기본 신호 분석을 수행합니다.
    Args:
        filepath: 파일 경로
        dtype: 데이터 타입 (float32, int16, float64 등)
    """
    try:
        filepath = os.path.abspath(filepath)
        # 바이너리 데이터 로드
        data = np.fromfile(filepath, dtype=np.dtype(dtype))
        
        # 데이터가 너무 크면 앞부분만 요약
        preview_size = 100
        stats = {
            "file": os.path.basename(filepath),
            "total_samples": len(data),
            "min_val": float(np.min(data)),
            "max_val": float(np.max(data)),
            "mean_val": float(np.mean(data)),
            "std_dev": float(np.std(data)),
            "preview_first_100": data[:preview_size].tolist()
        }
        return json.dumps(stats, indent=2)
    except Exception as e:
        return f"Error analyzing binary: {str(e)}"

# 4. DICOM 의료 영상 메타데이터 추출 도구
@mcp.tool()
def read_dicom_metadata(filepath: str) -> str:
    """DICOM 의료 영상 파일(.dcm)의 환자 정보 및 촬영 메타데이터를 추출합니다."""
    try:
        filepath = os.path.abspath(filepath)
        ds = pydicom.dcmread(filepath)
        metadata = {
            "PatientID": getattr(ds, "PatientID", "N/A"),
            "Modality": getattr(ds, "Modality", "N/A"),
            "StudyDate": getattr(ds, "StudyDate", "N/A"),
            "BodyPartExamined": getattr(ds, "BodyPartExamined", "N/A"),
            "ImageSize": f"{ds.Rows}x{ds.Columns}" if hasattr(ds, 'Rows') else "N/A"
        }
        return json.dumps(metadata, ensure_ascii=False, indent=2)
    except Exception as e:
        return f"Error reading DICOM: {str(e)}"

# 5. 워드 문서(.docx) 텍스트 추출 도구
@mcp.tool()
def read_docx_text(filepath: str) -> str:
    """연구 보고서나 논문 초안(.docx)의 텍스트 내용을 읽어옵니다."""
    try:
        filepath = os.path.abspath(filepath)
        doc = Document(filepath)
        full_text = [para.text for para in doc.paragraphs if para.text.strip()]
        return "\n".join(full_text)
    except Exception as e:
        return f"Error reading DOCX: {str(e)}"

if __name__ == "__main__":
    # 서버 실행
    mcp.run()