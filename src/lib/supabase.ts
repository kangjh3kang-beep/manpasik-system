import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// 환경 변수가 없을 경우 더미 값 사용 (개발 모드용)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Supabase 클라이언트 생성 (환경 변수가 없으면 기능 제한됨)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Supabase가 제대로 설정되었는지 확인하는 플래그
export const isSupabaseConfigured = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
