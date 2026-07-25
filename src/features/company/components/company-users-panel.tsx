import { Button } from '@/components/ui/button';
import { Form, Input, Select } from '@/components/ui/form';

import {
  inviteCompanyUserSchema,
  useCompanyUsers,
  useDeactivateCompanyUser,
  useInviteCompanyUser,
} from '../api/company';

export const CompanyUsersPanel = () => {
  const users = useCompanyUsers();
  const inviteUser = useInviteCompanyUser();
  const deactivateUser = useDeactivateCompanyUser();

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="overflow-hidden border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.data?.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {user.name}
                </td>
                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                <td className="px-4 py-3 text-gray-600">{user.role}</td>
                <td className="px-4 py-3 text-gray-600">{user.status}</td>
                <td className="px-4 py-3 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={user.status === 'deactivated'}
                    isLoading={
                      deactivateUser.isPending &&
                      deactivateUser.variables === user.id
                    }
                    onClick={() => deactivateUser.mutate(user.id)}
                  >
                    Deactivate
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border bg-white p-4">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">
          Invite User
        </h2>
        <Form
          schema={inviteCompanyUserSchema}
          options={{
            defaultValues: {
              name: '',
              email: '',
              role: 'member' as const,
            },
          }}
          onSubmit={(values) => inviteUser.mutate(values)}
        >
          {({ register, formState }) => (
            <>
              <Input
                label="Name"
                error={formState.errors['name']}
                registration={register('name')}
              />
              <Input
                label="Email"
                type="email"
                error={formState.errors['email']}
                registration={register('email')}
              />
              <Select
                label="Role"
                error={formState.errors['role']}
                registration={register('role')}
                options={[
                  { label: 'Member', value: 'member' },
                  { label: 'Admin', value: 'admin' },
                ]}
              />
              <Button
                className="w-full"
                type="submit"
                isLoading={inviteUser.isPending}
              >
                Invite
              </Button>
            </>
          )}
        </Form>
      </div>
    </div>
  );
};
