-- ============================================================================
-- DataCamp Student Club - Comprehensive Seed Data for Supabase
-- Tables: courses, lessons, events, staff, projects, blog, gallery, settings
-- ============================================================================

-- 1. Initial Site Settings
INSERT INTO public.settings (key, value)
VALUES (
  'general',
  '{
    "siteName": "DataCamp",
    "siteSubName": "STUDENT CLUB",
    "description": "The Premier Student Tech Community for AI, Data Science & Engineering.",
    "contactEmail": "mart33645@gmail.com",
    "theme": "dark",
    "allowRegistrations": true
  }'::JSONB
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. Seed Courses & Lessons
DO $$
DECLARE
  c1_id UUID;
  c2_id UUID;
  c3_id UUID;
BEGIN
  -- Course 1: Python for Data Science
  INSERT INTO public.courses (
    title, slug, description, short_description, thumbnail_url,
    price, category, level, duration_hours, total_lessons, points_reward,
    instructor_name, instructor_title, is_published
  ) VALUES (
    'Python for Data Science & AI',
    'python-for-data-science',
    'احترف أساسيات بايثون، هياكل البيانات، ومكتبات NumPy و Pandas، واستكشاف البيانات (EDA) لتجهيزها لخوارزميات التعلم الآلي.',
    'من أساسيات بايثون إلى التلاعب المتقدم بالبيانات مع Pandas و NumPy.',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    0, 'data_science', 'beginner', 24, 5, 500,
    'د. تامر مصطفى', 'كبير باحثي الذكاء الاصطناعي والمشرف الأكاديمي', true
  )
  ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title
  RETURNING id INTO c1_id;

  IF c1_id IS NOT NULL THEN
    DELETE FROM public.lessons WHERE course_id = c1_id;
    INSERT INTO public.lessons (course_id, title, content, video_url, position, duration_minutes) VALUES
    (c1_id, '1. مقدمة في بيئة العمل وتثبيت Python & Jupyter', 'إعداد بيئة التطوير المحلية وتشغيل Jupyter Notebooks لتنفيذ أول كود تفاعلي.', 'https://www.youtube.com/embed/kqtD5dpn9C8', 1, 20),
    (c1_id, '2. المتغيرات والعمليات وهياكل البيانات الأساسية', 'شرح تفصيلي للمتغيرات والقوائم والقواميس والمجموعات مع تدريبات برمجية.', 'https://www.youtube.com/embed/kqtD5dpn9C8', 2, 35),
    (c1_id, '3. المصفوفات والعمليات الحسابية مع NumPy', 'إنشاء المصفوفات متعددة الأبعاد وإجراء العمليات الخطية والمتجهات بسرعة فائقة.', 'https://www.youtube.com/embed/kqtD5dpn9C8', 3, 40),
    (c1_id, '4. معالجة وتجهيز الجداول مع Pandas DataFrames', 'تحميل ملفات CSV و Excel، الفلترة، استخراج الإحصائيات، وتنظيف القيم المفقودة.', 'https://www.youtube.com/embed/kqtD5dpn9C8', 4, 45),
    (c1_id, '5. مشروع عملي: تحليل بيانات حقيقية وبناء الرسوم البيانية', 'مشروع متكامل لتحليل بيانات مبيعات حقيقية ورسم المخططات باستخدام Matplotlib و Seaborn.', 'https://www.youtube.com/embed/kqtD5dpn9C8', 5, 50);
  END IF;

  -- Course 2: Machine Learning Fundamentals
  INSERT INTO public.courses (
    title, slug, description, short_description, thumbnail_url,
    price, category, level, duration_hours, total_lessons, points_reward,
    instructor_name, instructor_title, is_published
  ) VALUES (
    'Machine Learning Fundamentals & Scikit-Learn',
    'machine-learning-essentials',
    'تعلم خوارزميات التعلم الخاضع وغير الخاضع للإشراف، الانحدار الخطي والتصنيف، وأشجار القرار، والتقييم الرياضي للنماذج.',
    'بناء النماذج التنبؤية وإتقان أشهر خوارزميات الذكاء الاصطناعي مع Scikit-Learn.',
    'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&auto=format&fit=crop&q=80',
    0, 'ai_ml', 'intermediate', 30, 4, 750,
    'م. سارة السيد', 'مسؤولة مسار التعلم الآلي بنادي داتا كامب', true
  )
  ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title
  RETURNING id INTO c2_id;

  IF c2_id IS NOT NULL THEN
    DELETE FROM public.lessons WHERE course_id = c2_id;
    INSERT INTO public.lessons (course_id, title, content, video_url, position, duration_minutes) VALUES
    (c2_id, '1. مقدمة في تعلم الآلة وتجهيز المميزات (Feature Engineering)', 'نظرة عامة على دورة حياة نموذج التعلم الآلي وكيفية اختيار وتجهيز البيانات.', 'https://www.youtube.com/embed/kqtD5dpn9C8', 1, 30),
    (c2_id, '2. خوارزميات الانحدار والتصنيف (Regression & Classification)', 'تطبيق Linear Regression و Logistic Regression مع قياس الدقة ومصفوفة الارتباك.', 'https://www.youtube.com/embed/kqtD5dpn9C8', 2, 45),
    (c2_id, '3. أشجار القرار والغابات العشوائية (Random Forests)', 'شرح كيفية عمل Ensemble Methods وبناء نماذج عالية الدقة لمقاومة الـ Overfitting.', 'https://www.youtube.com/embed/kqtD5dpn9C8', 3, 50),
    (c2_id, '4. التجميع غير الخاضع للإشراف مع K-Means Clustering', 'تطبيق خوارزميات تقسيم العملاء وتجميع البيانات المشابهة بدون تصنيفات مسبقة.', 'https://www.youtube.com/embed/kqtD5dpn9C8', 4, 40);
  END IF;

  -- Course 3: Deep Learning & Neural Networks
  INSERT INTO public.courses (
    title, slug, description, short_description, thumbnail_url,
    price, category, level, duration_hours, total_lessons, points_reward,
    instructor_name, instructor_title, is_published
  ) VALUES (
    'Deep Learning & Neural Networks with PyTorch',
    'deep-learning-pytorch',
    'بناء الشبكات العصبية الاصطناعية (ANN)، والشبكات الالتفافية (CNN) للرؤية الحاسوبية، والتعامل مع PyTorch لتدريب النماذج على GPU.',
    'من الخلايا العصبية إلى الرؤية الحاسوبية ومعالجة الصور المتقدمة.',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    0, 'deep_learning', 'advanced', 40, 3, 1000,
    'د. كريم عبد العزيز', 'أستاذ الذكاء الاصطناعي وباحث الرؤية الحاسوبية', true
  )
  ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title
  RETURNING id INTO c3_id;

  IF c3_id IS NOT NULL THEN
    DELETE FROM public.lessons WHERE course_id = c3_id;
    INSERT INTO public.lessons (course_id, title, content, video_url, position, duration_minutes) VALUES
    (c3_id, '1. أساسيات PyTorch والتفاضل التلقائي (Autograd)', 'مقدمة للـ Tensors، الحسابات الرياضية على كرت الشاشة، وحساب الانحدار تلقائياً.', 'https://www.youtube.com/embed/kqtD5dpn9C8', 1, 40),
    (c3_id, '2. بناء شبكة عصبية وتدريبها على تصنيف الصور', 'تصميم معماريات الطبقات المتصلة (Linear Layers)، دوال التنشيط، ودوال الخسارة.', 'https://www.youtube.com/embed/kqtD5dpn9C8', 2, 55),
    (c3_id, '3. الشبكات الالتفافية (CNNs) وتطبيق Transfer Learning', 'استخدام نماذج ResNet المدربة مسبقاً لحل مشاكل تصنيف الصور الواقعية بدقة تفوق 95%.', 'https://www.youtube.com/embed/kqtD5dpn9C8', 3, 60);
  END IF;
