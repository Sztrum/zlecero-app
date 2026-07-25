import {
  render as rtlRender,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router';

import { AppProvider } from '@/app/provider';
import { authToken } from '@/lib/auth-token';

import {
  createCompany as generateCompany,
  createUser as generateUser,
} from './data-generators';
import { db } from './mocks/db';
import { authenticate, hash } from './mocks/utils';

export const createUser = async (userProperties?: any) => {
  const user = generateUser(userProperties) as any;
  const company = user.company || generateCompany();
  await db.company.create(company);
  await db.user.create({
    ...user,
    companyId: company.id,
    password: hash(user.password),
  });
  return user;
};

export const loginAsUser = async (user: any) => {
  const authUser = await authenticate(user);
  authToken.set(authUser.token);
  return authUser;
};

export const waitForLoadingToFinish = () =>
  Promise.resolve().then(() => {
    const getLoaders = () => [
      ...screen.queryAllByTestId(/loading/i),
      ...screen.queryAllByText(/loading/i),
    ];

    if (getLoaders().length === 0) {
      return;
    }

    return waitForElementToBeRemoved(getLoaders, { timeout: 4000 });
  });

const initializeUser = async (user: any) => {
  if (typeof user === 'undefined') {
    const newUser = await createUser();
    return loginAsUser(newUser);
  } else if (user) {
    return loginAsUser(user);
  } else {
    return null;
  }
};

export const renderApp = async (
  ui: any,
  { user, url = '/', path = '/', ...renderOptions }: Record<string, any> = {},
) => {
  const initializedUser = await initializeUser(user);

  const router = createMemoryRouter(
    [
      {
        path: path,
        element: ui,
      },
    ],
    {
      initialEntries: url ? ['/', url] : ['/'],
      initialIndex: url ? 1 : 0,
    },
  );

  const returnValue = {
    ...rtlRender(ui, {
      wrapper: () => {
        return (
          <AppProvider>
            <RouterProvider router={router} />
          </AppProvider>
        );
      },
      ...renderOptions,
    }),
    user: initializedUser,
  };

  await waitForLoadingToFinish();

  return returnValue;
};

export * from '@testing-library/react';
export { userEvent, rtlRender };
