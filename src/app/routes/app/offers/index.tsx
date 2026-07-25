import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';
import { OfferForm } from '@/features/offers/components/offer-form';
import { OffersList } from '@/features/offers/components/offers-list';
import { Offer } from '@/types/api';

export const AppOffersRoute = () => {
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Offers</h1>
          <p className="text-sm text-gray-500">
            Draft, send, and accept offers.
          </p>
        </div>
        <Button onClick={() => setIsCreating((value) => !value)}>
          {isCreating ? 'Back to List' : 'New Offer'}
        </Button>
      </div>

      {isCreating ? (
        <div className="border bg-white p-4">
          <OfferForm
            onSaved={(offer: Offer) => {
              navigate(paths.app.offerDetail.getHref(offer.id));
            }}
          />
        </div>
      ) : (
        <OffersList />
      )}
    </div>
  );
};

export default AppOffersRoute;
