export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRoleType = 'user' | 'admin';
export type UserMirrorRoleType = 'user' | 'admin' | 'super_admin' | 'member';

type TimestampColumns = {
  created_at?: string;
  updated_at?: string;
};

export interface Database {
  public: {
    Tables: {
      admin_emails: {
        Row: { email: string; created_at: string };
        Insert: { email: string; created_at?: string };
        Update: { email?: string; created_at?: string };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string;
          role: UserRoleType;
          provider: string;
          member_id: string | null;
          phone: string;
          faculty: string;
          university: string;
          status: 'active' | 'inactive' | 'pending';
          total_points: number;
          xp: number;
          level: string;
          is_verified: boolean;
          bio: string;
          interests: string[];
          linkedin_url: string;
          github_url: string;
          photo_url?: string;
          created_at: string;
          last_sign_in_at: string;
          last_seen_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          avatar_url?: string;
          role?: UserRoleType;
          provider?: string;
          member_id?: string | null;
          phone?: string;
          faculty?: string;
          university?: string;
          status?: 'active' | 'inactive' | 'pending';
          total_points?: number;
          xp?: number;
          level?: string;
          is_verified?: boolean;
          bio?: string;
          interests?: string[];
          linkedin_url?: string;
          github_url?: string;
          photo_url?: string;
          created_at?: string;
          last_sign_in_at?: string;
          last_seen_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']> & { [key: string]: any };
      };
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string;
          photo_url: string;
          role: UserMirrorRoleType;
          provider: string;
          member_id: string | null;
          phone: string;
          faculty: string;
          university: string;
          status: 'active' | 'inactive' | 'pending';
          total_points: number;
          xp: number;
          level: string;
          is_verified: boolean;
          created_at: string;
          last_sign_in_at: string;
          last_seen_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          avatar_url?: string;
          photo_url?: string;
          role?: UserMirrorRoleType;
          provider?: string;
          member_id?: string | null;
          phone?: string;
          faculty?: string;
          university?: string;
          status?: 'active' | 'inactive' | 'pending';
          total_points?: number;
          xp?: number;
          level?: string;
          is_verified?: boolean;
          created_at?: string;
          last_sign_in_at?: string;
          last_seen_at?: string;
          updated_at?: string;
          [key: string]: any;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']> & { [key: string]: any };
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
        Update: Partial<Database['public']['Tables']['auth_events']['Insert']>;
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
          language: 'ar' | 'en' | 'both';
          duration_hours: number;
          total_lessons: number;
          points_reward: number;
          instructor_name: string;
          instructor_title: string;
          enrolled_count: number;
          rating: number;
          rating_count: number;
          tags: string[];
          skills: string[];
          prerequisites: string[];
          is_featured: boolean;
          is_locked: boolean;
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
          language?: 'ar' | 'en' | 'both';
          duration_hours?: number;
          total_lessons?: number;
          points_reward?: number;
          instructor_name?: string;
          instructor_title?: string;
          enrolled_count?: number;
          rating?: number;
          rating_count?: number;
          tags?: string[];
          skills?: string[];
          prerequisites?: string[];
          is_featured?: boolean;
          is_locked?: boolean;
          is_published?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['courses']['Insert']>;
      };
      lessons: {
        Row: {
          id: string;
          course_id: string;
          module_id: string | null;
          title: string;
          type: 'video' | 'article' | 'quiz' | 'exercise' | 'project';
          content: string | null;
          video_url: string | null;
          position: number;
          duration_minutes: number;
          is_preview: boolean;
          points_reward: number;
          quiz_questions: Json;
          exercise_prompt: string;
          exercise_starter_code: string;
          exercise_solution: string;
          exercise_test_cases: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          module_id?: string | null;
          title: string;
          type?: 'video' | 'article' | 'quiz' | 'exercise' | 'project';
          content?: string | null;
          video_url?: string | null;
          position?: number;
          duration_minutes?: number;
          is_preview?: boolean;
          points_reward?: number;
          quiz_questions?: Json;
          exercise_prompt?: string;
          exercise_starter_code?: string;
          exercise_solution?: string;
          exercise_test_cases?: Json;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['lessons']['Insert']>;
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          enrolled_at: string;
          completed_lessons: string[];
          completed_modules: string[];
          progress_percent: number;
          is_completed: boolean;
          completed_at: string | null;
          last_accessed_at: string | null;
          last_lesson_id: string | null;
          status: 'active' | 'completed' | 'dropped';
          quiz_scores: Json;
          certificate_id: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          enrolled_at?: string;
          completed_lessons?: string[];
          completed_modules?: string[];
          progress_percent?: number;
          is_completed?: boolean;
          completed_at?: string | null;
          last_accessed_at?: string | null;
          last_lesson_id?: string | null;
          status?: 'active' | 'completed' | 'dropped';
          quiz_scores?: Json;
          certificate_id?: string | null;
        };
        Update: Partial<Database['public']['Tables']['enrollments']['Insert']>;
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
        Insert: TimestampColumns & {
          id?: string;
          title: string;
          date: string;
          location?: string;
          description?: string | null;
          capacity?: number;
          registered_count?: number;
          status?: string;
        };
        Update: Partial<Database['public']['Tables']['events']['Insert']>;
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          user_email: string;
          action: string;
          target: string | null;
          status: string;
          details: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          user_email?: string;
          action: string;
          target?: string | null;
          status?: string;
          details?: Json;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>;
      };
      staff: {
        Row: {
          id: string;
          name: string;
          role: string;
          category: string;
          image: string;
          socials: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          role: string;
          category?: string;
          image?: string;
          socials?: Json;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['staff']['Insert']>;
      };
      projects: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          status: string;
          members: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          status?: string;
          members?: string[];
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
      };
      blog: {
        Row: {
          id: string;
          title: string;
          content: string | null;
          author: string;
          date: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content?: string | null;
          author?: string;
          date?: string;
          status?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['blog']['Insert']>;
      };
      gallery: {
        Row: {
          id: string;
          url: string;
          title: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          url: string;
          title: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['gallery']['Insert']>;
      };
      messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          status: 'unread' | 'read' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          status?: 'unread' | 'read' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          message: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title: string;
          message: string;
          read?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
      settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['settings']['Insert']>;
      };
      points_log: {
        Row: {
          id: string;
          user_id: string;
          points: number;
          action: string;
          description: string;
          reference_id: string | null;
          reference_type: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          points: number;
          action: string;
          description: string;
          reference_id?: string | null;
          reference_type?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['points_log']['Insert']>;
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          badge_name: string;
          badge_icon: string;
          badge_color: string;
          description: string;
          is_new: boolean;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_id: string;
          badge_name: string;
          badge_icon?: string;
          badge_color?: string;
          description?: string;
          is_new?: boolean;
          unlocked_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_achievements']['Insert']>;
      };
      certificates: {
        Row: {
          id: string;
          user_id: string;
          user_full_name: string;
          course_id: string | null;
          course_title: string | null;
          event_id: string | null;
          event_title: string | null;
          type: 'course' | 'event' | 'achievement';
          pdf_url: string | null;
          share_url: string | null;
          verification_code: string;
          issued_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          user_full_name: string;
          course_id?: string | null;
          course_title?: string | null;
          event_id?: string | null;
          event_title?: string | null;
          type: 'course' | 'event' | 'achievement';
          pdf_url?: string | null;
          share_url?: string | null;
          verification_code: string;
          issued_at?: string;
        };
        Update: Partial<Database['public']['Tables']['certificates']['Insert']>;
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
      promote_admin_by_email: {
        Args: { admin_email: string };
        Returns: void;
      };
    };
  };
}
