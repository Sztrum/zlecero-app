import { configureAuth } from 'react-query-auth';
import { Navigate } from 'react-router';
import { z } from 'zod';

import { Spinner } from '@/components/ui/spinner';
import { paths } from '@/config/paths';
import { ApiResponse, AuthTokenResponse, User } from '@/types/api';

import { api } from './api-client';
import { authToken } from './auth-token';

// API call definitions for auth are shared because auth is used across routes and features.

const getUser = async (): Promise<User> => {
  const response = await api.get<unknown, ApiResponse<User>>('/auth/profile');

  return response.data;
};

const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } finally {
    authToken.clear();
  }
};

export const loginInputSchema = z.object({
  email: z.string().min(1, 'Required').email('Invalid email'),
  password: z.string().min(5, 'Required'),
});

export type LoginInput = z.infer<typeof loginInputSchema>;
const loginWithEmailAndPassword = (
  data: LoginInput,
): Promise<ApiResponse<AuthTokenResponse>> => {
  return api.post<unknown, ApiResponse<AuthTokenResponse>>('/auth/login', data);
};

export const registerInputSchema = z.object({
  email: z.string().min(1, 'Required').email('Invalid email'),
  name: z.string().min(1, 'Required'),
});

export type RegisterInput = z.infer<typeof registerInputSchema>;

export const registerUser = (
  data: RegisterInput,
): Promise<ApiResponse<Record<string, never>>> => {
  return api.post<unknown, ApiResponse<Record<string, never>>>(
    '/auth/register',
    data,
  );
};

const authConfig = {
  userFn: getUser,
  loginFn: async (data: LoginInput) => {
    const response = await loginWithEmailAndPassword(data);
    authToken.set(response.data.token);

    return getUser();
  },
  registerFn: async (data: RegisterInput) => {
    await registerUser(data);

    throw new Error('Registration does not create an authenticated session.');
  },
  logoutFn: logout,
};

export const { useUser, useLogin, useLogout, AuthLoader } =
  configureAuth(authConfig);

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useUser();

  if (user.isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!user.data) {
    return <Navigate to={paths.auth.login.getHref()} replace />;
  }

  return children;
};
