/**
 * courseService.ts
 * Comprehensive service for managing Courses, Lessons, Enrollments, and Progress.
 * Fully integrated with Supabase Database (courses, lessons, enrollments) & Storage.
 * Operations require persisted Supabase data.
 */

import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  Course,
  CourseModule,
  CourseLesson,
  Enrollment,
} from '../types';
export interface CourseCursor { createdAt: string; id: string }
export interface CoursePage { items: Course[]; hasMore: boolean; nextCursor: CourseCursor | null }
export function courseModulesFromLessons(courseId: string, lessons: CourseLesson[]): CourseModule[] {
  const groups = new Map<string, CourseLesson[]>();
  for (const lesson of lessons) { const id = lesson.moduleId || `module-${courseId}`; const rows = groups.get(id) || []; rows.push(lesson); groups.set(id, rows); }
  return [...groups].map(([id, rows], index) => ({ id, courseId, title: groups.size === 1 ? 'Course Lessons' : `Module ${index + 1}`, description: '', order: index + 1, totalLessons: rows.length, durationMinutes: rows.reduce((sum, lesson) => sum + lesson.duration, 0) }));
}
function nonNegativeNumber(value: unknown, fallback: number, label: string): number {
  const number = value === undefined || value === null ? fallback : Number(value);
  if (!Number.isSafeInteger(number) || number < 0 || number > 100000) throw new Error(`${label} must be an integer from 0 to 100000.`);
  return number;
}
export function courseSlug(title: string, id: string): string {
  return title.normalize('NFKC').trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 160) || `course-${id}`;
}

const mapDatabaseCourse = (row: any): Course => {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description || '',
    shortDescription: row.short_description || row.shortDescription || '',
    instructorId: row.created_by || 'admin',
    instructorName: row.instructor_name || row.instructorName || '',
    instructorTitle: row.instructor_title || row.instructorTitle || '',
    coverImage: row.thumbnail_url || row.coverImage || '',
    category: row.category || 'data_science',
    level: row.level || 'beginner',
    language: row.language || 'both',
    durationHours: Number(row.duration_hours ?? row.durationHours ?? 0),
    totalLessons: Number(row.total_lessons ?? row.totalLessons ?? 0),
    enrolledCount: Number(row.enrolled_count || row.enrolledCount || 0),
    rating: Number(row.rating ?? 0),
    ratingCount: Number(row.rating_count ?? row.ratingCount ?? 0),
    tags: Array.isArray(row.tags) ? row.tags : [],
    skills: Array.isArray(row.skills) ? row.skills : [],
    prerequisites: Array.isArray(row.prerequisites) ? row.prerequisites : [],
    pointsReward: Number(row.points_reward ?? row.pointsReward ?? 500),
    status: row.is_published === false ? 'draft' : 'published',
    isFeatured: Boolean(row.is_featured),
    isLocked: Boolean(row.is_locked),
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
};

const mapDatabaseLesson = (row: any): CourseLesson => ({
  id: row.id,
  courseId: row.course_id,
  moduleId: row.module_id || `module-${row.course_id}`,
  title: row.title,
  type: row.type || (row.video_url ? 'video' : 'article'),
  content: row.content || '',
  videoUrl: row.video_url || '',
  duration: Number(row.duration_minutes ?? 20),
  order: Number(row.position || 1),
  isPreview: Boolean(row.is_preview),
  pointsReward: Number(row.points_reward ?? 30),
  quizQuestions: Array.isArray(row.quiz_questions) ? row.quiz_questions : [],
  exercisePrompt: row.exercise_prompt || '',
  exerciseStarterCode: row.exercise_starter_code || '',
  exerciseSolution: row.exercise_solution || '',
  exerciseTestCases: Array.isArray(row.exercise_test_cases) ? row.exercise_test_cases : [],
});

