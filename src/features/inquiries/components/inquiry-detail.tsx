import { Button } from '@/components/ui/button';
import { Form, Select, Textarea, Input } from '@/components/ui/form';
import { Inquiry, InquiryStatus } from '@/types/api';

import {
  inquiryMessageSchema,
  useAddInquiryMessage,
  useArchiveInquiry,
  useChangeInquiryStatus,
  useRestoreInquiry,
} from '../api/inquiries';

import { InquiryForm } from './inquiry-form';

type InquiryDetailProps = {
  inquiry: Inquiry;
};

const statusOptions: InquiryStatus[] = [
  'new',
  'triage',
  'waiting_for_customer',
  'preparing_offer',
  'offer_sent',
  'accepted',
  'rejected',
  'closed',
];

export const InquiryDetail = ({ inquiry }: InquiryDetailProps) => {
  const changeStatus = useChangeInquiryStatus();
  const archive = useArchiveInquiry();
  const restore = useRestoreInquiry();
  const addMessage = useAddInquiryMessage();

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Select
            label="Status"
            defaultValue={inquiry.status}
            registration={{
              name: 'status',
              onChange: (event) => {
                changeStatus.mutate({
                  inquiryId: inquiry.id,
                  status: event.target.value as InquiryStatus,
                });

                return Promise.resolve();
              },
            }}
            options={statusOptions.map((status) => ({
              label: status.replaceAll('_', ' '),
              value: status,
            }))}
          />
          {inquiry.archivedAt ? (
            <Button
              variant="outline"
              isLoading={restore.isPending}
              onClick={() => restore.mutate(inquiry.id)}
            >
              Restore
            </Button>
          ) : (
            <Button
              variant="outline"
              isLoading={archive.isPending}
              onClick={() => archive.mutate(inquiry.id)}
            >
              Archive
            </Button>
          )}
        </div>

        <div className="border bg-white p-4">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">
            Inquiry Details
          </h2>
          <InquiryForm inquiry={inquiry} />
        </div>

        <div className="border bg-white p-4">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">
            Correspondence
          </h2>
          <div className="mb-6 space-y-3">
            {inquiry.messages.map((message) => (
              <div key={message.id} className="border p-3 text-sm">
                <div className="font-medium text-gray-900">
                  {message.subject || message.direction}
                </div>
                <div className="text-xs text-gray-500">
                  {message.senderEmail || '-'} → {message.recipientEmail || '-'}
                </div>
                <div className="mt-2 whitespace-pre-wrap text-gray-700">
                  {message.body}
                </div>
              </div>
            ))}
          </div>
          <Form
            schema={inquiryMessageSchema}
            options={{
              defaultValues: {
                direction: 'outbound' as const,
                senderName: '',
                senderEmail: '',
                recipientEmail: inquiry.customer?.email || '',
                subject: inquiry.title,
                body: '',
              },
            }}
            onSubmit={(values) =>
              addMessage.mutate({ inquiryId: inquiry.id, data: values })
            }
          >
            {({ register, formState }) => (
              <>
                <Select
                  label="Direction"
                  error={formState.errors['direction']}
                  registration={register('direction')}
                  options={[
                    { label: 'Inbound', value: 'inbound' },
                    { label: 'Outbound', value: 'outbound' },
                    { label: 'Internal', value: 'internal' },
                  ]}
                />
                <Input
                  label="Recipient Email"
                  error={formState.errors['recipientEmail']}
                  registration={register('recipientEmail')}
                />
                <Input
                  label="Subject"
                  error={formState.errors['subject']}
                  registration={register('subject')}
                />
                <Textarea
                  label="Body"
                  error={formState.errors['body']}
                  registration={register('body')}
                />
                <Button isLoading={addMessage.isPending} type="submit">
                  Add Message
                </Button>
              </>
            )}
          </Form>
        </div>
      </div>

      <div className="border bg-white p-4">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">
          Status History
        </h2>
        <div className="space-y-3 text-sm">
          {inquiry.statusChanges.map((change) => (
            <div key={change.id} className="border-b pb-3 last:border-b-0">
              <div className="font-medium text-gray-900">
                {change.fromStatus || '-'} → {change.toStatus}
              </div>
              <div className="text-xs text-gray-500">{change.changedAt}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
