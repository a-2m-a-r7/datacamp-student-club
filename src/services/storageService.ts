import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, isFirebaseReady } from '../lib/firebase';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const uploadFile = async (path: string, file: File | Blob): Promise<string> => {
  // 1. Validate file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File size exceeds maximum allowed limit of 5MB (${Math.round(file.size / 1024 / 1024)}MB uploaded)`);
  }

  // 2. Validate MIME type
  if (file.type && !ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
    throw new Error(`Unsupported file type: ${file.type}. Only JPEG, PNG, and WebP are allowed.`);
  }

  if (!isFirebaseReady) {
    // In mock mode, return data URL if provided as Blob
    if (file instanceof Blob) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }
    return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiB2aWV3Qm94PSIwIDAgMTUwIDE1MCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzEwMTAxMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMzk2ZjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSI+W0RFTU8gTUVESUFdPC90ZXh0Pjwvc3ZnPg==';
  }

  // Sanitize path to prevent directory traversal
  const sanitizedPath = path.replace(/\.\./g, '').replace(/\/+/g, '/').replace(/^\//, '');
  const storageRef = ref(storage, sanitizedPath);
  await uploadBytes(storageRef, file, {
    contentType: file.type || 'image/jpeg',
  });
  return await getDownloadURL(storageRef);
};

export const deleteFile = async (url: string): Promise<void> => {
  if (!isFirebaseReady || !url || url.startsWith('data:')) return;
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (error) {
    if ((error as any).code === 'storage/object-not-found') {
      return;
    }
    console.error('Failed to delete file from storage:', error);
  }
};

export const getStoragePath = (collection: string, id: string, fileName: string): string => {
  const cleanCollection = collection.replace(/[^a-zA-Z0-9_-]/g, '');
  const cleanId = id.replace(/[^a-zA-Z0-9_-]/g, '');
  // Sanitize fileName: strip non-alphanumeric except extension dot and hyphen
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.+/g, '.');
  return `${cleanCollection}/${cleanId}/${cleanFileName}`;
};

