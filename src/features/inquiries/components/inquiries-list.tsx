import {
  Download,
  Eye,
  FileText,
  MoreHorizontal,
  Plus,
  UserCheck,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Form, Textarea } from '@/components/ui/form';
import { Spinner } from '@/components/ui/spinner';
import { env } from '@/config/env';
import { Inquiry, InquiryPriority, InquiryStatus, Offer } from '@/types/api';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/format-date';
import { formatMoney } from '@/utils/format-money';

import {
  InquiryFilters,
  inquiryNoteSchema,
  useAddInquiryNote,
  useInquiries,
} from '../api/inquiries';
import { useInquiryOffers } from '../api/linked-offers';

type InquiriesListProps = {
  filters?: InquiryFilters;
  initialInquiryId?: string | null;
  query?: string;
  onSelectedInquiryChange?: (inquiryId: string | null) => void;
};

const statusLabels: Record<InquiryStatus, string> = {
  new: 'Nowe',
  triage: 'W toku',
  waiting_for_customer: 'Oczekuje',
  preparing_offer: 'W toku',
  offer_sent: 'Wysłano ofertę',
  accepted: 'Zaakceptowano',
  rejected: 'Odrzucone',
  closed: 'Zamknięte',
};

const statusClasses: Record<InquiryStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  triage: 'bg-orange-100 text-orange-700',
  waiting_for_customer: 'bg-yellow-100 text-yellow-700',
  preparing_offer: 'bg-orange-100 text-orange-700',
  offer_sent: 'bg-purple-100 text-purple-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  closed: 'bg-gray-100 text-gray-600',
};

const priorityLabels: Record<InquiryPriority, string> = {
  urgent: 'Pilny',
  high: 'Wysoki',
  normal: 'Normalny',
  low: 'Niski',
};

const priorityClasses: Record<InquiryPriority, string> = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  normal: 'bg-slate-100 text-slate-600',
  low: 'bg-gray-100 text-gray-500',
};

const downloadHref = (downloadUrl: string) =>
  new URL(downloadUrl, env.API_URL.replace(/\/api\/v1\/?$/, '')).toString();

export const InquiriesList = ({
  filters = {},
  initialInquiryId = null,
  query = '',
  onSelectedInquiryChange,
}: InquiriesListProps) => {
  const inquiries = useInquiries(filters);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(
    initialInquiryId,
  );
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(
    Boolean(initialInquiryId),
  );
  const closeTimerRef = useRef<number | null>(null);
  const normalizedQuery = query.trim().toLocaleLowerCase('pl-PL');
  const visibleInquiries = (inquiries.data ?? []).filter((inquiry) => {
    if (!normalizedQuery) {
      return true;
    }

    return [
      inquiry.title,
      inquiry.source,
      inquiry.customer?.displayName,
      inquiry.owner?.name,
      statusLabels[inquiry.status],
      priorityLabels[inquiry.priority],
    ]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase('pl-PL')
      .includes(normalizedQuery);
  });
  const selectedInquiry =
    inquiries.data?.find((inquiry) => inquiry.id === selectedInquiryId) ?? null;

  useEffect(() => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setSelectedInquiryId(initialInquiryId);
    setIsInquiryDrawerOpen(Boolean(initialInquiryId));
  }, [initialInquiryId]);

  useEffect(
    () => () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    },
    [],
  );

  const closeInquiryDrawer = () => {
    setIsInquiryDrawerOpen(false);

    closeTimerRef.current = window.setTimeout(() => {
      setSelectedInquiryId(null);
      onSelectedInquiryChange?.(null);
      closeTimerRef.current = null;
    }, 300);
  };

  const selectInquiry = (inquiry: Inquiry | null) => {
    const inquiryId = inquiry?.id ?? null;

    if (!inquiryId) {
      closeInquiryDrawer();
      return;
    }

    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setSelectedInquiryId(inquiryId);
    setIsInquiryDrawerOpen(true);
    onSelectedInquiryChange?.(inquiryId);
  };

  if (inquiries.isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-[#EADBCD] bg-white">
        <Spinner size="lg" />
      </div>
    );
  }

  if (inquiries.isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        Nie udało się pobrać listy zapytań.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-[#EADBCD] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#EADBCD] bg-[#FFFDF9]">
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                  Nr / Klient
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold text-muted-foreground md:table-cell">
                  Temat
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold text-muted-foreground lg:table-cell">
                  Data
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                  Status
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold text-muted-foreground md:table-cell">
                  Priorytet
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold text-muted-foreground lg:table-cell">
                  Opiekun
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADBCD]">
              {visibleInquiries.map((inquiry) => (
                <InquiryRow
                  key={inquiry.id}
                  inquiry={inquiry}
                  onSelect={selectInquiry}
                />
              ))}
              {visibleInquiries.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-10 text-sm text-muted-foreground"
                    colSpan={7}
                  >
                    Brak zapytań dla wybranych filtrów.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
      {selectedInquiry ? (
        <InquiryDrawer
          inquiry={selectedInquiry}
          open={isInquiryDrawerOpen}
          onClose={closeInquiryDrawer}
        />
      ) : null}
    </>
  );
};

