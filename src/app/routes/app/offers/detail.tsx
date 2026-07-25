import { Link, useParams } from 'react-router';

import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';
import { useOffer } from '@/features/offers/api/offers';
import { OfferDetail } from '@/features/offers/components/offer-detail';

export const AppOfferDetailRoute = () => {
  const { offerId } = useParams();
  const offer = useOffer(offerId || '');

  if (!offerId) {
    return <div className="text-sm text-red-600">Offer route is invalid.</div>;
  }

  if (offer.isLoading) {
    return <div className="text-sm text-gray-500">Loading offer...</div>;
  }

  if (!offer.data) {
    return <div className="text-sm text-gray-500">Offer not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {offer.data.number}
          </h1>
          <p className="text-sm text-gray-500">{offer.data.status}</p>
        </div>
        <Button asChild variant="outline">
          <Link to={paths.app.offers.getHref()}>Back to Offers</Link>
        </Button>
      </div>
      <OfferDetail offer={offer.data} />
    </div>
  );
};

export default AppOfferDetailRoute;
