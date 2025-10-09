import { sendToIngest } from '@/capture/transport';
import { buildSessionStart, buildSessionEnd, buildScreenStart, buildScreenEnd, buildAction, buildError, buildPerformance } from '@/capture/builders';

type WebSdkOpts = {
  apiUrl: string;
  apiKey: string;
  accountId: string;
  containerId?: string;
  appVersion?: string;
};

export function createWebSdk(opts: WebSdkOpts) {
  let sessionId: string | null = null;

  return {
    async startSession(userId?: string) {
      sessionId = `s_${Math.random().toString(36).slice(2,10)}`;
      const payload = buildSessionStart({
        account_id: opts.accountId,
        container_id: opts.containerId,
        user_id: userId,
        session_id: sessionId,
        source: 'web',
        app_version: opts.appVersion,
      });
      return sendToIngest(opts.apiUrl, opts.apiKey, payload);
    },

    async endSession() {
      if (!sessionId) return;
      const payload = buildSessionEnd({
        account_id: opts.accountId,
        container_id: opts.containerId,
        session_id: sessionId,
        source: 'web',
        app_version: opts.appVersion,
      });
      sessionId = null;
      return sendToIngest(opts.apiUrl, opts.apiKey, payload);
    },

    async screenStart(module_key: string, screen: string, userId?: string) {
      const payload = buildScreenStart({
        account_id: opts.accountId,
        container_id: opts.containerId,
        session_id: sessionId || undefined,
        user_id: userId,
        module_key,
        context: { screen },
        source: 'web',
        app_version: opts.appVersion,
      });
      return sendToIngest(opts.apiUrl, opts.apiKey, payload);
    },

    async screenEnd(module_key: string, screen: string, duration_ms?: number, userId?: string) {
      const payload = buildScreenEnd({
        account_id: opts.accountId,
        container_id: opts.containerId,
        session_id: sessionId || undefined,
        user_id: userId,
        module_key,
        context: { screen },
        duration_ms,
        source: 'web',
        app_version: opts.appVersion,
      });
      return sendToIngest(opts.apiUrl, opts.apiKey, payload);
    },

    async trackAction(p: { userId?: string; module_key?: string; feature_key?: string; action: string; success?: boolean; latency_ms?: number; biz?: any; }) {
      const payload = buildAction({
        account_id: opts.accountId,
        container_id: opts.containerId,
        session_id: sessionId || undefined,
        user_id: p.userId,
        module_key: p.module_key,
        feature_key: p.feature_key,
        action: p.action,
        success: p.success,
        latency_ms: p.latency_ms,
        biz: p.biz,
        source: 'web',
        app_version: opts.appVersion,
      });
      return sendToIngest(opts.apiUrl, opts.apiKey, payload);
    },

    async error(p: { userId?: string; code: string; severity?: 'warn'|'error'|'fatal'; message_hash?: string; retry_count?: number; }) {
      const payload = buildError({
        event: 'error',
        account_id: opts.accountId,
        container_id: opts.containerId,
        session_id: sessionId || undefined,
        user_id: p.userId,
        code: p.code,
        severity: p.severity || 'error',
        message_hash: p.message_hash,
        retry_count: p.retry_count,
        source: 'web',
        app_version: opts.appVersion,
      });
      return sendToIngest(opts.apiUrl, opts.apiKey, payload);
    },

    async performance(p: { lcp_ms?: number; inp_ms?: number; cls?: number; ttfb_ms?: number; }) {
      const payload = buildPerformance({
        account_id: opts.accountId,
        container_id: opts.containerId,
        session_id: sessionId || undefined,
        ...p,
        source: 'web',
        app_version: opts.appVersion,
      });
      return sendToIngest(opts.apiUrl, opts.apiKey, payload);
    },
  };
}
