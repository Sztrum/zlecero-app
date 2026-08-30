import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { SearchBox } from '@/components/ui/search-box';
import { paths } from '@/config/paths';
import { OfferForm } from '@/features/offers/components/offer-form';
import { OffersList } from '@/features/offers/components/offers-list';
import { Offer, OfferStatus } from '@/types/api';
import { cn } from '@/utils/cn';

const statusFilters: { label: string; value?: OfferStatus }[] = [
  { label: 'Wszystkie' },
  { label: 'Szkice', value: 'draft' },
  { label: 'Wysłane', value: 'sent' },
  { label: 'Zaakceptowane', value: 'accepted' },
  { label: 'Odrzucone', value: 'rejected' },
];

export const AppOffersRoute = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [status, setStatus] = useState<OfferStatus | undefined>(undefined);
  const [query, setQuery] = useState('');

  return (
    <div className="w-full space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[#33251D]">
            Twórz, wysyłaj i śledź każdą ofertę od szkicu.
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Wartość, terminy ważności i konwersja liczone z realnych ofert.
          </p>
        </div>
        <div className="hidden sm:block">
          <Button onClick={() => setIsCreating(true)}>Nowa oferta</Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchBox
          className="lg:w-80"
          value={query}
          placeholder="Szukaj ofert, klientów..."
          onChange={setQuery}
        />
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

      <OffersList status={status} query={query} />

      <Drawer open={isCreating} onOpenChange={setIsCreating}>
        <DrawerContent
          side="right"
          className="flex h-full w-[min(96vw,96rem)] max-w-none flex-col overflow-hidden border-[#EADBCD] bg-[#FAF5ED] p-0 sm:max-w-none"
        >
          <DrawerHeader className="border-b border-[#EADBCD] bg-white px-6 py-5 pr-14 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Nowa oferta
            </p>
            <DrawerTitle className="font-display text-xl font-extrabold text-[#33251D]">
              Wyceń zapytanie i przygotuj ofertę do wysyłki.
            </DrawerTitle>
            <DrawerDescription className="max-w-3xl">
              Wybierz zapytanie, dodaj pozycje i warunki handlowe. Po zapisaniu
              przejdziesz do edytora oferty z generowaniem PDF.
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto p-5">
            <OfferForm
              onSaved={(offer: Offer) => {
                setIsCreating(false);
                navigate(paths.app.offerDetail.getHref(offer.id));
              }}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default AppOffersRoute;
