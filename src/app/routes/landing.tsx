import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';

import logo from '@/assets/logo.svg';
import { Head } from '@/components/seo';
import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';
import { useUser } from '@/lib/auth';

const LandingRoute = () => {
  const navigate = useNavigate();
  const user = useUser();

  const handleStart = () => {
    if (user.data) {
      navigate(paths.app.dashboard.getHref());
    } else {
      navigate(paths.auth.login.getHref());
    }
  };

  return (
    <>
      <Head description="Zlecero frontend application" />
      <div className="flex min-h-screen items-center bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12 text-center sm:px-6 lg:px-8 lg:py-16">
          <img className="mx-auto h-28 w-auto" src={logo} alt="Zlecero" />
          <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Zlecero
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            React application shell prepared for feature-based Zlecero product
            development.
          </p>
          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleStart}
              icon={<ArrowRight className="size-5" />}
            >
              Get started
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingRoute;
