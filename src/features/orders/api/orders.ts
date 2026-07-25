import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { ApiResponse, Order, OrderStatus } from '@/types/api';

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

export const changeOrderStatus = async ({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}): Promise<Order> => {
  const response = await api.patch<unknown, ApiResponse<Order>>(
    `/orders/${orderId}/status`,
    { status },
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

export const useChangeOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeOrderStatus,
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ordersQueryKey });
      queryClient.setQueryData([...ordersQueryKey, order.id], order);
    },
  });
};
