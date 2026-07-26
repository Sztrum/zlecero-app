import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { Form, Input } from '@/components/ui/form';
import { paths } from '@/config/paths';
import { registerInputSchema, registerUser } from '@/lib/auth';

type RegisterFormProps = {
  onSuccess: () => void;
};

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const registering = useMutation({
    mutationFn: registerUser,
    onSuccess,
  });

  return (
    <div>
      <Form
        onSubmit={(values) => {
          registering.mutate(values);
        }}
        schema={registerInputSchema}
      >
        {({ register, formState }) => (
          <>
            <Input
              type="text"
              label="Imię i nazwisko"
              error={formState.errors['name']}
              registration={register('name')}
            />
            <Input
              type="email"
              label="E-mail"
              error={formState.errors['email']}
              registration={register('email')}
            />
            <Input
              type="text"
              label="Nazwa firmy"
              error={formState.errors['companyName']}
              registration={register('companyName')}
            />
            <Input
              type="password"
              label="Hasło"
              error={formState.errors['password']}
              registration={register('password')}
            />
            <Input
              type="password"
              label="Powtórz hasło"
              error={formState.errors['passwordConfirmation']}
              registration={register('passwordConfirmation')}
            />
            <label className="flex items-start gap-3 text-sm text-[#33251D]">
              <input
                type="checkbox"
                className="mt-1"
                {...register('termsAccepted')}
              />
              <span>
                Akceptuję warunki wymagane do utworzenia konta firmowego.
              </span>
            </label>
            {formState.errors['termsAccepted'] ? (
              <p className="text-sm text-red-600">
                {formState.errors['termsAccepted'].message}
              </p>
            ) : null}
            <div>
              <Button
                isLoading={registering.isPending}
                type="submit"
                className="w-full"
              >
                Utwórz konto
              </Button>
            </div>
          </>
        )}
      </Form>
      <div className="mt-2 flex items-center justify-end">
        <div className="text-sm">
          <Link
            to={paths.auth.login.getHref()}
            className="font-medium text-primary hover:text-primary/80"
          >
            Zaloguj się
          </Link>
        </div>
      </div>
    </div>
  );
};
