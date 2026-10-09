import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseService } from '../../services/courseService';
import { Course, CourseCategory, CourseLevel } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useLanguage } from '../../contexts/LanguageContext';
import ImagePicker from '../../components/ImagePicker';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit,
  Search,
  Award,
  X,
  ExternalLink,
  GraduationCap,
  PlayCircle,
  Eye,
  CheckCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

export const CourseManagement = () => {
  const { isArabic } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const list = await courseService.getCourses(true);
      setCourses(list);
    } catch {
      toast.error(isArabic ? 'فشل تحميل الدورات' : 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleOpenCreate = () => {
    setEditingCourse({
      title: '',
      slug: '',
      description: '',
      shortDescription: '',
      category: 'data_science',
      level: 'beginner',
      durationHours: 12,
      totalLessons: 10,
      pointsReward: 500,
      instructorName: 'Club Faculty Mentor',
      coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
      status: 'published',
      tags: ['Python', 'Data Science'],
      skills: ['Data Analysis', 'Python Scripting'],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    setEditingCourse({ ...course });
    setIsModalOpen(true);
  };

  const handleDelete = async (courseId: string) => {
    const confirmMsg = isArabic 
      ? 'هل أنت متأكد من حذف هذه الدورة التدريبية؟' 
      : 'Are you sure you want to delete this course?';
    if (!window.confirm(confirmMsg)) return;

    try {
      await courseService.deleteCourse(courseId);
      toast.success(isArabic ? 'تم حذف الدورة بنجاح' : 'Course deleted.');
      fetchCourses();
    } catch {
      toast.error(isArabic ? 'فشل حذف الدورة' : 'Failed to delete course.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse || !editingCourse.title?.trim()) {
      toast.error(isArabic ? 'عنوان الدورة مطلوب' : 'Title is required');
      return;
    }

    try {
      if (!editingCourse.slug) {
        editingCourse.slug = editingCourse.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }

      await courseService.saveCourse(editingCourse);
      toast.success(isArabic ? 'تم حفظ الدورة بنجاح' : 'Course saved successfully.');
      setIsModalOpen(false);
      setEditingCourse(null);
      fetchCourses();
    } catch {
      toast.error(isArabic ? 'فشل حفظ الدورة' : 'Failed to save course.');
    }
  };

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase()) ||
    c.instructorName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-cyber text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            {isArabic ? 'إدارة الدورات والكورسات' : 'COURSE_MANAGEMENT'}
          </h2>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            {isArabic
              ? 'إدارة المناهج الأكاديمية والدروس التفاعلية ومكافآت نقاط الـ XP وتسجيلات الطلاب.'
              : 'Manage club curricula, lesson units, XP bounties, and student enrollments.'}
          </p>
        </div>

        <Button
          variant="cyber"
          className="font-cyber text-xs tracking-wider gap-2 shadow-[0_0_20px_rgba(0,255,204,0.2)]"
          onClick={handleOpenCreate}
        >
          <Plus className="w-4 h-4" /> 
          {isArabic ? 'إضافة دورة جديدة' : 'NEW_COURSE'}
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isArabic ? 'right-3.5' : 'left-3.5'}`} />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={isArabic ? 'البحث في الدورات أو المدربين أو التصنيفات...' : 'Filter courses by title, category, instructor...'}
          className={`${isArabic ? 'pr-10' : 'pl-10'} font-mono text-xs bg-dark-navy/60 border-primary/20 h-11`}
        />
      </div>

      {/* Courses List Table */}
      <div className="rounded-xl border border-white/10 bg-dark-navy/60 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[10px] font-cyber tracking-widest text-muted-foreground uppercase">
                <th className="py-4 px-6">{isArabic ? 'الدورة التدريبية' : 'COURSE'}</th>
                <th className="py-4 px-6">{isArabic ? 'التصنيف' : 'CATEGORY'}</th>
                <th className="py-4 px-6">{isArabic ? 'المستوى' : 'LEVEL'}</th>
                <th className="py-4 px-6">{isArabic ? 'مكافأة الـ XP' : 'XP BOUNTY'}</th>
                <th className="py-4 px-6">{isArabic ? 'الحالة' : 'STATUS'}</th>
                <th className="py-4 px-6 text-right rtl:text-left">{isArabic ? 'الإجراءات' : 'ACTIONS'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(course => (
                <tr key={course.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={course.coverImage}
                        alt={course.title}
                        className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0 bg-dark-navy"
                      />
                      <div>
                        <span className="font-semibold text-foreground text-sm block">{course.title}</span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span>{course.instructorName}</span>
                          <span>•</span>
                          <span>{course.totalLessons} {isArabic ? 'درس' : 'Lessons'}</span>
                          <span>•</span>
                          <span>{course.durationHours}h</span>
                          <span>•</span>
                          <span className="text-neon-cyan">{course.enrolledCount} {isArabic ? 'طالب' : 'Enrolled'}</span>
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6 text-muted-foreground uppercase">
                    {course.category.replace('_', ' ')}
                  </td>

                  <td className="py-4 px-6 uppercase text-primary font-bold">
                    {course.level}
                  </td>

                  <td className="py-4 px-6 font-cyber font-bold text-primary">
                    +{course.pointsReward} XP
                  </td>

                  <td className="py-4 px-6">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-cyber tracking-wider uppercase ${
                        course.status === 'published'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {course.status === 'published' ? (isArabic ? 'منشور' : 'PUBLISHED') : (isArabic ? 'مسودة' : 'DRAFT')}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-right rtl:text-left">
                    <div className="flex items-center justify-end rtl:justify-start gap-1 sm:gap-2">
                      {/* View Catalog Detail */}
                      <Link
                        to={`/courses/${course.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-neon-cyan hover:bg-white/5 transition-colors"
                        title={isArabic ? 'معاينة في الكتالوج' : 'View in Catalog'}
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {/* Open Interactive Learning Room */}
                      <Link
                        to={`/courses/${course.slug}/learn`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-white/5 transition-colors"
                        title={isArabic ? 'فتح بيئة التعلم التفاعلية' : 'Open Learning Room'}
                      >
                        <PlayCircle className="w-4 h-4" />
                      </Link>

                      {/* Edit */}
                      <button
                        onClick={() => handleOpenEdit(course)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-neon-yellow hover:bg-white/5 transition-colors"
                        title={isArabic ? 'تعديل الدورة' : 'Edit Course'}
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-white/5 transition-colors"
                        title={isArabic ? 'حذف الدورة' : 'Delete Course'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground font-mono text-xs">
                    {isArabic ? 'لم يتم العثور على أي دورات تطابق البحث.' : 'No courses found matching criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl max-h-[90vh] bg-dark-navy border border-primary/30 rounded-2xl p-6 overflow-y-auto space-y-6 custom-scrollbar">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-cyber font-bold text-primary text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                {editingCourse.id 
                  ? (isArabic ? 'تعديل الدورة التدريبية' : 'EDIT_COURSE') 
                  : (isArabic ? 'إنشاء دورة تدريبية جديدة' : 'CREATE_NEW_COURSE')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Cover Image with direct ImagePicker */}
              <div className="space-y-2">
                <ImagePicker 
                  label={isArabic ? 'غلاف الدورة التدريبية (رفع من الجهاز)' : 'Course Cover Image (Upload from device)'}
                  currentImage={editingCourse.coverImage}
                  onImageSelected={(base64) => setEditingCourse(p => ({ ...p, coverImage: base64 }))}
                />
                <div className="space-y-1">
                  <label className="text-[10px] font-cyber text-muted-foreground uppercase">
                    {isArabic ? 'أو أدخل رابط الصورة مباشرة' : 'Or paste Cover Image URL directly'}
                  </label>
                  <Input
                    value={editingCourse.coverImage || ''}
                    onChange={e => setEditingCourse(p => ({ ...p, coverImage: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="font-mono text-xs"
                  />
                </div>
              </div>

              {/* Title & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-cyber text-muted-foreground uppercase">
                    {isArabic ? 'عنوان الدورة' : 'Course Title'} *
                  </label>
                  <Input
                    value={editingCourse.title || ''}
                    onChange={e => setEditingCourse(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Advanced Deep Learning with PyTorch"
                    className="font-mono text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-cyber text-muted-foreground uppercase">
                    {isArabic ? 'الرابط المخصص (Slug)' : 'URL Slug'}
                  </label>
                  <Input
                    value={editingCourse.slug || ''}
                    onChange={e => setEditingCourse(p => ({ ...p, slug: e.target.value }))}
                    placeholder="auto-generated-from-title"
                    className="font-mono text-xs"
                  />
                </div>
              </div>

              {/* Category, Level, Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-cyber text-muted-foreground uppercase">
                    {isArabic ? 'التصنيف الأكاديمي' : 'Category'}
                  </label>
                  <select
                    value={editingCourse.category || 'data_science'}
                    onChange={e => setEditingCourse(p => ({ ...p, category: e.target.value as CourseCategory }))}
                    className="w-full h-10 px-3 rounded-lg bg-dark-navy border border-white/20 text-xs font-mono text-foreground"
                  >
                    <option value="data_science">{isArabic ? 'علوم البيانات' : 'Data Science'}</option>
                    <option value="ai_ml">{isArabic ? 'الذكاء الاصطناعي وتعلم الآلة' : 'AI & ML'}</option>
                    <option value="business_intelligence">{isArabic ? 'ذكاء الأعمال والتحليلات' : 'Business Intelligence'}</option>
                    <option value="software_eng">{isArabic ? 'هندسة البرمجيات' : 'Software Engineering'}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-cyber text-muted-foreground uppercase">
                    {isArabic ? 'المستوى' : 'Level'}
                  </label>
                  <select
                    value={editingCourse.level || 'beginner'}
                    onChange={e => setEditingCourse(p => ({ ...p, level: e.target.value as CourseLevel }))}
                    className="w-full h-10 px-3 rounded-lg bg-dark-navy border border-white/20 text-xs font-mono text-foreground"
                  >
                    <option value="beginner">{isArabic ? 'مبتدئ' : 'Beginner'}</option>
                    <option value="intermediate">{isArabic ? 'متوسط' : 'Intermediate'}</option>
                    <option value="advanced">{isArabic ? 'متقدم' : 'Advanced'}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-cyber text-muted-foreground uppercase">
                    {isArabic ? 'حالة النشر' : 'Status'}
                  </label>
                  <select
                    value={editingCourse.status || 'published'}
                    onChange={e => setEditingCourse(p => ({ ...p, status: e.target.value as any }))}
                    className="w-full h-10 px-3 rounded-lg bg-dark-navy border border-white/20 text-xs font-mono text-foreground"
                  >
                    <option value="published">{isArabic ? 'منشور للطلاب' : 'Published'}</option>
                    <option value="draft">{isArabic ? 'مسودة خاصة' : 'Draft'}</option>
                  </select>
                </div>
              </div>

              {/* XP, Duration, Lessons */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-cyber text-muted-foreground uppercase">
                    {isArabic ? 'مكافأة الـ XP' : 'XP Bounty'}
                  </label>
                  <Input
                    type="number"
                    value={editingCourse.pointsReward || 500}
                    onChange={e => setEditingCourse(p => ({ ...p, pointsReward: Number(e.target.value) }))}
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-cyber text-muted-foreground uppercase">
                    {isArabic ? 'المدة (ساعات)' : 'Duration (Hours)'}
                  </label>
                  <Input
                    type="number"
                    value={editingCourse.durationHours || 12}
                    onChange={e => setEditingCourse(p => ({ ...p, durationHours: Number(e.target.value) }))}
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-cyber text-muted-foreground uppercase">
                    {isArabic ? 'عدد الدروس' : 'Total Lessons'}
                  </label>
                  <Input
                    type="number"
                    value={editingCourse.totalLessons || 10}
                    onChange={e => setEditingCourse(p => ({ ...p, totalLessons: Number(e.target.value) }))}
                    className="font-mono text-xs"
                  />
                </div>
              </div>

              {/* Instructor Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-cyber text-muted-foreground uppercase">
                  {isArabic ? 'اسم المحاضر أو المدرب' : 'Instructor / Mentor Name'}
                </label>
                <Input
                  value={editingCourse.instructorName || ''}
                  onChange={e => setEditingCourse(p => ({ ...p, instructorName: e.target.value }))}
                  placeholder="Dr. Tamer Mostafa / Eng. Sarah Al-Sayed"
                  className="font-mono text-xs"
                />
              </div>

              {/* Short Summary */}
              <div className="space-y-1">
                <label className="text-[10px] font-cyber text-muted-foreground uppercase">
                  {isArabic ? 'نبذة مختصرة (تظهر في البطاقات)' : 'Short Summary (Shown in cards)'}
                </label>
                <Input
                  value={editingCourse.shortDescription || ''}
                  onChange={e => setEditingCourse(p => ({ ...p, shortDescription: e.target.value }))}
                  placeholder={isArabic ? 'ملخص سريع لأهم مهارات الدورة...' : 'Brief 1-line overview of the curriculum...'}
                  className="font-mono text-xs"
                />
              </div>

              {/* Course Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-cyber text-muted-foreground uppercase">
                  {isArabic ? 'الوصف التفصيلي والمنهج' : 'Course Description & Syllabus'}
                </label>
                <textarea
                  value={editingCourse.description || ''}
                  onChange={e => setEditingCourse(p => ({ ...p, description: e.target.value }))}
                  rows={4}
                  className="w-full p-3 rounded-lg bg-dark-navy border border-white/20 text-xs font-mono text-foreground"
                  placeholder={isArabic ? 'اكتب تفاصيل المنهج والمتطلبات السابقة...' : 'Comprehensive description of the syllabus, outcomes, and prerequisites...'}
                />
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="font-cyber text-xs border-white/20"
                >
                  {isArabic ? 'إلغاء' : 'CANCEL'}
                </Button>
                <Button type="submit" variant="cyber" className="font-cyber text-xs tracking-wider">
                  {isArabic ? 'حفظ الدورة' : 'SAVE_COURSE'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
