import React from 'react';
import { FileCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export const Terms = () => {
  const { isArabic } = useLanguage();

  return (
    <div className="pt-20 md:pt-32 pb-24 min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-cyber tracking-widest uppercase mb-4">
            <FileCheck className="w-3.5 h-3.5" /> 
            {isArabic ? 'ميثاق الشرف الأكاديمي والنزاهة' : 'ACADEMIC CODE OF CONDUCT'}
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-cyber tracking-tighter mb-4 neon-text">
            {isArabic ? 'شروط' : 'TERMS OF'} <span className="text-white">{isArabic ? 'الخدمة' : 'SERVICE'}</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            {isArabic
              ? 'شروط العضوية وميثاق الشرف الأكاديمي لنادي DataCamp الطلابي بجامعة الابتكار.'
              : 'Member conditions and academic honor code for DataCamp Student Club at Innovation University.'}
          </p>
          <div className="text-xs font-mono text-muted-foreground/60 mt-2">
            {isArabic ? 'الفصل الدراسي الأكاديمي 2025/2026 • ميثاق الشرف الإصدار 2.0' : 'Academic Term 2025/2026 • Honor Code Charter v2.0'}
          </div>
        </div>

        <div className="space-y-10 text-muted-foreground text-sm sm:text-base leading-relaxed">
          {/* Section 1 */}
          <section className="glass p-8 rounded-2xl border border-white/10 space-y-4">
            <h2 className="text-xl font-cyber font-bold text-white flex items-center gap-2">
              <span className="text-primary font-mono text-sm">01.</span> 
              {isArabic ? 'شروط العضوية والأهلية الأكاديمية' : 'Membership Terms & Eligibility'}
            </h2>
            <p>
              {isArabic 
                ? 'بالدخول إلى المنصة والمشاركة في أنشطة النادي، يوافق الأعضاء على ما يلي:'
                : 'By accessing the platform and participating in club activities, members agree to:'}
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
              {isArabic ? (
                <>
                  <li>تقديم بيانات هوية صحيحة ومطابقة للبيانات الجامعية الرسمية أثناء التسجيل.</li>
                  <li>الحفاظ على سرية بيانات تسجيل الدخول وعدم مشاركة الحسابات الشخصية مع الآخرين.</li>
                  <li>الالتزام بحضور الورش التدريبية والمعسكرات داخل الحرم الجامعي بعد تأكيد التسجيل احتراماً للمقاعد المحدودة.</li>
                </>
              ) : (
                <>
                  <li>Provide truthful identification data corresponding to valid university or student credentials during onboarding.</li>
                  <li>Maintain the confidentiality of individual login tokens and refrain from account sharing.</li>
                  <li>Honor confirmed registrations for on-campus bootcamps and workshops to respect limited seating capacities.</li>
                </>
              )}
            </ul>
          </section>

          {/* Section 2 */}
          <section className="glass p-8 rounded-2xl border border-white/10 space-y-4">
            <h2 className="text-xl font-cyber font-bold text-white flex items-center gap-2">
              <span className="text-primary font-mono text-sm">02.</span> 
              {isArabic ? 'النزاهة الأكاديمية وسياسة التقييم' : 'Academic Integrity & Assessment Policy'}
            </h2>
            <p>
              {isArabic
                ? 'إتقان المهارات الحقيقي هو حجر الأساس في مجتمعنا الأكاديمي بجامعة الابتكار:'
                : 'Genuine skill mastery is the bedrock of our community at Innovation University:'}
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
              {isArabic ? (
                <>
                  <li>يُحظر تماماً الانتحال الأكاديمي في الاختبارات أو التلاعب البرمجي لجمع نقاط الخبرة (XP).</li>
                  <li>يجب أن تكون التحديات البرمجية والمشاريع المرفوعة عملاً أصلياً للطالب مع الإشارة المناسبة للمكتبات مفتوحة المصدر.</li>
                  <li>يحتفظ المشرفون الأكاديميون بحق إلغاء النقاط أو سحب الشهادات الصادرة في حال ثبوت عدم النزاهة الأكاديمية.</li>
                </>
              ) : (
                <>
                  <li>Strict prohibition against plagiarism on unit quizzes or automated XP farming manipulations.</li>
                  <li>Submitted code challenges and repository projects must represent original student work, with appropriate attribution for open-source libraries.</li>
                  <li>Club faculty leads and academic evaluators reserve the right to revoke points or recall issued credentials upon verified academic dishonesty.</li>
                </>
              )}
            </ul>
          </section>

          {/* Section 3 */}
          <section className="glass p-8 rounded-2xl border border-white/10 space-y-4">
            <h2 className="text-xl font-cyber font-bold text-white flex items-center gap-2">
              <span className="text-primary font-mono text-sm">03.</span> 
              {isArabic ? 'الملكية الفكرية والشهادات المعتمدة' : 'Intellectual Property & Verified Credentials'}
            </h2>
            <p>
              {isArabic
                ? 'جميع الأصول التعليمية والشعارات والشهادات المعتمدة محمية أكاديمياً وقانونياً:'
                : 'All educational assets, official insignias, and certified credentials are legally protected:'}
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
              {isArabic ? (
                <>
                  <li>الشهادات الرقمية المزودة بهاش تحقق ورمز QR هي وثائق رسمية معتمدة؛ وتعديلها غير مصرح به على الإطلاق.</li>
                  <li>المناهج الدراسية ودفاتر الملاحظات البرمجية مخصصة للتعلم الذاتي الشخصي ولا يجوز بيعها تجارياً.</li>
                </>
              ) : (
                <>
                  <li>Digital certificates featuring verification hashes and QR tokens are authentic university-affiliated credentials; unauthorized alteration is strictly prohibited.</li>
                  <li>Course curricula and proprietary notebooks are intended for individual educational use and may not be resold commercially.</li>
                </>
              )}
            </ul>
          </section>

          {/* Section 4 */}
          <section className="glass p-8 rounded-2xl border border-white/10 space-y-4">
            <h2 className="text-xl font-cyber font-bold text-white flex items-center gap-2">
              <span className="text-primary font-mono text-sm">04.</span> 
              {isArabic ? 'الاستخدام العادل للمحرر ومرشد الذكاء الاصطناعي' : 'Fair Use: Compiler & AI Systems'}
            </h2>
            <p>
              {isArabic
                ? 'تخضع بيئات تشغيل الأكواد ونظام مرشد الذكاء الاصطناعي NEXUS لسياسات الاستخدام العادل:'
                : 'Execution playgrounds and NEXUS AI Mentor systems are governed by fair computing policies:'}
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
              {isArabic ? (
                <>
                  <li>حظر تشغيل الأكواد الضارة أو فحص الشبكات أو التعدين الرقمي أو محاولات تعطيل الخوادم.</li>
                  <li>تطبيق حدود معقولة لمعدل الطلبات لحماية البنية التحتية البرمجية لجميع الطلاب.</li>
                </>
              ) : (
                <>
                  <li>Prohibition of malicious code execution, network scanning, cryptographic mining, or intentional service disruption.</li>
                  <li>Reasonable request rate limits are enforced to protect compute infrastructure for the entire student body.</li>
                </>
              )}
            </ul>
          </section>
        </div>

        <div className="mt-16 text-center">
          <Link to="/faq" className="text-primary hover:underline text-sm font-cyber inline-flex items-center gap-2">
            <span>{isArabic ? '← لديك استفسارات؟ تفضل بزيارة صفحة الأسئلة الشائعة (FAQ)' : '← Have questions? Review our Frequently Asked Questions (FAQ)'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Terms;
