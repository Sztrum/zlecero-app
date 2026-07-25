import { Button } from '@/components/ui/button';
import { Form, Input, Select, Textarea } from '@/components/ui/form';
import { Customer } from '@/types/api';

import {
  CustomerInput,
  customerSchema,
  useCreateCustomer,
  useUpdateCustomer,
} from '../api/customers';

type CustomerFormProps = {
  customer?: Customer;
  onSaved?: (customer: Customer) => void;
};

const getDefaultValues = (customer?: Customer): CustomerInput => ({
  type: customer?.type || 'company',
  displayName: customer?.displayName || '',
  companyName: customer?.companyName || '',
  firstName: customer?.firstName || '',
  lastName: customer?.lastName || '',
  email: customer?.email || '',
  phone: customer?.phone || '',
  taxNumber: customer?.taxNumber || '',
  addressLine: customer?.addressLine || '',
  postalCode: customer?.postalCode || '',
  city: customer?.city || '',
  countryCode: customer?.countryCode || 'PL',
  notes: customer?.notes || '',
});

export const CustomerForm = ({ customer, onSaved }: CustomerFormProps) => {
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const isEditing = !!customer;
  const isSaving = createCustomer.isPending || updateCustomer.isPending;

  return (
    <Form
      schema={customerSchema}
      options={{ defaultValues: getDefaultValues(customer) }}
      onSubmit={(values) => {
        if (customer) {
          updateCustomer.mutate(
            { customerId: customer.id, data: values },
            { onSuccess: onSaved },
          );
          return;
        }

        createCustomer.mutate(values, { onSuccess: onSaved });
      }}
      className="grid gap-4 md:grid-cols-2"
    >
      {({ register, formState }) => (
        <>
          <Select
            label="Type"
            error={formState.errors['type']}
            registration={register('type')}
            options={[
              { label: 'Company', value: 'company' },
              { label: 'Individual', value: 'individual' },
            ]}
          />
          <Input
            label="Display Name"
            error={formState.errors['displayName']}
            registration={register('displayName')}
          />
          <Input
            label="Company Name"
            error={formState.errors['companyName']}
            registration={register('companyName')}
          />
          <Input
            label="Tax Number"
            error={formState.errors['taxNumber']}
            registration={register('taxNumber')}
          />
          <Input
            label="First Name"
            error={formState.errors['firstName']}
            registration={register('firstName')}
          />
          <Input
            label="Last Name"
            error={formState.errors['lastName']}
            registration={register('lastName')}
          />
          <Input
            label="Email"
            type="email"
            error={formState.errors['email']}
            registration={register('email')}
          />
          <Input
            label="Phone"
            error={formState.errors['phone']}
            registration={register('phone')}
          />
          <Input
            label="Address"
            error={formState.errors['addressLine']}
            registration={register('addressLine')}
          />
          <Input
            label="Postal Code"
            error={formState.errors['postalCode']}
            registration={register('postalCode')}
          />
          <Input
            label="City"
            error={formState.errors['city']}
            registration={register('city')}
          />
          <Input
            label="Country Code"
            error={formState.errors['countryCode']}
            registration={register('countryCode')}
          />
          <div className="md:col-span-2">
            <Textarea
              label="Notes"
              error={formState.errors['notes']}
              registration={register('notes')}
            />
          </div>
          <div className="md:col-span-2">
            <Button isLoading={isSaving} type="submit">
              {isEditing ? 'Save Customer' : 'Create Customer'}
            </Button>
          </div>
        </>
      )}
    </Form>
  );
};
