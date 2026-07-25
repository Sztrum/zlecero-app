import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';
import { InquiriesList } from '@/features/inquiries/components/inquiries-list';
import { InquiryForm } from '@/features/inquiries/components/inquiry-form';
import { Inquiry } from '@/types/api';

export const AppInquiriesRoute = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [queue, setQueue] = useState<
    'new' | 'waiting' | 'overdue' | 'unassigned' | 'urgent' | undefined
  >();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Inquiries</h1>
        <div className="flex items-center gap-2">
          <select
            className="h-9 border bg-white px-3 text-sm"
            value={queue || ''}
            onChange={(event) =>
              setQueue(
                event.target.value
                  ? (event.target.value as typeof queue)
                  : undefined,
              )
            }
          >
            <option value="">Operational</option>
            <option value="new">New</option>
            <option value="waiting">Waiting</option>
            <option value="overdue">Overdue</option>
            <option value="unassigned">Unassigned</option>
            <option value="urgent">Urgent</option>
          </select>
          <Button onClick={() => setIsCreating((value) => !value)}>
            {isCreating ? 'Back to List' : 'New Inquiry'}
          </Button>
        </div>
      </div>

      {isCreating ? (
        <div className="border bg-white p-4">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">
            New Inquiry
          </h2>
          <InquiryForm
            onSaved={(inquiry: Inquiry) => {
              navigate(paths.app.inquiryDetail.getHref(inquiry.id));
            }}
          />
        </div>
      ) : (
        <InquiriesList filters={{ queue }} />
      )}
    </div>
  );
};

export default AppInquiriesRoute;
