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
            {isArabic ? 'آخر تحديث: 15 أكتوبر 2026' : 'Last updated: 15 October 2026'}
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
                ? 'تستخدم المنصة TLS أثناء نقل البيانات، وSupabase لحفظ بيانات الحساب والتعلم وإدارة المصادقة. تستخدم ميزات ملفات الكورسات وتحليل الفيديو خدمات Google كما هو موضح أدناه.'
                : 'The platform uses TLS for data transfer and Supabase for account and learning records and authentication. Course files and video analysis use Google services as described below.'
              }
            </p>
          </section>
          <section className="glass p-8 rounded-2xl border border-white/10 space-y-4">
            <h2 className="text-xl font-cyber font-bold text-white">
              <span className="text-primary font-mono text-sm">04. </span>
              {isArabic ? 'ملفات الكورسات وGoogle Drive وتحليل Gemini' : 'Course files, Google Drive and Gemini analysis'}
            </h2>
            <p>{isArabic
              ? 'يربط المدير حساب Google Drive بموافقته عبر OAuth بصلاحية drive.file لإدارة الملفات التي ينشئها التطبيق أو يُسمح له باستخدامها. تحفظ المنصة رمز التجديد مشفرًا على الخادم، ومراجع الملفات وبصماتها في قاعدة البيانات. ملفات الفيديو والماتريال المرفوعة تكون متاحة لمن يمتلك رابط Drive؛ المسودة غير المنشورة لا توفر حماية للرابط من إعادة المشاركة.'
              : 'An administrator connects Google Drive through OAuth consent with the drive.file scope for files created by or explicitly made available to this app. Refresh tokens are encrypted on the server; file references and hashes are stored in the database. Uploaded videos and materials are accessible to anyone with their Drive link. An unpublished course does not prevent redistribution of that link.'}</p>
            <p>{isArabic
              ? 'عند اختيار تحليل الفيديو، تُرسل نسخة إلى Gemini لتوليد ملخص وأسئلة وتطبيق برمجي عند وجود محتوى مناسب. يُحفظ الناتج للمراجعة قبل اعتماده. يمكن تعطيل التحليل التلقائي من محرر الدرس. وفق شروط خدمات Gemini المجانية، قد تستخدم Google المدخلات والمخرجات لتحسين خدماتها وتراجعها بشريًا؛ لا تستخدم هذه الميزة لمحتوى شخصي أو سري أو حساس.'
              : 'When video analysis is selected, a copy is sent to Gemini to generate a summary, questions and coding practice where appropriate. Results are saved for review before applying them. Automatic analysis can be turned off in the lesson editor. Under the unpaid Gemini service terms, Google may use inputs and outputs to improve its services and may have them reviewed by humans. Do not use this feature for personal, confidential or sensitive content.'}</p>
            <p>{isArabic
              ? 'يمكن للمدير إلغاء وصول التطبيق من إعدادات اتصالات حساب Google. حذف درس يزيل مراجع ملفاته من المنصة ولا يحذف النسخة الأصلية من Drive؛ حذفها يتم من حساب مالك الملف. تحفظ المنصة كذلك موضع مشاهدة الدرس لحساب المتعلم لاستكماله لاحقًا.'
              : 'Administrators can revoke access through their Google Account connections. Deleting a lesson removes its platform file references, not the original Drive files; the file owner manages deletion in Drive. The platform also saves each learner’s video position for later resumption.'}</p>
            <div className="flex flex-wrap gap-4 text-primary underline">
              <a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noopener noreferrer">{isArabic ? 'شروط Gemini' : 'Gemini terms'}</a>
              <a href="https://myaccount.google.com/connections" target="_blank" rel="noopener noreferrer">{isArabic ? 'إدارة اتصالات حساب Google' : 'Manage Google Account connections'}</a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
