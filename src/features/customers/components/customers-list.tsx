import { Search } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Link } from '@/components/ui/link';
import { paths } from '@/config/paths';
import { Customer } from '@/types/api';

import { useCustomers } from '../api/customers';

type CustomersListProps = {
  onCreate: () => void;
};

export const CustomersList = ({ onCreate }: CustomersListProps) => {
  const [search, setSearch] = useState('');
  const customers = useCustomers(search);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-gray-400" />
          <input
            className="h-9 w-full border bg-white pl-9 pr-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search customers"
          />
        </div>
        <Button onClick={onCreate}>New Customer</Button>
      </div>

      <div className="overflow-hidden border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Tax Number</th>
              <th className="px-4 py-3">Duplicates</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {customers.data?.map((customer) => (
              <CustomerRow key={customer.id} customer={customer} />
            ))}
            {customers.data?.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-gray-500" colSpan={4}>
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CustomerRow = ({ customer }: { customer: Customer }) => (
  <tr>
    <td className="px-4 py-3">
      <Link
        className="font-medium text-gray-900"
        to={paths.app.customerDetail.getHref(customer.id)}
      >
        {customer.displayName}
      </Link>
      <div className="text-xs text-gray-500">{customer.type}</div>
    </td>
    <td className="px-4 py-3 text-gray-600">
      <div>{customer.email || '-'}</div>
      <div className="text-xs">{customer.phone || '-'}</div>
    </td>
    <td className="px-4 py-3 text-gray-600">{customer.taxNumber || '-'}</td>
    <td className="px-4 py-3 text-gray-600">
      {customer.potentialDuplicates.length > 0
        ? customer.potentialDuplicates.length
        : '-'}
    </td>
  </tr>
);