const InquiryRow = ({
  inquiry,
  onSelect,
}: {
  inquiry: Inquiry;
  onSelect: (inquiry: Inquiry) => void;
}) => (
  <tr
    className="cursor-pointer transition-colors hover:bg-[#FFFDF9]"
    onClick={() => onSelect(inquiry)}
  >
    <td className="px-6 py-4">
      <button
        className="font-mono text-xs font-semibold text-[#33251D]"
        type="button"
        onClick={() => onSelect(inquiry)}
      >
        {inquiry.id}
      </button>
      <div className="mt-0.5 text-xs text-muted-foreground">
        {inquiry.customer?.displayName || '-'}
      </div>
    </td>
    <td className="hidden max-w-[240px] p-4 text-xs text-[#33251D] md:table-cell">
      <button
        className="line-clamp-1 text-left hover:text-primary"
        type="button"
        onClick={() => onSelect(inquiry)}
      >
        {inquiry.title}
      </button>
    </td>
    <td className="hidden p-4 text-xs text-muted-foreground lg:table-cell">
      {formatDate(inquiry.responseDueAt ?? inquiry.updatedAt)}
    </td>
    <td className="p-4">
      <StatusLabel status={inquiry.status} />
    </td>
    <td className="hidden p-4 md:table-cell">
      <PriorityLabel priority={inquiry.priority} />
    </td>
    <td className="hidden p-4 text-xs text-muted-foreground lg:table-cell">
      {inquiry.owner?.name || '-'}
    </td>
    <td className="p-4">
      <div className="flex items-center gap-1">
        <button
          className="p-1 text-muted-foreground transition-colors hover:text-[#33251D]"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onSelect(inquiry);
          }}
        >
          <Eye className="size-4" />
        </button>
        <button
          className="p-1 text-muted-foreground transition-colors hover:text-[#33251D]"
          type="button"
          onClick={(event) => event.stopPropagation()}
        >
          <FileText className="size-4" />
          <span className="sr-only">Utwórz ofertę</span>
        </button>
        <button
          className="p-1 text-muted-foreground transition-colors hover:text-[#33251D]"
          type="button"
          onClick={(event) => event.stopPropagation()}
        >
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Więcej akcji</span>
        </button>
      </div>
    </td>
  </tr>
);

