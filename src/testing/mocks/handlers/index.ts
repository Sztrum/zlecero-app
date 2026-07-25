import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import { networkDelay } from '../utils';

import { authHandlers } from './auth';
import { companyHandlers } from './company';
import { customerHandlers } from './customers';

export const handlers = [
  ...authHandlers,
  ...companyHandlers,
  ...customerHandlers,
  http.get(`${env.API_URL}/healthcheck`, async () => {
    await networkDelay();
    return HttpResponse.json({ ok: true });
  }),
];
