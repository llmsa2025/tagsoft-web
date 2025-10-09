import { SessionStart, SessionEnd } from '../schemas/session';

export const buildSessionStart = (p: Parameters<typeof SessionStart.parse>[0]) =>
  SessionStart.parse(p);

export const buildSessionEnd = (p: Parameters<typeof SessionEnd.parse>[0]) =>
  SessionEnd.parse(p);
