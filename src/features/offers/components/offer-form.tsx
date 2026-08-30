import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/form';
import { useInquiries } from '@/features/inquiries/api/inquiries';
import { Offer } from '@/types/api';

import { OfferInput, useCreateOffer, useUpdateOffer } from '../api/offers';

type OfferFormProps = {
  offer?: Offer;
  onSaved?: (offer: Offer) => void;
};

const today = () => new Date().toISOString().slice(0, 10);

const futureDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const defaultValues = (offer?: Offer): OfferInput => ({
  inquiryId: offer?.inquiryId || '',
  number: offer?.number || '',
  currency: offer?.currency || 'PLN',
  issueDate: offer?.issueDate || today(),
  validUntil: offer?.validUntil || futureDate(14),
  paymentDueDays: offer?.paymentDueDays || 7,
  deliveryCostCents: offer?.deliveryCostCents || 0,
  discountType: offer?.discountType || '',
  discountValue: offer?.discountValue || '0',
  depositPercent: offer?.depositPercent || '0',
  terms: offer?.terms || '',
  notes: offer?.notes || '',
  items: offer?.items.map((item) => ({
    name: item.name,
    description: item.description || '',
    quantity: item.quantity,
    unit: item.unit,
    unitPriceCents: item.unitPriceCents,
    taxRate: item.taxRate,
  })) || [emptyItem()],
});

const emptyItem = () => ({
  name: '',
  description: '',
  quantity: '1',
  unit: 'szt.',
  unitPriceCents: 0,
  taxRate: '23',
});

