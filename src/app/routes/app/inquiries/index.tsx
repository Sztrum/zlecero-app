import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { InquiriesList } from '@/features/inquiries/components/inquiries-list';
import { InquiryForm } from '@/features/inquiries/components/inquiry-form';
import { InquiryStatus } from '@/types/api';
import { cn } from '@/utils/cn';

const statusFilters: { label: string; value?: InquiryStatus }[] = [
  { label: 'Wszystkie' },
  { label: 'Nowe', value: 'new' },
  { label: 'W toku', value: 'triage' },
  { label: 'Oczekuje', value: 'waiting_for_customer' },
  { label: 'Wysłano ofertę', value: 'offer_sent' },
  { label: 'Zaakceptowano', value: 'accepted' },
];

export const AppInquiriesRoute = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [status, setStatus] = useState<InquiryStatus | undefined>();
  const [query, setQuery] = useState('');

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[#33251D]">
            Zarządzaj wszystkimi zapytaniami w jednym miejscu.
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Aktywne sprawy, statusy, priorytety i opiekunowie zespołu.
          </p>
        </div>
        <div className="hidden sm:block">
          <Button onClick={() => setIsCreating((value) => !value)}>
            {isCreating ? 'Wróć do listy' : 'Nowe zapytanie'}
          </Button>
        </div>
      </div>

      {isCreating ? (
        <div className="rounded-xl border border-[#EADBCD] bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-display text-sm font-bold text-[#33251D]">
            Nowe zapytanie
          </h2>
          <InquiryForm onSaved={() => setIsCreating(false)} />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="flex min-w-0 items-center gap-2 rounded-lg border border-[#EADBCD] bg-white px-3 py-2 lg:w-80">
              <span className="sr-only">Szukaj zapytań</span>
              <input
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Szukaj zapytań, klientów..."
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((filter) => (
                <button
                  key={filter.label}
                  aria-pressed={status === filter.value}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                    status === filter.value
                      ? 'bg-primary text-white shadow-sm'
                      : 'border border-[#EADBCD] bg-white text-muted-foreground hover:bg-[#FAF5ED] hover:text-[#33251D]',
                  )}
                  type="button"
                  onClick={() => setStatus(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          <InquiriesList filters={{ status }} query={query} />
        </>
      )}
    </div>
  );
};

export default AppInquiriesRoute;
