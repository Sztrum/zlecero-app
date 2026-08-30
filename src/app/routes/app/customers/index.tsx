import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { SearchBox } from '@/components/ui/search-box';
import { paths } from '@/config/paths';
import { CustomerForm } from '@/features/customers/components/customer-form';
import { CustomersList } from '@/features/customers/components/customers-list';
import { Customer } from '@/types/api';

export const AppCustomersRoute = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [query, setQuery] = useState('');

  return (
    <div className="w-full space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[#33251D]">
            Buduj pełną historię relacji z każdym klientem.
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Dane kontaktowe, typ klienta i wykryte duplikaty w jednym miejscu.
          </p>
        </div>
        <div className="hidden sm:block">
          <Button onClick={() => setIsCreating(true)}>Dodaj klienta</Button>
        </div>
      </div>

      <SearchBox
        className="lg:w-80"
        value={query}
        placeholder="Szukaj klientów, firm, e-maili..."
        onChange={setQuery}
      />

      <CustomersList query={query} />

      <Drawer open={isCreating} onOpenChange={setIsCreating}>
        <DrawerContent
          side="right"
          className="flex h-full w-[min(96vw,64rem)] max-w-none flex-col overflow-hidden border-[#EADBCD] bg-[#FAF5ED] p-0 sm:max-w-none"
        >
          <DrawerHeader className="border-b border-[#EADBCD] bg-white px-6 py-5 pr-14 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Nowy klient
            </p>
            <DrawerTitle className="font-display text-xl font-extrabold text-[#33251D]">
              Dodaj klienta, aby powiązać z nim zapytania i oferty.
            </DrawerTitle>
            <DrawerDescription className="max-w-3xl">
              Uzupełnij dane kontaktowe i rozliczeniowe. System wskaże możliwe
              duplikaty po zapisaniu karty klienta.
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto p-5">
            <CustomerForm
              onSaved={(customer: Customer) => {
                setIsCreating(false);
                navigate(paths.app.customerDetail.getHref(customer.id));
              }}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default AppCustomersRoute;
