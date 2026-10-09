import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePoints } from '../contexts/PointsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { courseService } from '../services/courseService';
import { Enrollment, Course, BADGES_CATALOG } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Logo from '../components/Logo';
import { Button } from '../components/ui/Button';
import { QRCodeSVG } from 'qrcode.react';
import {
  Mail,
  Phone,
  GraduationCap,
  Award,
  Zap,
  Download,
  Sparkles,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { isFirebaseReady } from '../lib/firebase';
import { demoEvents } from '../lib/demoData';

const Dashboard = () => {
  const { profile } = useAuth();
  const { isArabic } = useLanguage();
  const {
    totalPoints,
    level,
    nextLevel,
    progressToNextLevel,
    pointsToNextLevel,
    recentLogs,
    achievements
  } = usePoints();

  const [enrolledCourses, setEnrolledCourses] = useState<{ course: Course; enrollment: Enrollment }[]>([]);
  const [, setEventsAttendedCount] = useState(0);

  useEffect(() => {
    if (!profile) return;

    if (!isFirebaseReady) {
      const attended = demoEvents.filter(e => e.registeredCount > 0).length;
      setEventsAttendedCount(attended);
    }

    // Load enrolled courses
    courseService.getUserEnrollments(profile.uid).then(async enrollments => {
      const allCourses = await courseService.getCourses(true);
      const combined = enrollments.map(enr => {
        const c = allCourses.find(course => course.id === enr.courseId);
        return c ? { course: c, enrollment: enr } : null;
      }).filter(Boolean) as { course: Course; enrollment: Enrollment }[];
      setEnrolledCourses(combined);
    }).catch(console.error);
  }, [profile]);

  const downloadIDCard = async () => {
    const element = document.getElementById('id-card');
    if (!element) return;
    const canvas = await html2canvas(element, { backgroundColor: null });
    const link = document.createElement('a');
    link.download = `DataCamp-ID-${profile?.memberId}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  if (!profile) {
    return (
      <div className="p-20 text-center font-cyber animate-pulse">
        {isArabic ? 'جاري تحميل بيانات العضو...' : 'LOADING PROFILE DATA...'}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black font-cyber tracking-tighter">
            {isArabic ? 'لوحة تحكم' : 'OPERATIVE'} <span className="text-primary neon-text">{isArabic ? 'العضو' : 'DASHBOARD'}</span>
          </h1>
          <p className="text-muted-foreground">
            {isArabic ? `مرحباً بك مجدداً، ${profile.fullName}. تصنيف الرتبة: ` : `Welcome back, ${profile.fullName}. Rank clearance: `}
            <strong className="text-primary">{level}</strong>.
          </p>
        </div>
        <div className="flex items-center space-x-4 gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-muted-foreground uppercase tracking-widest">
              {isArabic ? 'مستوى الرتبة' : 'RANK LEVEL'}
            </div>
            <div className="text-primary font-cyber font-bold flex items-center gap-1 justify-end">
              <Sparkles className="w-3.5 h-3.5" /> {level} ({totalPoints} XP)
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center font-cyber text-primary font-bold text-lg">
            {profile.fullName[0]}
          </div>
        </div>
      </header>

      {/* Rank Progress Bar Widget */}
      <Card className="border-primary/30 bg-dark-navy/60 backdrop-blur-xl">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-cyber text-primary tracking-widest uppercase">
                {isArabic ? 'التقدم في الرتبة والعضوية' : 'MEMBERSHIP PROGRESSION'}
              </span>
              <h3 className="font-cyber font-bold text-lg text-foreground flex items-center gap-2">
                <span>{level}</span>
                {nextLevel && (
                  <>
                    <span className="text-muted-foreground font-normal text-xs">{isArabic ? '← التالي:' : '→ Next:'}</span>
                    <span className="text-secondary">{nextLevel}</span>
                  </>
                )}
              </h3>
            </div>
            <div className="text-left sm:text-right">
              <div className="font-cyber font-bold text-primary text-xl">{totalPoints} XP</div>
              {nextLevel && (
                <div className="text-[11px] font-mono text-muted-foreground">
                  {isArabic ? `متبقي ${pointsToNextLevel} نقطة XP للترقية` : `${pointsToNextLevel} XP needed for promotion`}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="h-3 w-full rounded-full bg-black/50 border border-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full shadow-[0_0_15px_rgba(0,255,204,0.7)] transition-all duration-500"
                style={{ width: `${progressToNextLevel}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>{isArabic ? `الرتبة الحالية: ${level}` : `Current Tier: ${level}`}</span>
              <span>{isArabic ? `تم إنجاز ${progressToNextLevel}%` : `${progressToNextLevel}% completed`}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Stats & Profile */}
        <div className="lg:col-span-2 space-y-12">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="border-neon-green/20">
              <CardContent className="p-6 flex items-center space-x-4 gap-3">
                <div className="p-3 rounded-lg bg-neon-green/10 text-neon-green"><Zap className="w-6 h-6" /></div>
                <div>
                  <div className="text-2xl font-bold font-cyber text-primary">{totalPoints}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    {isArabic ? 'إجمالي نقاط XP' : 'Total XP Points'}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-neon-blue/20">
              <CardContent className="p-6 flex items-center space-x-4 gap-3">
                <div className="p-3 rounded-lg bg-neon-blue/10 text-neon-blue"><BookOpen className="w-6 h-6" /></div>
                <div>
                  <div className="text-2xl font-bold font-cyber">{enrolledCourses.length}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    {isArabic ? 'الدورات المسجلة' : 'Enrolled Courses'}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-neon-purple/20">
              <CardContent className="p-6 flex items-center space-x-4 gap-3">
                <div className="p-3 rounded-lg bg-neon-purple/10 text-neon-purple"><Award className="w-6 h-6" /></div>
                <div>
                  <div className="text-2xl font-bold font-cyber">{achievements.length}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    {isArabic ? 'الشارات المكتسبة' : 'Badges Unlocked'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enrolled Courses Active Section */}
          <Card className="border-white/10 bg-dark-navy/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl font-cyber text-foreground">
                  {isArabic ? 'مساري التعليمي' : 'MY_LEARNING_PATH'}
                </CardTitle>
                <CardDescription>
                  {isArabic ? 'الدورات الجارية والشهادات المعتمدة' : 'Courses in progress and certifications'}
                </CardDescription>
              </div>
              <Link to="/courses">
                <Button variant="outline" className="text-xs font-cyber h-8 px-3 border-primary/30 text-primary">
                  {isArabic ? 'استكشف الكل' : 'EXPLORE_ALL'} 
                  <ArrowRight className={`w-3.5 h-3.5 ${isArabic ? 'mr-1 rotate-180' : 'ml-1'}`} />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              {enrolledCourses.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-white/10 rounded-xl space-y-3">
                  <p className="text-xs font-mono text-muted-foreground">
                    {isArabic ? 'أنت غير مسجل في أي دورة حالياً.' : 'You are not currently enrolled in any courses.'}
                  </p>
                  <Link to="/courses">
                    <Button variant="cyber" className="text-xs font-cyber">
                      {isArabic ? 'سجل في أول دورة (+5 XP)' : 'ENROLL IN FIRST COURSE (+5 XP)'}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {enrolledCourses.map(({ course, enrollment }) => (
                    <div
                      key={course.id}
                      className="p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-cyber px-2 py-0.5 rounded bg-primary/20 text-primary uppercase">
                            {course.level}
                          </span>
                          <h4 className="font-semibold text-sm text-foreground">{course.title}</h4>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
                          <span>{enrollment.completedLessons?.length || 0} / {course.totalLessons} {isArabic ? 'درس' : 'Lessons'}</span>
                          <span>•</span>
                          <span>{enrollment.progress}% {isArabic ? 'مكتمل' : 'completed'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 rounded-full bg-black/40 overflow-hidden hidden sm:block">
                          <div className="h-full bg-primary" style={{ width: `${enrollment.progress}%` }} />
                        </div>
                        <Link to={`/courses/${course.slug}/learn`}>
                          <Button variant="cyber" className="h-8 text-xs font-cyber px-3">
                            {enrollment.progress >= 100 
                              ? (isArabic ? 'مراجعة' : 'REVIEW') 
                              : (isArabic ? 'متابعة' : 'RESUME')
                            }
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Badges Catalog Section */}
          <Card className="border-white/10 bg-dark-navy/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-cyber text-foreground">
                {isArabic ? 'شارات الإنجاز' : 'ACHIEVEMENT_BADGES'}
              </CardTitle>
              <CardDescription>
                {isArabic ? 'اكتسب الشارات بإنجاز التمارين والاختبارات وحضور الفعاليات' : 'Earn badges by completing tasks, taking quizzes, and attending events'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {BADGES_CATALOG.slice(0, 8).map(b => {
                  const isUnlocked = achievements.some(a => a.badgeId === b.id) || totalPoints >= 50;

                  return (
                    <div
                      key={b.id}
                      className={`p-3 rounded-xl border text-center space-y-1.5 transition-all ${
                        isUnlocked
                          ? 'border-primary/40 bg-primary/10 shadow-[0_0_15px_rgba(0,255,204,0.1)]'
                          : 'border-white/5 bg-white/[0.02] opacity-40'
                      }`}
                    >
                      <div className="text-2xl">{b.icon}</div>
                      <div className="text-xs font-cyber font-bold text-foreground">{b.name}</div>
                      <div className="text-[10px] font-mono text-muted-foreground line-clamp-1">{b.description}</div>
                      <div className="text-[9px] font-mono text-primary font-bold">
                        {isUnlocked 
                          ? (isArabic ? '✓ مكتسبة' : '✓ UNLOCKED') 
                          : (isArabic ? 'مقفلة' : 'LOCKED')
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Profile Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                {isArabic ? 'بيانات الهوية الجامعية' : 'IDENTITY DATA'}
              </CardTitle>
              <CardDescription>
                {isArabic ? 'المعلومات الموثقة في قاعدة بيانات النادي' : 'Verified information in the club database'}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-4 gap-3">
                  <Mail className="text-primary w-5 h-5" />
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
                      {isArabic ? 'البريد الإلكتروني' : 'Email Address'}
                    </div>
                    <div className="text-sm font-medium">{profile.email}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 gap-3">
                  <Phone className="text-primary w-5 h-5" />
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
                      {isArabic ? 'رقم الهاتف' : 'Phone Number'}
                    </div>
                    <div className="text-sm font-medium" dir="ltr">{profile.phoneNumber || '+20 --- --- ----'}</div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center space-x-4 gap-3">
                  <GraduationCap className="text-primary w-5 h-5" />
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
                      {isArabic ? 'الكلية والفرقة' : 'Faculty & Year'}
                    </div>
                    <div className="text-sm font-medium">{profile.faculty} - {isArabic ? `الفرقة ${profile.academicYear}` : `Year ${profile.academicYear}`}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 gap-3">
                  <Zap className="text-primary w-5 h-5" />
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
                      {isArabic ? 'رقم العضوية' : 'Member ID'}
                    </div>
                    <div className="text-sm font-mono font-bold text-neon-blue">{profile.memberId}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-white/10 bg-dark-navy/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-cyber text-foreground">
                {isArabic ? 'سجل نشاط نقاط XP' : 'XP ACTIVITY TIMELINE'}
              </CardTitle>
              <Link to="/leaderboard">
                <Button variant="outline" className="text-xs font-cyber h-8 px-3 border-primary/30 text-primary">
                  {isArabic ? 'عرض لوحة المتصدرين' : 'VIEW LEADERBOARD'} 
                  <ArrowRight className={`w-3.5 h-3.5 ${isArabic ? 'mr-1 rotate-180' : 'ml-1'}`} />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 pt-2">
                {recentLogs.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-white/10 rounded-xl space-y-2">
                    <div className="text-muted-foreground font-mono text-xs">
                      {isArabic ? 'لا يوجد نشاط مسجل مؤخراً' : 'NO_RECENT_ACTIVITY_LOGGED'}
                    </div>
                    <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">
                      {isArabic ? 'حل التحديات البرمجية أو أكمل الدروس لتسجيل نقاط XP.' : 'Solve coding challenges or complete lessons to record XP points.'}
                    </p>
                  </div>
                ) : (
                  recentLogs.slice(0, 5).map((log, idx) => (
                    <div
                      key={log.id || idx}
                      className="p-3 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between gap-4 text-xs font-mono"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{log.description}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {isArabic ? 'العملية:' : 'Action:'} {log.action}
                          </div>
                        </div>
                      </div>
                      <div className="font-cyber font-bold text-emerald-400 text-sm whitespace-nowrap">
                        +{log.points} XP
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: ID Card & Quick Links */}
        <div className="space-y-8">
          <div className="sticky top-24 space-y-6">
            <h2 className="text-xl font-cyber font-bold text-center uppercase tracking-widest">
              {isArabic ? 'بطاقة العضوية الرقمية' : 'Digital ID Card'}
            </h2>
            
            <div id="id-card" className="relative w-full aspect-[1.586/1] bg-dark-navy rounded-2xl overflow-hidden border-2 border-primary/30 shadow-[0_0_30px_rgba(57,255,20,0.1)]">
              {/* Card Background Patterns */}
              <div className="absolute inset-0 cyber-grid opacity-20" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-neon-blue/10 rounded-full blur-3xl" />
              
              <div className="relative h-full p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <Logo iconSize={24} textSize="text-xs" subtextSize="text-[6px]" />
                  <div className="text-[10px] font-mono text-primary/70">
                    {isArabic ? 'عضو معتمد' : 'VERIFIED_MEMBER'}
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div className="space-y-4">
                    <div>
                      <div className="text-[8px] text-muted-foreground uppercase tracking-widest">
                        {isArabic ? 'الاسم بالكامل' : 'Full Name'}
                      </div>
                      <div className="text-lg font-black font-cyber leading-none uppercase">{profile.fullName}</div>
                    </div>
                    <div className="flex space-x-6 gap-4">
                      <div>
                        <div className="text-[8px] text-muted-foreground uppercase tracking-widest">
                          {isArabic ? 'رقم العضوية' : 'ID Number'}
                        </div>
                        <div className="text-xs font-mono font-bold text-neon-blue">{profile.memberId}</div>
                      </div>
                      <div>
                        <div className="text-[8px] text-muted-foreground uppercase tracking-widest">
                          {isArabic ? 'الدور' : 'Role'}
                        </div>
                        <div className="text-xs font-mono font-bold text-neon-green">{profile.role.toUpperCase()}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-1 rounded-lg">
                    <QRCodeSVG value={profile.memberId} size={60} level="H" />
                  </div>
                </div>
              </div>
            </div>

            <Button variant="cyber" className="w-full" onClick={downloadIDCard}>
              <Download className={`w-4 h-4 ${isArabic ? 'ml-2' : 'mr-2'}`} />
              {isArabic ? 'تحميل بطاقة الهوية' : 'Download ID Card'}
            </Button>

            {/* Quick Credentials & Certificates Link */}
            <Link to="/certificates" className="block">
              <Button variant="outline" className="w-full border-primary/40 text-primary hover:bg-primary/10 font-cyber text-xs">
                <Award className={`w-4 h-4 ${isArabic ? 'ml-2' : 'mr-2'} text-neon-green`} />
                {isArabic ? 'عرض شهاداتي الرقمية المعتمدة' : 'VIEW MY DIGITAL CERTIFICATES'}
              </Button>
            </Link>

            <Link to="/compiler" className="block">
              <Button variant="outline" className="w-full border-white/20 hover:border-primary text-foreground font-cyber text-xs">
                <Sparkles className={`w-4 h-4 ${isArabic ? 'ml-2' : 'mr-2'} text-primary`} />
                {isArabic ? 'تشغيل محرر الأكواد المتعدد' : 'OPEN MULTI-LANGUAGE COMPILER'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
