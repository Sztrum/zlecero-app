import { useNavigate, useSearchParams } from 'react-router';

import { AuthLayout } from '@/components/layouts/auth-layout';
import { paths } from '@/config/paths';
import { LoginForm } from '@/features/auth/components/login-form';

const LoginRoute = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');
  const validRedirectTo = redirectTo?.startsWith('/auth/') ? null : redirectTo;

  return (
    <AuthLayout title="Log in to your account">
      <LoginForm
        onSuccess={() => {
          navigate(
            `${
              validRedirectTo
                ? `${validRedirectTo}`
                : paths.app.dashboard.getHref()
            }`,
            {
              replace: true,
            },
          );
        }}
      />
    </AuthLayout>
  );
};

export default LoginRoute;
