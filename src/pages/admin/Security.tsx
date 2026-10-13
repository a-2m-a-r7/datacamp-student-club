import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { getSiteUrl } from '../../lib/siteUrl';
import { toast } from 'sonner';

export default function Security() {
 const { user } = useAuth(); const [logs, setLogs] = useState<any[]>([]);
 const [pending, setPending] = useState(false); const [error, setError] = useState('');
 const refresh = async () => {
  if (pending) return; setPending(true); setError('');
  try {
   if (!isSupabaseConfigured) throw new Error('Database is not configured');
   const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
   if (error) throw error; setLogs(data || []);
  } catch (err: any) { setError(err.message || 'Unable to load audit records'); }
  finally { setPending(false); }
 };
 useEffect(() => { refresh(); }, []);
 const reset = async () => {
  if (!user?.email || pending) return; setPending(true);
  try {
   const { error } = await supabase.auth.resetPasswordForEmail(user.email, { redirectTo: getSiteUrl() + '/reset-password' });
   if (error) throw error; toast.success('Password recovery email sent');
  } catch (err: any) { toast.error(err.message || 'Recovery email failed'); }
  finally { setPending(false); }
 };
 return <div className="space-y-6">
  <h1 className="text-3xl font-bold">Account Security & Audit Records</h1>
  <div className="flex flex-wrap gap-3"><Button disabled={pending} onClick={refresh}>Refresh audit records</Button>
  <Button disabled={pending || !user?.email} variant="outline" onClick={reset}>Send password recovery email</Button></div>
  {error && <p role="alert" className="text-destructive">{error}</p>}
  <Card><CardContent className="p-4 overflow-x-auto">
   {logs.length ? <table className="w-full text-sm"><thead><tr><th>Time</th><th>Action</th><th>Actor</th><th>Status</th></tr></thead>
   <tbody>{logs.map(log => <tr key={log.id}><td>{new Date(log.created_at).toLocaleString()}</td><td>{log.action}</td><td>{log.user_email || '—'}</td><td>{log.status || '—'}</td></tr>)}</tbody></table>
   : <p>No audit records available.</p>}
  </CardContent></Card>
 </div>;
}
