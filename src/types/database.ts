export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          nickname: string | null;
          health_score: number;
          role: 'user' | 'admin' | 'researcher';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          nickname?: string | null;
          health_score?: number;
          role?: 'user' | 'admin' | 'researcher';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          nickname?: string | null;
          health_score?: number;
          role?: 'user' | 'admin' | 'researcher';
          created_at?: string;
          updated_at?: string;
        };
      };
      devices: {
        Row: {
          id: string;
          device_serial: string;
          owner_id: string | null;
          firmware_version: string;
          status: 'online' | 'offline' | 'error';
          last_sync_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          device_serial: string;
          owner_id?: string | null;
          firmware_version?: string;
          status?: 'online' | 'offline' | 'error';
          last_sync_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          device_serial?: string;
          owner_id?: string | null;
          firmware_version?: string;
          status?: 'online' | 'offline' | 'error';
          last_sync_at?: string | null;
          created_at?: string;
        };
      };
      cartridges: {
        Row: {
          id: string;
          device_id: string;
          cartridge_type: 'glucose' | 'radon' | 'cholesterol' | 'hemoglobin';
          remaining_uses: number;
          manufactured_at: string;
          expired_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          device_id: string;
          cartridge_type: 'glucose' | 'radon' | 'cholesterol' | 'hemoglobin';
          remaining_uses?: number;
          manufactured_at: string;
          expired_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          device_id?: string;
          cartridge_type?: 'glucose' | 'radon' | 'cholesterol' | 'hemoglobin';
          remaining_uses?: number;
          manufactured_at?: string;
          expired_at?: string;
          created_at?: string;
        };
      };
      measurements: {
        Row: {
          id: string;
          user_id: string;
          device_id: string | null;
          cartridge_id: string | null;
          measurement_type: string;
          value: number;
          unit: string;
          measured_at: string;
          location_lat: number | null;
          location_lng: number | null;
          environmental_data: Json | null;
          ai_analysis: Json | null;
          raw_signal_data: Json | null;
          quality_score: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          device_id?: string | null;
          cartridge_id?: string | null;
          measurement_type: string;
          value: number;
          unit: string;
          measured_at?: string;
          location_lat?: number | null;
          location_lng?: number | null;
          environmental_data?: Json | null;
          ai_analysis?: Json | null;
          raw_signal_data?: Json | null;
          quality_score?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          device_id?: string | null;
          cartridge_id?: string | null;
          measurement_type?: string;
          value?: number;
          unit?: string;
          measured_at?: string;
          location_lat?: number | null;
          location_lng?: number | null;
          environmental_data?: Json | null;
          ai_analysis?: Json | null;
          raw_signal_data?: Json | null;
          quality_score?: number | null;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

// 편의 타입 별칭
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Device = Database['public']['Tables']['devices']['Row'];
export type Cartridge = Database['public']['Tables']['cartridges']['Row'];
export type Measurement = Database['public']['Tables']['measurements']['Row'];
