export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRoleType = 'user' | 'admin';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string;
          role: string;
          provider: string;
          member_id: string | null;
          phone: string;
          faculty: string;
          university: string;
          total_points: number;
          level: string;
          is_verified: boolean;
          photo_url?: string;
          created_at: string;
          last_sign_in_at: string;
          last_seen_at: string;
          updated_at?: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          avatar_url?: string;
          role?: string;
          provider?: string;
          member_id?: string | null;
          phone?: string;
          faculty?: string;
          university?: string;
          total_points?: number;
          level?: string;
          is_verified?: boolean;
          photo_url?: string;
          created_at?: string;
          last_sign_in_at?: string;
          last_seen_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string;
          role?: string;
          provider?: string;
          member_id?: string | null;
          phone?: string;
          faculty?: string;
          university?: string;
          total_points?: number;
          level?: string;
          is_verified?: boolean;
          photo_url?: string;
          created_at?: string;
          last_sign_in_at?: string;
          last_seen_at?: string;
          updated_at?: string;
          [key: string]: any;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url?: string;
          role: string;
          provider?: string;
          member_id: string | null;
          phone?: string;
          faculty?: string;
          university?: string;
          total_points?: number;
          level?: string;
          is_verified?: boolean;
          photo_url?: string;
          created_at: string;
          last_sign_in_at?: string;
          last_seen_at?: string;
          updated_at?: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          avatar_url?: string;
          role?: string;
          provider?: string;
          member_id?: string | null;
          phone?: string;
          faculty?: string;
          university?: string;
          total_points?: number;
          level?: string;
          is_verified?: boolean;
          photo_url?: string;
          created_at?: string;
          last_sign_in_at?: string;
          last_seen_at?: string;
          updated_at?: string;
          [key: string]: any;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string;
          role?: string;
          provider?: string;
          member_id?: string | null;
          phone?: string;
          faculty?: string;
          university?: string;
          total_points?: number;
          level?: string;
          is_verified?: boolean;
          photo_url?: string;
          created_at?: string;
          last_sign_in_at?: string;
          last_seen_at?: string;
          updated_at?: string;
          [key: string]: any;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          action: string;
          user_email: string | null;
          target: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          action: string;
          user_email?: string | null;
          target?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          action?: string;
          user_email?: string | null;
          target?: string | null;
          status?: string;
          created_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          date: string;
          location: string;
          description: string | null;
          capacity: number;
          registered_count: number;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          date: string;
          location: string;
          description?: string | null;
          capacity?: number;
          registered_count?: number;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          date?: string;
          location?: string;
          description?: string | null;
          capacity?: number;
          registered_count?: number;
          status?: string;
          created_at?: string;
        };
      };
      auth_events: {
        Row: {
          id: string;
          user_id: string | null;
          email: string;
          event_type: 'signup' | 'login' | 'logout';
          provider: 'email' | 'google';
          user_agent: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          email: string;
          event_type: 'signup' | 'login' | 'logout';
          provider: 'email' | 'google';
          user_agent?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          email?: string;
          event_type?: 'signup' | 'login' | 'logout';
          provider?: 'email' | 'google';
          user_agent?: string;
          created_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          short_description: string | null;
          thumbnail_url: string | null;
          price: number;
          category: string;
          level: string;
          duration_hours: number;
          total_lessons: number;
          points_reward: number;
          instructor_name: string;
          instructor_title: string;
          is_published: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          short_description?: string | null;
          thumbnail_url?: string | null;
          price?: number;
          category?: string;
          level?: string;
          duration_hours?: number;
          total_lessons?: number;
          points_reward?: number;
          instructor_name?: string;
          instructor_title?: string;
          is_published?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          short_description?: string | null;
          thumbnail_url?: string | null;
          price?: number;
          category?: string;
          level?: string;
          duration_hours?: number;
          total_lessons?: number;
          points_reward?: number;
          instructor_name?: string;
          instructor_title?: string;
          is_published?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          content: string | null;
          video_url: string | null;
          position: number;
          duration_minutes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          content?: string | null;
          video_url?: string | null;
          position?: number;
          duration_minutes?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          content?: string | null;
          video_url?: string | null;
          position?: number;
          duration_minutes?: number;
          created_at?: string;
        };
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          enrolled_at: string;
          completed_lessons: string[];
          progress_percent: number;
          is_completed: boolean;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          enrolled_at?: string;
          completed_lessons?: string[];
          progress_percent?: number;
          is_completed?: boolean;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          enrolled_at?: string;
          completed_lessons?: string[];
          progress_percent?: number;
          is_completed?: boolean;
          completed_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
  };
}
