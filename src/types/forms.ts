/**
 * src/types/forms.ts
 * Comprehensive types for Microsoft Forms-inspired Form Builder feature
 */

export type FormStatus = 'draft' | 'published' | 'closed';

export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'single_choice'
  | 'multiple_choice'
  | 'dropdown'
  | 'rating'
  | 'linear_scale'
  | 'date'
  | 'time'
  | 'number'
  | 'email'
  | 'file_upload'
  | 'ranking'
  | 'section_header';

export interface FormTheme {
  primaryColor: string;
  accentColor: string;
  backgroundStyle: 'cyber' | 'gradient' | 'minimal' | 'glow';
  coverImage?: string | null;
}

export interface ChoiceOption {
  id: string;
  text: string;
  isOther?: boolean;
  goToQuestionId?: string | 'next' | 'end'; // Branching logic
}

export interface QuestionSettings {
  min?: number;
  max?: number;
  step?: number;
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
  ratingIcon?: 'star' | 'heart' | 'thumb' | 'number';
  maxRating?: number; // 5 or 10
  placeholder?: string;
  allowedFileTypes?: string[];
  maxFileSizeMB?: number;
  shuffleOptions?: boolean;
  sectionDescription?: string;
}

export interface FormQuestion {
  id: string;
  form_id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  position: number;
  options: ChoiceOption[];
  settings: QuestionSettings;
  created_at?: string;
}

export interface FormRecord {
  id: string;
  title: string;
  description: string;
  slug: string;
  status: FormStatus;
  theme: FormTheme;
  allow_anonymous: boolean;
  one_response_per_user: boolean;
  collect_email: boolean;
  opens_at: string | null;
  closes_at: string | null;
  success_message: string;
  sheets_sync_enabled: boolean;
  spreadsheet_id: string | null;
  spreadsheet_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  response_count?: number;
}

export interface FormResponse {
  id: string;
  form_id: string;
  respondent_id: string | null;
  respondent_email: string | null;
  submitted_at: string;
  metadata: {
    browser?: string;
    os?: string;
    ipHash?: string;
    completionSeconds?: number;
  };
  answers?: FormAnswer[];
  respondent_profile?: {
    full_name?: string;
    avatar_url?: string;
    email?: string;
  };
}

export interface FormAnswer {
  id?: string;
  response_id?: string;
  question_id: string;
  value: any; // string, string[], number, or { url: string; name: string; size: number }
  created_at?: string;
}

export interface SyncLog {
  id: string;
  form_id: string;
  response_id: string | null;
  status: 'pending' | 'synced' | 'failed' | 'retrying';
  error: string | null;
  details?: any;
  created_at: string;
}

// Question Type Metadata for the Builder Picker
export interface QuestionTypeMeta {
  type: QuestionType;
  labelEn: string;
  labelAr: string;
  iconName: string;
  category: 'text' | 'choice' | 'scale' | 'date_number' | 'special';
  descriptionEn: string;
  descriptionAr: string;
}
