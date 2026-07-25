import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';
import { DashboardItem } from '@/types/api';

import { db } from '../db';
import { networkDelay, requireAdmin, requireAuth } from '../utils';

const requireCompany = (authorizationHeader: string | null) => {
  const { error, user } = requireAuth(authorizationHeader);

  if (error || !user?.company) {
    return { error: error || 'Unauthorized', user: null, company: null };
  }

  return { error: null, user, company: user.company };
};

const customerName = (customerId: string | null) => {
  const customer = customerId
    ? db.customer.findFirst({ where: { id: { equals: customerId } } })
    : null;

  return customer?.displayName ?? null;
};

const ownerName = (ownerUserId: string | null) => {
  const user = ownerUserId
    ? db.user.findFirst({ where: { id: { equals: ownerUserId } } })
    : null;

  return user?.name ?? null;
};

const toTimestamp = (value: string | null) =>
  value ? Date.parse(value) : Number.MAX_SAFE_INTEGER;

const inquiryItem = (
  inquiry: ReturnType<typeof db.inquiry.create>,
  label: string,
  tone: DashboardItem['tone'],
): DashboardItem => ({
  id: `inquiry-${inquiry.id}`,
  type: 'inquiry',
  label,
  title: inquiry.title,
  customerName: customerName(inquiry.customerId),
  ownerName: ownerName(inquiry.ownerUserId),
  status: inquiry.status,
  tone,
  dueAt: inquiry.responseDueAt,
  href: `/app/inquiries/${inquiry.id}`,
});

const offerItem = (
  offer: ReturnType<typeof db.offer.create>,
  label: string,
  tone: DashboardItem['tone'],
): DashboardItem => ({
  id: `offer-${offer.id}`,
  type: 'offer',
  label,
  title: offer.number,
  customerName: customerName(offer.customerId),
  ownerName: ownerName(offer.ownerUserId),
  status: offer.status,
  tone,
  dueAt: offer.validUntil,
  href: `/app/offers/${offer.id}`,
});

const orderItem = (
  order: ReturnType<typeof db.order.create>,
  label: string,
  tone: DashboardItem['tone'],
): DashboardItem => ({
  id: `order-${order.id}`,
  type: 'order',
  label,
  title: order.number,
  customerName: customerName(order.customerId),
  ownerName: ownerName(order.ownerUserId),
  status: order.status,
  tone,
  dueAt: order.realizationDueDate,
  href: `/app/orders/${order.id}`,
});

