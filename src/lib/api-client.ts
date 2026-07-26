import Axios, { InternalAxiosRequestConfig } from 'axios';

import { useNotifications } from '@/components/ui/notifications';
import { env } from '@/config/env';

import { authToken } from './auth-token';

type ValidationErrors = Record<string, string | string[] | undefined>;

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
  (error) => {
    const message =
      getFirstValidationError(error.response?.data?.errors) ||
      error.response?.data?.message ||
      error.message;

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
