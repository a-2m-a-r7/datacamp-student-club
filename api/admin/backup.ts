import { authorizeAdmin } from '../_lib/authorize';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });
  const authorized = await authorizeAdmin(req, res);
  if (!authorized) return;
  // This exports platform records, not secrets, auth users/passwords, or storage binaries.
  const records: Record<string, unknown[]> = {};
  for (const table of ['courses', 'lessons', 'events', 'staff', 'gallery', 'projects', 'blog', 'forms', 'form_questions']) {
    records[table] = [];
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await authorized.client.from(table).select('*').order('id').range(offset, offset + 499);
      if (error) return res.status(500).json({ error: `Unable to export ${table}. No complete export was created.` });
      records[table].push(...(data || []));
      if ((data?.length || 0) < 500) break;
    }
  }
  return res.status(200).json({ success: true, exportedAt: new Date().toISOString(), records });
}
