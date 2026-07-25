import { Link } from '@/components/ui/link';
import { paths } from '@/config/paths';
import { Inquiry, InquiryPriority, InquiryStatus } from '@/types/api';

import { InquiryFilters, useInquiries } from '../api/inquiries';

type InquiriesListProps = {
  filters?: InquiryFilters;
};

export const InquiriesList = ({ filters = {} }: InquiriesListProps) => {
  const inquiries = useInquiries(filters);

  return (
    <div className="overflow-hidden border bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-3">Inquiry</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Response Due</th>
            <th className="px-4 py-3">Owner</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {inquiries.data?.map((inquiry) => (
            <InquiryRow key={inquiry.id} inquiry={inquiry} />
          ))}
          {inquiries.data?.length === 0 && (
            <tr>
              <td className="px-4 py-6 text-gray-500" colSpan={6}>
                No inquiries found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const InquiryRow = ({ inquiry }: { inquiry: Inquiry }) => (
  <tr>
    <td className="px-4 py-3">
      <Link
        className="font-medium text-gray-900"
        to={paths.app.inquiryDetail.getHref(inquiry.id)}
      >
        {inquiry.title}
      </Link>
      <div className="text-xs text-gray-500">{inquiry.source}</div>
    </td>
    <td className="px-4 py-3 text-gray-600">
      {inquiry.customer?.displayName || '-'}
    </td>
    <td className="px-4 py-3 text-gray-600">
      <StatusLabel status={inquiry.status} />
    </td>
    <td className="px-4 py-3 text-gray-600">
      <PriorityLabel priority={inquiry.priority} />
    </td>
    <td className="px-4 py-3 text-gray-600">
      {inquiry.responseDueAt ? inquiry.responseDueAt.slice(0, 16) : '-'}
    </td>
    <td className="px-4 py-3 text-gray-600">{inquiry.owner?.name || '-'}</td>
  </tr>
);

const StatusLabel = ({ status }: { status: InquiryStatus }) => (
  <span className="whitespace-nowrap">{status.replaceAll('_', ' ')}</span>
);

const PriorityLabel = ({ priority }: { priority: InquiryPriority }) => (
  <span className="font-medium">{priority}</span>
);
