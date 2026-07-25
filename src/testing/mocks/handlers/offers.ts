import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import { db, persistDb } from '../db';
import { networkDelay, requireAuth } from '../utils';

type MockOffer = ReturnType<typeof db.offer.create>;
type MockOrder = ReturnType<typeof db.order.create>;

const requireCompany = (authorizationHeader: string | null) => {
  const { error, user } = requireAuth(authorizationHeader);

  if (error || !user?.company) {
    return { error: error || 'Unauthorized', user: null, company: null };
  }

  return { error: null, user, company: user.company };
};

const userSummary = (userId: string | null) => {
  const user = userId
    ? db.user.findFirst({ where: { id: { equals: userId } } })
    : null;

  return user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    : null;
};

const customerSummary = (customerId: string | null) => {
  const customer = customerId
    ? db.customer.findFirst({ where: { id: { equals: customerId } } })
    : null;

  return customer
    ? {
        id: customer.id,
        displayName: customer.displayName,
        email: customer.email,
      }
    : null;
};

const toOfferResponse = (offer: MockOffer) => {
  const order = db.order.findFirst({
    where: { offerId: { equals: offer.id } },
  });

  return {
    id: offer.id,
    inquiryId: offer.inquiryId,
    customer: customerSummary(offer.customerId),
    owner: userSummary(offer.ownerUserId),
    number: offer.number,
    status: offer.status,
    currency: offer.currency,
    issueDate: offer.issueDate,
    validUntil: offer.validUntil,
    paymentDueDays: offer.paymentDueDays,
    deliveryCostCents: offer.deliveryCostCents,
    discountType: offer.discountType,
    discountValue: offer.discountValue,
    depositPercent: offer.depositPercent,
    terms: offer.terms,
    notes: offer.notes,
    subtotalNetCents: offer.subtotalNetCents,
    discountCents: offer.discountCents,
    taxCents: offer.taxCents,
    totalGrossCents: offer.totalGrossCents,
    depositCents: offer.depositCents,
    pdf: offer.pdfGeneratedAt
      ? {
          generatedAt: offer.pdfGeneratedAt,
          downloadUrl: `/api/v1/offers/${offer.id}/pdf/download`,
        }
      : null,
    orderId: order?.id || null,
    sentAt: offer.sentAt,
    acceptedAt: offer.acceptedAt,
    rejectedAt: offer.rejectedAt,
    items: db.offerItem
      .findMany({ where: { offerId: { equals: offer.id } } })
      .map((item) => itemResponse(item)),
    createdAt: offer.createdAt,
    updatedAt: offer.updatedAt,
  };
};

const toOrderResponse = (order: MockOrder) => ({
  id: order.id,
  inquiryId: order.inquiryId,
  offerId: order.offerId,
  customer: customerSummary(order.customerId),
  owner: userSummary(order.ownerUserId),
  number: order.number,
  status: order.status,
  currency: order.currency,
  acceptedDate: order.acceptedDate,
  paymentDueDate: order.paymentDueDate,
  realizationDueDate: order.realizationDueDate,
  pickupDueDate: order.pickupDueDate,
  terms: order.terms,
  notes: order.notes,
  subtotalNetCents: order.subtotalNetCents,
  discountCents: order.discountCents,
  taxCents: order.taxCents,
  totalGrossCents: order.totalGrossCents,
  depositCents: order.depositCents,
  items: db.orderItem
    .findMany({ where: { orderId: { equals: order.id } } })
    .map((item) => itemResponse(item)),
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
});

const itemResponse = (item: {
  id: string;
  position: number;
  name: string;
  description: string | null;
  quantity: string;
  unit: string;
  unitPriceCents: number;
  taxRate: string;
  netCents: number;
  taxCents: number;
  grossCents: number;
}) => ({
  id: item.id,
  position: item.position,
  name: item.name,
  description: item.description,
  quantity: item.quantity,
  unit: item.unit,
  unitPriceCents: item.unitPriceCents,
  taxRate: item.taxRate,
  netCents: item.netCents,
  taxCents: item.taxCents,
  grossCents: item.grossCents,
});

