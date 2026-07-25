import { ContentLayout } from '@/components/layouts';
import { useUser } from '@/lib/auth';

type EntryProps = {
  label: string;
  value: string;
};

const Entry = ({ label, value }: EntryProps) => (
  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
      {value || '-'}
    </dd>
  </div>
);

const ProfileRoute = () => {
  const user = useUser();

  if (!user.data) return null;

  return (
    <ContentLayout title="Profile">
      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            User Information
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Personal details for the signed-in user.
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <Entry label="Name" value={user.data.name} />
            <Entry label="Email Address" value={user.data.email} />
            <Entry label="Role" value={user.data.role ?? '-'} />
          </dl>
        </div>
      </div>
    </ContentLayout>
  );
};

export default ProfileRoute;
