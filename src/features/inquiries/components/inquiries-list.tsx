import {
  Clock,
  Download,
  Eye,
  FileText,
  Layers,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';

import { Spinner } from '@/components/ui/spinner';
import { Inquiry, InquiryPriority, InquiryStatus } from '@/types/api';
import { cn } from '@/utils/cn';

import { InquiryFilters, useInquiries } from '../api/inquiries';

type InquiriesListProps = {
  filters?: InquiryFilters;
  query?: string;
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

export const InquiriesList = ({
  filters = {},
  query = '',
}: InquiriesListProps) => {
  const inquiries = useInquiries(filters);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
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
                  onSelect={setSelectedInquiry}
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
          onClose={() => setSelectedInquiry(null)}
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
  onClose,
}: {
  inquiry: Inquiry;
  onClose: () => void;
}) => {
  const [tab, setTab] = useState<'inquiry' | 'offers' | 'history' | 'note'>(
    'inquiry',
  );
  const [note, setNote] = useState('');
  const [replyText, setReplyText] = useState('');

  const customerName = inquiry.customer?.displayName ?? 'Klient';
  const customerEmail = inquiry.customer?.email ?? 'kontakt@firma.pl';
  const ownerName = inquiry.owner?.name ?? 'Nieprzypisane';
  const linkedOffers = buildLinkedOffers(inquiry);
  const timeline = buildTimeline(inquiry, customerName, ownerName);

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <button
        aria-label="Zamknij szczegóły zapytania"
        className="absolute inset-0 bg-black/30"
        type="button"
        onClick={onClose}
      />
      <aside className="relative flex size-full max-w-4xl flex-col bg-white shadow-2xl">
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
            { key: 'offers', label: `Oferty (${linkedOffers.length})` },
            { key: 'history', label: 'Historia' },
            { key: 'note', label: 'Notatka' },
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
            <div className="space-y-5 p-6">
              <section className="rounded-xl border border-primary/15 bg-primary/5 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wide text-primary">
                    Podsumowanie AI
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-[#33251D]">
                  Klient prosi o obsługę sprawy: {inquiry.title}. AI wykrywa
                  status {statusLabels[inquiry.status].toLowerCase()}, priorytet{' '}
                  {priorityLabels[inquiry.priority].toLowerCase()} i sugeruje
                  przygotowanie odpowiedzi oraz szkicu oferty na bazie
                  dotychczasowego cennika.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge
                    className="bg-orange-100 text-orange-700"
                    label="Do weryfikacji"
                  />
                  <Badge
                    className="bg-blue-100 text-blue-700"
                    label={inquiry.source}
                  />
                  <Badge
                    className="bg-purple-100 text-purple-700"
                    label="Oferta AI"
                  />
                </div>
              </section>

              <section>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Wiadomość klienta
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
                    <p>
                      Dzień dobry, proszę o przygotowanie oferty dla sprawy:
                      {` ${inquiry.title}`}. Zależy nam na szybkim terminie
                      odpowiedzi i jasnym harmonogramie dalszych kroków.
                    </p>
                  )}
                </div>
              </section>

              <section className="overflow-hidden rounded-xl border border-primary/20">
                <div className="flex items-center justify-between border-b border-primary/15 bg-primary/5 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded bg-primary text-white">
                      <Sparkles className="size-3" />
                    </span>
                    <span className="text-xs font-bold text-primary">
                      AI przygotował szkic odpowiedzi - sprawdź przed wysłaniem
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] font-semibold text-green-600">
                      Gotowy
                    </span>
                  </div>
                </div>
                <div className="bg-white px-4 py-3">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Szkic AI · możesz edytować
                  </p>
                  <textarea
                    className="w-full resize-none bg-transparent text-sm leading-relaxed text-[#33251D] outline-none"
                    rows={9}
                    value={
                      replyText ||
                      `Dzień dobry,\n\nDziękujemy za przesłane zapytanie: ${inquiry.title}.\n\nPrzygotujemy szczegółową ofertę wraz z zakresem, harmonogramem i warunkami realizacji. W pierwszym kroku zweryfikujemy komplet danych oraz zaproponujemy wariant bazowy i rozszerzony.\n\nW razie potrzeby wrócimy z pytaniami doprecyzowującymi.\n\nZ poważaniem,\n${ownerName}`
                    }
                    onChange={(event) => setReplyText(event.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between border-t border-[#EADBCD] bg-[#FFFDF9] px-4 py-2.5">
                  <div className="flex gap-2">
                    <button className="inline-flex items-center gap-1 rounded-lg border border-[#EADBCD] bg-white px-2.5 py-1.5 text-xs text-muted-foreground transition hover:text-[#33251D]">
                      <RefreshCw className="size-3" />
                      Regeneruj
                    </button>
                    <button className="inline-flex items-center gap-1 rounded-lg border border-[#EADBCD] bg-white px-2.5 py-1.5 text-xs text-muted-foreground transition hover:text-[#33251D]">
                      <Layers className="size-3" />
                      Zmień ton
                    </button>
                  </div>
                  <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-primary/90">
                    <Send className="size-3" />
                    Wyślij odpowiedź
                  </button>
                </div>
              </section>
            </div>
          ) : null}

          {tab === 'offers' ? (
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-sm font-bold text-[#33251D]">
                    Oferty powiązane z zapytaniem
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Kliknij edycję, aby dopracować pozycje i wysłać ofertę.
                  </p>
                </div>
                <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary/90">
                  <Plus className="size-3" />
                  Nowa oferta
                </button>
              </div>
              <div className="space-y-3">
                {linkedOffers.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} />
                ))}
              </div>
              <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#EADBCD] py-3 text-xs font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-primary">
                <Plus className="size-3" />
                Utwórz kolejną wersję oferty
              </button>
            </div>
          ) : null}

          {tab === 'history' ? (
            <div className="p-6">
              <div className="relative space-y-0">
                <div className="absolute inset-y-2 left-[9px] w-px bg-[#EADBCD]" />
                {timeline.map((item) => (
                  <div
                    key={`${item.time}-${item.text}`}
                    className="relative flex gap-3 pb-5"
                  >
                    <div
                      className={cn(
                        'z-10 mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full',
                        item.type === 'ai'
                          ? 'bg-primary'
                          : item.type === 'client'
                            ? 'bg-green-500'
                            : item.type === 'user'
                              ? 'bg-blue-500'
                              : 'bg-[#EADBCD]',
                      )}
                    >
                      {item.type === 'ai' ? (
                        <Sparkles className="size-2.5 text-white" />
                      ) : item.type === 'client' ? (
                        <Users className="size-2.5 text-white" />
                      ) : item.type === 'user' ? (
                        <UserCheck className="size-2.5 text-white" />
                      ) : (
                        <Clock className="size-2.5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#33251D]">
                        {item.actor}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.text}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {tab === 'note' ? (
            <div className="p-6">
              <p className="mb-3 text-xs text-muted-foreground">
                Notatka wewnętrzna - niewidoczna dla klienta.
              </p>
              <textarea
                className="w-full resize-none rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-[#33251D] outline-none transition focus:border-yellow-400"
                placeholder="Dodaj notatkę dla zespołu..."
                rows={8}
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
              <div className="mt-2 flex justify-end">
                <button className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary/90">
                  Zapisz notatkę
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
};

type OfferPreview = {
  id: string;
  version: string;
  author: string;
  status: 'Szkic' | 'Wysłana' | 'Zaakceptowana';
  amount: string;
  validUntil: string;
};

const OfferCard = ({ offer }: { offer: OfferPreview }) => (
  <div
    className={cn(
      'overflow-hidden rounded-xl border',
      offer.author === 'AI Asystent' ? 'border-primary/20' : 'border-[#EADBCD]',
    )}
  >
    <div
      className={cn(
        'flex items-center justify-between gap-4 px-4 py-3',
        offer.author === 'AI Asystent' ? 'bg-primary/5' : 'bg-[#FFFDF9]',
      )}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-lg',
            offer.author === 'AI Asystent'
              ? 'bg-primary text-white'
              : 'bg-blue-100 text-blue-700',
          )}
        >
          {offer.author === 'AI Asystent' ? (
            <Sparkles className="size-4" />
          ) : (
            <UserCheck className="size-4" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#33251D]">
              {offer.id}
            </span>
            <span className="rounded bg-[#F3E7DA] px-1.5 py-0.5 text-[10px] font-bold text-primary">
              {offer.version}
            </span>
            {offer.author === 'AI Asystent' ? (
              <span className="text-[10px] font-semibold text-primary">
                Szkic AI
              </span>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">
            przez {offer.author} · ważna do {offer.validUntil}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge
          className={
            offer.status === 'Zaakceptowana'
              ? 'bg-green-100 text-green-700'
              : offer.status === 'Wysłana'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-600'
          }
          label={offer.status}
        />
        <span className="text-sm font-bold text-[#33251D]">{offer.amount}</span>
      </div>
    </div>
    <div className="bg-white px-4 py-3">
      <p className="mb-3 text-xs text-muted-foreground">
        Oferta wygenerowana z zapytania i aktualnego cennika.
      </p>
      <div className="mb-3 overflow-hidden rounded-lg border border-[#EADBCD] bg-[#FFFDF9]">
        <table className="w-full text-xs">
          <tbody className="divide-y divide-[#EADBCD]">
            {[
              ['Analiza i projekt zakresu', '2 500 zl'],
              ['Przygotowanie oferty i harmonogramu', '3 200 zl'],
              ['Wsparcie wdrożeniowe', '1 400 zl'],
            ].map(([name, amount]) => (
              <tr key={name}>
                <td className="px-3 py-1.5 text-muted-foreground">{name}</td>
                <td className="whitespace-nowrap px-3 py-1.5 text-right font-mono font-semibold text-[#33251D]">
                  {amount}
                </td>
              </tr>
            ))}
            <tr className="bg-[#FAF5ED]">
              <td className="px-3 py-1.5 text-[10px] italic text-muted-foreground">
                + kolejne pozycje w edytorze
              </td>
              <td className="px-3 py-1.5 text-right font-mono font-bold text-[#33251D]">
                {offer.amount}
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
        {offer.status === 'Szkic' ? (
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-primary px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/5">
            <Send className="size-3" />
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

const buildLinkedOffers = (inquiry: Inquiry): OfferPreview[] => {
  const base = [
    {
      id: `OF-${inquiry.id.slice(-6)}`,
      version: 'v2',
      author: inquiry.owner?.name ?? 'A. Nowak',
      status: inquiry.status === 'accepted' ? 'Zaakceptowana' : 'Wysłana',
      amount: '12 400 zl',
      validUntil: formatDate(inquiry.responseDueAt),
    },
    {
      id: `OF-${inquiry.id.slice(-6)}A`,
      version: 'v1',
      author: 'AI Asystent',
      status: 'Szkic',
      amount: '11 400 zl',
      validUntil: formatDate(inquiry.responseDueAt),
    },
  ] satisfies OfferPreview[];

  return inquiry.status === 'new' || inquiry.status === 'triage'
    ? [base[1]]
    : base;
};

const buildTimeline = (
  inquiry: Inquiry,
  customerName: string,
  ownerName: string,
) => [
  {
    time: formatDate(inquiry.createdAt),
    actor: 'System',
    text: 'Zapytanie zarejestrowane, AI wygenerowało podsumowanie',
    type: 'system',
  },
  {
    time: formatDate(inquiry.createdAt),
    actor: 'AI Asystent',
    text: 'Automatycznie przygotowano szkic odpowiedzi i propozycję oferty',
    type: 'ai',
  },
  {
    time: formatDate(inquiry.updatedAt),
    actor: ownerName,
    text: `Przejął zapytanie i ustawił priorytet ${priorityLabels[inquiry.priority]}`,
    type: 'user',
  },
  {
    time: formatDate(inquiry.responseDueAt),
    actor: customerName,
    text: 'Oczekuje na odpowiedź zespołu lub decyzję dotyczącą oferty',
    type: 'client',
  },
];

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

const formatDate = (value: number | string | null) => {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
};
