-- ============================================================================
-- DataCamp Student Club - Migration 20261010000001: Seed Initial Courses & Lessons
-- ============================================================================

DO $$
DECLARE
  course1_id UUID;
  course2_id UUID;
  course3_id UUID;
BEGIN
  -- 1. Insert Course: Python for Data Science & AI
  INSERT INTO public.courses (
    title,
    slug,
    description,
    short_description,
    thumbnail_url,
    price,
    category,
    level,
    duration_hours,
    total_lessons,
    points_reward,
    instructor_name,
    instructor_title,
    is_published
  )
  VALUES (
    'Python for Data Science & AI',
    'python-for-data-science',
    'احترف أساسيات بايثون، والتعامل مع هياكل البيانات، ومكتبات NumPy و Pandas، وتحليل واستكشاف البيانات (EDA) لتجهيزها لخوارزميات التعلم الآلي.',
    'من أساسيات بايثون إلى التلاعب المتقدم بالبيانات مع Pandas و NumPy.',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    0,
    'data_science',
    'beginner',
    24,
    5,
    500,
    'د. تامر مصطفى',
    'كبير باحثي الذكاء الاصطناعي والمشرف الأكاديمي',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    thumbnail_url = EXCLUDED.thumbnail_url
  RETURNING id INTO course1_id;

  -- Lessons for Course 1
  IF course1_id IS NOT NULL THEN
    DELETE FROM public.lessons WHERE course_id = course1_id;

    INSERT INTO public.lessons (course_id, title, content, video_url, position, duration_minutes) VALUES
    (course1_id, '1. مقدمة في بيئة العمل وتثبيت Python & Jupyter', 'في هذا الدرس سنتعرف على كيفية إعداد بيئة التطوير المحلية وتشغيل Jupyter Notebooks لتنفيذ أول كود بايثون تفاعلي.', 'https://www.youtube.com/embed/kqtD5dpn9C8', 1, 20),
    (course1_id, '2. المتغيرات والعمليات وهياكل البيانات الأساسية', 'شرح تفصيلي للمتغيرات (Variables)، القوائم (Lists)، القواميس (Dictionaries)، والمجموعات (Sets) مع تدريبات برمجية.', 'https://www.youtube.com/embed/kqtD5dpn9C8', 2, 35),
    (course1_id, '3. المصفوفات والعمليات الحسابية مع NumPy', 'تعلم كيفية إنشاء المصفوفات متعددة الأبعاد وإجراء العمليات الخطية والمتجهات بسرعة فائقة باستخدام NumPy.', 'https://www.youtube.com/embed/kqtD5dpn9C8', 3, 40),
    (course1_id, '4. معالجة وتجهيز الجداول مع Pandas DataFrames', 'تحميل ملفات CSV و Excel، الفلترة، استخراج الإحصائيات، وتنظيف القيم المفقودة والبيانات غير المكتملة.', 'https://www.youtube.com/embed/kqtD5dpn9C8', 4, 45),
    (course1_id, '5. مشروع عملي: تحليل بيانات حقيقية وبناء الرسوم البيانية', 'بناء مشروع متكامل لتحليل بيانات مبيعات وعملاء مع رسم المخططات البيانية التفاعلية باستخدام Matplotlib و Seaborn.', 'https://www.youtube.com/embed/kqtD5dpn9C8', 5, 50);
  END IF;

  -- 2. Insert Course: Machine Learning Fundamentals
  INSERT INTO public.courses (
    title,
    slug,
    description,
    short_description,
    thumbnail_url,
    price,
    category,
    level,
    duration_hours,
    total_lessons,
    points_reward,
    instructor_name,
    instructor_title,
    is_published
  )
  VALUES (
    'Machine Learning Fundamentals & Scikit-Learn',
    'machine-learning-essentials',
    'فهم وتطبيق خوارزميات التعلم الخاضع وغير الخاضع للإشراف: الانحدار الخطي واللوجستي، أشجار القرار، والغابات العشوائية وتقييم دقة النماذج.',
    'بناء النماذج التنبؤية واحتراف أشهر خوارزميات تعلم الآلة العملية.',
    'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&auto=format&fit=crop&q=80',
    0,
    'ai_ml',
    'intermediate',
    32,
    4,
    650,
    'م. سارة السيد',
    'مسؤولة مسار تعلم الآلة بنادي داتا كامب',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    thumbnail_url = EXCLUDED.thumbnail_url
  RETURNING id INTO course2_id;

  -- Lessons for Course 2
  IF course2_id IS NOT NULL THEN
    DELETE FROM public.lessons WHERE course_id = course2_id;

    INSERT INTO public.lessons (course_id, title, content, video_url, position, duration_minutes) VALUES
    (course2_id, '1. ما هو التعلم الآلي؟ Supervised vs Unsupervised', 'مفاهيم تدريب النماذج، تقسيم البيانات إلى Train/Test، وتجنب مشكلة الـ Overfitting و Underfitting.', 'https://www.youtube.com/embed/ukzFI9RGwfU', 1, 30),
    (course2_id, '2. الانحدار الخطي والتنبؤ بالقيم العددية (Linear Regression)', 'شرح نظرية دالة التكلفة (Cost Function) وخوارزمية Gradient Descent مع تطبيق عملي في بايثون.', 'https://www.youtube.com/embed/ukzFI9RGwfU', 2, 45),
    (course2_id, '3. خوارزميات التصنيف: Decision Trees & Random Forest', 'بناء نماذج تصنيف العملاء وتوقع النتائج باستخدام مكتبة Scikit-Learn وتقييم النموذج بواسطة Confusion Matrix.', 'https://www.youtube.com/embed/ukzFI9RGwfU', 3, 50),
    (course2_id, '4. نشر نموذج الذكاء الاصطناعي واستدعائه عبر API', 'تصدير النموذج وحفظه وتجهيز نقطة اتصال برمجية لاستقبال التوقعات في الوقت الفعلي.', 'https://www.youtube.com/embed/ukzFI9RGwfU', 4, 40);
  END IF;

  -- 3. Insert Course: SQL & Power BI Business Intelligence
  INSERT INTO public.courses (
    title,
    slug,
    description,
    short_description,
    thumbnail_url,
    price,
    category,
    level,
    duration_hours,
    total_lessons,
    points_reward,
    instructor_name,
    instructor_title,
    is_published
  )
  VALUES (
    'SQL & Power BI Business Intelligence',
    'sql-powerbi-mastery',
    'استخراج رؤى الأعمال التحليلية باستخدام استعلامات SQL المتقدمة والربط بين الجداول، وتحويلها إلى لوحات تحكم تفاعلية وتقارير أداء باستخدام Power BI.',
    'احتراف قواعد البيانات العلائقية وبناء لوحات معلومات تفاعلية للشركات.',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    0,
    'business_intelligence',
    'beginner',
    18,
    3,
    450,
    'أ. كريم عزت',
    'كبير محللي ذكاء الأعمال',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    thumbnail_url = EXCLUDED.thumbnail_url
  RETURNING id INTO course3_id;

  -- Lessons for Course 3
  IF course3_id IS NOT NULL THEN
    DELETE FROM public.lessons WHERE course_id = course3_id;

    INSERT INTO public.lessons (course_id, title, content, video_url, position, duration_minutes) VALUES
    (course3_id, '1. أساسيات لغة الاستعلامات SQL وربط الجداول (JOINS)', 'كتابة استعلامات SELECT، WHERE، GROUP BY، ودوال التجميع مع Inner و Left Joins.', 'https://www.youtube.com/embed/HXV3zeRR3h4', 1, 35),
    (course3_id, '2. استعلامات متقدمة و Window Functions', 'استخدام CTEs و Rank و Partition By لاستخراج تحليلات أداء شهرية ومقارنات تاريخية.', 'https://www.youtube.com/embed/HXV3zeRR3h4', 2, 45),
    (course3_id, '3. بناء لوحة تحكم تفاعلية متكاملة في Power BI', 'ربط Power BI بقاعدة البيانات، نمذجة العلاقات (Data Modeling)، وكتابة مقاييس DAX وحساب مؤشرات الـ KPIs.', 'https://www.youtube.com/embed/HXV3zeRR3h4', 3, 50);
  END IF;

END $$;
