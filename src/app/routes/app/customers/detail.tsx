import { useParams } from 'react-router';

import { Spinner } from '@/components/ui/spinner';
import { useCustomer } from '@/features/customers/api/customers';
import { CustomerProfile } from '@/features/customers/components/customer-profile';

export const AppCustomerDetailRoute = () => {
  const params = useParams();
  const customerId = params.customerId || '';
  const customer = useCustomer(customerId);

  if (customer.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!customer.data) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <div className="border bg-white p-4 text-sm text-gray-600">
          Customer not found.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        {customer.data.displayName}
      </h1>
      <CustomerProfile customer={customer.data} />
    </div>
  );
};

export default AppCustomerDetailRoute;
