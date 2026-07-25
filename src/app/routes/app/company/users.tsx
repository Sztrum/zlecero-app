import { ContentLayout } from '@/components/layouts';
import { CompanyUsersPanel } from '@/features/company/components/company-users-panel';

const CompanyUsersRoute = () => {
  return (
    <ContentLayout title="Users">
      <CompanyUsersPanel />
    </ContentLayout>
  );
};

export default CompanyUsersRoute;
