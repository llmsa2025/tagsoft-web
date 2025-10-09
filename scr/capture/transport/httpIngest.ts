// Simple HTTP transport to TagSoft Ingest API
export async function sendToIngest(apiUrl: string, apiKey: string, body: any) {
  const res = await fetch(`${apiUrl.replace(/\/+$/,'')}/v1/ingest`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Ingest failed: ${res.status} ${text}`);
  }
  return res.json().catch(() => ({}));
}
