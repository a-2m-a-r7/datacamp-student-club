import React from 'react';
import { Lock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Privacy = () => {
  const { isArabic } = useLanguage();

  return (
    <div className="pt-20 md:pt-32 pb-24 min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-cyber tracking-widest uppercase mb-4">
            <Lock className="w-3.5 h-3.5" /> 
            {isArabic ? 'حماية البيانات والامتثال الأمني' : 'SECURITY & DATA COMPLIANCE'}
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-cyber tracking-tighter mb-4 neon-text">
            {isArabic ? 'سياسة' : 'PRIVACY'} <span className="text-white">{isArabic ? 'الخصوصية' : 'POLICY'}</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            {isArabic 
              ? 'إرشادات حماية البيانات وبروتوكولات خصوصية الطلاب لنادي DataCamp الطلابي بجامعة الابتكار.'
              : 'Data protection guidelines and student privacy protocols for DataCamp Student Club at Innovation University.'
            }
          </p>
          <div className="text-xs font-mono text-muted-foreground/60 mt-2">
            {isArabic ? 'آخر تحديث: يناير 2026 • الفصل الدراسي الأكاديمي' : 'Last Updated: January 2026 • Academic Operating Term'}
          </div>
        </div>

        <div className="space-y-10 text-muted-foreground text-sm sm:text-base leading-relaxed">
          {/* Section 1 */}
          <section className="glass p-8 rounded-2xl border border-white/10 space-y-4">
            <h2 className="text-xl font-cyber font-bold text-white flex items-center gap-2">
              <span className="text-primary font-mono text-sm">01.</span> 
              {isArabic ? 'البيانات التي نجمعها' : 'Information We Collect'}
            </h2>
            <p>
              {isArabic 
                ? 'يجمع نادي DataCamp المقاييس التعليمية اللازمة لتقديم تجربة أكاديمية مخصصة ومعتمدة:'
                : 'DataCamp Student Club collects necessary educational and verification metrics required to provide personalized academic services:'
              }
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
              {isArabic ? (
                <>
                  <li>بيانات الهوية والتواصل: الاسم القانوني، البريد الجامعي الرسمي (@edu.eg) أو الشخصي، الكلية والفرقة الدراسية.</li>
                  <li>النشاط الأكاديمي: معدل إكمال التمارين، درجات الاختبارات، ونقاط الخبرة المكتسبة (XP).</li>
                  <li>الأكواد البرمجية: الأكواد المقدمة عبر المحرر لتنفيذ المهام ومشاريع الطلاب المنشورة.</li>
                </>
              ) : (
                <>
                  <li>Identity & Contact Data: Full legal name, institutional email address (@edu.eg) or personal email, university department, and academic class standing.</li>
                  <li>Academic Activity: Exercise completion rates, assessment scores, live playground executions, and cumulative Experience Points (XP).</li>
                  <li>Interactive Code Artifacts: Source code submitted to the compiler playground for exercise validation and project showcases.</li>
                </>
              )}
            </ul>
          </section>

          {/* Section 2 */}
          <section className="glass p-8 rounded-2xl border border-white/10 space-y-4">
            <h2 className="text-xl font-cyber font-bold text-white flex items-center gap-2">
              <span className="text-primary font-mono text-sm">02.</span> 
              {isArabic ? 'كيفية استخدام البيانات' : 'How We Utilize Your Data'}
            </h2>
            <p>
              {isArabic
                ? 'تُستخدم البيانات المجمعة حصرياً لأغراض النادي التعليمية والتنظيمية:'
                : 'Collected parameters are strictly utilized for club operational and educational requirements:'
              }
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
              {isArabic ? (
                <>
                  <li>إصدار الشهادات الرقمية المعتمدة رسمياً برمز QR بالتعاون مع جامعة الابتكار.</li>
                  <li>تحديث ترتيب لوحة المتصدرين وتوزيع الشارات بدقة وفقاً للإنجاز الحقيقي.</li>
                  <li>إرسال الإشعارات والتنبيهات حول ورش العمل والهاكاثونات القادمة.</li>
                  <li>تخصيص توجيهات المرشد الذكي NEXUS وفقاً للوحدات المنجزة.</li>
                </>
              ) : (
                <>
                  <li>Issuing authentic digital certificates cryptographically accredited alongside Innovation University.</li>
                  <li>Maintaining accurate leaderboard standings and badge allocations based on genuine technical performance.</li>
                  <li>Transmitting important club dispatch notices regarding workshops, hackathons, and guest seminars.</li>
                  <li>Tailoring NEXUS AI mentor recommendations to your actual completed curriculum units.</li>
                </>
              )}
            </ul>
          </section>

          {/* Section 3 */}
          <section className="glass p-8 rounded-2xl border border-white/10 space-y-4">
            <h2 className="text-xl font-cyber font-bold text-white flex items-center gap-2">
              <span className="text-primary font-mono text-sm">03.</span> 
              {isArabic ? 'الأمان والتشفير السحابي' : 'Infrastructure Security & Encryption'}
            </h2>
            <p>
              {isArabic
                ? 'تُخزن جميع البيانات باستخدام بروتوكولات التشفير الحديثة (SSL/TLS)، مع إدارة جلسات المصادقة الآمنة عبر Firebase و OAuth 2.0، ولا تتم مشاركة أي بيانات طلابية مع جهات تجارية خارجية.'
                : 'All club data is stored securely using TLS encryption and protected via Firebase Authentication and OAuth 2.0 protocols. Student data is never sold or shared with third-party advertisers.'
              }
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
