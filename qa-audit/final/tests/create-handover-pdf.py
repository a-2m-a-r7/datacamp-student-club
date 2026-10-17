from pathlib import Path
import sys,json,re,csv
sys.path.insert(0,str(Path('qa-audit/.runtime/pdf-libs').resolve()))
import arabic_reshaper
from bidi.algorithm import get_display
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from PIL import Image
from pypdf import PdfReader

root=Path.cwd(); final=root/'qa-audit/final'; out=root/'output/pdf/DataCamp_Audit_2026-10-17_AR.pdf'
metrics=json.loads((final/'evidence/QA_TEST_delivery_metrics.json').read_text())
fullpath=final/'evidence/runs/QA_TEST_full_delivery_504/results.json'; stats=json.loads(fullpath.read_text())['stats'] if fullpath.exists() else {}
bugcount=len(re.findall(r'^## BUG-\d+', (final/'BUGS.md').read_text(encoding='utf-8'),re.M))
cleanup=final/'evidence/QA_TEST_cleanup_executed.json'; cleaned=cleanup.exists() and json.loads(cleanup.read_text()).get('status')=='passed'
if '--final' in sys.argv and (stats.get('expected')!=504 or stats.get('unexpected') or stats.get('skipped') or not cleaned):raise RuntimeError('Final PDF requires completed passing browser run and verified hosted cleanup')
pdfmetrics.registerFont(TTFont('AR','C:/Windows/Fonts/tahoma.ttf'));pdfmetrics.registerFont(TTFont('ARB','C:/Windows/Fonts/tahomabd.ttf'));pdfmetrics.registerFont(TTFont('Mono','C:/Windows/Fonts/consola.ttf'))
out.parent.mkdir(parents=True,exist_ok=True);c=canvas.Canvas(str(out),pagesize=(595.28,841.89));c.setTitle('DataCamp - Audit and Handover - 17 October 2026');c.setAuthor('DataCamp project QA')
W,H=595.28,841.89;M=43;content=W-2*M;navy='#102334';green='#008f70';gray='#4b5863';y=0;page=0
def rtl(t):return get_display(arabic_reshaper.reshape(str(t)))
def wrap(text,width,font='AR',size=10.5):
 result=[];line=''
 for word in text.split():
  trial=(line+' '+word).strip()
  if pdfmetrics.stringWidth(rtl(word),font,size)>width:
   if line:result.append(line);line=''
   chunk=''
   for ch in word:
    if chunk and pdfmetrics.stringWidth(rtl(chunk+ch),font,size)>width:result.append(chunk);chunk=ch
    else:chunk+=ch
   line=chunk
  elif line and pdfmetrics.stringWidth(rtl(trial),font,size)>width:result.append(line);line=word
  else:line=trial
 if line:result.append(line)
 return result
def para(text,size=10.5,gap=11,color=gray):
 global y
 c.setFillColor(HexColor(color));c.setFont('AR',size)
 for line in wrap(text,content,'AR',size):
  if y<62:raise RuntimeError('Page overflow '+str(page))
  c.drawRightString(W-M,y,rtl(line));y-=size*1.72
 y-=gap
def heading(text):
 global y
 c.setFont('ARB',12);c.setFillColor(HexColor(green));c.drawRightString(W-M,y,rtl(text));y-=25
def start(title,kicker='تقرير المراجعة والتسليم'):
 global page,y
 if page:c.showPage()
 page+=1;c.setFillColor(HexColor('#f5f8fa'));c.rect(0,H-104,W,104,fill=1,stroke=0);c.setFillColor(HexColor(green));c.rect(W-12,0,12,H,fill=1,stroke=0)
 c.setFont('Mono',9);c.setFillColor(HexColor(green));c.drawString(M,H-31,'DATACAMP / STUDENT CLUB')
 c.setFont('AR',9);c.setFillColor(HexColor(gray));c.drawRightString(W-M,H-31,rtl(kicker));c.setFont('ARB',19);c.setFillColor(HexColor(navy));c.drawRightString(W-M,H-72,rtl(title))
 c.setStrokeColor(HexColor('#dce5e9'));c.line(M,43,W-M,43);c.setFont('AR',8);c.setFillColor(HexColor(gray));c.drawRightString(W-M,28,rtl('17 أكتوبر 2026 | فرع tester-final | مراجعة قبل النشر'));c.setFont('Mono',8);c.drawString(M,28,f'{page:02d} / 10');y=H-135