const InquiryDrawer = ({
  inquiry,
  open,
  onClose,
}: {
  inquiry: Inquiry;
  open: boolean;
  onClose: () => void;
}) => {
  const [tab, setTab] = useState<'inquiry' | 'messages' | 'files' | 'offers'>(
    'inquiry',
  );
  const offers = useInquiryOffers(inquiry.id);
  const addNote = useAddInquiryNote();

  const customerName = inquiry.customer?.displayName ?? 'Klient';
  const customerEmail = inquiry.customer?.email ?? '-';
  const ownerName = inquiry.owner?.name ?? 'Nieprzypisane';
  const linkedOffers = offers.data ?? [];

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <DrawerContent
        side="right"
        className="flex h-full w-[min(96vw,88rem)] max-w-none flex-col overflow-hidden border-[#EADBCD] bg-white p-0 shadow-2xl sm:max-w-none"
      >
        <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-4 border-b border-[#EADBCD] bg-white px-6 py-4">
          <div className="min-w-0">
            <p className="mb-0.5 font-mono text-xs font-semibold text-muted-foreground">
              {inquiry.id}
            </p>
            <h3 className="font-display text-base font-bold leading-tight text-[#33251D]">
              {inquiry.title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary/90"
              type="button"
              onClick={() => setTab('offers')}
            >
              <FileText className="size-3" />
              Oferty ({linkedOffers.length})
            </button>
            <button
              className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-[#FAF5ED] hover:text-[#33251D]"
              type="button"
              onClick={onClose}
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-2 border-b border-[#EADBCD] md:grid-cols-4">
          {[
            {
              label: 'Status',
              value: <StatusLabel status={inquiry.status} />,
            },
            {
              label: 'Priorytet',
              value: <PriorityLabel priority={inquiry.priority} />,
            },
            {
              label: 'Opiekun',
              value: (
                <span className="text-xs font-medium text-[#33251D]">
                  {ownerName}
                </span>
              ),
            },
            {
              label: 'Data wpływu',
              value: (
                <span className="text-xs text-muted-foreground">
                  {formatDate(inquiry.createdAt)}
                </span>
              ),
            },
          ].map((meta) => (
            <div
              key={meta.label}
              className="border-r border-[#EADBCD] px-4 py-2.5 last:border-r-0"
            >
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {meta.label}
              </p>
              {meta.value}
            </div>
          ))}
        </div>

        <div className="flex shrink-0 gap-0 border-b border-[#EADBCD] bg-white px-6">
          {[
            { key: 'inquiry', label: 'Zapytanie' },
            {
              key: 'messages',
              label: `Wiadomości (${inquiry.messages.length})`,
            },
            { key: 'files', label: `Pliki (${inquiry.files.length})` },
            { key: 'offers', label: `Oferty (${linkedOffers.length})` },
          ].map((item) => (
            <button
              key={item.key}
              className={cn(
                '-mb-px border-b-2 px-4 py-3 text-xs font-semibold transition-colors',
                tab === item.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-[#33251D]',
              )}
              type="button"
              onClick={() => setTab(item.key as typeof tab)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === 'inquiry' ? (
            <div className="space-y-5 p-6 duration-200 animate-in fade-in-0 slide-in-from-bottom-2">
              <section className="grid gap-3 md:grid-cols-2">
                {[
                  ['Klient', customerName],
                  ['E-mail', customerEmail],
                  ['Źródło', inquiry.source],
                  ['Termin odpowiedzi', formatDate(inquiry.responseDueAt)],
                  ['Termin realizacji', formatDate(inquiry.realizationDueAt)],
                  ['Termin odbioru', formatDate(inquiry.pickupDueAt)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-[#EADBCD] bg-[#FFFDF9] p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#33251D]">
                      {value}
                    </p>
                  </div>
                ))}
              </section>

              <section>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Opis zapytania
                </p>
                <div className="rounded-xl border border-[#EADBCD] bg-[#FFFDF9] p-4 text-sm leading-relaxed text-[#33251D]">
                  <div className="mb-3 flex items-center gap-2 border-b border-[#EADBCD] pb-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {initials(customerName)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#33251D]">
                        {customerName}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {customerEmail} · {formatDate(inquiry.createdAt)}
                      </p>
                    </div>
                  </div>
                  {inquiry.description ? (
                    <p className="whitespace-pre-line">{inquiry.description}</p>
                  ) : (
                    <p className="text-muted-foreground">Brak opisu.</p>
                  )}
                </div>
              </section>

              <section className="rounded-xl border border-[#EADBCD] p-4">
                <h4 className="font-display text-sm font-bold text-[#33251D]">
                  Historia statusów
                </h4>
                <div className="mt-4 space-y-3">
                  {inquiry.statusChanges.map((change) => (
                    <div key={change.id} className="flex items-center gap-3">
                      <span className="size-2 rounded-full bg-primary" />
                      <div>
                        <p className="text-sm font-semibold text-[#33251D]">
                          {change.fromStatus
                            ? statusLabels[change.fromStatus]
                            : '-'}{' '}
                          → {statusLabels[change.toStatus]}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(change.changedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {inquiry.statusChanges.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Brak historii statusów.
                    </p>
                  ) : null}
                </div>
              </section>
            </div>
          ) : null}

          {tab === 'messages' ? (
            <div className="p-6 duration-200 animate-in fade-in-0 slide-in-from-bottom-2">
              <div className="space-y-3">
                {inquiry.messages.map((message) => (
                  <div
                    key={message.id}
                    className="rounded-xl border border-[#EADBCD] bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#33251D]">
                          {message.subject ||
                            directionLabels[message.direction]}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {message.senderEmail || '-'} →{' '}
                          {message.recipientEmail || '-'}
                        </p>
                      </div>
                      <Badge
                        className="bg-slate-100 text-slate-600"
                        label={directionLabels[message.direction]}
                      />
                    </div>
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#33251D]">
                      {message.body}
                    </p>
                    <p className="mt-3 text-[10px] text-muted-foreground">
                      {formatDate(message.sentAt ?? message.createdAt)}
                    </p>
                  </div>
                ))}
                {inquiry.messages.length === 0 ? (
                  <p className="rounded-xl border border-[#EADBCD] p-4 text-sm text-muted-foreground">
                    Brak wiadomości dla tego zapytania.
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {tab === 'files' ? (
            <div className="p-6 duration-200 animate-in fade-in-0 slide-in-from-bottom-2">
              <div className="space-y-3">
                {inquiry.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-start justify-between gap-4 rounded-xl border border-[#EADBCD] bg-white p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#33251D]">
                        {file.originalName}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                        {file.category || file.source} ·{' '}
                        {(file.sizeBytes / 1024).toLocaleString('pl-PL', {
                          maximumFractionDigits: 1,
                        })}{' '}
                        KB · {formatDate(file.createdAt)}
                      </p>
                      {file.description ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {file.description}
                        </p>
                      ) : null}
                    </div>
                    <a
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#EADBCD] px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-[#FAF5ED] hover:text-[#33251D]"
                      href={downloadHref(file.downloadUrl)}
                    >
                      <Download className="size-3" />
                      Pobierz
                    </a>
                  </div>
                ))}
                {inquiry.files.length === 0 ? (
                  <p className="rounded-xl border border-[#EADBCD] p-4 text-sm text-muted-foreground">
                    Brak plików dla tego zapytania.
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {tab === 'offers' ? (
            <div className="p-6 duration-200 animate-in fade-in-0 slide-in-from-bottom-2">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-sm font-bold text-[#33251D]">
                    Oferty powiązane z zapytaniem
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Numery, statusy, wartości i pozycje ofert.
                  </p>
                </div>
                <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary/90">
                  <Plus className="size-3" />
                  Nowa oferta
                </button>
              </div>
              {offers.isLoading ? (
                <div className="flex min-h-40 items-center justify-center">
                  <Spinner />
                </div>
              ) : (
                <div className="space-y-3">
                  {linkedOffers.map((offer) => (
                    <OfferCard key={offer.id} offer={offer} />
                  ))}
                  {linkedOffers.length === 0 ? (
                    <p className="rounded-xl border border-[#EADBCD] p-4 text-sm text-muted-foreground">
                      Brak ofert powiązanych z tym zapytaniem.
                    </p>
                  ) : null}
                </div>
              )}
              <div className="mt-6 rounded-xl border border-[#EADBCD] p-4">
                <h4 className="font-display text-sm font-bold text-[#33251D]">
                  Notatki wewnętrzne
                </h4>
                <div className="mt-4 space-y-3">
                  {inquiry.notes.map((note) => (
                    <div
                      key={note.id}
                      className="border-b pb-3 last:border-b-0"
                    >
                      <p className="whitespace-pre-line text-sm text-[#33251D]">
                        {note.body}
                      </p>
                      <p className="mt-2 text-[10px] text-muted-foreground">
                        {note.author?.name || 'Zespół'} ·{' '}
                        {formatDate(note.createdAt)}
                      </p>
                    </div>
                  ))}
                  {inquiry.notes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Brak notatek wewnętrznych.
                    </p>
                  ) : null}
                </div>
                <Form
                  schema={inquiryNoteSchema}
                  options={{ defaultValues: { body: '' } }}
                  onSubmit={(values) => {
                    addNote.mutate({ inquiryId: inquiry.id, data: values });
                  }}
                  className="mt-5 space-y-3"
                >
                  {({ register, formState }) => (
                    <>
                      <Textarea
                        label="Nowa notatka wewnętrzna"
                        className="min-h-28 border-[#EADBCD] bg-[#FAF5ED] text-[#33251D] focus-visible:ring-primary/20"
                        error={formState.errors['body']}
                        registration={register('body')}
                      />
                      <Button isLoading={addNote.isPending} type="submit">
                        Dodaj notatkę
                      </Button>
                    </>
                  )}
                </Form>
              </div>
            </div>
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

const directionLabels = {
  inbound: 'Przychodząca',
  outbound: 'Wychodząca',
  internal: 'Wewnętrzna',
};

const offerStatusLabels = {
  draft: 'Szkic',
  sent: 'Wysłana',
  accepted: 'Zaakceptowana',
  rejected: 'Odrzucona',
};

const OfferCard = ({ offer }: { offer: Offer }) => (
  <div
    className={cn(
      'overflow-hidden rounded-xl border',
      offer.status === 'draft' ? 'border-primary/20' : 'border-[#EADBCD]',
    )}
  >
    <div
      className={cn(
        'flex items-center justify-between gap-4 px-4 py-3',
        offer.status === 'draft' ? 'bg-primary/5' : 'bg-[#FFFDF9]',
      )}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-lg',
            offer.status === 'draft'
              ? 'bg-primary text-white'
              : 'bg-blue-100 text-blue-700',
          )}
        >
          <UserCheck className="size-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#33251D]">
              {offer.number}
            </span>
            <span className="rounded bg-[#F3E7DA] px-1.5 py-0.5 text-[10px] font-bold text-primary">
              {offer.currency}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            przez {offer.owner?.name ?? 'Nieprzypisane'} · ważna do{' '}
            {formatDate(offer.validUntil)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge
          className={
            offer.status === 'accepted'
              ? 'bg-green-100 text-green-700'
              : offer.status === 'sent'
                ? 'bg-purple-100 text-purple-700'
                : offer.status === 'rejected'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600'
          }
          label={offerStatusLabels[offer.status]}
        />
        <span className="text-sm font-bold text-[#33251D]">
          {formatMoney(offer.totalGrossCents)}
        </span>
      </div>
    </div>
    <div className="bg-white px-4 py-3">
      <p className="mb-3 text-xs text-muted-foreground">
        {offer.notes || offer.terms || 'Oferta powiązana z zapytaniem.'}
      </p>
      <div className="mb-3 overflow-hidden rounded-lg border border-[#EADBCD] bg-[#FFFDF9]">
        <table className="w-full text-xs">
          <tbody className="divide-y divide-[#EADBCD]">
            {offer.items.slice(0, 3).map((item) => (
              <tr key={item.id}>
                <td className="px-3 py-1.5 text-muted-foreground">
                  {item.name}
                </td>
                <td className="whitespace-nowrap px-3 py-1.5 text-right font-mono font-semibold text-[#33251D]">
                  {formatMoney(item.grossCents)}
                </td>
              </tr>
            ))}
            <tr className="bg-[#FAF5ED]">
              <td className="px-3 py-1.5 text-[10px] italic text-muted-foreground">
                {offer.items.length > 3
                  ? `+ ${offer.items.length - 3} kolejne pozycje`
                  : 'Razem'}
              </td>
              <td className="px-3 py-1.5 text-right font-mono font-bold text-[#33251D]">
                {formatMoney(offer.totalGrossCents)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary/90">
          <FileText className="size-3" />
          Edytuj ofertę
        </button>
        {offer.status === 'draft' ? (
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-primary px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/5">
            <FileText className="size-3" />
            Wyślij do klienta
          </button>
        ) : null}
        <button className="inline-flex items-center gap-1.5 rounded-lg border border-[#EADBCD] px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-[#FAF5ED]">
          <Download className="size-3" />
          PDF
        </button>
        <button className="ml-auto p-1.5 text-muted-foreground transition hover:text-[#33251D]">
          <MoreHorizontal className="size-4" />
        </button>
      </div>
    </div>
  </div>
);

const Badge = ({ label, className }: { label: string; className: string }) => (
  <span
    className={cn(
      'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium',
      className,
    )}
  >
    {label}
  </span>
);

const initials = (value: string) =>
  value
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const StatusLabel = ({ status }: { status: InquiryStatus }) => (
  <span
    className={cn(
      'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium',
      statusClasses[status],
    )}
  >
    {statusLabels[status]}
  </span>
);

const PriorityLabel = ({ priority }: { priority: InquiryPriority }) => (
  <span
    className={cn(
      'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium',
      priorityClasses[priority],
    )}
  >
    {priorityLabels[priority]}
  </span>
);
