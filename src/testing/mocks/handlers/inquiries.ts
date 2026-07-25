import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';
import { InquiryStatus } from '@/types/api';

import { db, persistDb } from '../db';
import { networkDelay, requireAuth } from '../utils';

type MockInquiry = ReturnType<typeof db.inquiry.create>;

const transitions: Record<InquiryStatus, InquiryStatus[]> = {
  new: ['triage', 'waiting_for_customer', 'preparing_offer', 'closed'],
  triage: ['waiting_for_customer', 'preparing_offer', 'closed'],
  waiting_for_customer: ['triage', 'preparing_offer', 'closed'],
  preparing_offer: ['offer_sent', 'waiting_for_customer', 'closed'],
  offer_sent: ['accepted', 'rejected', 'preparing_offer', 'closed'],
  accepted: ['closed'],
  rejected: ['closed'],
  closed: [],
};

const requireCompany = (authorizationHeader: string | null) => {
  const { error, user } = requireAuth(authorizationHeader);

  if (error || !user?.company) {
    return { error: error || 'Unauthorized', user: null, company: null };
  }

  return { error: null, user, company: user.company };
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

const toInquiryResponse = (inquiry: MockInquiry) => ({
  id: inquiry.id,
  title: inquiry.title,
  description: inquiry.description,
  source: inquiry.source,
  status: inquiry.status,
  priority: inquiry.priority,
  responseDueAt: inquiry.responseDueAt,
  realizationDueAt: inquiry.realizationDueAt,
  pickupDueAt: inquiry.pickupDueAt,
  archivedAt: inquiry.archivedAt,
  customer: customerSummary(inquiry.customerId),
  owner: userSummary(inquiry.ownerUserId),
  messages: db.inquiryMessage
    .findMany({ where: { inquiryId: { equals: inquiry.id } } })
    .map((message) => ({
      id: message.id,
      direction: message.direction,
      senderName: message.senderName,
      senderEmail: message.senderEmail,
      recipientEmail: message.recipientEmail,
      subject: message.subject,
      body: message.body,
      externalMessageId: message.externalMessageId,
      externalThreadId: message.externalThreadId,
      sentAt: message.sentAt,
      createdAt: message.createdAt,
    })),
  files: db.inquiryFile
    .findMany({ where: { inquiryId: { equals: inquiry.id } } })
    .map((file) => ({
      id: file.id,
      source: file.source,
      originalName: file.originalName,
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
      category: file.category,
      description: file.description,
      uploadedByUserId: file.uploadedByUserId,
      messageId: file.inquiryMessageId,
      downloadUrl: file.downloadUrl,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    })),
  notes: db.inquiryNote
    .findMany({ where: { inquiryId: { equals: inquiry.id } } })
    .map((note) => ({
      id: note.id,
      body: note.body,
      isInternal: note.isInternal,
      author: userSummary(note.authorUserId),
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    })),
  statusChanges: db.inquiryStatusChange
    .findMany({ where: { inquiryId: { equals: inquiry.id } } })
    .map((change) => ({
      id: change.id,
      fromStatus: change.fromStatus,
      toStatus: change.toStatus,
      changedByUserId: change.changedByUserId,
      changedAt: change.changedAt,
    })),
  createdAt: inquiry.createdAt,
  updatedAt: inquiry.updatedAt,
});

const payload = async (request: Request) => {
  const body = (await request.json()) as Record<string, string | null>;

  return {
    customerId: body.customer_id || null,
    ownerUserId: body.owner_user_id || null,
    title: body.title || '',
    description: body.description || null,
    priority: body.priority || 'normal',
    responseDueAt: body.response_due_at || null,
    realizationDueAt: body.realization_due_at || null,
    pickupDueAt: body.pickup_due_at || null,
  };
};

export const inquiryHandlers = [
  http.get(`${env.API_URL}/inquiries`, async ({ request }) => {
    await networkDelay();

    const { error, company, user } = requireCompany(
      request.headers.get('authorization'),
    );

    if (error || !company || !user) {
      return HttpResponse.json({ message: error }, { status: 401 });
    }

    const params = new URL(request.url).searchParams;
    const queue = params.get('queue');
    const archived = params.get('archived') === '1';
    const now = Date.now();
    const inquiries = db.inquiry
      .findMany({ where: { companyId: { equals: company.id } } })
      .filter((inquiry) =>
        archived ? !!inquiry.archivedAt : !inquiry.archivedAt,
      )
      .filter((inquiry) => {
        if (!queue) return true;
        if (queue === 'new') return inquiry.status === 'new';
        if (queue === 'waiting')
          return inquiry.status === 'waiting_for_customer';
        if (queue === 'overdue') {
          return (
            !!inquiry.responseDueAt && Date.parse(inquiry.responseDueAt) < now
          );
        }
        if (queue === 'unassigned') return !inquiry.ownerUserId;
        if (queue === 'urgent') return inquiry.priority === 'urgent';
        return true;
      })
      .map((inquiry) => toInquiryResponse(inquiry));

    return HttpResponse.json({ status: 200, data: { inquiries } });
  }),

  http.post(`${env.API_URL}/inquiries`, async ({ request }) => {
    await networkDelay();

    const { error, company, user } = requireCompany(
      request.headers.get('authorization'),
    );

    if (error || !company || !user) {
      return HttpResponse.json({ message: error }, { status: 401 });
    }

    const data = await payload(request);
    const inquiry = db.inquiry.create({
      companyId: company.id,
      ...data,
      source: 'manual',
      status: 'new',
      archivedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    db.inquiryStatusChange.create({
      companyId: company.id,
      inquiryId: inquiry.id,
      changedByUserId: user.id,
      fromStatus: null,
      toStatus: 'new',
      changedAt: new Date().toISOString(),
    });

    await persistDb('inquiry');
    await persistDb('inquiryStatusChange');

    return HttpResponse.json(
      { status: 201, data: toInquiryResponse(inquiry) },
      { status: 201 },
    );
  }),

  http.get(
    `${env.API_URL}/inquiries/:inquiryId`,
    async ({ params, request }) => {
      await networkDelay();

      const { error, company } = requireCompany(
        request.headers.get('authorization'),
      );

      if (error || !company) {
        return HttpResponse.json({ message: error }, { status: 401 });
      }

      const inquiry = db.inquiry.findFirst({
        where: {
          id: { equals: String(params.inquiryId) },
          companyId: { equals: company.id },
        },
      });

      if (!inquiry) {
        return HttpResponse.json(
          { message: 'Inquiry was not found.' },
          { status: 422 },
        );
      }

      return HttpResponse.json({
        status: 200,
        data: toInquiryResponse(inquiry),
      });
    },
  ),

  http.patch(
    `${env.API_URL}/inquiries/:inquiryId`,
    async ({ params, request }) => {
      await networkDelay();

      const { error, company } = requireCompany(
        request.headers.get('authorization'),
      );

      if (error || !company) {
        return HttpResponse.json({ message: error }, { status: 401 });
      }

      const data = await payload(request);
      const inquiry = db.inquiry.update({
        where: {
          id: { equals: String(params.inquiryId) },
          companyId: { equals: company.id },
        },
        data: { ...data, updatedAt: new Date().toISOString() },
      });

      if (!inquiry) {
        return HttpResponse.json(
          { message: 'Inquiry was not found.' },
          { status: 422 },
        );
      }

      await persistDb('inquiry');

      return HttpResponse.json({
        status: 200,
        data: toInquiryResponse(inquiry),
      });
    },
  ),

  http.patch(
    `${env.API_URL}/inquiries/:inquiryId/status`,
    async ({ params, request }) => {
      await networkDelay();

      const { error, company, user } = requireCompany(
        request.headers.get('authorization'),
      );

      if (error || !company || !user) {
        return HttpResponse.json({ message: error }, { status: 401 });
      }

      const body = (await request.json()) as { status: InquiryStatus };
      const inquiry = db.inquiry.findFirst({
        where: {
          id: { equals: String(params.inquiryId) },
          companyId: { equals: company.id },
        },
      });

      if (!inquiry) {
        return HttpResponse.json(
          { message: 'Inquiry was not found.' },
          { status: 422 },
        );
      }

      if (!transitions[inquiry.status as InquiryStatus].includes(body.status)) {
        return HttpResponse.json(
          { message: 'Invalid transition' },
          { status: 409 },
        );
      }

      const updatedInquiry = db.inquiry.update({
        where: { id: { equals: inquiry.id } },
        data: { status: body.status, updatedAt: new Date().toISOString() },
      });

      if (!updatedInquiry) {
        return HttpResponse.json(
          { message: 'Inquiry was not found.' },
          { status: 422 },
        );
      }

      db.inquiryStatusChange.create({
        companyId: company.id,
        inquiryId: inquiry.id,
        changedByUserId: user.id,
        fromStatus: inquiry.status,
        toStatus: body.status,
        changedAt: new Date().toISOString(),
      });

      await persistDb('inquiry');
      await persistDb('inquiryStatusChange');

      return HttpResponse.json({
        status: 200,
        data: toInquiryResponse(updatedInquiry),
      });
    },
  ),

  http.patch(
    `${env.API_URL}/inquiries/:inquiryId/archive`,
    async ({ params, request }) => {
      return toggleArchive(params.inquiryId, request, true);
    },
  ),

  http.patch(
    `${env.API_URL}/inquiries/:inquiryId/restore`,
    async ({ params, request }) => {
      return toggleArchive(params.inquiryId, request, false);
    },
  ),

  http.post(
    `${env.API_URL}/inquiries/:inquiryId/messages`,
    async ({ params, request }) => {
      await networkDelay();

      const { error, company, user } = requireCompany(
        request.headers.get('authorization'),
      );

      if (error || !company || !user) {
        return HttpResponse.json({ message: error }, { status: 401 });
      }

      const inquiry = db.inquiry.findFirst({
        where: {
          id: { equals: String(params.inquiryId) },
          companyId: { equals: company.id },
        },
      });

      if (!inquiry) {
        return HttpResponse.json(
          { message: 'Inquiry was not found.' },
          { status: 422 },
        );
      }

      const body = (await request.json()) as Record<string, string | null>;
      db.inquiryMessage.create({
        companyId: company.id,
        inquiryId: inquiry.id,
        customerId: inquiry.customerId,
        createdByUserId: user.id,
        direction: body.direction || 'outbound',
        senderName: body.sender_name || null,
        senderEmail: body.sender_email || null,
        recipientEmail: body.recipient_email || null,
        subject: body.subject || null,
        body: body.body || '',
        externalMessageId: body.external_message_id || null,
        externalThreadId: body.external_thread_id || null,
        sentAt: body.sent_at || new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });

      const updatedInquiry = db.inquiry.update({
        where: { id: { equals: inquiry.id } },
        data: {
          status:
            body.direction === 'outbound'
              ? 'waiting_for_customer'
              : inquiry.status,
          updatedAt: new Date().toISOString(),
        },
      });

      await persistDb('inquiry');
      await persistDb('inquiryMessage');

      return HttpResponse.json({
        status: 200,
        data: toInquiryResponse(updatedInquiry || inquiry),
      });
    },
  ),

  http.post(
    `${env.API_URL}/inquiries/:inquiryId/files`,
    async ({ params, request }) => {
      await networkDelay();

      const { error, company, user } = requireCompany(
        request.headers.get('authorization'),
      );

      if (error || !company || !user) {
        return HttpResponse.json({ message: error }, { status: 401 });
      }

      const inquiry = findCompanyInquiry(params.inquiryId, company.id);

      if (!inquiry) {
        return HttpResponse.json(
          { message: 'Inquiry was not found.' },
          { status: 422 },
        );
      }

      const formData = await request.formData();
      const file = formData.get('file');

      if (!(file instanceof File) || !isAllowedFile(file)) {
        return HttpResponse.json({ message: 'Invalid file.' }, { status: 422 });
      }

      const createdAt = new Date().toISOString();
      const inquiryFile = db.inquiryFile.create({
        companyId: company.id,
        inquiryId: inquiry.id,
        customerId: inquiry.customerId,
        inquiryMessageId: null,
        uploadedByUserId: user.id,
        source: 'manual',
        originalName: file.name,
        mimeType: file.type || null,
        sizeBytes: file.size,
        category: String(formData.get('category') || '') || null,
        description: String(formData.get('description') || '') || null,
        downloadUrl: '',
        createdAt,
        updatedAt: createdAt,
      });
      db.inquiryFile.update({
        where: { id: { equals: inquiryFile.id } },
        data: {
          downloadUrl: `/api/v1/inquiries/${inquiry.id}/files/${inquiryFile.id}/download`,
        },
      });

      const updatedInquiry = db.inquiry.update({
        where: { id: { equals: inquiry.id } },
        data: { updatedAt: createdAt },
      });

      await persistDb('inquiry');
      await persistDb('inquiryFile');

      return HttpResponse.json(
        { status: 201, data: toInquiryResponse(updatedInquiry || inquiry) },
        { status: 201 },
      );
    },
  ),

  http.get(
    `${env.API_URL}/inquiries/:inquiryId/files/:fileId/download`,
    async ({ params, request }) => {
      await networkDelay();

      const { error, company } = requireCompany(
        request.headers.get('authorization'),
      );

      if (error || !company) {
        return HttpResponse.json({ message: error }, { status: 401 });
      }

      const file = db.inquiryFile.findFirst({
        where: {
          inquiryId: { equals: String(params.inquiryId) },
          id: { equals: String(params.fileId) },
          companyId: { equals: company.id },
        },
      });

      if (!file) {
        return HttpResponse.json(
          { message: 'Inquiry was not found.' },
          { status: 422 },
        );
      }

      return new HttpResponse('mock file', {
        headers: {
          'Content-Type': file.mimeType || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${file.originalName}"`,
        },
      });
    },
  ),

  http.post(
    `${env.API_URL}/inquiries/:inquiryId/notes`,
    async ({ params, request }) => {
      await networkDelay();

      const { error, company, user } = requireCompany(
        request.headers.get('authorization'),
      );

      if (error || !company || !user) {
        return HttpResponse.json({ message: error }, { status: 401 });
      }

      const inquiry = findCompanyInquiry(params.inquiryId, company.id);

      if (!inquiry) {
        return HttpResponse.json(
          { message: 'Inquiry was not found.' },
          { status: 422 },
        );
      }

      const body = (await request.json()) as Record<string, string | null>;
      const createdAt = new Date().toISOString();
      db.inquiryNote.create({
        companyId: company.id,
        inquiryId: inquiry.id,
        authorUserId: user.id,
        body: body.body || '',
        isInternal: true,
        createdAt,
        updatedAt: createdAt,
      });

      const updatedInquiry = db.inquiry.update({
        where: { id: { equals: inquiry.id } },
        data: { updatedAt: createdAt },
      });

      await persistDb('inquiry');
      await persistDb('inquiryNote');

      return HttpResponse.json({
        status: 200,
        data: toInquiryResponse(updatedInquiry || inquiry),
      });
    },
  ),

  http.patch(
    `${env.API_URL}/inquiries/:inquiryId/owner`,
    async ({ params, request }) => {
      await networkDelay();

      const { error, company, user } = requireCompany(
        request.headers.get('authorization'),
      );

      if (error || !company || !user) {
        return HttpResponse.json({ message: error }, { status: 401 });
      }

      if (user.role !== 'owner' && user.role !== 'admin') {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 });
      }

      const inquiry = findCompanyInquiry(params.inquiryId, company.id);

      if (!inquiry) {
        return HttpResponse.json(
          { message: 'Inquiry was not found.' },
          { status: 422 },
        );
      }

      const body = (await request.json()) as Record<string, string | null>;
      const ownerUserId = body.owner_user_id || null;
      const createdAt = new Date().toISOString();
      const updatedInquiry = db.inquiry.update({
        where: { id: { equals: inquiry.id } },
        data: { ownerUserId, updatedAt: createdAt },
      });

      if (inquiry.ownerUserId !== ownerUserId) {
        db.inquiryNote.create({
          companyId: company.id,
          inquiryId: inquiry.id,
          authorUserId: user.id,
          body: `Owner changed from ${inquiry.ownerUserId || 'unassigned'} to ${ownerUserId || 'unassigned'}.`,
          isInternal: true,
          createdAt,
          updatedAt: createdAt,
        });
      }

      await persistDb('inquiry');
      await persistDb('inquiryNote');

      return HttpResponse.json({
        status: 200,
        data: toInquiryResponse(updatedInquiry || inquiry),
      });
    },
  ),
];

const allowedFileExtensions = [
  'csv',
  'doc',
  'docx',
  'dwg',
  'dxf',
  'jpeg',
  'jpg',
  'pdf',
  'png',
  'txt',
  'webp',
  'xls',
  'xlsx',
];

const isAllowedFile = (file: File) => {
  if (file.size > 20 * 1024 * 1024) {
    return false;
  }

  const extension = file.name.split('.').pop()?.toLowerCase();

  return extension ? allowedFileExtensions.includes(extension) : false;
};

const findCompanyInquiry = (inquiryId: unknown, companyId: string) =>
  db.inquiry.findFirst({
    where: {
      id: { equals: String(inquiryId) },
      companyId: { equals: companyId },
    },
  });

const toggleArchive = async (
  inquiryId: unknown,
  request: Request,
  archived: boolean,
) => {
  await networkDelay();

  const { error, company } = requireCompany(
    request.headers.get('authorization'),
  );

  if (error || !company) {
    return HttpResponse.json({ message: error }, { status: 401 });
  }

  const inquiry = db.inquiry.update({
    where: {
      id: { equals: String(inquiryId) },
      companyId: { equals: company.id },
    },
    data: {
      archivedAt: archived ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
    },
  });

  if (!inquiry) {
    return HttpResponse.json(
      { message: 'Inquiry was not found.' },
      { status: 422 },
    );
  }

  await persistDb('inquiry');

  return HttpResponse.json({ status: 200, data: toInquiryResponse(inquiry) });
};
