import { createUser } from '@/testing/data-generators';
import { renderApp, screen, userEvent, waitFor } from '@/testing/test-utils';

import { RegisterForm } from '../register-form';

test('should register new user and call onSuccess cb which should navigate the user to login', async () => {
  const newUser = createUser({});

  const onSuccess = vi.fn();

  await renderApp(<RegisterForm onSuccess={onSuccess} />, { user: null });

  await userEvent.type(screen.getByLabelText(/^name$/i), newUser.name);
  await userEvent.type(screen.getByLabelText(/email address/i), newUser.email);
  await userEvent.type(
    screen.getByLabelText(/company name/i),
    'Zlecero Studio',
  );
  await userEvent.type(screen.getByLabelText(/^password$/i), 'ZleceroTest123!');
  await userEvent.type(
    screen.getByLabelText(/confirm password/i),
    'ZleceroTest123!',
  );
  await userEvent.click(screen.getByLabelText(/required terms/i));

  await userEvent.click(screen.getByRole('button', { name: /register/i }));

  await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
});
