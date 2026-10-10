import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { UserProfile } from '../types';
import { demoUsers } from '../lib/demoData';

const mapUser = (row: any): UserProfile => ({
  uid: row.id,
  id: row.id,
  email: row.email || '',
  fullName: row.full_name || row.display_name || row.email || 'Member',
  role: row.role === 'admin' ? 'super_admin' : 'member',
  memberId: row.member_id || row.id,
  status: row.status || 'active',
  isVerified: Boolean(row.is_verified ?? row.email_verified ?? true),
  university: row.university || row.university_name || '',
  phoneNumber: row.phone || row.phone_number || '',
  faculty: row.faculty || '',
  photoURL: row.photo_url || row.avatar_url || '',
  totalPoints: row.total_points || row.xp || 0,
  level: row.level || 'RECRUIT',
  bio: row.bio || '',
  interests: row.interests || [],
  linkedinUrl: row.linkedin_url || '',
  githubUrl: row.github_url || '',
  createdAt: row.created_at || new Date().toISOString(),
  updatedAt: row.updated_at || new Date().toISOString(),
});

const mapProfileUpdates = (profile: Partial<UserProfile>) => ({
  email: profile.email,
  full_name: profile.fullName,
  role: profile.role === 'super_admin' ? 'admin' : profile.role === 'member' ? 'user' : undefined,
  member_id: profile.memberId,
  status: profile.status,
  is_verified: profile.isVerified,
  university: profile.university || profile.universityName,
  phone: profile.phoneNumber,
  faculty: profile.faculty,
  photo_url: profile.photoURL,
  total_points: profile.totalPoints,
  level: profile.level,
  bio: profile.bio,
  interests: profile.interests,
  linkedin_url: profile.linkedinUrl,
  github_url: profile.githubUrl,
  updated_at: new Date().toISOString(),
});

const compact = (value: Record<string, any>) =>
  Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined));

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!isSupabaseConfigured) {
    return demoUsers.find((u: UserProfile) => u.uid === uid || u.id === uid) || null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', uid)
    .maybeSingle();

  if (error) throw error;
  return data ? mapUser(data) : null;
};

export const createUserProfile = async (profile: UserProfile): Promise<void> => {
  if (!isSupabaseConfigured) return;

  const { error } = await supabase
    .from('profiles')
    .upsert(compact({
      id: profile.uid,
      ...mapProfileUpdates(profile),
      created_at: new Date().toISOString(),
    }) as any);

  if (error) throw error;
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  if (!isSupabaseConfigured) return;

  const { error } = await supabase
    .from('profiles')
    .update(compact(mapProfileUpdates(updates)) as any)
    .eq('id', uid);

  if (error) throw error;
};

export const getUsers = async (pageSize: number = 10, lastDoc?: any): Promise<{ users: UserProfile[], lastDoc?: any }> => {
  if (!isSupabaseConfigured) return { users: demoUsers.slice(0, pageSize) };

  let query = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(pageSize);

  if (lastDoc?.created_at) query = query.lt('created_at', lastDoc.created_at);

  const { data, error } = await query;
  if (error) throw error;

  return { users: (data || []).map(mapUser), lastDoc: data?.at(-1) };
};
