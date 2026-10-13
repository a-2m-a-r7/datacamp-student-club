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
import { awardPoints } from './pointsService';

const mapDatabaseCourse = (row: any): Course => {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description || '',
    shortDescription: row.short_description || row.shortDescription || '',
    instructorId: row.created_by || 'admin',
    instructorName: row.instructor_name || row.instructorName || 'DataCamp Instructor',
    instructorTitle: row.instructor_title || row.instructorTitle || '',
    coverImage: row.thumbnail_url || row.coverImage || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
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
    pointsReward: Number(row.points_reward || row.pointsReward || 500),
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
  duration: Number(row.duration_minutes || 20),
  order: Number(row.position || 1),
  isPreview: Boolean(row.is_preview),
  pointsReward: Number(row.points_reward || 30),
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
          .order('created_at', { ascending: false });

        if (!includeDrafts) {
          q = q.eq('is_published', true);
        }

        const { data, error } = await q;
        if (!error && data) {
          return data.map(mapDatabaseCourse);
        }
      } catch (err) {
        console.warn('[courseService] Supabase getCourses error:', err);
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

        if (!error && data) {
          return mapDatabaseCourse(data);
        }
      } catch (err) {
        console.warn('[courseService] Supabase getCourseBySlug error:', err);
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
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', courseId)
          .order('position', { ascending: true });

        if (!error && data) {
          return data.map(mapDatabaseLesson);
        }
      } catch (err) {
        console.warn('[courseService] Supabase getCourseLessons error:', err);
      }
    }

    // Fallback to demo lessons
    return [];
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

        if (!error && data) return mapDatabaseEnrollment(data);
      } catch (err) {
        console.warn('[courseService] Supabase getUserEnrollment error:', err);
      }
    }

    return null;
  },

  /**
   * 6. Get all courses a user is enrolled in
   */
  async getUserEnrollments(userId: string): Promise<Enrollment[]> {
    if (!userId) return [];

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', userId)
          .order('enrolled_at', { ascending: false });

        if (!error && data) return data.map(mapDatabaseEnrollment);
      } catch (err) {
        console.warn('[courseService] Supabase getUserEnrollments error:', err);
      }
    }

    return [];
  },

  async getCoursesByIds(courseIds: string[]): Promise<Course[]> {
    const uniqueIds = Array.from(new Set(courseIds.filter(Boolean)));
    if (uniqueIds.length === 0) return [];

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .in('id', uniqueIds);

      if (error) throw error;
      return (data || []).map(mapDatabaseCourse);
    }

    return [];
  },

  /**
   * 7. Enroll user in a course
   */
  async enrollCourse(userId: string, courseId: string): Promise<Enrollment> {
 if (!isSupabaseConfigured) throw new Error('Database is not configured.');
 const { data: identity } = await supabase.auth.getUser();
 if (identity.user?.id !== userId) throw new Error('You can only enroll your own account.');
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
 const { data: identity } = await supabase.auth.getUser();
 if (identity.user?.id !== userId) throw new Error('You can only update your own progress.');
 const { data, error } = await supabase.rpc('complete_course_lesson', { p_course_id: courseId, p_lesson_id: lessonId });
 if (error) throw error; if (!data?.enrollment) throw new Error('Progress was not saved.');
 if (data.isCourseFinished && !data.enrollment.certificate_id) throw new Error('Course completed, but certificate issuance was not confirmed. Please reload.');
 return { enrollment: mapDatabaseEnrollment(data.enrollment), isCourseFinished: data.isCourseFinished, pointsAwarded: data.pointsAwarded };
},

  /**
   * 9. Save or update course (Admin)
   */
  async saveCourse(courseData: Partial<Course>): Promise<Course> {
    const isNew = !courseData.id || courseData.id.startsWith('course-') && !courseData.id.includes('-');
    const slug = courseData.slug || (courseData.title || 'course')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (isSupabaseConfigured) {
      try {
        const payload: any = {
          title: courseData.title || 'Untitled Course',
          slug,
          description: courseData.description || '',
          short_description: courseData.shortDescription || '',
          instructor_name: courseData.instructorName || 'DataCamp Instructor',
          instructor_title: courseData.instructorTitle || '',
          thumbnail_url: courseData.coverImage || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
          category: courseData.category || 'data_science',
          level: courseData.level || 'beginner',
          language: courseData.language || 'both',
          duration_hours: Number(courseData.durationHours) || 12,
          total_lessons: Number(courseData.totalLessons) || 10,
          points_reward: Number(courseData.pointsReward) || 500,
          tags: parseListInput(courseData.tags),
          skills: parseListInput(courseData.skills),
          prerequisites: parseListInput(courseData.prerequisites),
          is_featured: Boolean(courseData.isFeatured),
          is_locked: Boolean(courseData.isLocked),
          is_published: courseData.status === 'published',
          updated_at: new Date().toISOString(),
        };

        if (courseData.id && !courseData.id.startsWith('mock_')) {
          payload.id = courseData.id;
        }

        const { data, error } = await supabase
          .from('courses')
          .upsert(payload, { onConflict: 'slug' })
          .select()
          .single();

        if (error) throw error;
        if (data) return mapDatabaseCourse(data);
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
    const payload = {
      course_id: lessonData.courseId,
      module_id: lessonData.moduleId || null,
      title: lessonData.title || 'Untitled Lesson',
      type: lessonData.type || 'article',
      content: lessonData.content || '',
      video_url: lessonData.videoUrl || null,
      position: Number(lessonData.order || 1),
      duration_minutes: Number(lessonData.duration || 20),
      is_preview: Boolean(lessonData.isPreview),
      points_reward: Number(lessonData.pointsReward || 30),
      quiz_questions: lessonData.quizQuestions || [],
      exercise_prompt: lessonData.exercisePrompt || '',
      exercise_starter_code: lessonData.exerciseStarterCode || '',
      exercise_solution: lessonData.exerciseSolution || '',
      exercise_test_cases: lessonData.exerciseTestCases || [],
    };

    if (isSupabaseConfigured) {
      const query = lessonData.id
        ? supabase.from('lessons').update(payload).eq('id', lessonData.id).select().single()
        : supabase.from('lessons').insert(payload).select().single();

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
  async uploadThumbnail(file: File): Promise<string> {
    if (!isSupabaseConfigured) { throw new Error('Database is not configured. No changes were saved.'); }

    const ext = file.name.split('.').pop() || 'png';
    const filePath = `thumbnails/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

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