export const OfferForm = ({ offer, onSaved }: OfferFormProps) => {
  const inquiries = useInquiries();
  const createOffer = useCreateOffer();
  const updateOffer = useUpdateOffer();
  const [values, setValues] = useState<OfferInput>(() => defaultValues(offer));
  const isDraft = !offer || offer.status === 'draft';
  const isSaving = createOffer.isPending || updateOffer.isPending;

  const update = <TKey extends keyof OfferInput>(
    key: TKey,
    value: OfferInput[TKey],
  ) => setValues((current) => ({ ...current, [key]: value }));

  const updateItem = (
    index: number,
    key: keyof OfferInput['items'][number],
    value: string | number,
  ) =>
    setValues((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }));

  const save = () => {
    if (offer) {
      updateOffer.mutate(
        { offerId: offer.id, data: values },
        { onSuccess: onSaved },
      );
      return;
    }

    createOffer.mutate(values, { onSuccess: onSaved });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Select
          label="Zapytanie"
          defaultValue={values.inquiryId}
          registration={{
            name: 'inquiryId',
            onChange: (event) => {
              update('inquiryId', event.target.value);
              return Promise.resolve();
            },
          }}
          options={[
            { label: 'Wybierz zapytanie', value: '' },
            ...(inquiries.data || []).map((inquiry) => ({
              label: inquiry.title,
              value: inquiry.id,
            })),
          ]}
        />
        <Input
          label="Numer"
          value={values.number}
          disabled={!isDraft}
          onChange={(event) => update('number', event.target.value)}
          registration={{ name: 'number' }}
        />
        <Input
          label="Waluta"
          value={values.currency}
          disabled={!isDraft}
          onChange={(event) => update('currency', event.target.value)}
          registration={{ name: 'currency' }}
        />
        <Input
          label="Data wystawienia"
          type="date"
          value={values.issueDate}
          disabled={!isDraft}
          onChange={(event) => update('issueDate', event.target.value)}
          registration={{ name: 'issueDate' }}
        />
        <Input
          label="Ważna do"
          type="date"
          value={values.validUntil}
          disabled={!isDraft}
          onChange={(event) => update('validUntil', event.target.value)}
          registration={{ name: 'validUntil' }}
        />
        <Input
          label="Termin płatności (dni)"
          type="number"
          value={values.paymentDueDays}
          disabled={!isDraft}
          onChange={(event) =>
            update('paymentDueDays', Number(event.target.value))
          }
          registration={{ name: 'paymentDueDays' }}
        />
        <Input
          label="Koszt dostawy (gr)"
          type="number"
          value={values.deliveryCostCents}
          disabled={!isDraft}
          onChange={(event) =>
            update('deliveryCostCents', Number(event.target.value))
          }
          registration={{ name: 'deliveryCostCents' }}
        />
        <Select
          label="Rabat"
          defaultValue={values.discountType}
          registration={{
            name: 'discountType',
            onChange: (event) => {
              update(
                'discountType',
                event.target.value as OfferInput['discountType'],
              );
              return Promise.resolve();
            },
          }}
          options={[
            { label: 'Brak', value: '' },
            { label: 'Procentowy', value: 'percent' },
            { label: 'Kwotowy', value: 'amount' },
          ]}
        />
        <Input
          label="Wartość rabatu"
          value={values.discountValue}
          disabled={!isDraft}
          onChange={(event) => update('discountValue', event.target.value)}
          registration={{ name: 'discountValue' }}
        />
        <Input
          label="Zaliczka (%)"
          value={values.depositPercent}
          disabled={!isDraft}
          onChange={(event) => update('depositPercent', event.target.value)}
          registration={{ name: 'depositPercent' }}
        />
        <div className="md:col-span-3">
          <Textarea
            label="Warunki handlowe"
            value={values.terms}
            disabled={!isDraft}
            onChange={(event) => update('terms', event.target.value)}
            registration={{ name: 'terms' }}
          />
        </div>
        <div className="md:col-span-3">
          <Textarea
            label="Notatki"
            value={values.notes}
            disabled={!isDraft}
            onChange={(event) => update('notes', event.target.value)}
            registration={{ name: 'notes' }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {values.items.map((item, index) => (
          <div
            key={index}
            className="grid gap-3 rounded-xl border border-[#EADBCD] bg-white p-4 md:grid-cols-6"
          >
            <Input
              label="Nazwa"
              value={item.name}
              disabled={!isDraft}
              onChange={(event) =>
                updateItem(index, 'name', event.target.value)
              }
              registration={{ name: `items.${index}.name` }}
            />
            <Input
              label="Ilość"
              value={item.quantity}
              disabled={!isDraft}
              onChange={(event) =>
                updateItem(index, 'quantity', event.target.value)
              }
              registration={{ name: `items.${index}.quantity` }}
            />
            <Input
              label="Jednostka"
              value={item.unit}
              disabled={!isDraft}
              onChange={(event) =>
                updateItem(index, 'unit', event.target.value)
              }
              registration={{ name: `items.${index}.unit` }}
            />
            <Input
              label="Cena jedn. (gr)"
              type="number"
              value={item.unitPriceCents}
              disabled={!isDraft}
              onChange={(event) =>
                updateItem(index, 'unitPriceCents', Number(event.target.value))
              }
              registration={{ name: `items.${index}.unitPriceCents` }}
            />
            <Input
              label="Stawka VAT"
              value={item.taxRate}
              disabled={!isDraft}
              onChange={(event) =>
                updateItem(index, 'taxRate', event.target.value)
              }
              registration={{ name: `items.${index}.taxRate` }}
            />
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                disabled={!isDraft || values.items.length === 1}
                onClick={() =>
                  update(
                    'items',
                    values.items.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
              >
                Usuń
              </Button>
            </div>
            <div className="md:col-span-6">
              <Textarea
                label="Opis"
                value={item.description}
                disabled={!isDraft}
                onChange={(event) =>
                  updateItem(index, 'description', event.target.value)
                }
                registration={{ name: `items.${index}.description` }}
              />
            </div>
          </div>
        ))}
      </div>

      {isDraft && (
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => update('items', [...values.items, emptyItem()])}
          >
            Dodaj pozycję
          </Button>
          <Button type="button" isLoading={isSaving} onClick={save}>
            {offer ? 'Zapisz ofertę' : 'Utwórz ofertę'}
          </Button>
        </div>
      )}
    </div>
  );
};
