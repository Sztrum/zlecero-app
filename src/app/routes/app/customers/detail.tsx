import { Link, useParams } from 'react-router';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { paths } from '@/config/paths';
import { useCustomer } from '@/features/customers/api/customers';
import { CustomerProfile } from '@/features/customers/components/customer-profile';
import { customerTypeLabels } from '@/features/customers/components/customers-list';

export const AppCustomerDetailRoute = () => {
  const params = useParams();
  const customerId = params.customerId || '';
  const customer = useCustomer(customerId);

  if (customer.isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-[#EADBCD] bg-white">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!customer.data) {
    return (
      <div className="rounded-xl border border-[#EADBCD] bg-white p-5 text-sm text-muted-foreground">
        Nie znaleziono klienta.
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[#33251D]">
            {customer.data.displayName}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge
              label={customerTypeLabels[customer.data.type]}
              className="bg-[#FAF5ED] text-[#33251D]"
            />
            <span className="text-sm text-muted-foreground">
              {customer.data.email || 'Brak adresu e-mail'}
            </span>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link to={paths.app.customers.getHref()}>Wróć do klientów</Link>
        </Button>
      </div>
      <CustomerProfile customer={customer.data} />
    </div>
  );
};

export default AppCustomerDetailRoute;
