import { isSupabaseConfigured, supabase } from '../lib/supabase';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']);

export const uploadFile = async (path: string, file: File | Blob): Promise<string> => {
  // 1. Validate file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File size exceeds maximum allowed limit of 10MB (${Math.round(file.size / 1024 / 1024)}MB uploaded)`);
  }

  // 2. Validate MIME type
  if (file.type && !ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
    throw new Error(`Unsupported file type: ${file.type}. Only JPEG, PNG, WebP, GIF, and SVG are allowed.`);
  }

  // Sanitize path to prevent directory traversal
  const sanitizedPath = path.replace(/\.\./g, '').replace(/\/+/g, '/').replace(/^\//, '');

  // 3. Supabase Storage
  if (isSupabaseConfigured) {
    try {
      let bucket = 'uploads';
      let filePath = sanitizedPath;

      if (sanitizedPath.startsWith('avatars/')) {
        bucket = 'avatars';
        filePath = sanitizedPath.replace(/^avatars\//, '');
      } else if (sanitizedPath.startsWith('course-thumbnails/')) {
        bucket = 'course-thumbnails';
        filePath = sanitizedPath.replace(/^course-thumbnails\//, '');
      }

      const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
        upsert: true,
        contentType: file.type || 'image/jpeg',
        cacheControl: '0',
      });

      if (error) {
        throw error;
      } else if (data) {
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
        return urlData.publicUrl;
      }
    } catch (sbError) {
      throw sbError;
    }
  }

  throw new Error('Storage is not configured or upload returned no file. Nothing was saved.');
};

export const deleteFile = async (url: string): Promise<void> => {
  if (!url || url.startsWith('data:')) return;

  if (isSupabaseConfigured && url.includes('supabase.co/storage/v1/object/public/')) {
    try {
      const match = url.match(/\/object\/public\/([^/]+)\/(.+)$/);
      if (match) {
        const bucket = match[1];
        const filePath = match[2];
        const { error } = await supabase.storage.from(bucket).remove([filePath]);
        if (error) throw error;
        return;
      }
    } catch (e) {
      throw e;
    }
  }
};

export const getStoragePath = (collection: string, id: string, fileName: string): string => {
  const cleanCollection = collection.replace(/[^a-zA-Z0-9_-]/g, '');
  const cleanId = id.replace(/[^a-zA-Z0-9_-]/g, '');
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.+/g, '.');
  return `${cleanCollection}/${cleanId}/${cleanFileName}`;
};


