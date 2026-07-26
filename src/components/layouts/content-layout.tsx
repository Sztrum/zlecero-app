import * as React from 'react';

import { Head } from '../seo';

type ContentLayoutProps = {
  children: React.ReactNode;
  title: string;
};

export const ContentLayout = ({ children, title }: ContentLayoutProps) => {
  return (
    <>
      <Head title={title} />
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#33251D]">{title}</h1>
        </div>
        {children}
      </div>
    </>
  );
};
