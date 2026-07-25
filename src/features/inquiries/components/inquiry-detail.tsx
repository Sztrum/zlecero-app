import { Download, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Form, Select, Textarea, Input } from '@/components/ui/form';
import { env } from '@/config/env';
import { useCompanyUsers } from '@/features/company/api/company';
import { Inquiry, InquiryStatus } from '@/types/api';

import {
  inquiryMessageSchema,
  inquiryNoteSchema,
  useAddInquiryMessage,
  useAddInquiryNote,
  useArchiveInquiry,
  useAssignInquiryOwner,
  useChangeInquiryStatus,
  useRestoreInquiry,
  useUploadInquiryFile,
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

const allowedFileExtensions =
  '.csv,.doc,.docx,.dwg,.dxf,.jpeg,.jpg,.pdf,.png,.txt,.webp,.xls,.xlsx';
const maxFileSizeBytes = 20 * 1024 * 1024;

const downloadHref = (downloadUrl: string) =>
  new URL(downloadUrl, env.API_URL.replace(/\/api\/v1\/?$/, '')).toString();

export const InquiryDetail = ({ inquiry }: InquiryDetailProps) => {
  const changeStatus = useChangeInquiryStatus();
  const archive = useArchiveInquiry();
  const restore = useRestoreInquiry();
  const addMessage = useAddInquiryMessage();
  const addNote = useAddInquiryNote();
  const assignOwner = useAssignInquiryOwner();
  const uploadFile = useUploadInquiryFile();
  const users = useCompanyUsers();
  const uploadController = useRef<AbortController | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileCategory, setFileCategory] = useState('');
  const [fileDescription, setFileDescription] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const submitFile = () => {
    if (!selectedFile) {
      setFileError('Select a file.');
      return;
    }

    if (selectedFile.size > maxFileSizeBytes) {
      setFileError('File can be up to 20 MB.');
      return;
    }

    setFileError(null);
    setUploadProgress(0);
    uploadController.current = new AbortController();
    uploadFile.mutate(
      {
        inquiryId: inquiry.id,
        file: selectedFile,
        category: fileCategory || undefined,
        description: fileDescription || undefined,
        signal: uploadController.current.signal,
        onUploadProgress: (event) => {
          if (event.total) {
            setUploadProgress(Math.round((event.loaded / event.total) * 100));
          }
        },
      },
      {
        onSuccess: () => {
          setSelectedFile(null);
          setFileCategory('');
          setFileDescription('');
          setUploadProgress(null);
          setFileInputKey((value) => value + 1);
          uploadController.current = null;
        },
        onError: () => {
          setUploadProgress(null);
          uploadController.current = null;
        },
      },
    );
  };

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
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Owner</h2>
          <Select
            label="Assigned User"
            defaultValue={inquiry.owner?.id || ''}
            registration={{
              name: 'ownerUserId',
              onChange: (event) => {
                assignOwner.mutate({
                  inquiryId: inquiry.id,
                  ownerUserId: event.target.value || null,
                });

                return Promise.resolve();
              },
            }}
            options={[
              { label: 'Unassigned', value: '' },
              ...(users.data || []).map((user) => ({
                label: user.name,
                value: user.id,
              })),
            ]}
          />
        </div>

        <div className="border bg-white p-4">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">
            Inquiry Details
          </h2>
          <InquiryForm inquiry={inquiry} />
        </div>

        <div className="border bg-white p-4">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Files</h2>
          <div className="mb-6 space-y-3">
            {inquiry.files.map((file) => (
              <div
                key={file.id}
                className="flex items-start justify-between gap-4 border p-3 text-sm"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {file.originalName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {file.category || 'file'} ·{' '}
                    {(file.sizeBytes / 1024).toLocaleString(undefined, {
                      maximumFractionDigits: 1,
                    })}{' '}
                    KB
                  </div>
                  {file.description && (
                    <div className="mt-2 text-gray-700">{file.description}</div>
                  )}
                </div>
                <Button asChild variant="outline" size="sm" icon={<Download />}>
                  <a href={downloadHref(file.downloadUrl)}>Download</a>
                </Button>
              </div>
            ))}
            {inquiry.files.length === 0 && (
              <div className="text-sm text-gray-500">No files yet.</div>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              key={fileInputKey}
              label="File"
              type="file"
              accept={allowedFileExtensions}
              registration={{
                name: 'file',
                onChange: (event) => {
                  setSelectedFile(event.target.files?.[0] || null);
                  setFileError(null);

                  return Promise.resolve();
                },
              }}
            />
            <Input
              label="Category"
              value={fileCategory}
              onChange={(event) => setFileCategory(event.target.value)}
              registration={{ name: 'category' }}
            />
            <div className="md:col-span-2">
              <Textarea
                label="Description"
                value={fileDescription}
                onChange={(event) => setFileDescription(event.target.value)}
                registration={{ name: 'description' }}
              />
            </div>
          </div>
          {fileError && (
            <div className="mt-2 text-sm text-red-600">{fileError}</div>
          )}
          {uploadProgress !== null && (
            <div className="mt-4 h-2 overflow-hidden rounded bg-gray-100">
              <div
                className="h-full bg-gray-900 transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
          <div className="mt-4 flex gap-3">
            <Button
              type="button"
              icon={<Upload />}
              isLoading={uploadFile.isPending}
              onClick={submitFile}
            >
              Upload File
            </Button>
            {uploadFile.isPending && (
              <Button
                type="button"
                variant="outline"
                icon={<X />}
                onClick={() => uploadController.current?.abort()}
              >
                Cancel
              </Button>
            )}
          </div>
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

      <div className="space-y-6">
        <div className="border bg-white p-4">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">
            Internal Notes
          </h2>
          <div className="mb-6 space-y-3 text-sm">
            {inquiry.notes.map((note) => (
              <div key={note.id} className="border-b pb-3 last:border-b-0">
                <div className="whitespace-pre-wrap text-gray-800">
                  {note.body}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {note.author?.name || 'Team'} · {note.createdAt}
                </div>
              </div>
            ))}
            {inquiry.notes.length === 0 && (
              <div className="text-gray-500">No internal notes yet.</div>
            )}
          </div>
          <Form
            schema={inquiryNoteSchema}
            options={{ defaultValues: { body: '' } }}
            onSubmit={(values) =>
              addNote.mutate({ inquiryId: inquiry.id, data: values })
            }
          >
            {({ register, formState }) => (
              <>
                <Textarea
                  label="Internal Note"
                  error={formState.errors['body']}
                  registration={register('body')}
                />
                <Button isLoading={addNote.isPending} type="submit">
                  Add Note
                </Button>
              </>
            )}
          </Form>
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
    </div>
  );
};
