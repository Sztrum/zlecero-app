import { HttpResponse, http } from 'msw';

import { useNotifications } from '@/components/ui/notifications';
import { env } from '@/config/env';
import { server } from '@/testing/mocks/server';

import { api } from '../api-client';

test('logs full API error responses locally while preserving the user-facing validation message', async () => {
  const errorResponse = {
    status: 422,
    message: 'Invalid data.',
    errors: {
      terms_accepted: ['The terms must be accepted.'],
      email: ['The email has already been taken.'],
    },
  };
  const consoleErrorSpy = vi
    .spyOn(console, 'error')
    .mockImplementation(() => undefined);

  server.use(
    http.post(`${env.API_URL}/auth/register`, () => {
      return HttpResponse.json(errorResponse, { status: 422 });
    }),
  );

  await expect(api.post('/auth/register', {})).rejects.toMatchObject({
    response: {
      status: 422,
      data: errorResponse,
    },
  });

  expect(consoleErrorSpy).toHaveBeenCalledWith('API error response', {
    status: 422,
    data: errorResponse,
  });
  expect(useNotifications.getState().notifications).toEqual([
    expect.objectContaining({
      type: 'error',
      title: 'Error',
      message: 'The terms must be accepted.',
    }),
  ]);

  consoleErrorSpy.mockRestore();
});