def image(path,maxheight=300):
 global y
 path=Path(path);im=Image.open(path);w,h=im.size;scale=min(content/w,maxheight/h);ww,hh=w*scale,h*scale
 if y-hh<65:raise RuntimeError('Image overflow')
 c.drawImage(ImageReader(im),M+(content-ww)/2,y-hh,width=ww,height=hh,mask='auto');y-=hh+19
def first(glob):return next(root.glob(glob))

start('مراجعة DataCamp قبل التسليم')
para('هذا التقرير يجمع الأعمال المنفذة منذ بداية تطوير ومراجعة المشروع، مع فصل سجل الأعمال السابقة عن الاختبارات الفعلية للتدقيق الحالي. بيانات الإنتاج مستبعدة من اختبارات وترحيلات هذه الجولة.')
heading('حالة النسخة الحالية')
fulltext=f"اكتملت الجولة الحالية: {stats.get('expected')} حالة ناجحة، {stats.get('unexpected',0)} فشل، {stats.get('skipped',0)} تخطٍّ." if stats else 'الجولة الشاملة الحالية ما زالت قيد التنفيذ. هذه نسخة مراجعة للتقرير، وليست اعتمادًا نهائيًا.'
para(fulltext,size=12,color=navy)
para(f'أُصلحت {bugcount} مشكلة مثبتة، لكل مشكلة commit مستقل. آخر commit لتغييرات التطبيق: {metrics["sourceCommit"]}. البناء وفحص الأنواع والتثبيت النظيف ونتائج الخدمات الحقيقية موضحة في الصفحات التالية.')
para('اختُبرت رحلة تعلم فعلية في QA: فيديو وترجمة وحفظ المشاهدة، كويز ثنائي اللغة، تمرين Python، إكمال محفوظ بنسبة 100% وشهادة واحدة تلقائية وتنزيل PDF.')
heading('اعتماد النشر ما زال مطلوبًا')
para('لم يُنفذ merge أو push أو نشر إلى Vercel خلال هذا التدقيق. الرابط العام الحالي يعرض نسخة منشورة سابقة. اعتماد التقرير ومراجعة الترحيلات على الهدف يسبقان أي نشر واختبار حي لاحق.')
para('لا تعني النتائج ضمان غياب كل خطأ محتمل. الاختبارات المنفذة والقيود والعناصر غير المثبتة مسجلة صراحةً؛ لا تُعرض قوائم المصدر أو اختبارات المحاكاة بوصفها نجاحًا لخدمة خارجية.')

start('ما تغيّر منذ بداية العمل')
heading('الحسابات والخصوصية')
para('مراجعة الدخول بالبريد وGoogle والرجوع من OAuth والجلسات المستقلة لكل تبويب، والبروفايل وتعديل بياناته وإعدادات الأمان. حفظ صور الحسابات في Storage مع مرجع في قاعدة البيانات، والتحقق من منع تعديل صورة أو بيانات مستخدم آخر.')
para('حصر دليل الأعضاء والبحث فيه على الأدمن في الواجهة والخادم وقاعدة البيانات. إصلاح مسارات التصعيد غير المصرح به وتزوير XP وصلاحيات جدول المستخدمين القديم. المحافظة على البيانات التجارية غير المتعلقة بالنادي خارج نطاق التدقيق.')
heading('العضوية والتعلم')
para('مراجعة بطاقة العضوية وQR والتنزيل والتحقق، وإصدار الشهادات آليًا عند إكمال شروط الكورس. تجهيز بيانات ورابط إضافة الشهادة أو مشاركتها على LinkedIn؛ يبقى تأكيد الإضافة أو النشر من حساب المتعلم على LinkedIn.')
para('تنظيم الكورسات والدروس والوحدات، ترتيبها بالسحب، مواد مرفقة وترجمة SRT/VTT وحفظ موضع المشاهدة. جعل الكويز والتطبيق مرتبطين بالدرس ومراجعة المحتوى قبل اعتماده، مع تتبع التقدم والشهادة من البيانات المحفوظة.')
heading('الإدارة والتشغيل')
para('مراجعة الأحداث والتسجيل والسعة والحضور، والنماذج وأنواع الأسئلة ومسارات الانتقال، والموظفين والمعرض والمشروعات والمدونة والرسائل والإشعارات والنقاط والإعدادات والتصدير. تفاصيل كل سيناريو محفوظة في مصفوفة الاختبار وسجلاته.')
para('أُنشئت بيئة Supabase QA ومشروع Google QA مستقلان، دون تفعيل فوترة أو تغيير موارد الإنتاج في هذه الجولة. ملخصات التسليم الأقدم محفوظة كسجل تاريخي وليست بديلًا عن نتائج هذه المراجعة.')

