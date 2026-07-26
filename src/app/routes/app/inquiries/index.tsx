import { useState } from 'react';
import { useSearchParams } from 'react-router';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get('status') as InquiryStatus | null;
  const [isCreating, setIsCreating] = useState(false);
  const [status, setStatus] = useState<InquiryStatus | undefined>(
    statusParam ?? undefined,
  );
  const [query, setQuery] = useState('');
  const queue = searchParams.get('queue') as
    | 'new'
    | 'waiting'
    | 'overdue'
    | 'unassigned'
    | 'urgent'
    | null;
  const selectedInquiryId = searchParams.get('inquiry');

  const updateSearch = (values: {
    inquiryId?: string | null;
    queue?: string | null;
  }) => {
    const next = new URLSearchParams(searchParams);

    if (values.inquiryId === null) {
      next.delete('inquiry');
    } else if (values.inquiryId) {
      next.set('inquiry', values.inquiryId);
    }

    if (values.queue === null) {
      next.delete('queue');
    } else if (values.queue) {
      next.set('queue', values.queue);
    }

    setSearchParams(next, { replace: true });
  };

  const closeCreation = () => setIsCreating(false);

  return (
    <div className="w-full space-y-5">
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
          <Button onClick={() => setIsCreating(true)}>Nowe zapytanie</Button>
        </div>
      </div>

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
      <InquiriesList
        filters={{ status, queue: queue ?? undefined }}
        initialInquiryId={selectedInquiryId}
        query={query}
        onSelectedInquiryChange={(inquiryId) =>
          updateSearch({ inquiryId, queue: inquiryId ? null : undefined })
        }
      />
      <Drawer open={isCreating} onOpenChange={setIsCreating}>
        <DrawerContent
          side="right"
          className="flex h-full w-[min(96vw,96rem)] max-w-none flex-col overflow-hidden border-[#EADBCD] bg-[#FAF5ED] p-0 sm:max-w-none"
        >
          <DrawerHeader className="border-b border-[#EADBCD] bg-white px-6 py-5 pr-14 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Nowe zapytanie
            </p>
            <DrawerTitle className="font-display text-xl font-extrabold text-[#33251D]">
              Zarejestruj sprawę klienta i ustaw pierwsze kroki obsługi.
            </DrawerTitle>
            <DrawerDescription className="max-w-3xl">
              Uzupełnij najważniejsze dane, przypisz osobę odpowiedzialną i
              dodaj terminy, które później trafią do kolejek dashboardu.
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto p-5">
            <InquiryForm onCancel={closeCreation} onSaved={closeCreation} />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default AppInquiriesRoute;
