import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { ApiResponse, Offer } from '@/types/api';

export const offersQueryKey = ['offers'];
export const ordersQueryKey = ['orders'];

export const offerItemSchema = z.object({
  name: z.string().min(1, 'Required'),
  description: z.string().optional(),
  quantity: z.string().min(1, 'Required'),
  unit: z.string().min(1, 'Required'),
  unitPriceCents: z.coerce.number().int().min(0),
  taxRate: z.string().min(1, 'Required'),
});

export const offerSchema = z.object({
  inquiryId: z.string().min(1, 'Required'),
  number: z.string().optional(),
  currency: z.string().length(3, 'Use ISO code'),
  issueDate: z.string().min(1, 'Required'),
  validUntil: z.string().min(1, 'Required'),
  paymentDueDays: z.coerce.number().int().min(0).max(365),
  deliveryCostCents: z.coerce.number().int().min(0).optional(),
  discountType: z.enum(['percent', 'amount']).optional().or(z.literal('')),
  discountValue: z.string().optional(),
  depositPercent: z.string().optional(),
  terms: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(offerItemSchema).min(1),
});

export type OfferInput = z.infer<typeof offerSchema>;

const toOfferPayload = (data: OfferInput) => ({
  inquiry_id: data.inquiryId,
  number: data.number || null,
  currency: data.currency,
  issue_date: data.issueDate,
  valid_until: data.validUntil,
  payment_due_days: data.paymentDueDays,
  delivery_cost_cents: data.deliveryCostCents || 0,
  discount_type: data.discountType || null,
  discount_value: data.discountValue || '0',
  deposit_percent: data.depositPercent || '0',
  terms: data.terms || null,
  notes: data.notes || null,
  items: data.items.map((item) => ({
    name: item.name,
    description: item.description || null,
    quantity: item.quantity,
    unit: item.unit,
    unit_price_cents: item.unitPriceCents,
    tax_rate: item.taxRate,
  })),
});

export const getOffers = async (): Promise<Offer[]> => {
  const response = await api.get<unknown, ApiResponse<{ offers: Offer[] }>>(
    '/offers',
  );

  return response.data.offers;
};

export const getOffer = async (offerId: string): Promise<Offer> => {
  const response = await api.get<unknown, ApiResponse<Offer>>(
    `/offers/${offerId}`,
  );

  return response.data;
};

export const createOffer = async (data: OfferInput): Promise<Offer> => {
  const response = await api.post<unknown, ApiResponse<Offer>>(
    '/offers',
    toOfferPayload(data),
  );

  return response.data;
};

export const updateOffer = async ({
  offerId,
  data,
}: {
  offerId: string;
  data: OfferInput;
}): Promise<Offer> => {
  const response = await api.patch<unknown, ApiResponse<Offer>>(
    `/offers/${offerId}`,
    toOfferPayload(data),
  );

  return response.data;
};

export const sendOffer = async (offerId: string): Promise<Offer> => {
  const response = await api.patch<unknown, ApiResponse<Offer>>(
    `/offers/${offerId}/send`,
  );

  return response.data;
};

export const generateOfferPdf = async (offerId: string): Promise<Offer> => {
  const response = await api.post<unknown, ApiResponse<Offer>>(
    `/offers/${offerId}/pdf`,
  );

  return response.data;
};

export const acceptOffer = async (offerId: string): Promise<Offer> => {
  const response = await api.post<unknown, ApiResponse<Offer>>(
    `/offers/${offerId}/accept`,
  );

  return response.data;
};

export const useOffers = () =>
  useQuery({
    queryKey: offersQueryKey,
    queryFn: getOffers,
  });

export const useOffer = (offerId: string) =>
  useQuery({
    queryKey: [...offersQueryKey, offerId],
    queryFn: () => getOffer(offerId),
  });

const useOfferMutation = <TVariables>(
  mutationFn: (variables: TVariables) => Promise<Offer>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (offer) => {
      queryClient.setQueryData([...offersQueryKey, offer.id], offer);
      void queryClient.invalidateQueries({ queryKey: offersQueryKey });
      void queryClient.invalidateQueries({ queryKey: ordersQueryKey });
    },
  });
};

export const useCreateOffer = () => useOfferMutation(createOffer);
export const useUpdateOffer = () => useOfferMutation(updateOffer);
export const useSendOffer = () => useOfferMutation(sendOffer);
export const useGenerateOfferPdf = () => useOfferMutation(generateOfferPdf);
export const useAcceptOffer = () => useOfferMutation(acceptOffer);
