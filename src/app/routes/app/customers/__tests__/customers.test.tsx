import { within } from '@testing-library/react';

import { createCustomer } from '@/testing/data-generators';
import { db } from '@/testing/mocks/db';
import { createUser, renderApp, screen } from '@/testing/test-utils';

import AppCustomersRoute from '../index';

const seedCustomers = async () => {
  const user = await createUser();
  const companyId = user.company.id;

  await db.customer.create(
    createCustomer({
      companyId,
      type: 'company',
      displayName: 'Drukarnia Alfa',
      companyName: 'Drukarnia Alfa Sp. z o.o.',
    }),
  );
  await db.customer.create(
    createCustomer({
      companyId,
      type: 'company',
      displayName: 'Reklama Beta',
      companyName: 'Reklama Beta S.A.',
    }),
  );
  await db.customer.create(
    createCustomer({
      companyId,
      type: 'individual',
      displayName: 'Jan Kowalski',
      companyName: '',
    }),
  );

  return user;
};

const statCard = (label: string) =>
  within(screen.getByRole('group', { name: label }));

test('should render customers from the API with Polish type labels', async () => {
  const user = await seedCustomers();

  await renderApp(<AppCustomersRoute />, {
    user,
    path: '/app/customers',
    url: '/app/customers',
  });

  expect(await screen.findByText('Drukarnia Alfa')).toBeInTheDocument();
  expect(screen.getByText('Reklama Beta')).toBeInTheDocument();
  expect(screen.getByText('Jan Kowalski')).toBeInTheDocument();
  expect(screen.getAllByText('Firma')).toHaveLength(2);
  expect(screen.getByText('Osoba prywatna')).toBeInTheDocument();
});

test('should summarize the customer list by type', async () => {
  const user = await seedCustomers();

  await renderApp(<AppCustomersRoute />, {
    user,
    path: '/app/customers',
    url: '/app/customers',
  });

  expect(await screen.findByText('Drukarnia Alfa')).toBeInTheDocument();
  expect(statCard('Klienci na liście').getByText('3')).toBeInTheDocument();
  expect(statCard('Firmy').getByText('2')).toBeInTheDocument();
  expect(statCard('Osoby prywatne').getByText('1')).toBeInTheDocument();
});
