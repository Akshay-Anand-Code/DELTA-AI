export async function POST(req) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'OpenAI API key not set in environment' }), { status: 500 });
  }

  const body = await req.json();

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.text();
  return new Response(data, {
    status: response.status,
    headers: { 'Content-Type': 'application/json' },
  });
} 