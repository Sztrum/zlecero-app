import { ContentLayout } from '@/components/layouts';
import { useUser } from '@/lib/auth';

const DashboardRoute = () => {
  const user = useUser();

  return (
    <ContentLayout title="Dashboard">
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-gray-900">
          Welcome {user.data?.firstName} {user.data?.lastName}
        </h1>
        <p className="text-sm text-gray-600">
          This is the initial Zlecero React application shell. New product areas
          should be added as feature modules under <code>src/features</code>.
        </p>
      </div>
    </ContentLayout>
  );
};

export default DashboardRoute;
