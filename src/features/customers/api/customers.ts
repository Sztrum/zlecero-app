import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { ApiResponse, Customer } from '@/types/api';

export const customersQueryKey = ['customers'];

export const customerSchema = z.object({
  type: z.enum(['company', 'individual']),
  displayName: z.string().min(1, 'Required'),
  companyName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  taxNumber: z.string().optional(),
  addressLine: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  countryCode: z.string().min(2, 'Required').max(2, 'Required'),
  notes: z.string().optional(),
});

export type CustomerInput = z.infer<typeof customerSchema>;

const toCustomerPayload = (data: CustomerInput) => ({
  type: data.type,
  display_name: data.displayName,
  company_name: data.companyName || null,
  first_name: data.firstName || null,
  last_name: data.lastName || null,
  email: data.email || null,
  phone: data.phone || null,
  tax_number: data.taxNumber || null,
  address_line: data.addressLine || null,
  postal_code: data.postalCode || null,
  city: data.city || null,
  country_code: data.countryCode,
  notes: data.notes || null,
});

export const getCustomers = async (search?: string): Promise<Customer[]> => {
  const response = await api.get<
    unknown,
    ApiResponse<{ customers: Customer[] }>
  >('/customers', {
    params: search ? { search } : undefined,
  });

  return response.data.customers;
};

export const getCustomer = async (customerId: string): Promise<Customer> => {
  const response = await api.get<unknown, ApiResponse<Customer>>(
    `/customers/${customerId}`,
  );

  return response.data;
};

export const createCustomer = async (
  data: CustomerInput,
): Promise<Customer> => {
  const response = await api.post<unknown, ApiResponse<Customer>>(
    '/customers',
    toCustomerPayload(data),
  );

  return response.data;
};

export const updateCustomer = async ({
  customerId,
  data,
}: {
  customerId: string;
  data: CustomerInput;
}): Promise<Customer> => {
  const response = await api.patch<unknown, ApiResponse<Customer>>(
    `/customers/${customerId}`,
    toCustomerPayload(data),
  );

  return response.data;
};

export const useCustomers = (search?: string) =>
  useQuery({
    queryKey: [...customersQueryKey, search || ''],
    queryFn: () => getCustomers(search),
  });

export const useCustomer = (customerId: string) =>
  useQuery({
    queryKey: [...customersQueryKey, customerId],
    queryFn: () => getCustomer(customerId),
  });

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customersQueryKey });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCustomer,
    onSuccess: (customer) => {
      queryClient.setQueryData([...customersQueryKey, customer.id], customer);
      void queryClient.invalidateQueries({ queryKey: customersQueryKey });
    },
  });
};
