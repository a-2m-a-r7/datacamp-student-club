import { runIsolatedWorker } from './isolatedRunner';

export function runSQL(code: string) {
  return runIsolatedWorker(`
    self.onmessage = async event => {
      let db;
      try {
        importScripts('https://cdn.jsdelivr.net/npm/sql.js@1.13.0/dist/sql-wasm.js');
        const SQL = await initSqlJs({ locateFile: name => 'https://cdn.jsdelivr.net/npm/sql.js@1.13.0/dist/' + name });
        db = new SQL.Database();
        const result = db.exec(event.data);
        const output = result.map(table => [table.columns.join(' | '), ...table.values.map(row => row.map(v => v === null ? 'NULL' : String(v)).join(' | '))].join('\\n')).join('\\n\\n');
        self.postMessage({ output: output || 'SQL executed successfully. No result rows.' });
      } catch (error) { self.postMessage({ output: '', error: error.message || 'SQL execution failed' }); }
      finally { if (db) db.close(); }
    };
  `, code);
}
