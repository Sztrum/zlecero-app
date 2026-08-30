import { CheckCircle2, Clock, TrendingUp, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router';

import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { Spinner } from '@/components/ui/spinner';
import { StatCard } from '@/components/ui/stat-card';
import { paths } from '@/config/paths';
import { Offer, OfferStatus } from '@/types/api';
import { formatDate } from '@/utils/format-date';
import { formatMoney } from '@/utils/format-money';

import { useOffers } from '../api/offers';

type OffersListProps = {
  status?: OfferStatus;
  query?: string;
};

export const offerStatusLabels: Record<OfferStatus, string> = {
  draft: 'Szkic',
  sent: 'Wysłana',
  accepted: 'Zaakceptowana',
  rejected: 'Odrzucona',
};

const statusClasses: Record<OfferStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-purple-100 text-purple-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const expiredClasses = 'bg-orange-100 text-orange-700';

const isExpired = (offer: Offer) =>
  offer.status === 'sent' &&
  offer.validUntil < new Date().toISOString().slice(0, 10);

export const OffersList = ({ status, query = '' }: OffersListProps) => {
  const offers = useOffers();
  const navigate = useNavigate();
  const normalizedQuery = query.trim().toLocaleLowerCase('pl-PL');

  const visibleOffers = (offers.data ?? []).filter((offer) => {
    if (status && offer.status !== status) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return [
      offer.number,
      offer.customer?.displayName,
      offer.owner?.name,
      offerStatusLabels[offer.status],
    ]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase('pl-PL')
      .includes(normalizedQuery);
  });

  if (offers.isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-[#EADBCD] bg-white">
        <Spinner size="lg" />
      </div>
    );
  }

  if (offers.isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        Nie udało się pobrać listy ofert.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <OffersSummary offers={offers.data ?? []} />
      <DataTable
        items={visibleOffers}
        getRowKey={(offer) => offer.id}
        empty="Brak ofert dla wybranych filtrów."
        onRowClick={(offer) =>
          navigate(paths.app.offerDetail.getHref(offer.id))
        }
        columns={[
          {
            key: 'number',
            label: 'Nr oferty',
            render: (offer) => (
              <div>
                <p className="font-mono text-xs font-semibold text-primary">
                  {offer.number}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(offer.issueDate)}
                </p>
              </div>
            ),
          },
          {
            key: 'customer',
            label: 'Klient / opiekun',
            render: (offer) => (
              <div className="min-w-[220px]">
                <p className="text-sm font-semibold text-[#33251D]">
                  {offer.customer?.displayName || 'Brak klienta'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {offer.owner?.name || 'Nieprzypisana'}
                </p>
              </div>
            ),
          },
          {
            key: 'amount',
            label: 'Kwota',
            className: 'hidden lg:table-cell',
            render: (offer) => (
              <span className="font-semibold text-[#33251D]">
                {formatMoney(offer.totalGrossCents, offer.currency)}
              </span>
            ),
          },
          {
            key: 'validUntil',
            label: 'Ważna do',
            className: 'hidden md:table-cell',
            render: (offer) => (
              <span className="text-xs text-muted-foreground">
                {formatDate(offer.validUntil)}
              </span>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            render: (offer) =>
              isExpired(offer) ? (
                <Badge label="Wygasła" className={expiredClasses} />
              ) : (
                <Badge
                  label={offerStatusLabels[offer.status]}
                  className={statusClasses[offer.status]}
                />
              ),
          },
        ]}
      />
    </div>
  );
};

const OffersSummary = ({ offers }: { offers: Offer[] }) => {
  const currency = offers[0]?.currency ?? 'PLN';
  const sameCurrency = offers.filter((offer) => offer.currency === currency);

  const sumGross = (items: Offer[]) =>
    items.reduce((total, offer) => total + offer.totalGrossCents, 0);

  const accepted = sameCurrency.filter((offer) => offer.status === 'accepted');
  const pending = sameCurrency.filter((offer) => offer.status === 'sent');
  const decided = offers.filter(
    (offer) => offer.status === 'accepted' || offer.status === 'rejected',
  );
  const conversion = decided.length
    ? Math.round(
        (decided.filter((offer) => offer.status === 'accepted').length /
          decided.length) *
          100,
      )
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={Wallet}
        label="Łączna wartość"
        value={formatMoney(sumGross(sameCurrency), currency)}
        iconColor="bg-primary/10 text-primary"
      />
      <StatCard
        icon={CheckCircle2}
        label="Zaakceptowane"
        value={formatMoney(sumGross(accepted), currency)}
        iconColor="bg-green-50 text-green-600"
        valueColor="text-green-600"
      />
      <StatCard
        icon={Clock}
        label="Oczekujące"
        value={formatMoney(sumGross(pending), currency)}
        iconColor="bg-orange-50 text-orange-600"
        valueColor="text-orange-600"
      />
      <StatCard
        icon={TrendingUp}
        label="Konwersja"
        value={`${conversion}%`}
        sub={`${decided.length} rozstrzygniętych ofert`}
        iconColor="bg-primary/10 text-primary"
        valueColor="text-primary"
      />
    </div>
  );
};
