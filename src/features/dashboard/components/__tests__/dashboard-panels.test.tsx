import userEvent from '@testing-library/user-event';

import { renderApp, screen } from '@/testing/test-utils';
import { CompanyDashboard } from '@/types/api';

import { CompanyDashboardPanel } from '../dashboard-panels';

const dashboard: CompanyDashboard = {
  filter: { owner: 'all' },
  cards: [
    {
      id: 'new-inquiries',
      label: 'Nowe zapytania',
      value: 3,
      tone: 'info',
      href: '/app/inquiries',
    },
  ],
  tasksToday: [],
  attentionItems: [
    {
      id: 'inquiry-1',
      type: 'inquiry',
      label: 'Zapytanie bez odpowiedzi',
      title: 'Oklejanie floty',
      customerName: 'Drukarnia Alfa',
      ownerName: 'Anna Nowak',
      status: 'Nowe',
      tone: 'danger',
      dueAt: '2026-08-01',
      href: '/app/inquiries?inquiry=inquiry-1',
    },
  ],
  upcomingDeadlines: [],
  stats: {
    activeInquiries: 3,
    sentOffersGrossCents: 100000,
    acceptedOffersGrossCents: 200000,
    activeOrders: 1,
  },
  recentActivity: [],
};

const renderPanel = () =>
  renderApp(<CompanyDashboardPanel data={dashboard} />, {
    path: '/app',
    url: '/app',
  });

test('should expose only tabs backed by a real API contract', async () => {
  await renderPanel();

  expect(screen.getByRole('button', { name: /pulpit/i })).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /zapytania/i }),
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /oferty/i })).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /ustawienia/i }),
  ).toBeInTheDocument();

  expect(
    screen.queryByRole('button', { name: /produkty/i }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: /wiadomości/i }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: /pliki/i }),
  ).not.toBeInTheDocument();
});

test('should never render the demonstration action notice', async () => {
  await renderPanel();

  expect(screen.queryByText(/wersji demonstracyjnej/i)).not.toBeInTheDocument();
});

test('should hand off the offers tab to the canonical offers route', async () => {
  await renderPanel();

  await userEvent.click(screen.getByRole('button', { name: /oferty/i }));

  expect(screen.getByRole('link', { name: /otwórz oferty/i })).toHaveAttribute(
    'href',
    '/app/offers',
  );
});

test('should hand off the settings tab to real company API screens', async () => {
  await renderPanel();

  await userEvent.click(screen.getByRole('button', { name: /ustawienia/i }));

  expect(
    screen.getByRole('link', { name: /otwórz dane firmy/i }),
  ).toHaveAttribute('href', '/app/company');
  expect(
    screen.getByRole('link', { name: /otwórz użytkowników/i }),
  ).toHaveAttribute('href', '/app/company/users');
});
