import ts from 'typescript';
export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });
  if (typeof req.body?.code !== 'string' || req.body.code.length > 100000) return res.status(400).json({ error: 'Code must be a string under 100 KB.' });
  const result = ts.transpileModule(req.body.code, { reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } });
  const errors = result.diagnostics?.filter(d => d.category === ts.DiagnosticCategory.Error) || [];
  if (errors.length) return res.status(400).json({ error: errors.map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')).join('\n') });
  return res.status(200).json({ code: result.outputText });
}
