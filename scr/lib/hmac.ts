// HMAC signing helper (Node runtime)
import crypto from 'crypto';

export function hmacSign(secret: string, body: any) {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const nonce = Math.random().toString(36).slice(2, 10);
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  const base = `${timestamp}.${nonce}.${payload}`;
  const signature = crypto.createHmac('sha256', secret).update(base).digest('hex');
  return { timestamp, nonce, signature };
}