start('الكورسات والرفع والذكاء الاصطناعي')
para('مناطق رفع للفيديو والماتريال والترجمة تدعم السحب والإفلات والضغط وEnter لاختيار ملف. التحقق من النوع والحجم والملف الفارغ وتعدد الملفات قبل الرفع، وحالات انتظار وإيقاف واستئناف واضحة.')
para('الرفع الكبير يذهب على أجزاء إلى Google Drive مع بصمة/hash واستئناف؛ الحد المعلن 2 GiB. الفيديو الاصطناعي المنقول فعليًا 47,808,659 بايت. لم يُختبر نقل ملف 2 جيجا فعليًا أو أداء ألف مشاهد.')
para('حلّل Gemini فيديو QA الاصطناعي، وأنتج ثلاثة أسئلة بالعربية والإنجليزية وتمرين Python. روجع الناتج ثم أُضيفت الدروس إلى قاعدة البيانات. أضيف stdin قابل للتحرير للتجربة؛ تسليم الحل يختبر الحالات المعتمدة ويحدّث التقدم فعليًا.')
image(first('qa-audit/final/evidence/runs/QA_TEST_course_presentation_03/artifacts/*1440/course-catalog-en.png'),270)
para('عرض من اختبار الكتالوج ببيانات QA المعلّمة؛ الصور والتقدم والعدادات مشتقة من البيانات، مع بديل محايد للصورة المفقودة.',size=9)

start('الأمان والبيانات والتكاملات')
heading('صلاحيات قاعدة البيانات')
para('تثبيت نظيف بلا بيانات تجريبية قديمة: 34 جدولًا مع RLS و16 جدولًا في Realtime. نجح 816 فحص CRUD بصلاحيات الترحيلات الأصلية فقط، إضافة إلى اختبارات الحدود والملكية ومنع التصعيد. مفاتيح الخادم لا تدخل ملفات المتصفح.')
para('ترحيلات التصحيح الموافق عليها طُبقت محليًا أو في QA بحسب الإذن، ولم تُطبق على الإنتاج ضمن هذا التدقيق. إضافة أو ترقية بيئة الإنتاج تحتاج مراجعة سجل ترحيلاتها واعتمادًا مستقلًا.')
heading('مزامنة Google Sheets')
para('استُخدم ربط Drive لمالك النموذج بصلاحية drive.file لإنشاء الشيت في مساحة المالك. المزامنة تعيد صفوف الردود وعناوين الأسئلة من قاعدة البيانات وتنسّق الطلبات المتزامنة عبر جدول خادم خاص، فتمنع نسخ الرد عند إعادة المحاولة.')
para('تأكد الاختبار الحقيقي من حذف الأعمدة القديمة بعد Z، وإضافة الأسئلة، والتعافي من فشل متعمّد، و8 طلبات متوازية وتطابق 1003 ردود. الرد 202 يعني انتظارًا صريحًا؛ قد يلزم Resync all بعد انتهاء مهلة طلب متوقف.')
heading('حدود فحص الأمان')
para('فحص الأسرار يجمع مطابقة القيم الفعلية المعروفة مع أنماط مفاتيح شائعة دون عرض قيمها. تنبيهات Supabase عن واجهات عامة محدودة وصلاحيات SECURITY DEFINER وحماية كلمات المرور المكشوفة موثقة للمراجعة؛ لا يُقال إن لوحة التنبيهات فارغة.')

