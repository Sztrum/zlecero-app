import Axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { useNotifications } from '@/components/ui/notifications';
import { env } from '@/config/env';

import { authToken } from './auth-token';

type ValidationErrors = Record<string, string | string[] | undefined>;
type ApiErrorResponseData = {
  message?: unknown;
  errors?: unknown;
  [key: string]: unknown;
};

const getApiErrorResponseData = (
  data: unknown,
): ApiErrorResponseData | null => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return null;
  }

  return data as ApiErrorResponseData;
};

const getFirstValidationError = (errors: unknown): string | null => {
  if (!errors || typeof errors !== 'object' || Array.isArray(errors)) {
    return null;
  }

  const [firstError] = Object.values(errors as ValidationErrors);

  if (Array.isArray(firstError)) {
    return firstError.find(Boolean) ?? null;
  }

  return firstError ?? null;
};

const logLocalApiError = (error: AxiosError): void => {
  if (!import.meta.env.DEV || !error.response) {
    return;
  }

  console.error('API error response', {
    status: error.response.status,
    data: error.response.data,
  });
};

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  if (config.headers) {
    config.headers.Accept = 'application/json';

    const token = authToken.get();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
}

export const api = Axios.create({
  baseURL: env.API_URL,
});

api.interceptors.request.use(authRequestInterceptor);
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error: AxiosError) => {
    const responseData = getApiErrorResponseData(error.response?.data);
    const message =
      getFirstValidationError(responseData?.errors) ||
      (typeof responseData?.message === 'string'
        ? responseData.message
        : null) ||
      error.message;

    logLocalApiError(error);

    useNotifications.getState().addNotification({
      type: 'error',
      title: 'Error',
      message,
    });

    if (error.response?.status === 401) {
      authToken.clear();
    }

    return Promise.reject(error);
  },
);
