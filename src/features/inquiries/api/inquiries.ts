import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type AxiosProgressEvent } from 'axios';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import {
  ApiResponse,
  Inquiry,
  InquiryPriority,
  InquiryStatus,
} from '@/types/api';

export const inquiriesQueryKey = ['inquiries'];

export const inquirySchema = z.object({
  customerId: z.string().optional(),
  ownerUserId: z.string().optional(),
  title: z.string().min(1, 'Required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  responseDueAt: z.string().optional(),
  realizationDueAt: z.string().optional(),
  pickupDueAt: z.string().optional(),
});

export const inquiryMessageSchema = z.object({
  direction: z.enum(['inbound', 'outbound', 'internal']),
  senderName: z.string().optional(),
  senderEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  recipientEmail: z
    .string()
    .email('Invalid email')
    .optional()
    .or(z.literal('')),
  subject: z.string().optional(),
  body: z.string().min(1, 'Required'),
});

export const inquiryNoteSchema = z.object({
  body: z.string().min(1, 'Required'),
});

export type InquiryInput = z.infer<typeof inquirySchema>;
export type InquiryMessageInput = z.infer<typeof inquiryMessageSchema>;
export type InquiryNoteInput = z.infer<typeof inquiryNoteSchema>;

export type InquiryFilters = {
  status?: InquiryStatus;
  priority?: InquiryPriority;
  queue?: 'new' | 'waiting' | 'overdue' | 'unassigned' | 'urgent';
  archived?: boolean;
};

const toInquiryPayload = (data: InquiryInput) => ({
  customer_id: data.customerId || null,
  owner_user_id: data.ownerUserId || null,
  title: data.title,
  description: data.description || null,
  priority: data.priority,
  response_due_at: data.responseDueAt || null,
  realization_due_at: data.realizationDueAt || null,
  pickup_due_at: data.pickupDueAt || null,
});

export const getInquiries = async (
  filters: InquiryFilters = {},
): Promise<Inquiry[]> => {
  const response = await api.get<
    unknown,
    ApiResponse<{ inquiries: Inquiry[] }>
  >('/inquiries', {
    params: {
      status: filters.status,
      priority: filters.priority,
      queue: filters.queue,
      archived: filters.archived ? '1' : undefined,
    },
  });

  return response.data.inquiries;
};

export const getInquiry = async (inquiryId: string): Promise<Inquiry> => {
  const response = await api.get<unknown, ApiResponse<Inquiry>>(
    `/inquiries/${inquiryId}`,
  );

  return response.data;
};

export const createInquiry = async (data: InquiryInput): Promise<Inquiry> => {
  const response = await api.post<unknown, ApiResponse<Inquiry>>(
    '/inquiries',
    toInquiryPayload(data),
  );

  return response.data;
};

export const updateInquiry = async ({
  inquiryId,
  data,
}: {
  inquiryId: string;
  data: InquiryInput;
}): Promise<Inquiry> => {
  const response = await api.patch<unknown, ApiResponse<Inquiry>>(
    `/inquiries/${inquiryId}`,
    toInquiryPayload(data),
  );

  return response.data;
};

export const changeInquiryStatus = async ({
  inquiryId,
  status,
}: {
  inquiryId: string;
  status: InquiryStatus;
}): Promise<Inquiry> => {
  const response = await api.patch<unknown, ApiResponse<Inquiry>>(
    `/inquiries/${inquiryId}/status`,
    { status },
  );

  return response.data;
};

export const archiveInquiry = async (inquiryId: string): Promise<Inquiry> => {
  const response = await api.patch<unknown, ApiResponse<Inquiry>>(
    `/inquiries/${inquiryId}/archive`,
  );

  return response.data;
};

export const restoreInquiry = async (inquiryId: string): Promise<Inquiry> => {
  const response = await api.patch<unknown, ApiResponse<Inquiry>>(
    `/inquiries/${inquiryId}/restore`,
  );

  return response.data;
};

export const addInquiryMessage = async ({
  inquiryId,
  data,
}: {
  inquiryId: string;
  data: InquiryMessageInput;
}): Promise<Inquiry> => {
  const response = await api.post<unknown, ApiResponse<Inquiry>>(
    `/inquiries/${inquiryId}/messages`,
    {
      direction: data.direction,
      sender_name: data.senderName || null,
      sender_email: data.senderEmail || null,
      recipient_email: data.recipientEmail || null,
      subject: data.subject || null,
      body: data.body,
      sent_at: new Date().toISOString(),
    },
  );

  return response.data;
};

export const addInquiryNote = async ({
  inquiryId,
  data,
}: {
  inquiryId: string;
  data: InquiryNoteInput;
}): Promise<Inquiry> => {
  const response = await api.post<unknown, ApiResponse<Inquiry>>(
    `/inquiries/${inquiryId}/notes`,
    { body: data.body },
  );

  return response.data;
};

export const uploadInquiryFile = async ({
  inquiryId,
  file,
  category,
  description,
  signal,
  onUploadProgress,
}: {
  inquiryId: string;
  file: File;
  category?: string;
  description?: string;
  signal?: AbortSignal;
  onUploadProgress?: (event: AxiosProgressEvent) => void;
}): Promise<Inquiry> => {
  const formData = new FormData();
  formData.append('file', file);

  if (category) {
    formData.append('category', category);
  }

  if (description) {
    formData.append('description', description);
  }

  const response = await api.post<unknown, ApiResponse<Inquiry>>(
    `/inquiries/${inquiryId}/files`,
    formData,
    { signal, onUploadProgress },
  );

  return response.data;
};

export const assignInquiryOwner = async ({
  inquiryId,
  ownerUserId,
}: {
  inquiryId: string;
  ownerUserId: string | null;
}): Promise<Inquiry> => {
  const response = await api.patch<unknown, ApiResponse<Inquiry>>(
    `/inquiries/${inquiryId}/owner`,
    { owner_user_id: ownerUserId },
  );

  return response.data;
};

export const useInquiries = (filters: InquiryFilters = {}) =>
  useQuery({
    queryKey: [...inquiriesQueryKey, filters],
    queryFn: () => getInquiries(filters),
  });

export const useInquiry = (inquiryId: string) =>
  useQuery({
    queryKey: [...inquiriesQueryKey, inquiryId],
    queryFn: () => getInquiry(inquiryId),
  });

const useInquiryMutation = <TVariables>(
  mutationFn: (variables: TVariables) => Promise<Inquiry>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (inquiry) => {
      queryClient.setQueryData([...inquiriesQueryKey, inquiry.id], inquiry);
      void queryClient.invalidateQueries({ queryKey: inquiriesQueryKey });
    },
  });
};

export const useCreateInquiry = () => useInquiryMutation(createInquiry);
export const useUpdateInquiry = () => useInquiryMutation(updateInquiry);
export const useChangeInquiryStatus = () =>
  useInquiryMutation(changeInquiryStatus);
export const useArchiveInquiry = () => useInquiryMutation(archiveInquiry);
export const useRestoreInquiry = () => useInquiryMutation(restoreInquiry);
export const useAddInquiryMessage = () => useInquiryMutation(addInquiryMessage);
export const useAddInquiryNote = () => useInquiryMutation(addInquiryNote);
export const useUploadInquiryFile = () => useInquiryMutation(uploadInquiryFile);
export const useAssignInquiryOwner = () =>
  useInquiryMutation(assignInquiryOwner);
