import { ContentLayout } from '@/components/layouts';
import { useAdminDashboard } from '@/features/dashboard/api/dashboard';
import {
  AdminDashboardPanel,
  DashboardError,
  DashboardLoading,
} from '@/features/dashboard/components/dashboard-panels';

const AdminDashboardRoute = () => {
  const dashboard = useAdminDashboard();

  return (
    <ContentLayout title="Panel administratora">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#33251D]">
            Stan platformy Zlecero
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Podstawowe metryki firm, triali i działań administracyjnych.
          </p>
        </div>
        {dashboard.isLoading ? <DashboardLoading /> : null}
        {dashboard.isError ? (
          <DashboardError title="Nie udało się pobrać panelu administratora." />
        ) : null}
        {dashboard.data ? <AdminDashboardPanel data={dashboard.data} /> : null}
      </div>
    </ContentLayout>
  );
};

export default AdminDashboardRoute;
