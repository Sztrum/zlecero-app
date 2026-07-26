import { createUser } from '@/testing/data-generators';
import { db } from '@/testing/mocks/db';
import { renderApp, screen } from '@/testing/test-utils';

import VerifyEmailRoute from '../verify-email';

test('should verify email from query params and show login action', async () => {
  const user = createUser();
  await db.company.create(user.company);
  await db.user.create({
    ...user,
    companyId: user.company.id,
    password: user.password,
  });

  await renderApp(<VerifyEmailRoute />, {
    user: null,
    path: '/auth/verify-email',
    url: '/auth/verify-email?user_id=' + user.id + '&hash=test-hash',
  });

  expect(
    await screen.findByText(/adres e-mail został potwierdzony/i),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: /przejdź do logowania/i }),
  ).toHaveAttribute('href', '/login');
});

test('should show incomplete verification link state without query params', async () => {
  await renderApp(<VerifyEmailRoute />, {
    user: null,
    path: '/auth/verify-email',
    url: '/auth/verify-email',
  });

  expect(
    screen.getByText(/link weryfikacyjny jest niekompletny/i),
  ).toBeInTheDocument();
});
