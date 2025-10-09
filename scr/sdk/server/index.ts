import { sendToIngest } from '@/capture/transport';
import { hmacSign } from '@/lib/hmac';

type ServerSdkOpts = {
  apiUrl: string;
  apiKey: string;
  accountId: string;
  containerId?: string;
  appVersion?: string;
  hmacSecret?: string; // optional
};

export function createServerSdk(opts: ServerSdkOpts) {
  return {
    async track(event: any) {
      const base = {
        account_id: opts.accountId,
        container_id: opts.containerId,
        source: 'server',
        app_version: opts.appVersion,
      };
      const body = { ...base, ...event };

      // If you need signed ingest, replace sendToIngest by this custom fetch with headers:
      if (opts.hmacSecret) {
        const { timestamp, nonce, signature } = hmacSign(opts.hmacSecret, body);
        const url = `${opts.apiUrl.replace(/\/+$/,'')}/v1/ingest`;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-api-key': opts.apiKey,
            'x-ts-timestamp': timestamp,
            'x-ts-nonce': nonce,
            'x-ts-signature': signature,
          },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`Ingest ${res.status}`);
        return res.json();
      }

      return sendToIngest(opts.apiUrl, opts.apiKey, body);
    }
  };
}
