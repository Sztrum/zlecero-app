import { Link, useParams } from 'react-router';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { paths } from '@/config/paths';
import { useOffer } from '@/features/offers/api/offers';
import { OfferDetail } from '@/features/offers/components/offer-detail';
import { offerStatusLabels } from '@/features/offers/components/offers-list';

export const AppOfferDetailRoute = () => {
  const { offerId } = useParams();
  const offer = useOffer(offerId || '');

  if (!offerId) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        Nieprawidłowy adres oferty.
      </div>
    );
  }

  if (offer.isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-[#EADBCD] bg-white">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!offer.data) {
    return (
      <div className="rounded-xl border border-[#EADBCD] bg-white p-5 text-sm text-muted-foreground">
        Nie znaleziono oferty.
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[#33251D]">
            {offer.data.number}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge
              label={offerStatusLabels[offer.data.status]}
              className="bg-[#FAF5ED] text-[#33251D]"
            />
            <span className="text-sm text-muted-foreground">
              {offer.data.customer?.displayName || 'Brak klienta'}
            </span>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link to={paths.app.offers.getHref()}>Wróć do ofert</Link>
        </Button>
      </div>
      <OfferDetail offer={offer.data} />
    </div>
  );
};

export default AppOfferDetailRoute;
