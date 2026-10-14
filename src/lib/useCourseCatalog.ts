import { useCallback, useEffect, useRef, useState } from 'react';
import { courseService, CourseCursor } from '../services/courseService';
import { Course } from '../types';

// Requests are bounded and cancelled when filters change. No persistent cache.
export function useCourseCatalog(search: string, category = 'all', level = 'all', includeDrafts = false) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [cursor, setCursor] = useState<CourseCursor | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const generation = useRef(0), morePending = useRef(false), moreController = useRef<AbortController | null>(null);
  const reload = useCallback(() => setRevision(value => value + 1), []);
  useEffect(() => {
    const current = ++generation.current, controller = new AbortController();
    moreController.current?.abort(); morePending.current = false;
    setCourses([]); setCursor(null); setError(''); setLoading(true); setLoadingMore(false);
    const timer = setTimeout(async () => {
      try {
        const result = await courseService.getCoursePage({ search, category, level, includeDrafts, signal: controller.signal });
        if (generation.current !== current) return;
        setCourses(result.items); setCursor(result.nextCursor);
      } catch { if (!controller.signal.aborted && generation.current === current) setError('Unable to load courses. Please retry.'); }
      finally { if (generation.current === current) setLoading(false); }
    }, search ? 300 : 0);
    return () => { clearTimeout(timer); controller.abort(); moreController.current?.abort(); generation.current++; };
  }, [search, category, level, includeDrafts, revision]);
  const loadMore = async () => {
    if (!cursor || loading || morePending.current) return;
    const current = generation.current, controller = new AbortController(); moreController.current = controller;
    morePending.current = true; setLoadingMore(true); setError('');
    try {
      const result = await courseService.getCoursePage({ search, category, level, includeDrafts, cursor, signal: controller.signal });
      if (generation.current !== current) return;
      setCourses(previous => [...previous, ...result.items.filter(item => !previous.some(existing => existing.id === item.id))]); setCursor(result.nextCursor);
    } catch { if (!controller.signal.aborted && generation.current === current) setError('Unable to load more courses. Please retry.'); }
    finally { if (generation.current === current) { morePending.current = false; setLoadingMore(false); } }
  };
  return { courses, cursor, loading, loadingMore, error, reload, loadMore };
}
