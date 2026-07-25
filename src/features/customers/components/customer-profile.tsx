import { Customer } from '@/types/api';

import { CustomerForm } from './customer-form';

type CustomerProfileProps = {
  customer: Customer;
};

export const CustomerProfile = ({ customer }: CustomerProfileProps) => {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        {customer.potentialDuplicates.length > 0 && (
          <div className="border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="font-medium">Potential duplicates</div>
            <div className="mt-2 space-y-1">
              {customer.potentialDuplicates.map((duplicate) => (
                <div key={duplicate.id}>
                  {duplicate.displayName}
                  {duplicate.email ? ` · ${duplicate.email}` : ''}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border bg-white p-4">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">
            Customer Details
          </h2>
          <CustomerForm customer={customer} />
        </div>
      </div>

      <div className="border bg-white p-4">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">History</h2>
        <HistoryRow
          label="Inquiries"
          value={customer.history?.inquiries.length || 0}
        />
        <HistoryRow
          label="Messages"
          value={customer.history?.messages.length || 0}
        />
        <HistoryRow
          label="Offers"
          value={customer.history?.offers.length || 0}
        />
        <HistoryRow
          label="Orders"
          value={customer.history?.orders.length || 0}
        />
      </div>
    </div>
  );
};

const HistoryRow = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center justify-between border-b py-3 text-sm last:border-b-0">
    <span className="text-gray-600">{label}</span>
    <span className="font-medium text-gray-900">{value}</span>
  </div>
);
