/**
 * api/forms/sync-sheet.ts
 * Vercel Serverless Function: Automatic Google Sheets Sync using Service Account
 *
 * Responsibilities:
 * 1. Creates spreadsheet named after the form if not yet created.
 * 2. Writes styled frozen header row from questions.
 * 3. Shares sheet with admin Gmail (ammar25030177@gmail.com) as Editor.
 * 4. Appends incoming responses to the sheet within seconds.
 * 5. Handles "Resync All" rebuilding rows without duplicates.
 * 6. Logs all operations in `sync_logs` table.
 */

import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const defaultAdminGmail = 'ammar25030177@gmail.com';

export default async function handler(req: any, res: any) {
  // Allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { formId, responseId, resyncAll } = req.body || {};

  if (!formId) {
    return res.status(400).json({ error: 'Missing formId in request body.' });
  }

  // 1. Check Google Service Account Credentials
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const ownerEmail = process.env.GOOGLE_SPREADSHEET_OWNER_EMAIL || defaultAdminGmail;

  if (!clientEmail || !privateKey) {
    console.warn('[sync-sheet] Google Service Account credentials not found in env vars.');
    return res.status(200).json({
      success: false,
      configured: false,
      message: 'Google Service Account credentials not yet configured. Please set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY in .env / Vercel.',
    });
  }

  // Handle multi-line private key correctly
  privateKey = privateKey.replace(/\\n/g, '\n');

  // 2. Initialize Supabase Client
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 3. Fetch Form and Questions
  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('*')
    .eq('id', formId)
    .single();

  if (formError || !form) {
    return res.status(404).json({ error: 'Form not found in database.' });
  }

  const { data: questions, error: qError } = await supabase
    .from('form_questions')
    .select('*')
    .eq('form_id', formId)
    .neq('type', 'section_header')
    .order('position', { ascending: true });

  if (qError) {
    return res.status(500).json({ error: 'Failed to fetch form questions.' });
  }

  const activeQuestions = questions || [];

  // 4. Initialize Google Auth & Clients
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
    ],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const drive = google.drive({ version: 'v3', auth });

  try {
    let spreadsheetId = form.spreadsheet_id;
    let spreadsheetUrl = form.spreadsheet_url;

    const headerTitles = [
      'Submission ID',
      'Submitted At',
      'Respondent Name',
      'Respondent Email',
      ...activeQuestions.map((q) => q.title),
    ];

    // 5. If spreadsheet does not exist, create it!
    if (!spreadsheetId) {
      console.log(`[sync-sheet] Creating new spreadsheet for form: "${form.title}"`);
      const createResponse = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: `[DataCamp] ${form.title} (Responses)`,
          },
          sheets: [
            {
              properties: {
                title: 'Responses',
                gridProperties: {
                  frozenRowCount: 1,
                },
              },
            },
          ],
        },
      });

      spreadsheetId = createResponse.data.spreadsheetId!;
      spreadsheetUrl = createResponse.data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

      // Write Header Row with Bold and Fill
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Responses!A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [headerTitles],
        },
      });

      // Style Header: Navy fill, white text, bold
      const sheetId = createResponse.data.sheets?.[0]?.properties?.sheetId || 0;
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId,
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: headerTitles.length,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.2, green: 0.18, blue: 0.5 }, // Indigo/Navy
                    textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                    horizontalAlignment: 'CENTER',
                  },
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
              },
            },
            {
              autoResizeDimensions: {
                dimensions: {
                  sheetId,
                  dimension: 'COLUMNS',
                  startIndex: 0,
                  endIndex: headerTitles.length,
                },
              },
            },
          ],
        },
      });

      // Share with Admin Gmail as Editor
      try {
        await drive.permissions.create({
          fileId: spreadsheetId,
          sendNotificationEmail: true,
          requestBody: {
            role: 'editor',
            type: 'user',
            emailAddress: ownerEmail,
          },
        });
        console.log(`[sync-sheet] Shared spreadsheet ${spreadsheetId} with ${ownerEmail}`);
      } catch (shareErr) {
        console.warn('[sync-sheet] Drive permission share warning:', shareErr);
      }

      // Save spreadsheet ID and URL to form in database
      await supabase
        .from('forms')
        .update({
          spreadsheet_id: spreadsheetId,
          spreadsheet_url: spreadsheetUrl,
          sheets_sync_enabled: true,
        })
        .eq('id', formId);
    }

    // 6. Resync All vs Single Row Append
    if (resyncAll) {
      console.log(`[sync-sheet] Resyncing all responses for form: ${formId}`);

      // Fetch all responses and answers
      const { data: responses, error: respError } = await supabase
        .from('form_responses')
        .select(`
          id,
          submitted_at,
          respondent_email,
          respondent_id,
          form_answers (question_id, value),
          profiles:respondent_id (full_name, email)
        `)
        .eq('form_id', formId)
        .order('submitted_at', { ascending: true });

      if (respError) throw respError;

      // Rebuild rows
      const allRows = [headerTitles];
      (responses || []).forEach((r: any) => {
        const row = [
          r.id,
          new Date(r.submitted_at).toLocaleString('en-US', { timeZone: 'UTC' }) + ' UTC',
          r.profiles?.full_name || 'Anonymous',
          r.respondent_email || r.profiles?.email || 'N/A',
        ];

        activeQuestions.forEach((q) => {
          const ans = r.form_answers?.find((a: any) => a.question_id === q.id);
          let val = ans?.value;
          if (Array.isArray(val)) val = val.join(', ');
          else if (typeof val === 'object' && val !== null) val = val.url || val.name || JSON.stringify(val);
          row.push(val !== undefined && val !== null ? String(val) : '');
        });

        allRows.push(row);
      });

      // Clear existing sheet and write all rows
      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: 'Responses!A1:Z5000',
      });

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Responses!A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: allRows },
      });

      // Log success in sync_logs
      await supabase.from('sync_logs').insert({
        form_id: formId,
        status: 'synced',
        details: { action: 'resync_all', totalRows: allRows.length - 1 },
      });

      return res.status(200).json({
        success: true,
        spreadsheetId,
        spreadsheetUrl,
        syncedRowsCount: allRows.length - 1,
      });
    }

    // 7. Single Row Append
    if (responseId) {
      console.log(`[sync-sheet] Appending single response: ${responseId}`);

      const { data: singleResp, error: singleError } = await supabase
        .from('form_responses')
        .select(`
          id,
          submitted_at,
          respondent_email,
          respondent_id,
          form_answers (question_id, value),
          profiles:respondent_id (full_name, email)
        `)
        .eq('id', responseId)
        .single();

      if (singleError || !singleResp) {
        throw new Error('Response record not found for sync');
      }

      const rowValues = [
        singleResp.id,
        new Date(singleResp.submitted_at).toLocaleString('en-US', { timeZone: 'UTC' }) + ' UTC',
        (singleResp as any).profiles?.full_name || 'Anonymous',
        singleResp.respondent_email || (singleResp as any).profiles?.email || 'N/A',
      ];

      activeQuestions.forEach((q) => {
        const ans = singleResp.form_answers?.find((a: any) => a.question_id === q.id);
        let val = ans?.value;
        if (Array.isArray(val)) val = val.join(', ');
        else if (typeof val === 'object' && val !== null) val = val.url || val.name || JSON.stringify(val);
        rowValues.push(val !== undefined && val !== null ? String(val) : '');
      });

      // Append row
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Responses!A:A',
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [rowValues],
        },
      });

      // Log success in sync_logs
      await supabase.from('sync_logs').insert({
        form_id: formId,
        response_id: responseId,
        status: 'synced',
        details: { action: 'append_row' },
      });

      return res.status(200).json({
        success: true,
        spreadsheetId,
        spreadsheetUrl,
        rowAppended: true,
      });
    }

    return res.status(200).json({
      success: true,
      spreadsheetId,
      spreadsheetUrl,
      message: 'Spreadsheet verified.',
    });
  } catch (err: any) {
    console.error('[sync-sheet] Error syncing with Google Sheets:', err);

    // Record failure in sync_logs
    try {
      await supabase.from('sync_logs').insert({
        form_id: formId,
        response_id: responseId || null,
        status: 'failed',
        error: err.message || 'Google Sheets API error',
      });
    } catch (logErr) {
      console.warn('Logging error:', logErr);
    }

    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to sync with Google Sheets.',
    });
  }
}
