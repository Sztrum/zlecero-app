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
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900">
            <div className="font-semibold">Możliwe duplikaty</div>
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

        <section className="rounded-xl border border-[#EADBCD] bg-white shadow-sm">
          <div className="border-b border-[#EADBCD] px-5 py-4">
            <h2 className="font-display text-sm font-bold text-[#33251D]">
              Dane klienta
            </h2>
          </div>
          <div className="p-5">
            <CustomerForm customer={customer} />
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-[#EADBCD] bg-white shadow-sm">
        <div className="border-b border-[#EADBCD] px-5 py-4">
          <h2 className="font-display text-sm font-bold text-[#33251D]">
            Historia współpracy
          </h2>
        </div>
        <div className="px-5">
          <HistoryRow
            label="Zapytania"
            value={customer.history?.inquiries.length || 0}
          />
          <HistoryRow
            label="Wiadomości"
            value={customer.history?.messages.length || 0}
          />
          <HistoryRow
            label="Oferty"
            value={customer.history?.offers.length || 0}
          />
          <HistoryRow
            label="Zlecenia"
            value={customer.history?.orders.length || 0}
          />
        </div>
      </section>
    </div>
  );
};

const HistoryRow = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center justify-between border-b border-[#EADBCD] py-3 text-sm last:border-b-0">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-semibold text-[#33251D]">{value}</span>
  </div>
);
