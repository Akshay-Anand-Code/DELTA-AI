export async function POST(req) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'OpenAI API key not set in environment' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  let body;
  try {
    body = await req.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  let openaiResponse;
  try {
    openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to reach OpenAI API', details: err.message }), { status: 502, headers: { 'Content-Type': 'application/json' } });
  }

  const text = await openaiResponse.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    // If OpenAI did not return JSON, wrap the raw response in an error object
    return new Response(JSON.stringify({ error: 'Invalid JSON from OpenAI', raw: text }), {
      status: openaiResponse.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(data), {
    status: openaiResponse.status,
    headers: { 'Content-Type': 'application/json' },
  });
} 