END $$;

-- 3. Seed Events
INSERT INTO public.events (title, description, date, location, capacity, registered_count, status)
VALUES
(
  'AI Hackathon 2026: Build The Future',
  'هاكاثون برمجي تنافسي مكثف على مدار 48 ساعة لبناء حلول ذكاء اصطناعي ونماذج تعلم آلي مبتكرة تخدم المجتمع والجامعة مع جوائز مالية وشهادات معتمدة.',
  '2026-11-15T09:00:00Z',
  'القاعة الكبرى للمؤتمرات - مبنى الابتكار',
  250,
  142,
  'published'
),
(
  'Data Science Bootcamp & Hands-on Workshop',
  'ورشة عمل تفاعلية لبناء خطوط معالجة البيانات واستخراج الرؤى التحليلية من مجموعات بيانات ضخمة مع خبراء الصناعة.',
  '2026-11-28T14:00:00Z',
  'معمل الحوسبة السحابية - مبنى الحاسبات',
  120,
  89,
  'published'
)
ON CONFLICT DO NOTHING;

-- 4. Seed Projects
INSERT INTO public.projects (title, description, status, author, category, technologies, featured)
VALUES
(
  'Nexus AI: Autonomous Campus Assistant',
  'مساعد ذكي مدعوم بنماذج اللغة الكبيرة لمساعدة الطلاب في الجداول الدراسية والمناهج والإجابة عن الاستفسارات الأكاديمية.',
  'active',
  'فريق الذكاء الاصطناعي بنادي داتا كامب',
  'Generative AI',
  ARRAY['Python', 'PyTorch', 'FastAPI', 'React', 'TailwindCSS'],
  true
),
(
  'VisionHealth: Medical Imaging Classifier',
  'نظام رؤية حاسوبية لتشخيص وفحص صور الأشعة السينية بدقة عالية باستخدام شبكات CNN العميقة ومكتبة PyTorch.',
  'active',
  'م. عمار طاحون وفريق البحث العلمي',
  'Computer Vision',
  ARRAY['Python', 'TorchVision', 'NumPy', 'OpenCV'],
  true
)
ON CONFLICT DO NOTHING;

-- 5. Seed Staff Members
INSERT INTO public.staff (name, role, category, image)
VALUES
(
  'عمار طاحون (Ammar Tahoun)',
  'Founder & Super Admin 👑',
  'Board',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Ammar'
),
(
  'سارة حسن (Sara Hassan)',
  'Lead Community Coordinator & Student Rep',
  'Operations',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Sara'
)
ON CONFLICT DO NOTHING;
