import { ScreenViewStart, ScreenViewEnd } from '../schemas/screen';

export const buildScreenStart = (p: Parameters<typeof ScreenViewStart.parse>[0]) =>
  ScreenViewStart.parse(p);

export const buildScreenEnd = (p: Parameters<typeof ScreenViewEnd.parse>[0]) =>
  ScreenViewEnd.parse(p);