bug_titles=[
'عزل إعدادات QA عن مفاتيح الإنتاج','قصر ترقية الأدمن القديمة على الخادم','منع تزوير حقول المستخدم المشتقة','حجب دالة عداد الكورس عن العميل','إصلاح الترتيب والانتقال في النموذج العام','احترام الأسئلة المطلوبة التي يتجاوزها المسار','حفظ أدلة الجولات وتصدير الصور','بديل واضح للوسائط المفقودة','صلاحيات صريحة للتثبيت النظيف','رفض طلب AI الفارغ قبل استدعاء الخدمة','التحقق من إجابات مسار النموذج الفعلي','تفعيل RLS للمستخدمين في التثبيت النظيف','إضافة جداول الاشتراك إلى Realtime','إتاحة اختيار الإجابات والتقييم بالكيبورد','منع زر التالي من تسليم النموذج تلقائيًا','توافق الحد الأدنى لـNode مع Supabase','تكبير زر إظهار كلمة المرور وإتاحته','تصحيح تسلسل عناوين الصفحات','ملف robots.txt صالح لمحركات البحث','تأجيل حزم PDF والرسوم إلى وقت الحاجة','إنشاء Sheets عبر ربط مالك النموذج','استخدام نماذج Gemini مدعومة وقابلة للضبط','ثبات موضع الصفحة أثناء التحميل','تنسيق مزامنة Sheets ومنع التكرار','حالة حفظ صحيحة لخطة الدرس دون Pause','عرض الكود والأسطر في الكويز بشكل مقروء','إظهار أحجام الملفات المحفوظة بدقة','تمرير stdin قابل للتحرير للتطبيق البرمجي','تأكيد التسجيل حسب بيانات البروفايل الفعلية']
bug_titles.append('منع تداخل ذيل الصفحة مع أزرار الإدارة')
with (final/'bugs.csv').open(encoding='utf-8-sig')as f:bugrows=list(csv.DictReader(f))
def bugpage(startnum,endnum):
 global y
 start(f'سجل الإصلاحات: {startnum:03d} - {endnum:03d}')
 para('كل صف يشير إلى عيب مُعاد إنتاجه وإصلاح مستقل. خطوات الإعادة والنتيجة والأدلة والقيود كاملة في BUGS.md وbugs.csv.',size=10)
 for number in range(startnum,endnum+1):
  row=bugrows[number-1];height=34 if number%2 else 34
  if number%2:c.setFillColor(HexColor('#f1f6f7'));c.rect(M-3,y-height+7,content+6,height,fill=1,stroke=0)
  c.setFont('Mono',8);c.setFillColor(HexColor(green));c.drawString(M+3,y-5,row['ID']);c.setFont('Mono',7.5);c.setFillColor(HexColor(gray));c.drawString(M+3,y-19,row['Commit'])
  lines=wrap(bug_titles[number-1],content-105,'AR',10)
  c.setFont('AR',10);c.setFillColor(HexColor(navy))
  for i,line in enumerate(lines):c.drawRightString(W-M-5,y-7-i*14,rtl(line))
  y-=height
 y-=15;para('حالة التحقق ونطاقه تختلف حسب العيب: محلي أو QA حقيقي. لا توجد موافقة نشر ضمن هذه النتائج.',size=9)
bugpage(1,15);bugpage(16,len(bugrows))

start('الاختبارات وملف الشهادة')
para(fulltext)
para('نتائج منفصلة: 37 اختبار Node، و61 اختبار ميزات SQL بصلاحيات المصدر، و816 فحص CRUD، و19 فحص تنسيق ومهلات وصلاحيات المزامنة. هذه الأعداد مجموعات مختلفة ولا تُجمع كنسبة تغطية.')
para('فحوص Supabase الحقيقية: 12 فحص Auth وREST وStorage وRealtime، و6 حالات بروفايل في المتصفح. اختبارات النوافذ الثلاث واللغتين تستخدم سيناريوهات محددة؛ فهرس عناصر المصدر لا يثبت تنفيذ كل احتمال لكل عنصر.')
image(root/'tmp/pdfs/actual-course/certificate.png',315)
para('ملف PDF حقيقي صدر من إكمال المتعلم الاصطناعي. فُتح باستخدام Poppler ورُوجعت الصفحة بصريًا، ولم يعتمد التحقق على امتداد الملف وحده.',size=9)

start('الأداء والضغط والحدود الخارجية')
heading('القياسات المتاحة')
para('تثبيت نظيف: 253 حزمة مثبّتة و254 مفحوصة، دون ثغرات مسجلة من npm audit. يظهر تنبيه تقادم واحد في اعتماد غير مباشر node-domexception؛ لم يُخفَ التنبيه أو يُحذف اعتماد دون موافقة.')
para(f"بناء النسخة النظيفة: {metrics['buildFiles']} ملفًا، {metrics['buildBytes']:,} بايت. الاعتمادات المباشرة: 21 إنتاجية و13 تطويرية. أصلح فصل الحزم تحميل PDF والرسوم مبكرًا دون حاجة.")
para('عينات Lighthouse المحلية للموبايل على النسخة الحالية: الدخول 67، الكورسات 72، والرئيسية 71 للأداء. سهولة الوصول وأفضل الممارسات وSEO وصلت إلى 100 في العينات المذكورة. ليست هذه نتيجة إنتاج مضغوط عبر CDN.')
heading('ما لم يثبت بعد')
para('اختبار PostgreSQL السابق استخدم 1000 عضو اصطناعي و20 اتصالًا و10,000 عملية ناجحة. لا يثبت 1000 مستخدم متزامن على Supabase وVercel وDrive المجاني، ولا يثبت معدل نقل فيديوهات كبيرة.')
para('C++ وJava وGo وRust تحتاج خادم تشغيل Piston مستقلًا؛ وافق المالك على توضيح الإعداد في التقرير. يلزم عنوان خدمة عامة مضبوط، وعزل للكود وحدود موارد ومهلات، وإضافة أصلها إلى CSP.')
para('تسليم رسائل البريد إلى صندوق اختبار والتبديل بين هويتين مختلفتين في Google لم يثبتا في هذه الجولة. كذلك لا يُعامل حد الحجم المعلن أو نجاح نموذج Gemini واحد بوصفه ضمانًا لحصة مجانية مستمرة.')

