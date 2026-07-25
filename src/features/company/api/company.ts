import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { ApiResponse, Company, CompanyUser } from '@/types/api';

export const companyQueryKey = ['company'];
export const companyUsersQueryKey = ['company-users'];

export const companySettingsSchema = z.object({
  name: z.string().min(1, 'Required'),
  billingName: z.string().optional(),
  taxNumber: z.string().optional(),
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  addressLine: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  countryCode: z.string().min(2, 'Required').max(2, 'Required'),
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a hex color'),
});

export type CompanySettingsInput = z.infer<typeof companySettingsSchema>;

export const inviteCompanyUserSchema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().min(1, 'Required').email('Invalid email'),
  role: z.enum(['admin', 'member']),
});

export type InviteCompanyUserInput = z.infer<typeof inviteCompanyUserSchema>;

export const getCompany = async (): Promise<Company> => {
  const response = await api.get<unknown, ApiResponse<Company>>(
    '/companies/current',
  );

  return response.data;
};

export const updateCompany = async (
  data: CompanySettingsInput,
): Promise<Company> => {
  const response = await api.patch<unknown, ApiResponse<Company>>(
    '/companies/current',
    {
      name: data.name,
      billing_name: data.billingName || null,
      tax_number: data.taxNumber || null,
      contact_email: data.contactEmail || null,
      contact_phone: data.contactPhone || null,
      address_line: data.addressLine || null,
      postal_code: data.postalCode || null,
      city: data.city || null,
      country_code: data.countryCode,
      brand_color: data.brandColor,
    },
  );

  return response.data;
};

export const getCompanyUsers = async (): Promise<CompanyUser[]> => {
  const response = await api.get<
    unknown,
    ApiResponse<{ users: CompanyUser[] }>
  >('/companies/users');

  return response.data.users;
};

export const inviteCompanyUser = async (
  data: InviteCompanyUserInput,
): Promise<CompanyUser> => {
  const response = await api.post<unknown, ApiResponse<CompanyUser>>(
    '/companies/users',
    data,
  );

  return response.data;
};

export const deactivateCompanyUser = async (
  userId: string,
): Promise<CompanyUser> => {
  const response = await api.patch<unknown, ApiResponse<CompanyUser>>(
    `/companies/users/${userId}/deactivate`,
  );

  return response.data;
};

export const useCompany = () =>
  useQuery({
    queryKey: companyQueryKey,
    queryFn: getCompany,
  });

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCompany,
    onSuccess: (company) => {
      queryClient.setQueryData(companyQueryKey, company);
    },
  });
};

export const useCompanyUsers = () =>
  useQuery({
    queryKey: companyUsersQueryKey,
    queryFn: getCompanyUsers,
  });

export const useInviteCompanyUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inviteCompanyUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: companyUsersQueryKey });
    },
  });
};

export const useDeactivateCompanyUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateCompanyUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: companyUsersQueryKey });
    },
  });
};
