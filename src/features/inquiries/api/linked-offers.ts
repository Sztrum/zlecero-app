import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { ApiResponse, Offer } from '@/types/api';

const inquiryOffersQueryKey = ['inquiries', 'linked-offers'];

const getInquiryOffers = async (inquiryId: string): Promise<Offer[]> => {
  const response = await api.get<unknown, ApiResponse<{ offers: Offer[] }>>(
    '/offers',
  );

  return response.data.offers.filter((offer) => offer.inquiryId === inquiryId);
};

export const useInquiryOffers = (inquiryId: string) =>
  useQuery({
    queryKey: [...inquiryOffersQueryKey, inquiryId],
    queryFn: () => getInquiryOffers(inquiryId),
  });
