import { useMutation } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router';

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
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

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
              label="Name"
              error={formState.errors['name']}
              registration={register('name')}
            />
            <Input
              type="email"
              label="Email Address"
              error={formState.errors['email']}
              registration={register('email')}
            />
            <div>
              <Button
                isLoading={registering.isPending}
                type="submit"
                className="w-full"
              >
                Register
              </Button>
            </div>
          </>
        )}
      </Form>
      <div className="mt-2 flex items-center justify-end">
        <div className="text-sm">
          <Link
            to={paths.auth.login.getHref(redirectTo)}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};
