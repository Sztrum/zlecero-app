import { ContentLayout } from '@/components/layouts';
import { Spinner } from '@/components/ui/spinner';
import { useCompany } from '@/features/company/api/company';
import { CompanySettingsForm } from '@/features/company/components/company-settings-form';

const CompanySettingsRoute = () => {
  const company = useCompany();

  if (company.isLoading) {
    return (
      <ContentLayout title="Company">
        <div className="flex min-h-48 items-center justify-center">
          <Spinner size="lg" />
        </div>
      </ContentLayout>
    );
  }

  if (!company.data) {
    return null;
  }

  return (
    <ContentLayout title="Company">
      <div className="border bg-white p-6">
        <CompanySettingsForm
          defaultValues={{
            name: company.data.name,
            billingName: company.data.billingName ?? '',
            taxNumber: company.data.taxNumber ?? '',
            contactEmail: company.data.contactEmail ?? '',
            contactPhone: company.data.contactPhone ?? '',
            addressLine: company.data.addressLine ?? '',
            postalCode: company.data.postalCode ?? '',
            city: company.data.city ?? '',
            countryCode: company.data.countryCode,
            brandColor: company.data.brandColor,
          }}
        />
      </div>
    </ContentLayout>
  );
};

export default CompanySettingsRoute;