export const offerHandlers = [
  http.get(`${env.API_URL}/offers`, async ({ request }) => {
    await networkDelay();
    const { error, company } = requireCompany(
      request.headers.get('authorization'),
    );

    if (error || !company) {
      return HttpResponse.json({ message: error }, { status: 401 });
    }

    return HttpResponse.json({
      status: 200,
      data: {
        offers: db.offer
          .findMany({ where: { companyId: { equals: company.id } } })
          .map((offer) => toOfferResponse(offer)),
      },
    });
  }),

  http.post(`${env.API_URL}/offers`, async ({ request }) => {
    await networkDelay();
    const { error, company, user } = requireCompany(
      request.headers.get('authorization'),
    );

    if (error || !company || !user) {
      return HttpResponse.json({ message: error }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, any>;
    const inquiry = db.inquiry.findFirst({
      where: {
        id: { equals: String(body.inquiry_id) },
        companyId: { equals: company.id },
      },
    });

    if (!inquiry) {
      return HttpResponse.json(
        { message: 'Inquiry was not found.' },
        { status: 422 },
      );
    }

    const totals = calculateTotals(body);
    const createdAt = new Date().toISOString();
    const offer = db.offer.create({
      companyId: company.id,
      inquiryId: inquiry.id,
      customerId: inquiry.customerId,
      ownerUserId: inquiry.ownerUserId || user.id,
      number: body.number || nextNumber('OFF', db.offer.getAll().length + 1),
      status: 'draft',
      currency: body.currency || 'PLN',
      issueDate: body.issue_date,
      validUntil: body.valid_until,
      paymentDueDays: Number(body.payment_due_days || 7),
      deliveryCostCents: Number(body.delivery_cost_cents || 0),
      discountType: body.discount_type || null,
      discountValue: String(body.discount_value || '0'),
      depositPercent: String(body.deposit_percent || '0'),
      terms: body.terms || null,
      notes: body.notes || null,
      ...totals,
      pdfGeneratedAt: null,
      sentAt: null,
      acceptedAt: null,
      rejectedAt: null,
      createdAt,
      updatedAt: createdAt,
    });

    createOfferItems(company.id, offer.id, body.items || [], createdAt);
    await persistOfferState();

    return HttpResponse.json(
      { status: 201, data: toOfferResponse(offer) },
      { status: 201 },
    );
  }),

  http.get(`${env.API_URL}/offers/:offerId`, async ({ params, request }) => {
    await networkDelay();
    const { error, company } = requireCompany(
      request.headers.get('authorization'),
    );

    if (error || !company) {
      return HttpResponse.json({ message: error }, { status: 401 });
    }

    const offer = findOffer(params.offerId, company.id);

    if (!offer) {
      return HttpResponse.json(
        { message: 'Offer was not found.' },
        { status: 422 },
      );
    }

    return HttpResponse.json({ status: 200, data: toOfferResponse(offer) });
  }),

  http.patch(`${env.API_URL}/offers/:offerId`, async ({ params, request }) => {
    await networkDelay();
    const { error, company } = requireCompany(
      request.headers.get('authorization'),
    );

    if (error || !company) {
      return HttpResponse.json({ message: error }, { status: 401 });
    }

    const offer = findOffer(params.offerId, company.id);

    if (!offer) {
      return HttpResponse.json(
        { message: 'Offer was not found.' },
        { status: 422 },
      );
    }

    if (offer.status !== 'draft') {
      return HttpResponse.json(
        { message: 'Invalid offer state.' },
        { status: 409 },
      );
    }

    const body = (await request.json()) as Record<string, any>;
    const totals = calculateTotals(body);
    const updatedAt = new Date().toISOString();
    const updatedOffer = db.offer.update({
      where: { id: { equals: offer.id } },
      data: {
        currency: body.currency || offer.currency,
        issueDate: body.issue_date,
        validUntil: body.valid_until,
        paymentDueDays: Number(body.payment_due_days || offer.paymentDueDays),
        deliveryCostCents: Number(body.delivery_cost_cents || 0),
        discountType: body.discount_type || null,
        discountValue: String(body.discount_value || '0'),
        depositPercent: String(body.deposit_percent || '0'),
        terms: body.terms || null,
        notes: body.notes || null,
        ...totals,
        updatedAt,
      },
    });

    db.offerItem
      .findMany({ where: { offerId: { equals: offer.id } } })
      .forEach((item) =>
        db.offerItem.delete({ where: { id: { equals: item.id } } }),
      );
    createOfferItems(company.id, offer.id, body.items || [], updatedAt);
    await persistOfferState();

    return HttpResponse.json({
      status: 200,
      data: toOfferResponse(updatedOffer || offer),
    });
  }),

  http.patch(
    `${env.API_URL}/offers/:offerId/send`,
    async ({ params, request }) => {
      await networkDelay();
      return updateOfferStatus(params.offerId, request, 'sent');
    },
  ),

  http.post(
    `${env.API_URL}/offers/:offerId/pdf`,
    async ({ params, request }) => {
      await networkDelay();
      const { error, company } = requireCompany(
        request.headers.get('authorization'),
      );

      if (error || !company) {
        return HttpResponse.json({ message: error }, { status: 401 });
      }

      const offer = findOffer(params.offerId, company.id);

      if (!offer) {
        return HttpResponse.json(
          { message: 'Offer was not found.' },
          { status: 422 },
        );
      }

      const updatedOffer = db.offer.update({
        where: { id: { equals: offer.id } },
        data: {
          pdfGeneratedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });

      await persistDb('offer');

      return HttpResponse.json({
        status: 200,
        data: toOfferResponse(updatedOffer || offer),
      });
    },
  ),

  http.get(`${env.API_URL}/offers/:offerId/pdf/download`, async () => {
    await networkDelay();
    return new HttpResponse('mock pdf', {
      headers: { 'Content-Type': 'application/pdf' },
    });
  }),

  http.post(
    `${env.API_URL}/offers/:offerId/accept`,
    async ({ params, request }) => {
      await networkDelay();
      const { error, company } = requireCompany(
        request.headers.get('authorization'),
      );

      if (error || !company) {
        return HttpResponse.json({ message: error }, { status: 401 });
      }

      const offer = findOffer(params.offerId, company.id);

      if (!offer) {
        return HttpResponse.json(
          { message: 'Offer was not found.' },
          { status: 422 },
        );
      }

      if (offer.status === 'draft' || offer.status === 'rejected') {
        return HttpResponse.json(
          { message: 'Invalid offer state.' },
          { status: 409 },
        );
      }

      let order = db.order.findFirst({
        where: { offerId: { equals: offer.id } },
      });
      const updatedAt = new Date().toISOString();

      if (!order) {
        const createdOrder = db.order.create({
          companyId: company.id,
          inquiryId: offer.inquiryId,
          offerId: offer.id,
          customerId: offer.customerId,
          ownerUserId: offer.ownerUserId,
          number: nextNumber('ORD', db.order.getAll().length + 1),
          status: 'new',
          currency: offer.currency,
          acceptedDate: updatedAt.slice(0, 10),
          paymentDueDate: updatedAt.slice(0, 10),
          realizationDueDate: null,
          pickupDueDate: null,
          terms: offer.terms,
          notes: offer.notes,
          subtotalNetCents: offer.subtotalNetCents,
          discountCents: offer.discountCents,
          taxCents: offer.taxCents,
          totalGrossCents: offer.totalGrossCents,
          depositCents: offer.depositCents,
          createdAt: updatedAt,
          updatedAt,
        });
        order = createdOrder;

        db.offerItem
          .findMany({ where: { offerId: { equals: offer.id } } })
          .forEach((item) => {
            db.orderItem.create({
              companyId: company.id,
              orderId: createdOrder.id,
              offerItemId: item.id,
              position: item.position,
              name: item.name,
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
              unitPriceCents: item.unitPriceCents,
              taxRate: item.taxRate,
              netCents: item.netCents,
              taxCents: item.taxCents,
              grossCents: item.grossCents,
              createdAt: updatedAt,
              updatedAt,
            });
          });
      }

      const updatedOffer = db.offer.update({
        where: { id: { equals: offer.id } },
        data: { status: 'accepted', acceptedAt: updatedAt, updatedAt },
      });

      await persistOfferState();
      await persistDb('order');
      await persistDb('orderItem');

      return HttpResponse.json({
        status: 200,
        data: toOfferResponse(updatedOffer || offer),
      });
    },
  ),

  http.get(`${env.API_URL}/orders`, async ({ request }) => {
    await networkDelay();
    const { error, company } = requireCompany(
      request.headers.get('authorization'),
    );

    if (error || !company) {
      return HttpResponse.json({ message: error }, { status: 401 });
    }

    return HttpResponse.json({
      status: 200,
      data: {
        orders: db.order
          .findMany({ where: { companyId: { equals: company.id } } })
          .map((order) => toOrderResponse(order)),
      },
    });
  }),

  http.get(`${env.API_URL}/orders/:orderId`, async ({ params, request }) => {
    await networkDelay();
    const { error, company } = requireCompany(
      request.headers.get('authorization'),
    );

    if (error || !company) {
      return HttpResponse.json({ message: error }, { status: 401 });
    }

    const order = db.order.findFirst({
      where: {
        id: { equals: String(params.orderId) },
        companyId: { equals: company.id },
      },
    });

    if (!order) {
      return HttpResponse.json(
        { message: 'Order was not found.' },
        { status: 422 },
      );
    }

    return HttpResponse.json({ status: 200, data: toOrderResponse(order) });
  }),

  http.patch(
    `${env.API_URL}/orders/:orderId/status`,
    async ({ params, request }) => {
      await networkDelay();
      const { error, company } = requireCompany(
        request.headers.get('authorization'),
      );

      if (error || !company) {
        return HttpResponse.json({ message: error }, { status: 401 });
      }

      const order = db.order.findFirst({
        where: {
          id: { equals: String(params.orderId) },
          companyId: { equals: company.id },
        },
      });

      if (!order) {
        return HttpResponse.json(
          { message: 'Order was not found.' },
          { status: 422 },
        );
      }

      const body = (await request.json()) as { status?: string };
      const nextStatus = body.status;
      const allowed =
        nextStatus === order.status ||
        (order.status === 'new' &&
          ['in_progress', 'completed'].includes(nextStatus || '')) ||
        (order.status === 'in_progress' && nextStatus === 'completed');

      if (
        !allowed ||
        !['new', 'in_progress', 'completed'].includes(nextStatus || '')
      ) {
        return HttpResponse.json(
          { message: 'This order status change is not allowed.' },
          { status: 409 },
        );
      }

      const updatedAt = new Date().toISOString();
      const updatedOrder = db.order.update({
        where: { id: { equals: order.id } },
        data: { status: nextStatus, updatedAt },
      });

      await persistDb('order');

      return HttpResponse.json({
        status: 200,
        data: toOrderResponse(updatedOrder || order),
      });
    },
  ),
];

const updateOfferStatus = async (
  offerId: unknown,
  request: Request,
  status: string,
) => {
  const { error, company } = requireCompany(
    request.headers.get('authorization'),
  );

  if (error || !company) {
    return HttpResponse.json({ message: error }, { status: 401 });
  }

  const offer = findOffer(offerId, company.id);

  if (!offer) {
    return HttpResponse.json(
      { message: 'Offer was not found.' },
      { status: 422 },
    );
  }

  if (offer.status !== 'draft') {
    return HttpResponse.json(
      { message: 'Invalid offer state.' },
      { status: 409 },
    );
  }

  const updatedOffer = db.offer.update({
    where: { id: { equals: offer.id } },
    data: { status, sentAt: new Date().toISOString() },
  });

  await persistDb('offer');

  return HttpResponse.json({
    status: 200,
    data: toOfferResponse(updatedOffer || offer),
  });
};

const findOffer = (offerId: unknown, companyId: string) =>
  db.offer.findFirst({
    where: {
      id: { equals: String(offerId) },
      companyId: { equals: companyId },
    },
  });

const createOfferItems = (
  companyId: string,
  offerId: string,
  items: Array<Record<string, any>>,
  createdAt: string,
) => {
  items.forEach((item, index) => {
    const netCents = Math.round(
      Number(item.quantity || 0) * Number(item.unit_price_cents || 0),
    );
    const taxCents = Math.round(netCents * (Number(item.tax_rate || 0) / 100));

    db.offerItem.create({
      companyId,
      offerId,
      position: index + 1,
      name: item.name || '',
      description: item.description || null,
      quantity: String(item.quantity || '1'),
      unit: item.unit || 'pcs',
      unitPriceCents: Number(item.unit_price_cents || 0),
      taxRate: String(item.tax_rate || '23'),
      netCents,
      taxCents,
      grossCents: netCents + taxCents,
      createdAt,
      updatedAt: createdAt,
    });
  });
};

const calculateTotals = (body: Record<string, any>) => {
  const items = body.items || [];
  const itemTotals: Array<{ netCents: number; taxCents: number }> = items.map(
    (item: Record<string, any>) => {
      const netCents = Math.round(
        Number(item.quantity || 0) * Number(item.unit_price_cents || 0),
      );
      const taxCents = Math.round(
        netCents * (Number(item.tax_rate || 0) / 100),
      );
      return { netCents, taxCents };
    },
  );
  const subtotalNetCents = itemTotals.reduce(
    (total, item) => total + item.netCents,
    0,
  );
  const taxCents = itemTotals.reduce((total, item) => total + item.taxCents, 0);
  const grossBeforeDiscount =
    subtotalNetCents + taxCents + Number(body.delivery_cost_cents || 0);
  const discountCents =
    body.discount_type === 'percent'
      ? Math.round(
          grossBeforeDiscount * (Number(body.discount_value || 0) / 100),
        )
      : body.discount_type === 'amount'
        ? Math.round(Number(body.discount_value || 0) * 100)
        : 0;
  const totalGrossCents = Math.max(0, grossBeforeDiscount - discountCents);

  return {
    subtotalNetCents,
    discountCents: Math.min(grossBeforeDiscount, discountCents),
    taxCents,
    totalGrossCents,
    depositCents: Math.round(
      totalGrossCents * (Number(body.deposit_percent || 0) / 100),
    ),
  };
};

const nextNumber = (prefix: string, value: number) =>
  `${prefix}/${new Date().getFullYear()}/${String(value).padStart(4, '0')}`;

const persistOfferState = async () => {
  await persistDb('offer');
  await persistDb('offerItem');
};
