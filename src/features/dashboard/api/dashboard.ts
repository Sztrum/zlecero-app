import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { AdminDashboard, ApiResponse, CompanyDashboard } from '@/types/api';

export const dashboardQueryKey = ['dashboard'];

export const getCompanyDashboard = async (
  owner: 'all' | 'me' = 'all',
): Promise<CompanyDashboard> => {
  const response = await api.get<unknown, ApiResponse<CompanyDashboard>>(
    '/dashboard',
    { params: { owner: owner === 'me' ? 'me' : undefined } },
  );

  return response.data;
};

export const getAdminDashboard = async (): Promise<AdminDashboard> => {
  const response = await api.get<unknown, ApiResponse<AdminDashboard>>(
    '/dashboard/admin',
  );

  return response.data;
};

export const useCompanyDashboard = (owner: 'all' | 'me') =>
  useQuery({
    queryKey: [...dashboardQueryKey, 'company', owner],
    queryFn: () => getCompanyDashboard(owner),
  });

export const useAdminDashboard = () =>
  useQuery({
    queryKey: [...dashboardQueryKey, 'admin'],
    queryFn: getAdminDashboard,
  });
