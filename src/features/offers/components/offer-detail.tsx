import { Download, FileText, Send, ThumbsUp } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { env } from '@/config/env';
import { paths } from '@/config/paths';
import { Offer } from '@/types/api';
import { formatMoney } from '@/utils/format-money';

import {
  useAcceptOffer,
  useGenerateOfferPdf,
  useSendOffer,
} from '../api/offers';

import { OfferForm } from './offer-form';

type OfferDetailProps = {
  offer: Offer;
};

const downloadHref = (downloadUrl: string) =>
  new URL(downloadUrl, env.API_URL.replace(/\/api\/v1\/?$/, '')).toString();

export const OfferDetail = ({ offer }: OfferDetailProps) => {
  const sendOffer = useSendOffer();
  const generatePdf = useGenerateOfferPdf();
  const acceptOffer = useAcceptOffer();

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            icon={<FileText />}
            isLoading={generatePdf.isPending}
            onClick={() => generatePdf.mutate(offer.id)}
          >
            Generate PDF
          </Button>
          {offer.pdf && (
            <Button asChild type="button" variant="outline" icon={<Download />}>
              <a href={downloadHref(offer.pdf.downloadUrl)}>Download PDF</a>
            </Button>
          )}
          {offer.status === 'draft' && (
            <Button
              type="button"
              icon={<Send />}
              isLoading={sendOffer.isPending}
              onClick={() => sendOffer.mutate(offer.id)}
            >
              Send Offer
            </Button>
          )}
          {offer.status === 'sent' && (
            <Button
              type="button"
              icon={<ThumbsUp />}
              isLoading={acceptOffer.isPending}
              onClick={() => acceptOffer.mutate(offer.id)}
            >
              Accept Offer
            </Button>
          )}
          {offer.orderId && (
            <Button asChild type="button" variant="outline">
              <Link to={paths.app.orderDetail.getHref(offer.orderId)}>
                Open Order
              </Link>
            </Button>
          )}
        </div>

        <div className="border bg-white p-4">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">
            Offer Editor
          </h2>
          <OfferForm offer={offer} />
        </div>
      </div>

      <div className="space-y-6">
        <div className="border bg-white p-4">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Summary</h2>
          <dl className="space-y-3 text-sm">
            <SummaryLine
              label="Subtotal net"
              value={formatMoney(offer.subtotalNetCents, offer.currency)}
            />
            <SummaryLine
              label="Tax"
              value={formatMoney(offer.taxCents, offer.currency)}
            />
            <SummaryLine
              label="Discount"
              value={formatMoney(offer.discountCents, offer.currency)}
            />
            <SummaryLine
              label="Delivery"
              value={formatMoney(offer.deliveryCostCents, offer.currency)}
            />
            <SummaryLine
              label="Total gross"
              value={formatMoney(offer.totalGrossCents, offer.currency)}
              strong
            />
            <SummaryLine
              label="Deposit"
              value={formatMoney(offer.depositCents, offer.currency)}
            />
          </dl>
        </div>

        <div className="border bg-white p-4">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Items</h2>
          <div className="space-y-3 text-sm">
            {offer.items.map((item) => (
              <div key={item.id} className="border-b pb-3 last:border-b-0">
                <div className="font-medium text-gray-900">{item.name}</div>
                <div className="text-gray-500">
                  {item.quantity} {item.unit} ·{' '}
                  {formatMoney(item.grossCents, offer.currency)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryLine = ({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) => (
  <div className="flex items-center justify-between gap-4">
    <dt className="text-gray-500">{label}</dt>
    <dd className={strong ? 'font-semibold text-gray-900' : 'text-gray-900'}>
      {value}
    </dd>
  </div>
);
