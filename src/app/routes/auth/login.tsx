import { useNavigate } from 'react-router';

import { AuthLayout } from '@/components/layouts/auth-layout';
import { paths } from '@/config/paths';
import { LoginForm } from '@/features/auth/components/login-form';

const LoginRoute = () => {
  const navigate = useNavigate();

  return (
    <AuthLayout
      title="Wróć do pracy nad zapytaniami, ofertami i klientami."
      subtitle="Po zalogowaniu zobaczysz najważniejsze sprawy zespołu i terminy wymagające reakcji."
    >
      <LoginForm
        onSuccess={() => {
          navigate(paths.app.dashboard.getHref(), {
            replace: true,
          });
        }}
      />
    </AuthLayout>
  );
};

export default LoginRoute;
