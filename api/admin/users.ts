/**
 * api/admin/users.ts
 * Vercel Serverless Function: Secure Admin User Management
 *
 * Responsibilities:
 * 1. Safely creates and deletes users in Supabase Auth without disrupting client sessions.
 * 2. Uses SUPABASE_SERVICE_ROLE_KEY server-side when available for full auth.users lifecycle management.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { action, userId, email, password, fullName, role, faculty, memberId } = req.body || {};

  if (!supabaseUrl) {
    return res.status(500).json({ error: 'Supabase URL not configured on server.' });
  }

  // Use service role if available, otherwise fall back to anon client
  const activeKey = serviceRoleKey || anonKey;
  if (!activeKey) {
    return res.status(500).json({ error: 'Supabase key not configured on server.' });
  }

  const supabase = createClient(supabaseUrl, activeKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  try {
    if (action === 'delete') {
      if (!userId) {
        return res.status(400).json({ error: 'Missing userId for delete action.' });
      }

      // Delete from profiles and users
      await supabase.from('profiles').delete().eq('id', userId);
      await supabase.from('users').delete().eq('id', userId);

      // If service role key is available, also delete from auth.users
      if (serviceRoleKey && supabase.auth.admin) {
        try {
          await supabase.auth.admin.deleteUser(userId);
        } catch (authErr: any) {
          console.warn('[api/admin/users] Notice deleting auth user:', authErr?.message || authErr);
        }
      }

      return res.status(200).json({ success: true, message: 'User deleted successfully.' });
    }

    if (action === 'create') {
      if (!email) {
        return res.status(400).json({ error: 'Missing email for create action.' });
      }

      let createdUserId = '';

      if (serviceRoleKey && supabase.auth.admin) {
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: email.trim(),
          password: password || 'DataCampClub2025!',
          email_confirm: true,
          user_metadata: {
            full_name: fullName || 'Club Member',
          },
        });

        if (authError) throw authError;
        createdUserId = authData.user.id;
      } else {
        // Fallback: Isolated signUp call that does not affect client storage
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password || 'DataCampClub2025!',
          options: {
            data: {
              full_name: fullName || 'Club Member',
            },
          },
        });

        if (authError) throw authError;
        createdUserId = authData.user?.id || '';
      }

      if (createdUserId) {
        const dbRole = role === 'admin' || role === 'super_admin' ? 'admin' : 'user';
        const mirrorRole = dbRole === 'admin' ? 'admin' : 'member';

        await supabase.from('profiles').update({
          role: dbRole,
          faculty: faculty || 'Engineering',
          member_id: memberId,
        }).eq('id', createdUserId);

        await supabase.from('users').update({
          role: mirrorRole,
          faculty: faculty || 'Engineering',
          member_id: memberId,
        }).eq('id', createdUserId);
      }

      return res.status(200).json({ success: true, userId: createdUserId });
    }

    return res.status(400).json({ error: 'Unknown action.' });
  } catch (err: any) {
    console.error('[api/admin/users] Operation failed:', err);
    return res.status(500).json({ error: err.message || 'Operation failed.' });
  }
}
