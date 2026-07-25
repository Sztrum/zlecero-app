import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { ApiResponse, Order } from '@/types/api';

export const ordersQueryKey = ['orders'];

export const getOrders = async (): Promise<Order[]> => {
  const response = await api.get<unknown, ApiResponse<{ orders: Order[] }>>(
    '/orders',
  );

  return response.data.orders;
};

export const getOrder = async (orderId: string): Promise<Order> => {
  const response = await api.get<unknown, ApiResponse<Order>>(
    `/orders/${orderId}`,
  );

  return response.data;
};

export const useOrders = () =>
  useQuery({
    queryKey: ordersQueryKey,
    queryFn: getOrders,
  });

export const useOrder = (orderId: string) =>
  useQuery({
    queryKey: [...ordersQueryKey, orderId],
    queryFn: () => getOrder(orderId),
  });
