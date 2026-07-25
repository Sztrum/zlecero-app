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

export const InquiryForm = ({ inquiry, onSaved }: InquiryFormProps) => {
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
      className="grid gap-4 md:grid-cols-2"
    >
      {({ register, formState }) => (
        <>
          <Input
            label="Title"
            error={formState.errors['title']}
            registration={register('title')}
          />
          <Select
            label="Priority"
            error={formState.errors['priority']}
            registration={register('priority')}
            options={[
              { label: 'Low', value: 'low' },
              { label: 'Normal', value: 'normal' },
              { label: 'High', value: 'high' },
              { label: 'Urgent', value: 'urgent' },
            ]}
          />
          <Select
            label="Customer"
            error={formState.errors['customerId']}
            registration={register('customerId')}
            options={[
              { label: 'No customer', value: '' },
              ...(customers.data || []).map((customer) => ({
                label: customer.displayName,
                value: customer.id,
              })),
            ]}
          />
          <Select
            label="Owner"
            error={formState.errors['ownerUserId']}
            registration={register('ownerUserId')}
            options={[
              { label: 'Unassigned', value: '' },
              ...(users.data || []).map((user) => ({
                label: user.name,
                value: user.id,
              })),
            ]}
          />
          <Input
            label="Response Due"
            type="datetime-local"
            error={formState.errors['responseDueAt']}
            registration={register('responseDueAt')}
          />
          <Input
            label="Realization Due"
            type="datetime-local"
            error={formState.errors['realizationDueAt']}
            registration={register('realizationDueAt')}
          />
          <Input
            label="Pickup Due"
            type="datetime-local"
            error={formState.errors['pickupDueAt']}
            registration={register('pickupDueAt')}
          />
          <div className="md:col-span-2">
            <Textarea
              label="Description"
              error={formState.errors['description']}
              registration={register('description')}
            />
          </div>
          <div className="md:col-span-2">
            <Button isLoading={isSaving} type="submit">
              {inquiry ? 'Save Inquiry' : 'Create Inquiry'}
            </Button>
          </div>
        </>
      )}
    </Form>
  );
};
