import userEvent from '@testing-library/user-event';

import { createCustomer } from '@/testing/data-generators';
import { db } from '@/testing/mocks/db';
import { createUser, renderApp, screen } from '@/testing/test-utils';

import AppOffersRoute from '../index';

const baseOffer = {
  currency: 'PLN',
  issueDate: '2026-07-01',
  validUntil: '2030-01-01',
  paymentDueDays: 7,
  deliveryCostCents: 0,
  discountType: null,
  discountValue: '0',
  depositPercent: '0',
  terms: null,
  notes: null,
  subtotalNetCents: 0,
  discountCents: 0,
  taxCents: 0,
  depositCents: 0,
  pdfGeneratedAt: null,
  sentAt: null,
  acceptedAt: null,
  rejectedAt: null,
  createdAt: '2026-07-01T10:00:00.000Z',
  updatedAt: '2026-07-01T10:00:00.000Z',
};

const seedOffers = async () => {
  const user = await createUser();
  const companyId = user.company.id;
  const customer = createCustomer({ companyId, displayName: 'Drukarnia Alfa' });
  await db.customer.create(customer);

  await db.offer.create({
    ...baseOffer,
    companyId,
    inquiryId: 'inquiry-1',
    customerId: customer.id,
    ownerUserId: user.id,
    number: 'OF/2026/0001',
    status: 'sent',
    totalGrossCents: 100000,
  });
  await db.offer.create({
    ...baseOffer,
    companyId,
    inquiryId: 'inquiry-2',
    customerId: customer.id,
    ownerUserId: user.id,
    number: 'OF/2026/0002',
    status: 'accepted',
    totalGrossCents: 200000,
  });
  await db.offer.create({
    ...baseOffer,
    companyId,
    inquiryId: 'inquiry-3',
    customerId: customer.id,
    ownerUserId: user.id,
    number: 'OF/2026/0003',
    status: 'rejected',
    totalGrossCents: 50000,
  });

  return user;
};

test('should render offers from the API with Polish status labels', async () => {
  const user = await seedOffers();

  await renderApp(<AppOffersRoute />, {
    user,
    path: '/app/offers',
    url: '/app/offers',
  });

  expect(await screen.findByText('OF/2026/0001')).toBeInTheDocument();
  expect(screen.getByText('OF/2026/0002')).toBeInTheDocument();
  expect(screen.getByText('OF/2026/0003')).toBeInTheDocument();
  expect(screen.getByText('Wysłana')).toBeInTheDocument();
  expect(screen.getByText('Zaakceptowana')).toBeInTheDocument();
  expect(screen.getByText('Odrzucona')).toBeInTheDocument();
  expect(screen.getAllByText('Drukarnia Alfa').length).toBeGreaterThan(0);
});

test('should compute the conversion rate from accepted and rejected offers', async () => {
  const user = await seedOffers();

  await renderApp(<AppOffersRoute />, {
    user,
    path: '/app/offers',
    url: '/app/offers',
  });

  expect(await screen.findByText('50%')).toBeInTheDocument();
});

test('should narrow the list to the selected offer status', async () => {
  const user = await seedOffers();

  await renderApp(<AppOffersRoute />, {
    user,
    path: '/app/offers',
    url: '/app/offers',
  });

  expect(await screen.findByText('OF/2026/0001')).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Zaakceptowane' }));

  expect(screen.getByText('OF/2026/0002')).toBeInTheDocument();
  expect(screen.queryByText('OF/2026/0001')).not.toBeInTheDocument();
  expect(screen.queryByText('OF/2026/0003')).not.toBeInTheDocument();
});
