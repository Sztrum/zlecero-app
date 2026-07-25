import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { CustomerForm } from '@/features/customers/components/customer-form';
import { CustomersList } from '@/features/customers/components/customers-list';
import { Customer } from '@/types/api';

export const AppCustomersRoute = () => {
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
        {isCreating && (
          <Button variant="outline" onClick={() => setIsCreating(false)}>
            Back to List
          </Button>
        )}
      </div>

      {isCreating ? (
        <div className="border bg-white p-4">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">
            New Customer
          </h2>
          <CustomerForm
            onSaved={(customer: Customer) => {
              navigate(`/app/customers/${customer.id}`);
            }}
          />
        </div>
      ) : (
        <CustomersList onCreate={() => setIsCreating(true)} />
      )}
    </div>
  );
};

export default AppCustomersRoute;