const mapDatabaseEnrollment = (row: any): Enrollment => ({
  id: row.id,
  userId: row.user_id,
  courseId: row.course_id,
  enrolledAt: row.enrolled_at || new Date().toISOString(),
  progress: Number(row.progress_percent || 0),
  completedLessons: row.completed_lessons || [],
  completedModules: row.completed_modules || [],
  lastAccessedAt: row.last_accessed_at || new Date().toISOString(),
  lastLessonId: row.last_lesson_id || undefined,
  status: row.status || (row.is_completed ? 'completed' : 'active'),
  quizScores: row.quiz_scores || {},
  completedAt: row.completed_at || undefined,
  certificateId: row.certificate_id || undefined,
});

const parseListInput = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String).map(v => v.trim()).filter(Boolean);
  if (typeof value !== 'string') return [];
  return value
    .split(',')
    .map(v => v.trim())
    .filter(Boolean);
};

export const courseService = {
  async getCoursePage(options: { cursor?: CourseCursor | null; search?: string; category?: string; level?: string; includeDrafts?: boolean; limit?: number; signal?: AbortSignal } = {}): Promise<CoursePage> {
    if (!isSupabaseConfigured) throw new Error('Database is not configured.');
    let query = supabase.rpc('list_course_catalog', { p_limit: options.limit ?? 24, p_after: options.cursor?.createdAt ?? null, p_after_id: options.cursor?.id ?? null, p_search: options.search?.trim() || '', p_category: options.category === 'all' ? null : options.category || null, p_level: options.level === 'all' ? null : options.level || null, p_include_drafts: Boolean(options.includeDrafts) });
    if (options.signal) query = query.abortSignal(options.signal);
    const { data, error } = await query;
    if (error) throw error;
    if (!data || !Array.isArray(data.items)) throw new Error('Unable to load the course catalog.');
    return { items: data.items.map(mapDatabaseCourse), hasMore: Boolean(data.hasMore), nextCursor: data.nextCursor || null };
  },
  async submitQuiz(lessonId: string, answers: Record<string, number>) {
    if (!isSupabaseConfigured) throw new Error('Database is not configured.');
    const { data, error } = await supabase.rpc('submit_course_quiz', { p_lesson_id: lessonId, p_answers: answers });
    if (error) throw error;
    if (data?.progress?.isCourseFinished && !data.progress.enrollment?.certificate_id) throw new Error('Course completed, but certificate issuance was not confirmed. Please reload.');
    return data as { scorePercentage: number; passed: boolean; progress: any };
  },
  /**
   * 1. Get all courses from Supabase
   */
  async getCourses(includeDrafts = false): Promise<Course[]> {
    if (isSupabaseConfigured) {
      try {
        let q = supabase
          .from('courses')
          .select('*')
          .order('created_at', { ascending: false }).limit(100);

        if (!includeDrafts) {
          q = q.eq('is_published', true);
        }

        const { data, error } = await q;
        if (error) throw error;
        if (data) {
          return data.map(mapDatabaseCourse);
        }
      } catch (err) {
        throw err;
      }
    }

    return [];
  },

  /**
   * 2. Get course by Slug
   */
  async getCourseBySlug(slug: string): Promise<Course | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          return mapDatabaseCourse(data);
        }
      } catch (err) {
        throw err;
      }
    }

    return null;
  },

  /**
   * 3. Get Course Modules
   */
  async getCourseModules(courseId: string): Promise<CourseModule[]> {
    const lessons = await this.getCourseLessons(courseId);
    if (lessons.length > 0) {
      const moduleIds = Array.from(new Set<string>(lessons.map(l => String(l.moduleId || `module-${courseId}`))));
      return moduleIds.map((moduleId, index) => {
        const moduleLessons = lessons.filter(l => (l.moduleId || `module-${courseId}`) === moduleId);
        return {
          id: moduleId,
          courseId,
          title: moduleIds.length === 1 ? 'Course Lessons' : `Module ${index + 1}`,
          description: 'Lessons managed from the Supabase lessons table.',
          order: index + 1,
          totalLessons: moduleLessons.length,
          durationMinutes: moduleLessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0),
        };
      });
    }

    if (isSupabaseConfigured) return [];

    return [];
  },

  /**
   * 4. Get Lessons for a course from Supabase
   */
  async getCourseLessons(courseId: string): Promise<CourseLesson[]> {
    if (!isSupabaseConfigured) throw new Error('Database is not configured.');
    const lessons: CourseLesson[] = [];
    for (let offset = 0; ; offset += 100) {
      const { data, error } = await supabase.from('lessons').select('*').eq('course_id', courseId).order('position', { ascending: true }).order('id', { ascending: true }).range(offset, offset + 99);
      if (error) throw error;
      lessons.push(...(data || []).map(mapDatabaseLesson));
      if (!data || data.length < 100) return lessons;
    }
  },

  /**
   * 5. Get user's enrollment for a course
   */
  async getUserEnrollment(userId: string, courseId: string): Promise<Enrollment | null> {
    if (!userId || !courseId) return null;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', userId)
          .eq('course_id', courseId)
          .maybeSingle();

        if (error) throw error;
        if (data) return mapDatabaseEnrollment(data);
      } catch (err) {
        throw err;
      }
    }

    return null;
  },

  /**
   * 6. Get all courses a user is enrolled in
   */
  async getUserEnrollments(userId: string, courseIds?: string[]): Promise<Enrollment[]> {
    if (!userId || courseIds?.length === 0) return [];
    if (!isSupabaseConfigured) throw new Error('Database is not configured.');
    const results: Enrollment[] = [];
    const ids = courseIds ? [...new Set(courseIds)] : undefined;
    const chunks = ids ? Array.from({ length: Math.ceil(ids.length / 100) }, (_, index) => ids.slice(index * 100, index * 100 + 100)) : [undefined];
    for (const chunk of chunks) {
      for (let offset = 0; ; offset += 100) {
        let query = supabase.from('enrollments').select('*').eq('user_id', userId).order('enrolled_at', { ascending: false }).order('id', { ascending: true }).range(offset, offset + 99);
        if (chunk) query = query.in('course_id', chunk);
        const { data, error } = await query;
        if (error) throw error;
        results.push(...(data || []).map(mapDatabaseEnrollment));
        if (!data || data.length < 100) break;
      }
    }
    return results;
  },

  async getCoursesByIds(courseIds: string[]): Promise<Course[]> {
    const ids = [...new Set(courseIds.filter(Boolean))], results: Course[] = [];
    if (!ids.length) return results;
    if (!isSupabaseConfigured) throw new Error('Database is not configured.');
    for (let index = 0; index < ids.length; index += 100) {
      const { data, error } = await supabase.from('courses').select('*').in('id', ids.slice(index, index + 100));
      if (error) throw error;
      results.push(...(data || []).map(mapDatabaseCourse));
    }
    return results;
  },

  /**
   * 7. Enroll user in a course
   */
  async enrollCourse(userId: string, courseId: string): Promise<Enrollment> {
 if (!isSupabaseConfigured) throw new Error('Database is not configured.');
 const { data: identity } = await supabase.auth.getSession();
 if (identity.session?.user.id !== userId) throw new Error('You can only enroll your own account.');
 const { data, error } = await supabase.rpc('enroll_course', { p_course_id: courseId });
 if (error) throw error; if (!data?.id) throw new Error('Enrollment was not saved.');
 return mapDatabaseEnrollment(data);
},

  /**
   * 8. Mark lesson complete & recalculate progress
   */
  async completeLesson(
    userId: string,
    courseId: string,
    lessonId: string,
    arg4: number = 10,
    arg5: number = 25
  ): Promise<{ enrollment: Enrollment; isCourseFinished: boolean; pointsAwarded: number }> {
 if (!isSupabaseConfigured) throw new Error('Database is not configured.');
 const { data: identity } = await supabase.auth.getSession();
 if (identity.session?.user.id !== userId) throw new Error('You can only update your own progress.');
 const { data, error } = await supabase.rpc('complete_course_lesson', { p_course_id: courseId, p_lesson_id: lessonId });
 if (error) throw error; if (!data?.enrollment) throw new Error('Progress was not saved.');
 if (data.isCourseFinished && !data.enrollment.certificate_id) throw new Error('Course completed, but certificate issuance was not confirmed. Please reload.');
 return { enrollment: mapDatabaseEnrollment(data.enrollment), isCourseFinished: data.isCourseFinished, pointsAwarded: data.pointsAwarded };
},

  /**
   * 9. Save or update course (Admin)
   */
  async saveCourse(courseData: Partial<Course>, createId?: string): Promise<Course> {
    const title = courseData.title?.trim();
    if (!title || title.length > 300) throw new Error('Course title is required and must be under 300 characters.');
    const id = courseData.id || createId || crypto.randomUUID();
    const slug = courseSlug(courseData.slug?.trim() || title, id);
    if (!courseData.id && courseData.status === 'published') throw new Error('Save the course as a draft, add lessons, then publish it.');

    if (isSupabaseConfigured) {
      try {
        let thumbnail = courseData.coverImage || null;
        if (thumbnail?.startsWith('data:')) {
          if (thumbnail.length > 7500000 || !/^data:image\/(png|jpeg|webp);base64,/.test(thumbnail)) throw new Error('Course cover must be JPEG, PNG or WebP under 5 MB.');
          const [header, encoded] = thumbnail.split(',');
          const type = header.slice(5, header.indexOf(';'));
          const bytes = Uint8Array.from(atob(encoded), character => character.charCodeAt(0));
          thumbnail = await this.uploadThumbnail(new File([bytes], `cover.${type.split('/')[1]}`, { type }), id);
        }
        const payload: any = {
          title,
          slug,
          description: courseData.description || '',
          short_description: courseData.shortDescription || '',
          instructor_name: courseData.instructorName || '',
          instructor_title: courseData.instructorTitle || '',
          thumbnail_url: thumbnail,
          category: courseData.category || 'data_science',
          level: courseData.level || 'beginner',
          language: courseData.language || 'both',
          duration_hours: nonNegativeNumber(courseData.durationHours, 0, 'Duration'),
          points_reward: nonNegativeNumber(courseData.pointsReward, 500, 'Course reward'),
          tags: parseListInput(courseData.tags),
          skills: parseListInput(courseData.skills),
          prerequisites: parseListInput(courseData.prerequisites),
          is_featured: Boolean(courseData.isFeatured),
          is_locked: Boolean(courseData.isLocked),
          is_published: courseData.status === 'published',
          ...(!courseData.id ? { rating: 0, rating_count: 0 } : {}),
          updated_at: new Date().toISOString(),
        };

        if (payload.description.length > 20000 || payload.short_description.length > 2000) throw new Error('Course description is too long.');
        let query;
        if (courseData.id) {
          query = supabase.from('courses').update(payload).eq('id', id);
          if (courseData.updatedAt) query = query.eq('updated_at', courseData.updatedAt);
        } else {
          // Stable draft ID makes a lost-response retry safe. Never conflict on
          // slug: a duplicate title must not overwrite a different course.
          query = supabase.from('courses').upsert({ ...payload, id }, { onConflict: 'id', ignoreDuplicates: true });
        }
        const { data, error } = await query.select().maybeSingle();
        if (error) {
          if (error.code === '23505') throw new Error('This course URL already exists. Choose a different URL slug.');
          throw error;
        }
        if (data) return mapDatabaseCourse(data);
        const { data: existing, error: readError } = await supabase.from('courses').select('*').eq('id', id).maybeSingle();
        if (readError) throw readError;
        if (existing && Object.entries(payload).every(([key, value]) => key === 'updated_at' || JSON.stringify(existing[key]) === JSON.stringify(value))) return mapDatabaseCourse(existing);
        throw new Error('This course changed in another session. Reload it before saving.');
      } catch (err) {
        console.warn('[courseService] Supabase saveCourse error:', err);
        throw err;
      }
    }

    throw new Error('Course was not saved. Check database configuration.');
  },

  /**
   * 10. Delete course (Admin)
   */
  async deleteCourse(courseId: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('courses').delete().eq('id', courseId);
        if (error) throw error;
        return;
      } catch (err) {
        console.warn('[courseService] Supabase deleteCourse error:', err);
        throw err;
      }
    }
    throw new Error('Database is not configured.');
  },

  async saveLesson(lessonData: Partial<CourseLesson> & { courseId: string }): Promise<CourseLesson> {
    const title = lessonData.title?.trim();
    if (!title || title.length > 300) throw new Error('Lesson title is required and must be under 300 characters.');
    if (lessonData.type === 'quiz') {
      const questions = lessonData.quizQuestions;
      if (!Array.isArray(questions) || !questions.length || questions.length > 100) throw new Error('A quiz needs 1 to 100 valid questions.');
      const ids = new Set<string>();
      for (const question of questions) {
        const correct = question.correctIndex ?? question.correctAnswer;
        if (!question.id || ids.has(question.id) || !question.question?.trim() || !Array.isArray(question.options) || question.options.length < 2 || question.options.length > 10 || question.options.some(option => !option?.trim()) || typeof correct !== 'number' || !Number.isInteger(correct) || correct < 0 || correct >= question.options.length) throw new Error('Each quiz question needs a unique ID, question, options and a valid correct answer.');
        ids.add(question.id);
      }
    }
    const payload = {
      course_id: lessonData.courseId,
      module_id: lessonData.moduleId && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(lessonData.moduleId) ? lessonData.moduleId : null,
      title,
      type: lessonData.type || 'article',
      content: lessonData.content || '',
      video_url: lessonData.videoUrl || null,
      position: Number(lessonData.order || 1),
      duration_minutes: nonNegativeNumber(lessonData.duration, 20, 'Duration'),
      is_preview: Boolean(lessonData.isPreview),
      points_reward: nonNegativeNumber(lessonData.pointsReward, 30, 'Lesson reward'),
      quiz_questions: lessonData.quizQuestions || [],
      exercise_prompt: lessonData.exercisePrompt || '',
      exercise_starter_code: lessonData.exerciseStarterCode || '',
      exercise_solution: lessonData.exerciseSolution || '',
      exercise_test_cases: lessonData.exerciseTestCases || [],
    };

    if (isSupabaseConfigured) {
      const query = supabase.from('lessons').upsert({ ...payload, id: lessonData.id || crypto.randomUUID() }, { onConflict: 'id' }).select().single();

      const { data, error } = await query;
      if (error) throw error;
      return mapDatabaseLesson(data);
    }

    throw new Error('Database is not configured.');
  },

  async deleteLesson(lessonId: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
      if (error) throw error;
    }
  },

  async setCoursePublished(courseId: string, isPublished: boolean): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('courses')
        .update({ is_published: isPublished, updated_at: new Date().toISOString() })
        .eq('id', courseId);
      if (error) throw error;
      return;
    }

    throw new Error('Database is not configured.');
  },

  /**
   * 11. Upload Course Thumbnail to Supabase Storage Bucket
   */
  async uploadThumbnail(file: File, courseId?: string): Promise<string> {
    if (!isSupabaseConfigured) { throw new Error('Database is not configured. No changes were saved.'); }
    if (file.size > 5 * 1024 * 1024 || !['image/png','image/jpeg','image/webp'].includes(file.type)) throw new Error('Course cover must be JPEG, PNG or WebP under 5 MB.');

    const ext = file.type.split('/')[1];
    const digest = courseId ? Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', await file.arrayBuffer()))).map(byte => byte.toString(16).padStart(2, '0')).join('') : crypto.randomUUID();
    const filePath = `thumbnails/${courseId || 'upload'}_${digest}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from('course-thumbnails')
      .upload(filePath, file, { cacheControl: '0', upsert: true });

    if (uploadErr) {
      console.warn('Supabase thumbnail upload error:', uploadErr);
      throw uploadErr;
    }

    const { data } = supabase.storage
      .from('course-thumbnails')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },
};
