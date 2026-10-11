/**
 * api/ai/chat.ts
 * Vercel Serverless Function: Secure Gemini AI Proxy
 *
 * Responsibilities:
 * 1. Reads GEMINI_API_KEY from server-side environment variables strictly.
 * 2. Never exposes the API key to client browsers or network traces.
 * 3. Handles multi-turn chat completions for NEXUS AI Mentor.
 */

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim().length < 10) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server.',
      configured: false,
    });
  }

  const { prompt, systemPrompt, history } = req.body || {};

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing prompt in request body.' });
  }

  const cleanApiKey = apiKey.trim();
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];

  const contents = [
    ...(systemPrompt
      ? [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: 'Understood. I am NEXUS, ready to assist.' }] },
        ]
      : []),
    ...(Array.isArray(history) ? history.slice(-12) : []),
    { role: 'user', parts: [{ text: prompt.slice(0, 4000) }] },
  ];

  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanApiKey}`;
      const apiRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.75,
            maxOutputTokens: 1500,
            topP: 0.95,
            topK: 40,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ],
        }),
      });

      if (!apiRes.ok) {
        const errJson = await apiRes.json().catch(() => ({}));
        console.warn(`[api/ai/chat] Model ${model} returned HTTP ${apiRes.status}:`, errJson);
        if (apiRes.status === 403 || (errJson as any)?.error?.status === 'PERMISSION_DENIED') {
          break; // Invalid key
        }
        continue;
      }

      const data: any = await apiRes.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim().length > 0) {
        return res.status(200).json({ text: text.trim(), model });
      }
    } catch (err: any) {
      console.warn(`[api/ai/chat] Error invoking ${model}:`, err?.message || err);
    }
  }

  return res.status(502).json({
    error: 'All Gemini models failed to return a response.',
  });
}
