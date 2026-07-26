import { CalendarDays, Check, ClipboardList, UserRound } from 'lucide-react';
import { type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Form, Input, Select, Textarea } from '@/components/ui/form';
import { useCompanyUsers } from '@/features/company/api/company';
import { useCustomers } from '@/features/customers/api/customers';
import { Inquiry } from '@/types/api';

import {
  InquiryInput,
  inquirySchema,
  useCreateInquiry,
  useUpdateInquiry,
} from '../api/inquiries';

type InquiryFormProps = {
  inquiry?: Inquiry;
  onCancel?: () => void;
  onSaved?: (inquiry: Inquiry) => void;
};

const toDateTimeInput = (value: string | null | undefined) =>
  value ? value.slice(0, 16) : '';

const defaultValues = (inquiry?: Inquiry): InquiryInput => ({
  customerId: inquiry?.customer?.id || '',
  ownerUserId: inquiry?.owner?.id || '',
  title: inquiry?.title || '',
  description: inquiry?.description || '',
  priority: inquiry?.priority || 'normal',
  responseDueAt: toDateTimeInput(inquiry?.responseDueAt),
  realizationDueAt: toDateTimeInput(inquiry?.realizationDueAt),
  pickupDueAt: toDateTimeInput(inquiry?.pickupDueAt),
});

const fieldClassName =
  'border-[#EADBCD] bg-[#FAF5ED] text-[#33251D] focus-visible:border-primary focus-visible:ring-primary/20';

const selectClassName =
  'h-10 rounded-lg border border-[#EADBCD] bg-[#FAF5ED] px-3 py-2 text-sm text-[#33251D] shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

const SectionHeader = ({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) => (
  <div className="mb-5 flex items-start gap-3">
    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
      {icon}
    </span>
    <div>
      <h3 className="font-display text-sm font-bold text-[#33251D]">{title}</h3>
      <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
  </div>
);

export const InquiryForm = ({
  inquiry,
  onCancel,
  onSaved,
}: InquiryFormProps) => {
  const customers = useCustomers();
  const users = useCompanyUsers();
  const createInquiry = useCreateInquiry();
  const updateInquiry = useUpdateInquiry();
  const isSaving = createInquiry.isPending || updateInquiry.isPending;

  return (
    <Form
      schema={inquirySchema}
      options={{ defaultValues: defaultValues(inquiry) }}
      onSubmit={(values) => {
        if (inquiry) {
          updateInquiry.mutate(
            { inquiryId: inquiry.id, data: values },
            { onSuccess: onSaved },
          );
          return;
        }

        createInquiry.mutate(values, { onSuccess: onSaved });
      }}
      className="space-y-5"
    >
      {({ register, formState }) => (
        <>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
            <section className="rounded-lg border border-[#EADBCD] bg-white p-5 shadow-sm">
              <SectionHeader
                icon={<ClipboardList className="size-4" />}
                title="Treść zapytania"
                description="Nazwij sprawę tak, żeby zespół od razu wiedział, czego dotyczy kontakt klienta."
              />
              <div className="space-y-4">
                <Input
                  label="Tytuł"
                  placeholder="Np. Wycena zabudowy kuchennej"
                  className={fieldClassName}
                  error={formState.errors['title']}
                  registration={register('title')}
                />
                <Textarea
                  label="Opis"
                  placeholder="Wpisz wymagania klienta, zakres prac, ważne ustalenia i brakujące informacje."
                  className="min-h-72 border-[#EADBCD] bg-[#FAF5ED] text-[#33251D] focus-visible:ring-primary/20"
                  error={formState.errors['description']}
                  registration={register('description')}
                />
              </div>
            </section>

            <div className="space-y-5">
              <section className="rounded-lg border border-[#EADBCD] bg-white p-5 shadow-sm">
                <SectionHeader
                  icon={<UserRound className="size-4" />}
                  title="Klient i obsługa"
                  description="Przypisz klienta, opiekuna i priorytet przed przekazaniem sprawy do kolejki."
                />
                <div className="space-y-4">
                  <Select
                    label="Klient"
                    className={selectClassName}
                    error={formState.errors['customerId']}
                    registration={register('customerId')}
                    options={[
                      { label: 'Bez klienta', value: '' },
                      ...(customers.data || []).map((customer) => ({
                        label: customer.displayName,
                        value: customer.id,
                      })),
                    ]}
                  />
                  <Select
                    label="Opiekun"
                    className={selectClassName}
                    error={formState.errors['ownerUserId']}
                    registration={register('ownerUserId')}
                    options={[
                      { label: 'Nieprzypisane', value: '' },
                      ...(users.data || []).map((user) => ({
                        label: user.name,
                        value: user.id,
                      })),
                    ]}
                  />
                  <Select
                    label="Priorytet"
                    className={selectClassName}
                    error={formState.errors['priority']}
                    registration={register('priority')}
                    options={[
                      { label: 'Niski', value: 'low' },
                      { label: 'Normalny', value: 'normal' },
                      { label: 'Wysoki', value: 'high' },
                      { label: 'Pilny', value: 'urgent' },
                    ]}
                  />
                </div>
              </section>

              <section className="rounded-lg border border-[#EADBCD] bg-white p-5 shadow-sm">
                <SectionHeader
                  icon={<CalendarDays className="size-4" />}
                  title="Terminy"
                  description="Ustaw daty, które będą napędzać kolejki i widoki wymagające reakcji."
                />
                <div className="space-y-4">
                  <Input
                    label="Termin odpowiedzi"
                    type="datetime-local"
                    className={fieldClassName}
                    error={formState.errors['responseDueAt']}
                    registration={register('responseDueAt')}
                  />
                  <Input
                    label="Termin realizacji"
                    type="datetime-local"
                    className={fieldClassName}
                    error={formState.errors['realizationDueAt']}
                    registration={register('realizationDueAt')}
                  />
                  <Input
                    label="Termin odbioru"
                    type="datetime-local"
                    className={fieldClassName}
                    error={formState.errors['pickupDueAt']}
                    registration={register('pickupDueAt')}
                  />
                </div>
              </section>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 rounded-lg border border-[#EADBCD] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-muted-foreground">
              Po zapisaniu zapytanie pojawi się na liście i będzie gotowe do
              uzupełnienia o wiadomości, pliki, notatki oraz ofertę.
            </p>
            <div className="flex shrink-0 gap-2">
              {onCancel ? (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Anuluj
                </Button>
              ) : null}
              <Button
                isLoading={isSaving}
                type="submit"
                icon={<Check className="size-4" />}
              >
                {inquiry ? 'Zapisz zapytanie' : 'Utwórz zapytanie'}
              </Button>
            </div>
          </div>
        </>
      )}
    </Form>
  );
};
