import { Zap } from 'lucide-react';
import * as React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { Head } from '@/components/seo';
import { Link } from '@/components/ui/link';
import { paths } from '@/config/paths';
import { useUser } from '@/lib/auth';

type LayoutProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
};

export const AuthLayout = ({ children, title, subtitle }: LayoutProps) => {
  const user = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user.data) {
      navigate(paths.app.dashboard.getHref(), {
        replace: true,
      });
    }
  }, [user.data, navigate]);

  return (
    <>
      <Head title={title} />
      <div className="grid min-h-screen bg-[#33251D] lg:grid-cols-[0.82fr_1.18fr]">
        <section className="flex flex-col justify-between px-6 py-8 text-white lg:px-12">
          <Link
            className="flex items-center gap-2.5 text-sm font-bold text-white"
            to={paths.home.getHref()}
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="size-4" />
            </span>
            <span>Zlecero</span>
          </Link>
          <div className="hidden max-w-xl py-16 lg:block">
            <h1 className="text-5xl font-extrabold leading-tight text-white">
              Zlecero zamienia zapytania w oferty i podpisane zlecenia.
            </h1>
            <p className="mt-6 text-base leading-7 text-white/60">
              Logujesz się do panelu, w którym zespół widzi zapytania, oferty,
              klientów i terminy w jednym uporządkowanym procesie.
            </p>
          </div>
          <p className="hidden text-xs text-white/35 lg:block">
            14 dni testów bez karty kredytowej.
          </p>
        </section>

        <section className="flex items-center justify-center bg-[#FAF5ED] px-4 py-10 sm:px-6 lg:px-12">
          <div className="w-full max-w-md">
            <div className="rounded-2xl border border-[#EADBCD] bg-white p-6 shadow-[0_24px_70px_rgba(51,37,29,0.10)] sm:p-8">
              <div className="mb-7">
                <h2 className="text-2xl font-bold leading-tight text-[#33251D]">
                  {title}
                </h2>
                {subtitle ? (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {subtitle}
                  </p>
                ) : null}
              </div>
              {children}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};
