import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { watchQuery } from '../lib/watchQuery';
import { uploadFile } from './storageService';
import { imageDataToBlob } from '../lib/imageData';
import {
  defaultAboutData,
  defaultHomeContent,
  defaultSettings,
} from '../lib/defaultContent';

type TableName =
  | 'events'
  | 'staff'
  | 'projects'
  | 'blog'
  | 'gallery'
  | 'messages'
  | 'notifications'
  | 'settings';

const normalizeSettingsKey = (key: string) => {
  if (key === 'site') return 'general';
  if (key === 'home') return 'home_content';
  if (key === 'about') return 'about_data';
  return key;
};

const fallbackSettings: Record<string, any> = {
  general: defaultSettings,
  site: defaultSettings,
  home_content: defaultHomeContent,
  home: defaultHomeContent,
  about_data: defaultAboutData,
  about: defaultAboutData,
};

const fallbackRows: Record<string, any[]> = {
  events: [],
  staff: [],
  projects: [],
  blog: [],
  gallery: [],
  messages: [],
  notifications: [],
};

const mapToSupabase = (table: TableName, data: any) => {
  if (table === 'events') {
    return {
      title: data.title || 'Untitled Event',
      date: data.date || new Date().toISOString(),
      location: data.location || 'Main Hall',
      description: data.description || '',
      registered_count: Number(data.registeredCount ?? data.registered_count ?? 0),
      capacity: Number(data.capacity || 100),
      status: data.status || 'published',
      registrations: data.registrations || [],
      organizers: data.organizers || [],
    };
  }

  if (table === 'staff') {
    return {
      name: data.name || 'Team Member',
      role: data.role || 'Club Member',
      category: data.category || 'General',
      image: data.image || data.photoURL || '',
      socials: data.socials || [],
    };
  }

  if (table === 'projects') {
    return {
      title: data.title || 'Untitled Project',
      description: data.description || '',
      status: data.status || 'active',
      members: Array.isArray(data.members) ? data.members : [data.author].filter(Boolean),
      category: data.category || 'Data Science',
      author: data.author || data.authorName || 'Club Member',
      image: data.image || '',
      technologies: Array.isArray(data.technologies)
        ? data.technologies
        : String(data.technologies || '').split(',').map((item) => item.trim()).filter(Boolean),
      github_url: data.githubUrl || data.github_url || '',
      live_url: data.liveUrl || data.live_url || '',
      featured: Boolean(data.featured),
    };
  }

  if (table === 'blog') {
    return {
      title: data.title || 'Untitled Article',
      content: data.content || data.excerpt || '',
      author: data.author || data.authorName || 'Club Mentor',
      date: data.date || new Date().toISOString().slice(0, 10),
      status: data.status || 'published',
      category: data.category || data.tag || 'Data Science',
      excerpt: data.excerpt || '',
      image: data.image || data.coverImage || '',
      read_time: data.readTime || data.read_time || '5 min read',
    };
  }

  if (table === 'gallery') {
    return {
      url: data.url || data.image || data.imageURL || '',
      title: data.title || 'Gallery Image',
      category: data.category || 'Campus Days',
      description: data.description || '',
      date: data.date || '',
    };
  }

  if (table === 'messages') {
    return {
      name: data.name || '',
      email: data.email || '',
      subject: data.subject || 'Contact message',
      message: data.message || '',
      status: data.status || 'unread',
    };
  }

  if (table === 'notifications') {
    return {
      user_id: data.userId || data.user_id,
      title: data.title || 'Notification',
      message: data.message || data.body || '',
      read: Boolean(data.read || data.isRead),
    };
  }

  return data;
};

const mapFromSupabase = (table: TableName, row: any) => {
  if (table === 'events') {
    return {
      ...row,
      registeredCount: row.registered_count ?? row.registeredCount ?? 0,
      createdAt: row.created_at,
    };
  }

  if (table === 'blog') {
    return {
      ...row,
      excerpt: row.excerpt || row.content || '',
      category: row.category || 'Data Science',
      tag: row.category || 'Data Science',
      readTime: row.read_time || row.readTime || '5 min read',
      createdAt: row.created_at,
    };
  }

  if (table === 'projects') {
    return {
      ...row,
      author: row.author || row.members?.[0] || 'Club Member',
      githubUrl: row.github_url,
      liveUrl: row.live_url,
      createdAt: row.created_at,
    };
  }

  if (table === 'gallery') {
    return {
      ...row,
      image: row.image || row.url,
      createdAt: row.created_at,
    };
  }

  return {
    ...row,
    createdAt: row.created_at,
  };
};

async function persistImage(source: string, folder: string): Promise<string> {
  if (!source?.startsWith('data:')) return source || '';
  const file = imageDataToBlob(source);
  return uploadFile(`${folder}/${crypto.randomUUID()}.${file.type.split('/')[1]}`, file);
}

