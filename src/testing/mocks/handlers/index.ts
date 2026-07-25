import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import { networkDelay } from '../utils';

import { authHandlers } from './auth';
import { companyHandlers } from './company';
import { customerHandlers } from './customers';
import { inquiryHandlers } from './inquiries';
import { offerHandlers } from './offers';

export const handlers = [
  ...authHandlers,
  ...companyHandlers,
  ...customerHandlers,
  ...inquiryHandlers,
  ...offerHandlers,
  http.get(`${env.API_URL}/healthcheck`, async () => {
    await networkDelay();
    return HttpResponse.json({ ok: true });
  }),
];