export const dashboardHandlers = [
  http.get(`${env.API_URL}/dashboard`, async ({ request }) => {
    await networkDelay();

    const { error, company, user } = requireCompany(
      request.headers.get('authorization'),
    );

    if (error || !company || !user) {
      return HttpResponse.json({ message: error }, { status: 401 });
    }

    const owner = new URL(request.url).searchParams.get('owner');
    const ownerUserId = owner === 'me' ? user.id : null;
    const now = Date.now();
    const weekEnd = now + 7 * 24 * 60 * 60 * 1000;

    const inquiries = db.inquiry
      .findMany({ where: { companyId: { equals: company.id } } })
      .filter((inquiry) => !inquiry.archivedAt)
      .filter((inquiry) => !ownerUserId || inquiry.ownerUserId === ownerUserId);
    const offers = db.offer
      .findMany({ where: { companyId: { equals: company.id } } })
      .filter((offer) => !ownerUserId || offer.ownerUserId === ownerUserId);
    const orders = db.order
      .findMany({ where: { companyId: { equals: company.id } } })
      .filter((order) => !ownerUserId || order.ownerUserId === ownerUserId);

    const overdueInquiries = inquiries
      .filter(
        (inquiry) =>
          !!inquiry.responseDueAt && Date.parse(inquiry.responseDueAt) < now,
      )
      .map((inquiry) =>
        inquiryItem(inquiry, 'Termin odpowiedzi minął', 'danger'),
      );
    const sentOffers = offers
      .filter((offer) => offer.status === 'sent')
      .map((offer) => offerItem(offer, 'Oferta czeka na decyzję', 'warning'));

    return HttpResponse.json({
      status: 200,
      data: {
        filter: { owner: owner === 'me' ? 'me' : 'all' },
        cards: [
          {
            id: 'new-inquiries',
            label: 'Nowe zapytania',
            value: inquiries.filter((inquiry) => inquiry.status === 'new')
              .length,
            tone: 'info',
            href: '/app/inquiries?queue=new',
          },
          {
            id: 'waiting-inquiries',
            label: 'Sprawy oczekujące',
            value: inquiries.filter(
              (inquiry) => inquiry.status === 'waiting_for_customer',
            ).length,
            tone: 'warning',
            href: '/app/inquiries?queue=waiting',
          },
          {
            id: 'offer-actions',
            label: 'Oferty do reakcji',
            value: offers.filter((offer) => offer.status === 'sent').length,
            tone: 'primary',
            href: '/app/offers',
          },
          {
            id: 'overdue-orders',
            label: 'Opóźnione zlecenia',
            value: orders.filter(
              (order) =>
                order.status !== 'completed' &&
                !!order.realizationDueDate &&
                Date.parse(order.realizationDueDate) < now,
            ).length,
            tone: 'danger',
            href: '/app/orders',
          },
        ],
        tasksToday: inquiries
          .filter(
            (inquiry) =>
              !!inquiry.responseDueAt &&
              Date.parse(inquiry.responseDueAt) <= now,
          )
          .sort(
            (a, b) =>
              toTimestamp(a.responseDueAt) - toTimestamp(b.responseDueAt),
          )
          .slice(0, 6)
          .map((inquiry) =>
            inquiryItem(inquiry, 'Odpowiedz klientowi', 'info'),
          ),
        attentionItems: [...overdueInquiries, ...sentOffers]
          .sort((a, b) => toTimestamp(a.dueAt) - toTimestamp(b.dueAt))
          .slice(0, 6),
        upcomingDeadlines: orders
          .filter(
            (order) =>
              !!order.realizationDueDate &&
              Date.parse(order.realizationDueDate) >= now &&
              Date.parse(order.realizationDueDate) <= weekEnd,
          )
          .sort(
            (a, b) =>
              toTimestamp(a.realizationDueDate) -
              toTimestamp(b.realizationDueDate),
          )
          .slice(0, 6)
          .map((order) => orderItem(order, 'Termin realizacji', 'primary')),
        stats: {
          activeInquiries: inquiries.filter(
            (inquiry) =>
              inquiry.status !== 'closed' && inquiry.status !== 'rejected',
          ).length,
          sentOffersGrossCents: offers
            .filter((offer) => offer.status === 'sent')
            .reduce((total, offer) => total + offer.totalGrossCents, 0),
          acceptedOffersGrossCents: offers
            .filter((offer) => offer.status === 'accepted')
            .reduce((total, offer) => total + offer.totalGrossCents, 0),
          activeOrders: orders.filter((order) =>
            ['new', 'in_progress'].includes(order.status),
          ).length,
        },
        recentActivity: db.inquiryStatusChange
          .findMany({ where: { companyId: { equals: company.id } } })
          .slice(0, 6)
          .map((change) => ({
            id: change.id,
            type: 'inquiry_status',
            label: 'Zmieniono status zapytania',
            description: change.inquiryId,
            status: change.toStatus,
            occurredAt: change.changedAt,
            href: `/app/inquiries/${change.inquiryId}`,
          })),
      },
    });
  }),

  http.get(`${env.API_URL}/dashboard/admin`, async ({ request }) => {
    await networkDelay();

    const { error, user } = requireAuth(request.headers.get('authorization'));

    if (error || !user) {
      return HttpResponse.json({ message: error }, { status: 401 });
    }

    try {
      requireAdmin(user);
    } catch {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const companies = db.company.getAll();
    const now = Date.now();

    return HttpResponse.json({
      status: 200,
      data: {
        cards: [
          {
            id: 'active-companies',
            label: 'Aktywne firmy',
            value: companies.length,
            tone: 'primary',
          },
          {
            id: 'trial-companies',
            label: 'Konta w okresie próbnym',
            value: companies.filter(
              (company) =>
                !!company.trialEndsAt && Date.parse(company.trialEndsAt) >= now,
            ).length,
            tone: 'info',
          },
          {
            id: 'limited-companies',
            label: 'Konta z ograniczeniami',
            value: companies.filter(
              (company) =>
                !!company.trialEndsAt && Date.parse(company.trialEndsAt) < now,
            ).length,
            tone: 'danger',
          },
          {
            id: 'admin-actions',
            label: 'Wymagane działania',
            value: companies.filter((company) => !company.onboardingCompletedAt)
              .length,
            tone: 'warning',
          },
        ],
        recentCompanies: companies.slice(0, 6).map((company) => ({
          id: company.id,
          name: company.name,
          slug: company.slug,
          trialEndsAt: company.trialEndsAt,
          onboardingCompletedAt: company.onboardingCompletedAt,
          createdAt: String(company.createdAt),
        })),
        alerts: companies
          .filter((company) => !company.onboardingCompletedAt)
          .slice(0, 5)
          .map((company) => ({
            id: `company-onboarding-${company.id}`,
            severity: 'warning',
            label: 'Firma nie zakończyła onboardingu',
            companyName: company.name,
            createdAt: String(company.createdAt),
          })),
      },
    });
  }),
];