async function preparePayload(table: TableName, data: any) {
  const payload = mapToSupabase(table, data);
  const required: Partial<Record<TableName, string[]>> = {
    staff: ['name', 'role'], projects: ['title', 'description'], blog: ['title', 'content'],
    gallery: ['url'], messages: ['name', 'email', 'subject', 'message'], events: ['title', 'date', 'location'],
  };
  for (const key of required[table] || []) {
    if (!String(data[key] ?? (key === 'content' ? data.excerpt : '') ?? '').trim()) throw new Error(`${key} is required`);
  }
  if (table === 'events') {
    const date = new Date(data.date);
    if (!Number.isFinite(date.getTime())) throw new Error('Enter a valid event date.');
    payload.date = date.toISOString();
    if (!Number.isSafeInteger(payload.capacity) || payload.capacity < 1 || payload.capacity < payload.registered_count) throw new Error('Capacity must accommodate all registered members.');
  }
  for (const key of ['github_url', 'live_url']) {
    if (payload[key]) {
      try { if (!['https:', 'http:'].includes(new URL(payload[key]).protocol)) throw new Error(); }
      catch { throw new Error('Enter a valid HTTP or HTTPS project URL.'); }
    }
  }
  const imageKey = table === 'gallery' ? 'url' : ['staff', 'projects', 'blog'].includes(table) ? 'image' : null;
  if (imageKey) payload[imageKey] = await persistImage(payload[imageKey], table);
  return payload;
}

export const contentService = {
  isConfigured: isSupabaseConfigured,

  async getSetting(key: string): Promise<any> {
    const normalizedKey = normalizeSettingsKey(key);
    if (!isSupabaseConfigured) return fallbackSettings[normalizedKey] || fallbackSettings[key] || null;

    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', normalizedKey)
      .maybeSingle();

    if (error) throw error;
    return data?.value || fallbackSettings[normalizedKey] || null;
  },

  async upsertSetting(key: string, value: any): Promise<void> {
    const normalizedKey = normalizeSettingsKey(key);
    if (!isSupabaseConfigured) throw new Error('Database is not configured. No changes were saved.');

    // Content and branding editors share this record; preserve fields the editor did not change.
    if (normalizedKey === 'general') {
      const existing = await this.getSetting(normalizedKey);
      value = { ...existing, ...value };
      if (value.logoUrl) value = { ...value, logoUrl: await persistImage(value.logoUrl, 'branding') };
    }

    const { error } = await supabase
      .from('settings')
      .upsert({ key: normalizedKey, value, updated_at: new Date().toISOString() });

    if (error) throw error;
  },

  async list(table: TableName, options: { includeDrafts?: boolean; orderBy?: string; ascending?: boolean } = {}): Promise<any[]> {
    if (!isSupabaseConfigured) return [...(fallbackRows[table] || [])];

    let query = supabase
      .from(table === 'events' && !options.includeDrafts ? 'public_events' : table)
      .select('*')
      .order(options.orderBy || 'created_at', { ascending: options.ascending ?? false });

    if (!options.includeDrafts && table === 'projects') query = query.eq('status', 'active');
    if (!options.includeDrafts && (table === 'blog' || table === 'events')) {
      query = query.eq('status', 'published');
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).filter(row => table !== 'gallery' || options.includeDrafts || row.category !== 'Archived samples').map(row => mapFromSupabase(table, row));
  },

  async create(table: TableName, data: any): Promise<any> {
    if (!isSupabaseConfigured) throw new Error('Database is not configured. No changes were saved.');
    const payload = await preparePayload(table, data);
    if (table === 'messages') {
      // Public senders cannot SELECT inbox records. Minimal return keeps the admin inbox private.
      const { error } = await supabase.from(table).insert(payload);
      if (error) throw error;
      return null;
    }
    if (table === 'projects') {
      const { data: identity, error } = await supabase.auth.getUser();
      if (error || !identity.user) throw new Error('Sign in before submitting a project.');
      payload.created_by = identity.user.id;
    }
    const { data: row, error } = await supabase
      .from(table)
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return mapFromSupabase(table, row);
  },

  async update(table: TableName, id: string, data: any): Promise<any> {
    if (!isSupabaseConfigured) throw new Error('Database is not configured. No changes were saved.');
    const payload = await preparePayload(table, data);
    if (table === 'events') {
      // Registration RPCs own tickets/counters; an old editor snapshot must never overwrite them.
      delete payload.registered_count;
      delete payload.registrations;
    }
    const { data: row, error } = await supabase
      .from(table)
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapFromSupabase(table, row);
  },

  async remove(table: TableName, id: string): Promise<void> {
    if (!isSupabaseConfigured) throw new Error('Database is not configured. No changes were saved.');
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
  },

  subscribe(table: TableName, callback: () => void): () => void {
    if (!isSupabaseConfigured) return () => {};

    return watchQuery(async () => { await callback(); }, () => {}, refresh => {
      const channel = supabase.channel(`content_${table}_${crypto.randomUUID()}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, refresh).subscribe();
      return () => { supabase.removeChannel(channel); };
    }, false);
  },

  async registerEvent(event: any, userId: string, userEmail: string): Promise<any> {
    const registrationData = {
      userId,
      userEmail,
      eventId: event.id,
      eventTitle: event.title,
      registeredAt: new Date().toISOString(),
      qrCode: `REG-${event.id}-${userId}`,
    };

    if (!isSupabaseConfigured) throw new Error('Database is not configured. Registration was not saved.');

    const { data, error } = await supabase.rpc('register_for_event', { target_event_id: event.id });
    if (error) throw error;
    return data || registrationData;
  },
};
