import { authorizeAdmin } from '../_lib/authorize';
export default async function handler(req: any, res: any) {
 if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });
 const authorized = await authorizeAdmin(req, res); if (!authorized) return;
 const { client, user } = authorized;
 const { action, userId, email, password, fullName, role, faculty, memberId } = req.body || {};
 try {
  if (action === 'delete') {
   if (typeof userId !== 'string' || !/^[0-9a-f-]{36}$/i.test(userId)) return res.status(400).json({ error: 'Valid user ID required.' });
   if (userId === user.id) return res.status(400).json({ error: 'You cannot delete your current account here.' });
   const { error } = await client.auth.admin.deleteUser(userId);
   if (error) throw error;
   // Auth-owned records are removed by database foreign-key cascades.
   return res.status(200).json({ success: true });
  }
  if (action === 'create') {
   if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    || typeof password !== 'string' || password.length < 8 || password.length > 256
    || typeof fullName !== 'string' || !fullName.trim() || fullName.length > 200
    || !['member', 'user', 'admin', 'super_admin'].includes(role)) return res.status(400).json({ error: 'Name, valid email, role and strong password required.' });
   const { data, error } = await client.auth.admin.createUser({ email: email.trim(), password, email_confirm: true, user_metadata: { full_name: fullName.trim() } });
   if (error) throw error;
   try {
    const { data: profile, error: profileError } = await client.from('profiles').update({ role: role === 'admin' || role === 'super_admin' ? 'admin' : 'user', faculty: faculty || '', ...(memberId ? { member_id: memberId } : {}) }).eq('id', data.user.id).select('id').single();
    if (profileError || !profile) throw profileError || new Error('Profile creation failed');
   } catch (failure) { await client.auth.admin.deleteUser(data.user.id); throw failure; }
   return res.status(201).json({ success: true, userId: data.user.id });
  }
  return res.status(400).json({ error: 'Unknown action.' });
 } catch (error: any) { return res.status(400).json({ error: error.message || 'Operation failed.' }); }
}
