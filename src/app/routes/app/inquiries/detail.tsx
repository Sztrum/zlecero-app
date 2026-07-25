import { useParams } from 'react-router';

import { Spinner } from '@/components/ui/spinner';
import { useInquiry } from '@/features/inquiries/api/inquiries';
import { InquiryDetail } from '@/features/inquiries/components/inquiry-detail';

export const AppInquiryDetailRoute = () => {
  const params = useParams();
  const inquiryId = params.inquiryId || '';
  const inquiry = useInquiry(inquiryId);

  if (inquiry.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!inquiry.data) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <div className="border bg-white p-4 text-sm text-gray-600">
          Inquiry not found.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        {inquiry.data.title}
      </h1>
      <InquiryDetail inquiry={inquiry.data} />
    </div>
  );
};

export default AppInquiryDetailRoute;
