import { Button } from '@/components/ui/button';
import { Form, Input } from '@/components/ui/form';

import {
  companySettingsSchema,
  CompanySettingsInput,
  useUpdateCompany,
} from '../api/company';

type CompanySettingsFormProps = {
  defaultValues: CompanySettingsInput;
};

export const CompanySettingsForm = ({
  defaultValues,
}: CompanySettingsFormProps) => {
  const updateCompany = useUpdateCompany();

  return (
    <Form
      schema={companySettingsSchema}
      options={{ defaultValues }}
      onSubmit={(values) => updateCompany.mutate(values)}
      className="grid gap-4 md:grid-cols-2"
    >
      {({ register, formState }) => (
        <>
          <Input
            label="Company Name"
            error={formState.errors['name']}
            registration={register('name')}
          />
          <Input
            label="Billing Name"
            error={formState.errors['billingName']}
            registration={register('billingName')}
          />
          <Input
            label="Tax Number"
            error={formState.errors['taxNumber']}
            registration={register('taxNumber')}
          />
          <Input
            label="Contact Email"
            type="email"
            error={formState.errors['contactEmail']}
            registration={register('contactEmail')}
          />
          <Input
            label="Contact Phone"
            error={formState.errors['contactPhone']}
            registration={register('contactPhone')}
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
          <Input
            label="Brand Color"
            type="color"
            error={formState.errors['brandColor']}
            registration={register('brandColor')}
          />
          <div className="md:col-span-2">
            <Button isLoading={updateCompany.isPending} type="submit">
              Save Settings
            </Button>
          </div>
        </>
      )}
    </Form>
  );
};
