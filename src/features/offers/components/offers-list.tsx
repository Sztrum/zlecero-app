import { Link } from 'react-router';

import { paths } from '@/config/paths';
import { Offer } from '@/types/api';
import { formatMoney } from '@/utils/format-money';

import { useOffers } from '../api/offers';

export const OffersList = () => {
  const offers = useOffers();

  return (
    <div className="overflow-hidden border bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-3">Offer</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Valid Until</th>
            <th className="px-4 py-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {offers.data?.map((offer) => (
            <OfferRow key={offer.id} offer={offer} />
          ))}
          {offers.data?.length === 0 && (
            <tr>
              <td className="px-4 py-8 text-center text-gray-500" colSpan={5}>
                No offers found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const OfferRow = ({ offer }: { offer: Offer }) => (
  <tr className="hover:bg-gray-50">
    <td className="px-4 py-3">
      <Link
        to={paths.app.offerDetail.getHref(offer.id)}
        className="font-medium text-gray-900 hover:underline"
      >
        {offer.number}
      </Link>
    </td>
    <td className="px-4 py-3 text-gray-600">
      {offer.customer?.displayName || '-'}
    </td>
    <td className="px-4 py-3 text-gray-600">{offer.status}</td>
    <td className="px-4 py-3 text-gray-600">{offer.validUntil}</td>
    <td className="px-4 py-3 text-right font-medium text-gray-900">
      {formatMoney(offer.totalGrossCents, offer.currency)}
    </td>
  </tr>
);
