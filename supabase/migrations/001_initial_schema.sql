-- 만파식(Manpasik) 초기 데이터베이스 스키마
-- 생성일: 2026-01-06
-- 설명: 헬스케어 플랫폼 핵심 테이블 정의

-- =====================================================
-- 1. profiles 테이블 (사용자 프로필)
-- Supabase Auth와 연동되며, auth.users 테이블과 1:1 관계
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  nickname TEXT,
  health_score INTEGER DEFAULT 0 CHECK (health_score >= 0 AND health_score <= 100),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'researcher')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 새 사용자 가입 시 자동으로 profiles 레코드 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거가 존재하면 삭제 후 재생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 2. devices 테이블 (만파식 리더기)
-- =====================================================
CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_serial TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  firmware_version TEXT DEFAULT '1.0.0',
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'error')),
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. cartridges 테이블 (측정 카트리지)
-- =====================================================
CREATE TABLE IF NOT EXISTS cartridges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  cartridge_type TEXT NOT NULL CHECK (cartridge_type IN ('glucose', 'radon', 'cholesterol', 'hemoglobin')),
  remaining_uses INTEGER DEFAULT 50 CHECK (remaining_uses >= 0),
  manufactured_at DATE NOT NULL,
  expired_at DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. measurements 테이블 (측정 데이터)
-- AI 학습을 위해 정밀하게 설계됨
-- =====================================================
CREATE TABLE IF NOT EXISTS measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
  cartridge_id UUID REFERENCES cartridges(id) ON DELETE SET NULL,
  
  -- 측정 기본 정보
  measurement_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  measured_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 위치 정보 (선택적)
  location_lat NUMERIC,
  location_lng NUMERIC,
  
  -- AI/ML 학습용 확장 데이터
  environmental_data JSONB,    -- 온도, 습도, 기압 등
  ai_analysis JSONB,           -- AI 분석 결과
  raw_signal_data JSONB,       -- 원본 센서 신호 데이터
  quality_score NUMERIC CHECK (quality_score >= 0 AND quality_score <= 100),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 인덱스 (쿼리 성능 최적화)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_measurements_user_id ON measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_measurements_measured_at ON measurements(measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_measurements_type ON measurements(measurement_type);
CREATE INDEX IF NOT EXISTS idx_devices_owner_id ON devices(owner_id);
CREATE INDEX IF NOT EXISTS idx_cartridges_device_id ON cartridges(device_id);

-- =====================================================
-- Row Level Security (RLS) 정책
-- 사용자는 자신의 데이터만 접근 가능
-- =====================================================

-- profiles 테이블 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- devices 테이블 RLS
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own devices"
  ON devices FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Users can insert own devices"
  ON devices FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own devices"
  ON devices FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own devices"
  ON devices FOR DELETE
  USING (owner_id = auth.uid());

-- cartridges 테이블 RLS
ALTER TABLE cartridges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view cartridges of own devices"
  ON cartridges FOR SELECT
  USING (
    device_id IN (
      SELECT id FROM devices WHERE owner_id = auth.uid()
    )
  );

-- measurements 테이블 RLS
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own measurements"
  ON measurements FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own measurements"
  ON measurements FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- 완료 메시지
-- =====================================================
-- 마이그레이션이 성공적으로 완료되었습니다.
-- Supabase 대시보드의 SQL Editor에서 이 스크립트를 실행하세요.
