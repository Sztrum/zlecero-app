import { useMutation } from '@tanstack/react-query';
import { CheckCircle, XCircle } from 'lucide-react';
import type React from 'react';
import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';

import { AuthLayout } from '@/components/layouts/auth-layout';
import { paths } from '@/config/paths';
import { verifyEmail } from '@/lib/auth';

const VerifyEmailRoute = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('user_id');
  const hash = searchParams.get('hash');
  const verification = useMutation({
    mutationFn: verifyEmail,
  });
  const hasRequiredParams = Boolean(userId && hash);

  useEffect(() => {
    if (userId && hash && !verification.isPending && !verification.isSuccess) {
      verification.mutate({ userId, hash });
    }
  }, [hash, userId, verification]);

  return (
    <AuthLayout
      title="Potwierdzenie adresu e-mail"
      subtitle="Sprawdzamy link aktywacyjny i kończymy weryfikację konta."
    >
      <div className="space-y-5 text-sm text-[#33251D]">
        {!hasRequiredParams ? (
          <VerificationState
            icon={<XCircle className="size-5" />}
            tone="error"
            title="Link weryfikacyjny jest niekompletny."
            description="Otwórz pełny link z wiadomości e-mail albo poproś o nową wiadomość aktywacyjną."
          />
        ) : null}

        {hasRequiredParams && verification.isPending ? (
          <VerificationState
            title="Weryfikujemy adres e-mail..."
            description="To potrwa chwilę."
          />
        ) : null}

        {verification.isSuccess ? (
          <VerificationState
            icon={<CheckCircle className="size-5" />}
            tone="success"
            title="Adres e-mail został potwierdzony."
            description="Możesz teraz zalogować się do panelu i kontynuować konfigurację firmy."
          />
        ) : null}

        {verification.isError ? (
          <VerificationState
            icon={<XCircle className="size-5" />}
            tone="error"
            title="Nie udało się potwierdzić adresu e-mail."
            description="Link mógł wygasnąć albo został już wykorzystany. Spróbuj zalogować się lub poproś o nowy link."
          />
        ) : null}

        <Link
          className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          to={paths.auth.login.getHref()}
        >
          Przejdź do logowania
        </Link>
      </div>
    </AuthLayout>
  );
};

const VerificationState = ({
  description,
  icon,
  title,
  tone = 'neutral',
}: {
  description: string;
  icon?: React.ReactNode;
  title: string;
  tone?: 'neutral' | 'success' | 'error';
}) => (
  <div
    className={
      tone === 'success'
        ? 'rounded-lg border border-green-200 bg-green-50 p-4 text-green-800'
        : tone === 'error'
          ? 'rounded-lg border border-red-200 bg-red-50 p-4 text-red-800'
          : 'rounded-lg border border-[#EADBCD] bg-[#FFFDF9] p-4 text-[#33251D]'
    }
  >
    <div className="flex items-start gap-3">
      {icon ? <span className="mt-0.5 shrink-0">{icon}</span> : null}
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm opacity-80">{description}</p>
      </div>
    </div>
  </div>
);

export default VerifyEmailRoute;
