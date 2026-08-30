import { Building2, Copy, User, Users } from 'lucide-react';
import { useNavigate } from 'react-router';

import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { Spinner } from '@/components/ui/spinner';
import { StatCard } from '@/components/ui/stat-card';
import { paths } from '@/config/paths';
import { Customer, CustomerType } from '@/types/api';

import { useCustomers } from '../api/customers';

type CustomersListProps = {
  query?: string;
};

export const customerTypeLabels: Record<CustomerType, string> = {
  company: 'Firma',
  individual: 'Osoba prywatna',
};

const typeClasses: Record<CustomerType, string> = {
  company: 'bg-blue-100 text-blue-700',
  individual: 'bg-slate-100 text-slate-600',
};

const initials = (displayName: string) =>
  displayName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toLocaleUpperCase('pl-PL');

export const CustomersList = ({ query = '' }: CustomersListProps) => {
  const customers = useCustomers(query.trim() || undefined);
  const navigate = useNavigate();

  if (customers.isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-[#EADBCD] bg-white">
        <Spinner size="lg" />
      </div>
    );
  }

  if (customers.isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        Nie udało się pobrać listy klientów.
      </div>
    );
  }

  const items = customers.data ?? [];

  return (
    <div className="space-y-5">
      <CustomersSummary customers={items} />
      <DataTable
        items={items}
        getRowKey={(customer) => customer.id}
        empty="Brak klientów dla wybranych filtrów."
        onRowClick={(customer) =>
          navigate(paths.app.customerDetail.getHref(customer.id))
        }
        columns={[
          {
            key: 'customer',
            label: 'Klient',
            render: (customer) => (
              <div className="flex min-w-[240px] items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {initials(customer.displayName)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#33251D]">
                    {customer.displayName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {customer.companyName || '-'}
                  </p>
                </div>
              </div>
            ),
          },
          {
            key: 'type',
            label: 'Typ',
            render: (customer) => (
              <Badge
                label={customerTypeLabels[customer.type]}
                className={typeClasses[customer.type]}
              />
            ),
          },
          {
            key: 'email',
            label: 'E-mail',
            className: 'hidden md:table-cell',
            render: (customer) => (
              <span className="text-xs text-muted-foreground">
                {customer.email || '-'}
              </span>
            ),
          },
          {
            key: 'phone',
            label: 'Telefon',
            className: 'hidden lg:table-cell',
            render: (customer) => (
              <span className="text-xs text-muted-foreground">
                {customer.phone || '-'}
              </span>
            ),
          },
          {
            key: 'taxNumber',
            label: 'NIP',
            className: 'hidden lg:table-cell',
            render: (customer) => (
              <span className="text-xs text-muted-foreground">
                {customer.taxNumber || '-'}
              </span>
            ),
          },
          {
            key: 'duplicates',
            label: 'Duplikaty',
            className: 'hidden md:table-cell',
            render: (customer) =>
              customer.potentialDuplicates.length > 0 ? (
                <Badge
                  label={`${customer.potentialDuplicates.length}`}
                  className="bg-orange-100 text-orange-700"
                />
              ) : (
                <span className="text-xs text-muted-foreground">-</span>
              ),
          },
        ]}
      />
    </div>
  );
};

const CustomersSummary = ({ customers }: { customers: Customer[] }) => {
  const companies = customers.filter(
    (customer) => customer.type === 'company',
  ).length;
  const individuals = customers.length - companies;
  const duplicates = customers.filter(
    (customer) => customer.potentialDuplicates.length > 0,
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={Users}
        label="Klienci na liście"
        value={`${customers.length}`}
        iconColor="bg-primary/10 text-primary"
      />
      <StatCard
        icon={Building2}
        label="Firmy"
        value={`${companies}`}
        iconColor="bg-blue-50 text-blue-600"
      />
      <StatCard
        icon={User}
        label="Osoby prywatne"
        value={`${individuals}`}
        iconColor="bg-slate-100 text-slate-600"
      />
      <StatCard
        icon={Copy}
        label="Możliwe duplikaty"
        value={`${duplicates}`}
        iconColor="bg-orange-50 text-orange-600"
        valueColor={duplicates > 0 ? 'text-orange-600' : 'text-[#33251D]'}
      />
    </div>
  );
};
