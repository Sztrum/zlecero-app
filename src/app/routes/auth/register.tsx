import { useNavigate } from 'react-router';

import { AuthLayout } from '@/components/layouts/auth-layout';
import { paths } from '@/config/paths';
import { RegisterForm } from '@/features/auth/components/register-form';

const RegisterRoute = () => {
  const navigate = useNavigate();

  return (
    <AuthLayout
      title="Utwórz firmowe centrum obsługi zapytań i ofert."
      subtitle="Zacznij od konta firmowego, a konfigurację procesu dopracujesz później w panelu."
    >
      <RegisterForm
        onSuccess={() => {
          navigate(paths.auth.login.getHref(), {
            replace: true,
          });
        }}
      />
    </AuthLayout>
  );
};

export default RegisterRoute;
