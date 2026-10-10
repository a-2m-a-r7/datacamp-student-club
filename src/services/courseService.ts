/**
 * courseService.ts
 * Comprehensive service for managing Courses, Lessons, Enrollments, and Progress.
 * Fully integrated with Supabase Database (courses, lessons, enrollments) & Storage.
 * Local seed data is only used when Supabase is not configured.
 */

import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  Course,
  CourseModule,
  CourseLesson,
  Enrollment,
} from '../types';
import { awardPoints } from './pointsService';

// ─── RICH SEED / DEMO COURSES CATALOG ────────────────────────────────────────

export const DEMO_COURSES: Course[] = [
  {
    id: 'course-py-data',
    slug: 'python-for-data-science',
    title: 'Python for Data Science & AI',
    description: 'Master Python programming fundamentals, NumPy, Pandas, Data Cleaning, Visualization, and essential libraries for machine learning and real-world analytics.',
    shortDescription: 'From Python syntax to advanced data manipulation with Pandas & NumPy.',
    instructorId: 'demo-inst-1',
    instructorName: 'Dr. Tamer Mostafa',
    instructorTitle: 'Lead AI Researcher & Club Advisor',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    category: 'data_science',
    level: 'beginner',
    language: 'both',
    durationHours: 24,
    totalLessons: 18,
    enrolledCount: 142,
    rating: 4.9,
    ratingCount: 38,
    tags: ['Python', 'Pandas', 'NumPy', 'Data Analysis', 'Jupyter'],
    skills: ['Python Scripting', 'Data Wrangling', 'Exploratory Data Analysis', 'Statistical Thinking'],
    prerequisites: ['Basic Computer Literacy'],
    pointsReward: 500,
    status: 'published',
    isFeatured: true,
    isLocked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'course-ml-essentials',
    slug: 'machine-learning-essentials',
    title: 'Machine Learning Fundamentals & Scikit-Learn',
    description: 'Understand core supervised and unsupervised algorithms: Linear Regression, Decision Trees, Random Forests, K-Means clustering, and model evaluation metrics.',
    shortDescription: 'Build predictive models and master the foundational ML algorithms.',
    instructorId: 'demo-inst-2',
    instructorName: 'Eng. Sarah Al-Sayed',
    instructorTitle: 'DataCamp Club Machine Learning Lead',
    coverImage: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&auto=format&fit=crop&q=80',
    category: 'ai_ml',
    level: 'intermediate',
    language: 'both',
    durationHours: 32,
    totalLessons: 22,
    enrolledCount: 98,
    rating: 4.8,
    ratingCount: 29,
    tags: ['Machine Learning', 'Scikit-Learn', 'Algorithms', 'Regression', 'Classification'],
    skills: ['Model Training', 'Cross Validation', 'Hyperparameter Tuning', 'Feature Engineering'],
    prerequisites: ['Python for Data Science & AI'],
    pointsReward: 650,
    status: 'published',
    isFeatured: true,
    isLocked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'course-bi-sql',
    slug: 'sql-powerbi-mastery',
    title: 'SQL & Power BI Business Intelligence',
    description: 'Extract business insights using complex SQL queries, relational joins, aggregation, and translate them into interactive Power BI corporate dashboards.',
    shortDescription: 'Master relational databases, SQL queries, and interactive Power BI dashboards.',
    instructorId: 'demo-inst-3',
    instructorName: 'Karim Ezzat',
    instructorTitle: 'Senior BI Analyst',
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    category: 'business_intelligence',
    level: 'beginner',
    language: 'ar',
    durationHours: 18,
    totalLessons: 14,
    enrolledCount: 85,
    rating: 4.7,
    ratingCount: 21,
    tags: ['SQL', 'Power BI', 'Databases', 'Dashboards', 'Analytics'],
    skills: ['Relational Schema Design', 'Complex SQL Joins', 'DAX Formulas', 'Visual Storytelling'],
    prerequisites: ['None'],
    pointsReward: 450,
    status: 'published',
    isFeatured: false,
    isLocked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const DEMO_MODULES_PYTHON: CourseModule[] = [
  {
    id: 'mod-1',
    courseId: 'course-py-data',
    title: 'Unit 1: Python Core Foundations for Data',
    description: 'Data structures, vectorized logic, and execution environments.',
    order: 1,
    totalLessons: 3,
    durationMinutes: 60,
  },
  {
    id: 'mod-2',
    courseId: 'course-py-data',
    title: 'Unit 2: NumPy & Multi-Dimensional Matrices',
    description: 'Array manipulations, matrix operations, and vectorized computations.',
    order: 2,
    totalLessons: 1,
    durationMinutes: 25,
  },
  {
    id: 'mod-3',
    courseId: 'course-py-data',
    title: 'Unit 3: Pandas for Data Wrangling & Analytics',
    description: 'DataFrames, series, indexing, missing values, grouping, and aggregations.',
    order: 3,
    totalLessons: 1,
    durationMinutes: 35,
  },
];

export const DEMO_LESSONS_PYTHON: CourseLesson[] = [
  {
    id: 'les-py-1',
    courseId: 'course-py-data',
    moduleId: 'mod-1',
    title: '01. Setting Up the Data Environment: Jupyter & VS Code',
    type: 'video',
    duration: 18,
    order: 1,
    isPreview: true,
    pointsReward: 25,
    videoUrl: 'https://www.youtube.com/embed/kqtD5dpn9C8',
    content: `### Welcome to DataCamp Academy
In this unit, we set up Python 3.11+, Conda virtual environments, and Jupyter Notebooks.
\`\`\`bash
# Create isolated environment
conda create -n datacamp python=3.11 -y
conda activate datacamp
pip install numpy pandas matplotlib seaborn jupyter
\`\`\`
`,
    exercisePrompt: "Write Python code to calculate total members enrolled: [15, 25, 40] and print: 'Total: 80'",
    exerciseStarterCode: `members = [15, 25, 40]\ntotal = sum(members)\nprint(f"Total: {total}")\n`,
    exerciseTestCases: [
      { description: "Prints correct sum", expectedOutput: "Total: 80" }
    ],
  },
  {
    id: 'les-py-2',
    courseId: 'course-py-data',
    moduleId: 'mod-1',
    title: '02. Pythonic Data Structures: Lists, Tuples & Dicts',
    type: 'article',
    duration: 25,
    order: 2,
    isPreview: true,
    pointsReward: 30,
    content: `### Efficient Data Structures in Python
Understanding memory efficiency between Lists, Sets, and Tuples.
\`\`\`python
# Dictionary manipulation
student = {
    "name": "Ammar Tahoun",
    "faculty": "CS & AI",
    "courses": ["Python", "ML", "SQL"],
    "points": 1250
}
print(student.get("points"))
\`\`\`
`,
    exercisePrompt: "Task: Calculate the average grade and top score.",
    exerciseStarterCode: `marks = [75, 88, 92, 60, 95]\navg = sum(marks) / len(marks)\ntop = max(marks)\nprint(f"Average: {avg:.1f}")\nprint(f"Top: {top}")\n`,
    exerciseTestCases: [
      { description: "Calculates average score correctly", expectedOutput: "Average: 82.0" },
      { description: "Identifies maximum score", expectedOutput: "Top: 95" }
    ],
  },
  {
    id: 'les-py-3',
    courseId: 'course-py-data',
    moduleId: 'mod-1',
    title: '03. Knowledge Assessment: Python Basics Quiz',
    type: 'quiz',
    duration: 15,
    order: 3,
    isPreview: false,
    pointsReward: 40,
    content: 'Test your understanding of Python variables, collections, and execution flow.',
    quizQuestions: [
      {
        id: 'q1',
        question: 'Which of the following data structures is immutable in Python?',
        options: ['List', 'Dictionary', 'Tuple', 'Set'],
        correctAnswer: 2,
        explanation: 'Tuples cannot be modified after creation, making them immutable.',
      },
    ],
  },
];

// In-memory demo store
let demoEnrollmentsStore: Enrollment[] = [
  {
    id: 'enr-demo-1',
    userId: 'demo-user-1',
    courseId: 'course-py-data',
    enrolledAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    progress: 40,
    completedLessons: ['les-py-1', 'les-py-2'],
    completedModules: ['mod-1'],
    lastAccessedAt: new Date().toISOString(),
    lastLessonId: 'les-py-3',
    status: 'active',
    quizScores: {},
  },
];

let demoCoursesStore: Course[] = [...DEMO_COURSES];

// Helper to convert database course row to UI Course object
const mapDatabaseCourse = (row: any): Course => {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description || '',
    shortDescription: row.short_description || row.shortDescription || '',
    instructorId: row.created_by || 'admin',
    instructorName: row.instructor_name || row.instructorName || 'DataCamp Instructor',
    instructorTitle: row.instructor_title || row.instructorTitle || 'Lead AI Researcher',
    coverImage: row.thumbnail_url || row.coverImage || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
    category: row.category || 'data_science',
    level: row.level || 'beginner',
    language: row.language || 'both',
    durationHours: Number(row.duration_hours || row.durationHours || 12),
    totalLessons: Number(row.total_lessons || row.totalLessons || 10),
    enrolledCount: Number(row.enrolled_count || row.enrolledCount || 0),
    rating: Number(row.rating || 4.9),
    ratingCount: Number(row.rating_count || row.ratingCount || 25),
    tags: Array.isArray(row.tags) ? row.tags : [],
    skills: Array.isArray(row.skills) ? row.skills : [],
    prerequisites: Array.isArray(row.prerequisites) ? row.prerequisites : [],
    pointsReward: Number(row.points_reward || row.pointsReward || 500),
    status: row.is_published === false ? 'draft' : 'published',
    isFeatured: true,
    isLocked: false,
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

    return includeDrafts
      ? demoCoursesStore
      : demoCoursesStore.filter(c => c.status === 'published');
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

    return isSupabaseConfigured ? null : demoCoursesStore.find(c => c.slug === slug) ?? null;
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

    // If demo python course or fallback
    if (courseId === 'course-py-data' || courseId.includes('python')) {
      return DEMO_MODULES_PYTHON.map(m => ({ ...m, courseId }));
    }

    // Default 2-unit module wrapper
    return [
      {
        id: `mod-${courseId}-1`,
        courseId,
        title: 'Unit 1: Core Fundamentals & Principles',
        description: 'Foundational concepts and practical applications.',
        order: 1,
        totalLessons: 4,
        durationMinutes: 80,
      },
      {
        id: `mod-${courseId}-2`,
        courseId,
        title: 'Unit 2: Advanced Case Studies & Projects',
        description: 'Hands-on projects and industry applications.',
        order: 2,
        totalLessons: 4,
        durationMinutes: 90,
      },
    ];
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
    return isSupabaseConfigured ? [] : DEMO_LESSONS_PYTHON.map(l => ({ ...l, courseId }));
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

    return isSupabaseConfigured ? null : demoEnrollmentsStore.find(e => e.userId === userId && e.courseId === courseId) ?? null;
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

    return isSupabaseConfigured ? [] : demoEnrollmentsStore.filter(e => e.userId === userId);
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

    return demoCoursesStore.filter(c => uniqueIds.includes(c.id || ''));
  },

  /**
   * 7. Enroll user in a course
   */
  async enrollCourse(userId: string, courseId: string): Promise<Enrollment> {
    const existing = await this.getUserEnrollment(userId, courseId);
    if (existing) return existing;

    const newEnrollment: Enrollment = {
      id: `enr-${Date.now()}`,
      userId,
      courseId,
      enrolledAt: new Date().toISOString(),
      progress: 0,
      completedLessons: [],
      completedModules: [],
      lastAccessedAt: new Date().toISOString(),
      status: 'active',
      quizScores: {},
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('enrollments')
          .upsert({
            user_id: userId,
            course_id: courseId,
            progress_percent: 0,
            completed_lessons: [],
            is_completed: false,
            enrolled_at: new Date().toISOString(),
            last_accessed_at: new Date().toISOString()
          }, { onConflict: 'user_id,course_id' })
          .select()
          .maybeSingle();

        if (!error && data) {
          return mapDatabaseEnrollment(data);
        }

        if (error) {
          throw error;
        }
      } catch (err) {
        console.warn('[courseService] Supabase enrollCourse error:', err);
        throw err;
      }
    } else {
      demoEnrollmentsStore.push(newEnrollment);
    }

    // Award +50 XP for enrolling in a club course
    try {
      await awardPoints({
        userId,
        action: 'COURSE_ENROLL',
        description: 'Enrolled in club course',
        referenceId: courseId,
        referenceType: 'course',
      });
    } catch {}

    return newEnrollment;
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
    // Resolve totalLessons vs pointsReward safely
    const totalLessons = arg4 >= 1 && arg4 <= 50 ? arg4 : (arg5 >= 1 && arg5 <= 50 ? arg5 : 10);
    const lessonPoints = arg4 > 50 ? arg4 : (arg5 > 0 ? arg5 : 30);

    let enrollment = await this.getUserEnrollment(userId, courseId);
    if (!enrollment) {
      enrollment = await this.enrollCourse(userId, courseId);
    }

    const completed = new Set(enrollment.completedLessons || []);
    completed.add(lessonId);
    const updatedCompletedLessons = Array.from(completed);

    const progress = Math.min(100, Math.round((updatedCompletedLessons.length / Math.max(1, totalLessons)) * 100));
    const isCourseFinished = progress >= 100;

    const updatedEnrollment: Enrollment = {
      ...enrollment,
      completedLessons: updatedCompletedLessons,
      progress,
      lastLessonId: lessonId,
      lastAccessedAt: new Date().toISOString(),
      status: isCourseFinished ? 'completed' : 'active',
      ...(isCourseFinished ? { completedAt: new Date().toISOString() } : {}),
    };

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('enrollments')
          .update({
            completed_lessons: updatedCompletedLessons,
            progress_percent: progress,
            is_completed: isCourseFinished,
            last_accessed_at: new Date().toISOString(),
            last_lesson_id: lessonId,
            status: isCourseFinished ? 'completed' : 'active',
            ...(isCourseFinished ? { completed_at: new Date().toISOString() } : {}),
          })
          .eq('user_id', userId)
          .eq('course_id', courseId);
      } catch (err) {
        console.warn('[courseService] Supabase completeLesson update error:', err);
      }
    } else {
      const idx = demoEnrollmentsStore.findIndex(e => e.userId === userId && e.courseId === courseId);
      if (idx !== -1) demoEnrollmentsStore[idx] = updatedEnrollment;
      else demoEnrollmentsStore.push(updatedEnrollment);
    }

    // Award XP
    let pointsAwarded = lessonPoints;
    try {
      await awardPoints({
        userId,
        action: 'LESSON_COMPLETE',
        description: `Completed lesson ${lessonId}`,
        referenceId: lessonId,
        referenceType: 'lesson',
        customPoints: lessonPoints,
      });

      if (isCourseFinished) {
        pointsAwarded += 500;
        await awardPoints({
          userId,
          action: 'COURSE_COMPLETE',
          description: `Mastered and completed entire course!`,
          referenceId: courseId,
          referenceType: 'course',
        });
      }
    } catch {}

    return { enrollment: updatedEnrollment, isCourseFinished, pointsAwarded };
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

    const fullCourse: Course = {
      id: courseData.id || `course-${Date.now()}`,
      title: courseData.title || 'Untitled Course',
      slug,
      description: courseData.description || '',
      shortDescription: courseData.shortDescription || '',
      instructorId: 'admin',
      instructorName: courseData.instructorName || 'DataCamp Instructor',
      instructorTitle: 'Faculty Mentor',
      coverImage: courseData.coverImage || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
      category: courseData.category || 'data_science',
      level: courseData.level || 'beginner',
      language: 'both',
      durationHours: Number(courseData.durationHours) || 12,
      totalLessons: Number(courseData.totalLessons) || 10,
      enrolledCount: 50,
      rating: 5.0,
      ratingCount: 1,
      tags: courseData.tags || ['Data Science'],
      skills: courseData.skills || ['Python'],
      prerequisites: [],
      pointsReward: Number(courseData.pointsReward) || 500,
      status: courseData.status || 'published',
      isFeatured: true,
      isLocked: false,
      createdAt: courseData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const idx = demoCoursesStore.findIndex(c => c.id === fullCourse.id);
    if (idx !== -1) demoCoursesStore[idx] = fullCourse;
    else demoCoursesStore.unshift(fullCourse);
    return fullCourse;
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
    demoCoursesStore = demoCoursesStore.filter(c => c.id !== courseId);
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

    const lesson: CourseLesson = {
      id: lessonData.id || `lesson-${Date.now()}`,
      courseId: lessonData.courseId,
      moduleId: lessonData.moduleId || `module-${lessonData.courseId}`,
      title: lessonData.title || 'Untitled Lesson',
      type: lessonData.type || 'article',
      content: lessonData.content || '',
      videoUrl: lessonData.videoUrl || '',
      duration: Number(lessonData.duration || 20),
      order: Number(lessonData.order || 1),
      isPreview: Boolean(lessonData.isPreview),
      pointsReward: Number(lessonData.pointsReward || 30),
      quizQuestions: lessonData.quizQuestions || [],
    };
    return lesson;
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

    demoCoursesStore = demoCoursesStore.map(course =>
      course.id === courseId ? { ...course, status: isPublished ? 'published' : 'draft' } : course
    );
  },

  /**
   * 11. Upload Course Thumbnail to Supabase Storage Bucket
   */
  async uploadThumbnail(file: File): Promise<string> {
    if (!isSupabaseConfigured) {
      return URL.createObjectURL(file);
    }

    const ext = file.name.split('.').pop() || 'png';
    const filePath = `thumbnails/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from('course-thumbnails')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

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
