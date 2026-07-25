import { useState } from 'react';

import { ContentLayout } from '@/components/layouts';
import { useCompanyDashboard } from '@/features/dashboard/api/dashboard';
import {
  CompanyDashboardPanel,
  DashboardError,
  DashboardLoading,
} from '@/features/dashboard/components/dashboard-panels';
import { useUser } from '@/lib/auth';

const DashboardRoute = () => {
  const user = useUser();
  const [owner, setOwner] = useState<'all' | 'me'>('all');
  const dashboard = useCompanyDashboard(owner);

  return (
    <ContentLayout title="Pulpit">
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-950">
              Dzień dobry, {user.data?.name ?? 'użytkowniku'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Najważniejsze zapytania, oferty i zlecenia wymagające działania.
            </p>
          </div>
          <div className="inline-flex rounded-lg border bg-white p-1">
            {(['all', 'me'] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  owner === value
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setOwner(value)}
              >
                {value === 'all' ? 'Cały zespół' : 'Moje sprawy'}
              </button>
            ))}
          </div>
        </div>
        {dashboard.isLoading ? <DashboardLoading /> : null}
        {dashboard.isError ? (
          <DashboardError title="Nie udało się pobrać danych dashboardu." />
        ) : null}
        {dashboard.data ? (
          <CompanyDashboardPanel data={dashboard.data} />
        ) : null}
      </div>
    </ContentLayout>
  );
};

export default DashboardRoute;
