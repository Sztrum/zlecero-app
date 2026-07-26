import { createUser } from '@/testing/data-generators';
import { renderApp, screen, userEvent, waitFor } from '@/testing/test-utils';

import { RegisterForm } from '../register-form';

test('should register new user and call onSuccess cb which should navigate the user to login', async () => {
  const newUser = createUser({});

  const onSuccess = vi.fn();

  await renderApp(<RegisterForm onSuccess={onSuccess} />, { user: null });

  await userEvent.type(screen.getByLabelText(/imię i nazwisko/i), newUser.name);
  await userEvent.type(screen.getByLabelText(/e-mail/i), newUser.email);
  await userEvent.type(screen.getByLabelText(/nazwa firmy/i), 'Zlecero Studio');
  await userEvent.type(screen.getByLabelText(/^hasło$/i), 'ZleceroTest123!');
  await userEvent.type(
    screen.getByLabelText(/powtórz hasło/i),
    'ZleceroTest123!',
  );
  await userEvent.click(screen.getByLabelText(/akceptuję warunki/i));

  await userEvent.click(screen.getByRole('button', { name: /utwórz konto/i }));

  await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
});
