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
            Generuj PDF
          </Button>
          {offer.pdf && (
            <Button asChild type="button" variant="outline" icon={<Download />}>
              <a href={downloadHref(offer.pdf.downloadUrl)}>Pobierz PDF</a>
            </Button>
          )}
          {offer.status === 'draft' && (
            <Button
              type="button"
              icon={<Send />}
              isLoading={sendOffer.isPending}
              onClick={() => sendOffer.mutate(offer.id)}
            >
              Wyślij ofertę
            </Button>
          )}
          {offer.status === 'sent' && (
            <Button
              type="button"
              icon={<ThumbsUp />}
              isLoading={acceptOffer.isPending}
              onClick={() => acceptOffer.mutate(offer.id)}
            >
              Zarejestruj akceptację
            </Button>
          )}
          {offer.orderId && (
            <Button asChild type="button" variant="outline">
              <Link to={paths.app.orderDetail.getHref(offer.orderId)}>
                Otwórz zlecenie
              </Link>
            </Button>
          )}
        </div>

        <section className="rounded-xl border border-[#EADBCD] bg-white shadow-sm">
          <div className="border-b border-[#EADBCD] px-5 py-4">
            <h2 className="font-display text-sm font-bold text-[#33251D]">
              Edytor oferty
            </h2>
          </div>
          <div className="p-5">
            <OfferForm offer={offer} />
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="rounded-xl border border-[#EADBCD] bg-white shadow-sm">
          <div className="border-b border-[#EADBCD] px-5 py-4">
            <h2 className="font-display text-sm font-bold text-[#33251D]">
              Podsumowanie
            </h2>
          </div>
          <dl className="space-y-3 p-5 text-sm">
            <SummaryLine
              label="Wartość netto"
              value={formatMoney(offer.subtotalNetCents, offer.currency)}
            />
            <SummaryLine
              label="VAT"
              value={formatMoney(offer.taxCents, offer.currency)}
            />
            <SummaryLine
              label="Rabat"
              value={formatMoney(offer.discountCents, offer.currency)}
            />
            <SummaryLine
              label="Dostawa"
              value={formatMoney(offer.deliveryCostCents, offer.currency)}
            />
            <SummaryLine
              label="Wartość brutto"
              value={formatMoney(offer.totalGrossCents, offer.currency)}
              strong
            />
            <SummaryLine
              label="Zaliczka"
              value={formatMoney(offer.depositCents, offer.currency)}
            />
          </dl>
        </section>

        <section className="rounded-xl border border-[#EADBCD] bg-white shadow-sm">
          <div className="border-b border-[#EADBCD] px-5 py-4">
            <h2 className="font-display text-sm font-bold text-[#33251D]">
              Pozycje
            </h2>
          </div>
          <div className="divide-y divide-[#EADBCD]">
            {offer.items.map((item) => (
              <div key={item.id} className="px-5 py-3 text-sm">
                <div className="font-semibold text-[#33251D]">{item.name}</div>
                <div className="text-xs text-muted-foreground">
                  {item.quantity} {item.unit} ·{' '}
                  {formatMoney(item.grossCents, offer.currency)}
                </div>
              </div>
            ))}
            {offer.items.length === 0 ? (
              <p className="px-5 py-6 text-sm text-muted-foreground">
                Oferta nie ma jeszcze pozycji.
              </p>
            ) : null}
          </div>
        </section>
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
    <dt className="text-muted-foreground">{label}</dt>
    <dd
      className={
        strong ? 'font-bold text-[#33251D]' : 'font-medium text-[#33251D]'
      }
    >
      {value}
    </dd>
  </div>
);
