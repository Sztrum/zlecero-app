import {
  createUser,
  renderApp,
  screen,
  userEvent,
  waitFor,
} from '@/testing/test-utils';

import { LoginForm } from '../login-form';

test('should login new user and call onSuccess cb which should navigate the user to the app', async () => {
  const newUser = await createUser();

  const onSuccess = vi.fn();

  await renderApp(<LoginForm onSuccess={onSuccess} />, { user: null });

  await userEvent.type(screen.getByLabelText(/e-mail/i), newUser.email);
  await userEvent.type(screen.getByLabelText(/hasło/i), newUser.password);

  await userEvent.click(screen.getByRole('button', { name: /zaloguj się/i }));

  await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
});