start('التنظيف والموارد المحتفظ بها')
para('حالة تنظيف QA: '+('اكتمل التنظيف المحدد وتحقق بقاء الحساب والتسجيل الشخصي.' if cleaned else 'مؤجل حتى انتهاء كل الاختبارات وفق شرط الموافقة السابقة. لم تُحسب خطة التنظيف كتنفيذ.'))
para('القائمة الدقيقة في CLEANUP.md وأدلة QA_TEST_cleanup. تشمل الموارد الاصطناعية الثلاثة في Drive وشيت الاختبار وملف Gemini المؤقت، وسجلات الكورس والنموذج والحسابات المؤقتة وصورها. ملفات Drive تُنقل إلى المهملات القابلة للاستعادة.')
heading('موارد محمية أو تحتاج إذنًا آخر')
para('حساب Google المالك في QA محفوظ ودوره أعيد إلى user. الفيديو الشخصي الذي اختير أثناء تسليم الرفع محفوظ مع مرجع الكورس؛ لم يُحلل بواسطة AI. ربط Drive ومشروع Google QA ومفاتيحه المحلية محفوظة للمالك.')
para('موافقة تنظيف الملفات تشمل أربعة مجلدات متولدة فقط: dist وnode_modules/.vite وtest-results وqa-audit/site-build، بعد توقف الاختبارات وفحص المسار وحالة Git. نسخ QA وأدوات runtime والتنزيلات ليست مشمولة بهذا الإذن.')
para('لا تحتوي ملفات التقرير أو الواجهة على مفاتيح الخادم. ملفات الإعداد السرية محلية ومتجاهلة من Git. عند نقل الملكية، يحدد المالك حسابات الخدمات المطلوبة ويضبط مفاتيح البيئة الجديدة أو يلغي موارد QA التي لم يعد يحتاجها.')

start('خطوات التسليم والاعتماد')
heading('إعادة التشغيل من نسخة نظيفة')
para('استخدم Node 22 أو أحدث وnpm 10 أو أحدث. ثبّت عبر npm ci، واضبط نسخة محلية من .env.example بمشروع غير إنتاجي. لتثبيت قاعدة جديدة استخدم الترحيلات الأساسية من 20261013 مرتبة، بما فيها ترحيل تنسيق Sheets بتاريخ 20261017065319؛ تجنب seeds التاريخية.')
para('اضبط Supabase URL والمفتاح العام ورابط الموقع في الواجهة. أبقِ service_role ومفاتيح Gemini وGoogle خاصة بالخادم. جهّز قوائم رجوع Auth وOAuth وDrive للبيئة نفسها، ثم اختبر البناء والأنواع والصلاحيات والتكاملات.')
heading('قبل GitHub وVercel')
para('راجع التقرير والمصفوفة وحدود الخدمات، ثم اعتمد الفرع والتغييرات والترحيلات المقترحة للإنتاج. بعد إذن صريح منفصل: push أو merge ونشر commit المعتمد، ثم فحص حي للرابط وترويسات الأمان والدخول والأدوار والرفع والتنزيل.')
para('المشروع خاص مع UNLICENSED، وتبقى إشعارات حقوق الأطراف الأخرى. الملفات التشغيلية المرجعية: README.md وHANDOVER.md وdocs/deployment-guide.md وdocs/maintenance-guide.md وqa-audit/final/RESULTS-20261017.md.')
para('الموقع العام السابق: https://datacamp-student-club.vercel.app')
para('المستودع: https://github.com/a-2m-a-r7/datacamp-student-club')
para('مراجع الإعداد: supabase.com/docs/guides/database/postgres/row-level-security وdevelopers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/request. الأدلة المحلية هي مرجع نتائج الاختبار؛ الوثائق الخارجية مرجع سلوك المنصة.')
c.save();assert page==10;reader=PdfReader(str(out));assert len(reader.pages)==10
print(json.dumps({'output':str(out),'pages':len(reader.pages),'bytes':out.stat().st_size,'final':bool('--final'in sys.argv)},ensure_ascii=True))
