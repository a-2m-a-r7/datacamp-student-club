/**
 * courseService.ts
 * Comprehensive service for managing Courses, Lessons, Enrollments, and Progress.
 * Supports Firebase Firestore and offline Demo Mode with rich interactive data.
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db, isFirebaseReady } from '../lib/firebase';
import {
  Course,
  CourseModule,
  CourseLesson,
  Enrollment,
} from '../types';
import { awardPoints } from './pointsService';

// ─── RICH DEMO COURSES CATALOG ───────────────────────────────────────────────

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
  {
    id: 'course-deep-learning',
    slug: 'deep-learning-computer-vision',
    title: 'Deep Learning & Neural Networks with PyTorch',
    description: 'Deep dive into neural network architectures, Convolutional Neural Networks (CNNs), Computer Vision tasks, Object Detection, and transfer learning models.',
    shortDescription: 'Master PyTorch, CNNs, image recognition, and state-of-the-art vision models.',
    instructorId: 'demo-inst-1',
    instructorName: 'Dr. Tamer Mostafa',
    instructorTitle: 'Lead AI Researcher & Club Advisor',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    category: 'ai_ml',
    level: 'advanced',
    language: 'both',
    durationHours: 40,
    totalLessons: 26,
    enrolledCount: 64,
    rating: 4.95,
    ratingCount: 19,
    tags: ['PyTorch', 'Deep Learning', 'Computer Vision', 'CNN', 'Neural Networks'],
    skills: ['PyTorch Tensors', 'Backpropagation', 'Transfer Learning', 'Image Segmentation'],
    prerequisites: ['Machine Learning Fundamentals & Scikit-Learn'],
    pointsReward: 800,
    status: 'published',
    isFeatured: true,
    isLocked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ─── SAMPLE MODULES & LESSONS FOR PYTHON COURSE ──────────────────────────────

export const DEMO_MODULES_PYTHON: CourseModule[] = [
  {
    id: 'mod-1',
    courseId: 'course-py-data',
    title: 'Unit 1: The Foundations of Python & Environment Setup',
    description: 'Setting up Anaconda, VS Code, virtual environments, and learning Python data types and flow control.',
    order: 1,
    totalLessons: 3,
    durationMinutes: 90,
  },
  {
    id: 'mod-2',
    courseId: 'course-py-data',
    title: 'Unit 2: Scientific Computing with NumPy',
    description: 'Working with multidimensional arrays, vectorization, slicing, and mathematical operations.',
    order: 2,
    totalLessons: 3,
    durationMinutes: 120,
  },
  {
    id: 'mod-3',
    courseId: 'course-py-data',
    title: 'Unit 3: Data Wrangling & Analysis with Pandas',
    description: 'Series, DataFrames, loading CSVs, handling missing data, groupby aggregations, and merging.',
    order: 3,
    totalLessons: 4,
    durationMinutes: 160,
  },
];

export const DEMO_LESSONS_PYTHON: CourseLesson[] = [
  {
    id: 'les-py-1',
    courseId: 'course-py-data',
    moduleId: 'mod-1',
    title: '01. Welcome to the DataCamp Ecosystem & Setup',
    type: 'video',
    duration: 18,
    order: 1,
    isPreview: true,
    pointsReward: 20,
    videoUrl: 'https://www.youtube.com/embed/kqtD5dpn9C8',
    content: `### Welcome to DataCamp Student Club!

In this inaugural lesson, we set up your local development environment:
- Installing **Python 3.11+**
- Setting up **VS Code** with Python & Jupyter extensions
- Managing packages with **pip** and **conda**

\`\`\`python
# Verify your Python environment
import sys
print(f"System Version: {sys.version}")
\`\`\`

#### Key Takeaways:
1. Always isolate your data projects in virtual environments.
2. Jupyter Notebooks are ideal for exploratory data analysis (EDA).
`,
    exercisePrompt: "Task: Write a Python script to initialize club telemetry:\n1. Define variable: club_name = 'DataCamp Student Club'\n2. Define variable: member_count = 350\n3. Print: f'Welcome to {club_name}! Active Members: {member_count}'",
    exerciseStarterCode: `# Complete the task below
club_name = "DataCamp Student Club"
member_count = 350

print(f"Welcome to {club_name}! Active Members: {member_count}")
`,
    exerciseTestCases: [
      { description: "Prints welcome message with club name", expectedOutput: "Welcome to DataCamp Student Club!" },
      { description: "Prints correct active member count", expectedOutput: "Active Members: 350" }
    ],
  },
  {
    id: 'les-py-2',
    courseId: 'course-py-data',
    moduleId: 'mod-1',
    title: '02. Python Core Data Structures: Lists, Tuples & Dicts',
    type: 'article',
    duration: 25,
    order: 2,
    isPreview: false,
    pointsReward: 25,
    content: `### Python Data Structures in Data Science

Choosing the right data structure directly impacts memory performance and algorithm runtime.

#### 1. Lists vs Tuples
- **Lists** are mutable ordered collections:
\`\`\`python
student_scores = [85, 92, 78, 96]
student_scores.append(88)
\`\`\`

- **Tuples** are immutable sequences, useful for fixed coordinates and database records:
\`\`\`python
point = (12.45, 45.89)
\`\`\`

#### 2. Dictionaries for Key-Value Lookups
Dictionaries provide average $O(1)$ search time:
\`\`\`python
member_profile = {
    "name": "Ahmed",
    "level": "OPERATIVE",
    "points": 350,
    "faculty": "Computer Science"
}
print(member_profile.get("points"))
\`\`\`
`,
    exercisePrompt: "Task: Given the student examination marks `marks = [75, 88, 92, 60, 95]`:\n1. Compute the average mark.\n2. Find the top mark.\n3. Output: `Average: 82.0` and `Top: 95`",
    exerciseStarterCode: `marks = [75, 88, 92, 60, 95]

avg = sum(marks) / len(marks)
top = max(marks)

print(f"Average: {avg:.1f}")
print(f"Top: {top}")
`,
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
      {
        id: 'q2',
        question: 'What is the time complexity of looking up a key in a standard Python dictionary?',
        options: ['O(n)', 'O(1) average', 'O(log n)', 'O(n^2)'],
        correctAnswer: 1,
        explanation: 'Dictionaries use hash tables, offering O(1) average time complexity for lookups.',
      },
      {
        id: 'q3',
        question: 'Which method safely retrieves a value from a dictionary without raising a KeyError?',
        options: ['dict.fetch()', 'dict.get()', 'dict.find()', 'dict.pull()'],
        correctAnswer: 1,
        explanation: 'dict.get(key, default) returns default (None) if the key does not exist.',
      },
    ],
  },
  {
    id: 'les-py-4',
    courseId: 'course-py-data',
    moduleId: 'mod-2',
    title: '04. Introduction to NumPy: Arrays & Vectorization',
    type: 'video',
    duration: 22,
    order: 1,
    isPreview: false,
    pointsReward: 30,
    videoUrl: 'https://www.youtube.com/embed/QUT1VHiLmmI',
    content: `### Vectorized Operations with NumPy

NumPy arrays are stored in contiguous memory blocks and executed using compiled C-level optimizations.

\`\`\`python
import numpy as np

# Create a 2D array
matrix = np.array([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
])

# Vectorized operation - no python for-loops!
doubled = matrix * 2
row_sums = np.sum(matrix, axis=1)

print("Shape:", matrix.shape)
print("Row sums:", row_sums)
\`\`\`
`,
    exercisePrompt: "Task: Vector multiplication exercise.\nDouble the sensor telemetry array [10, 20, 30] using a list comprehension or vector operation and print: 'Doubled: [20, 40, 60]'",
    exerciseStarterCode: `readings = [10, 20, 30]
doubled = [x * 2 for x in readings]

print(f"Doubled: {doubled}")
`,
    exerciseTestCases: [
      { description: "Doubles each sensor reading", expectedOutput: "Doubled: [20, 40, 60]" }
    ],
  },
  {
    id: 'les-py-5',
    courseId: 'course-py-data',
    moduleId: 'mod-3',
    title: '05. Pandas DataFrames: Cleaning & Aggregations',
    type: 'article',
    duration: 35,
    order: 1,
    isPreview: false,
    pointsReward: 35,
    content: `### Exploratory Data Analysis with Pandas

The cornerstone of modern tabular data manipulation.

\`\`\`python
import pandas as pd

# Load dataset
df = pd.DataFrame({
    'member_id': ['DC001', 'DC002', 'DC003', 'DC004'],
    'faculty': ['Engineering', 'CS', 'Engineering', 'Science'],
    'xp': [450, 1200, 310, 890]
})

# Filter top performers
high_xp = df[df['xp'] > 500]

# Group by faculty and calculate average XP
avg_by_faculty = df.groupby('faculty')['xp'].mean().reset_index()
print(avg_by_faculty)
\`\`\`
`,
    exercisePrompt: "Task: Filter student operatives who accumulated more than 500 XP from the given records and print: 'Elite Count: 2'",
    exerciseStarterCode: `students = [
    {'name': 'Ahmed', 'xp': 650},
    {'name': 'Sara', 'xp': 300},
    {'name': 'Omar', 'xp': 800}
]

elites = [s for s in students if s['xp'] > 500]
print(f"Elite Count: {len(elites)}")
`,
    exerciseTestCases: [
      { description: "Filters records with XP > 500", expectedOutput: "Elite Count: 2" }
    ],
  },
];

// ─── IN-MEMORY DEMO ENROLLMENTS ──────────────────────────────────────────────

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

// ─── SERVICE METHODS ─────────────────────────────────────────────────────────

export const courseService = {
  /**
   * Get all published courses
   */
  async getCourses(includeDrafts = false): Promise<Course[]> {
    if (!isFirebaseReady) {
      return includeDrafts
        ? demoCoursesStore
        : demoCoursesStore.filter(c => c.status === 'published');
    }

    try {
      const col = collection(db, 'courses');
      const q = includeDrafts
        ? query(col, orderBy('createdAt', 'desc'))
        : query(col, where('status', '==', 'published'));
      const snap = await getDocs(q);
      if (snap.empty) {
        return demoCoursesStore.filter(c => includeDrafts || c.status === 'published');
      }
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Course));
    } catch (err) {
      console.warn('Firebase courses fetch error, using demo fallback:', err);
      return demoCoursesStore.filter(c => includeDrafts || c.status === 'published');
    }
  },

  /**
   * Get course by Slug
   */
  async getCourseBySlug(slug: string): Promise<Course | null> {
    if (!isFirebaseReady) {
      return demoCoursesStore.find(c => c.slug === slug) ?? null;
    }

    try {
      const col = collection(db, 'courses');
      const q = query(col, where('slug', '==', slug));
      const snap = await getDocs(q);
      if (snap.empty) {
        return demoCoursesStore.find(c => c.slug === slug) ?? null;
      }
      const d = snap.docs[0];
      return { id: d.id, ...d.data() } as Course;
    } catch (err) {
      console.warn('Firestore getCourseBySlug error, using fallback:', err);
      return demoCoursesStore.find(c => c.slug === slug) ?? null;
    }
  },

  /**
   * Get Modules for a course
   */
  async getCourseModules(courseId: string): Promise<CourseModule[]> {
    if (!isFirebaseReady || courseId === 'course-py-data') {
      return DEMO_MODULES_PYTHON.map(m => ({ ...m, courseId }));
    }

    try {
      const col = collection(db, 'course_modules');
      const q = query(col, where('courseId', '==', courseId), orderBy('order', 'asc'));
      const snap = await getDocs(q);
      if (snap.empty) return DEMO_MODULES_PYTHON.map(m => ({ ...m, courseId }));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as CourseModule));
    } catch {
      return DEMO_MODULES_PYTHON.map(m => ({ ...m, courseId }));
    }
  },

  /**
   * Get Lessons for a course
   */
  async getCourseLessons(courseId: string): Promise<CourseLesson[]> {
    if (!isFirebaseReady || courseId === 'course-py-data') {
      return DEMO_LESSONS_PYTHON.map(l => ({ ...l, courseId }));
    }

    try {
      const col = collection(db, 'course_lessons');
      const q = query(col, where('courseId', '==', courseId), orderBy('order', 'asc'));
      const snap = await getDocs(q);
      if (snap.empty) return DEMO_LESSONS_PYTHON.map(l => ({ ...l, courseId }));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as CourseLesson));
    } catch {
      return DEMO_LESSONS_PYTHON.map(l => ({ ...l, courseId }));
    }
  },

  /**
   * Get user's enrollment for a course
   */
  async getUserEnrollment(userId: string, courseId: string): Promise<Enrollment | null> {
    if (!userId) return null;

    if (!isFirebaseReady) {
      return demoEnrollmentsStore.find(e => e.userId === userId && e.courseId === courseId) ?? null;
    }

    try {
      const col = collection(db, 'enrollments');
      const q = query(col, where('userId', '==', userId), where('courseId', '==', courseId));
      const snap = await getDocs(q);
      if (snap.empty) {
        return demoEnrollmentsStore.find(e => e.userId === userId && e.courseId === courseId) ?? null;
      }
      const d = snap.docs[0];
      return { id: d.id, ...d.data() } as Enrollment;
    } catch {
      return demoEnrollmentsStore.find(e => e.userId === userId && e.courseId === courseId) ?? null;
    }
  },

  /**
   * Get all courses a user is enrolled in
   */
  async getUserEnrollments(userId: string): Promise<Enrollment[]> {
    if (!userId) return [];

    if (!isFirebaseReady) {
      return demoEnrollmentsStore.filter(e => e.userId === userId);
    }

    try {
      const col = collection(db, 'enrollments');
      const q = query(col, where('userId', '==', userId), orderBy('enrolledAt', 'desc'));
      const snap = await getDocs(q);
      if (snap.empty) return demoEnrollmentsStore.filter(e => e.userId === userId);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Enrollment));
    } catch {
      return demoEnrollmentsStore.filter(e => e.userId === userId);
    }
  },

  /**
   * Enroll a user in a course
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

    if (!isFirebaseReady) {
      demoEnrollmentsStore.push(newEnrollment);
      // Increment course enrolled count
      const course = demoCoursesStore.find(c => c.id === courseId);
      if (course) course.enrolledCount = (course.enrolledCount || 0) + 1;
    } else {
      try {
        const docRef = doc(collection(db, 'enrollments'));
        newEnrollment.id = docRef.id;
        await setDoc(docRef, {
          ...newEnrollment,
          enrolledAt: serverTimestamp(),
          lastAccessedAt: serverTimestamp(),
        });
        // increment course count
        await updateDoc(doc(db, 'courses', courseId), {
          enrolledCount: increment(1),
        });
      } catch (err) {
        console.error('Enroll error:', err);
      }
    }

    // Award +5 XP for enrolling
    try {
      await awardPoints({
        userId,
        action: 'COURSE_ENROLL',
        description: 'Enrolled in course',
        referenceId: courseId,
        referenceType: 'course',
      });
    } catch (e) {
      console.warn('Failed to award points for enrollment:', e);
    }

    return newEnrollment;
  },

  /**
   * Complete a lesson & calculate progress
   */
  async completeLesson(
    userId: string,
    courseId: string,
    lessonId: string,
    totalCourseLessons: number,
    lessonPoints: number = 20
  ): Promise<{ enrollment: Enrollment; isCourseFinished: boolean; pointsAwarded: number }> {
    let enrollment = await this.getUserEnrollment(userId, courseId);
    if (!enrollment) {
      enrollment = await this.enrollCourse(userId, courseId);
    }

    const alreadyDone = enrollment.completedLessons.includes(lessonId);
    if (alreadyDone) {
      return { enrollment, isCourseFinished: false, pointsAwarded: 0 };
    }

    const updatedCompletedLessons = [...enrollment.completedLessons, lessonId];
    const progress = Math.min(
      100,
      Math.round((updatedCompletedLessons.length / Math.max(1, totalCourseLessons)) * 100)
    );
    const isCourseFinished = progress >= 100;

    const updatedEnrollment: Enrollment = {
      ...enrollment,
      completedLessons: updatedCompletedLessons,
      progress,
      lastLessonId: lessonId,
      lastAccessedAt: new Date().toISOString(),
      status: isCourseFinished ? 'completed' : 'active',
      completedAt: isCourseFinished ? new Date().toISOString() : undefined,
    };

    if (!isFirebaseReady) {
      const idx = demoEnrollmentsStore.findIndex(e => e.id === enrollment!.id);
      if (idx !== -1) demoEnrollmentsStore[idx] = updatedEnrollment;
      else demoEnrollmentsStore.push(updatedEnrollment);
    } else {
      try {
        const ref = doc(db, 'enrollments', enrollment.id);
        await updateDoc(ref, {
          completedLessons: updatedCompletedLessons,
          progress,
          lastLessonId: lessonId,
          lastAccessedAt: serverTimestamp(),
          status: updatedEnrollment.status,
          ...(isCourseFinished ? { completedAt: serverTimestamp() } : {}),
        });
      } catch (err) {
        console.error('Update lesson complete error:', err);
      }
    }

    // Award lesson points
    let pointsAwarded = lessonPoints;
    try {
      await awardPoints({
        userId,
        action: 'LESSON_COMPLETE',
        description: `Completed lesson`,
        referenceId: lessonId,
        referenceType: 'lesson',
        customPoints: lessonPoints,
      });

      // If course is completed, grant +500 XP course completion bonus!
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
    } catch (e) {
      console.warn('Failed to award points on lesson complete:', e);
    }

    return { enrollment: updatedEnrollment, isCourseFinished, pointsAwarded };
  },

  /**
   * Save or update course (Admin)
   */
  async saveCourse(courseData: Partial<Course>): Promise<Course> {
    const id = courseData.id || `course-${Date.now()}`;
    const fullCourse: Course = {
      id,
      title: courseData.title || 'Untitled Course',
      slug: courseData.slug || `course-${Date.now()}`,
      description: courseData.description || '',
      shortDescription: courseData.shortDescription || '',
      instructorId: courseData.instructorId || 'admin',
      instructorName: courseData.instructorName || 'Club Mentor',
      coverImage: courseData.coverImage || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
      category: courseData.category || 'data_science',
      level: courseData.level || 'beginner',
      language: courseData.language || 'both',
      durationHours: Number(courseData.durationHours) || 10,
      totalLessons: Number(courseData.totalLessons) || 1,
      enrolledCount: courseData.enrolledCount || 0,
      rating: courseData.rating || 5.0,
      ratingCount: courseData.ratingCount || 1,
      tags: courseData.tags || [],
      skills: courseData.skills || [],
      prerequisites: courseData.prerequisites || [],
      pointsReward: Number(courseData.pointsReward) || 500,
      status: courseData.status || 'published',
      isFeatured: !!courseData.isFeatured,
      isLocked: !!courseData.isLocked,
      createdAt: courseData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!isFirebaseReady) {
      const idx = demoCoursesStore.findIndex(c => c.id === id);
      if (idx !== -1) demoCoursesStore[idx] = fullCourse;
      else demoCoursesStore.unshift(fullCourse);
      return fullCourse;
    }

    try {
      const ref = doc(db, 'courses', id);
      await setDoc(ref, {
        ...fullCourse,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      return fullCourse;
    } catch (err) {
      console.error('saveCourse error:', err);
      throw err;
    }
  },

  /**
   * Delete course (Admin)
   */
  async deleteCourse(courseId: string): Promise<void> {
    if (!isFirebaseReady) {
      demoCoursesStore = demoCoursesStore.filter(c => c.id !== courseId);
      return;
    }

    try {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'courses', courseId));
    } catch (err) {
      console.error('deleteCourse error:', err);
      throw err;
    }
  },
};
