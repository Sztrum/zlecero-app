import { Helmet, HelmetProvider } from 'react-helmet-async';

type HeadProps = {
  title?: string;
  description?: string;
};

export const Head = ({ title = '', description = '' }: HeadProps = {}) => {
  return (
    <HelmetProvider>
      <Helmet
        title={title ? `${title} | Zlecero` : undefined}
        defaultTitle="Zlecero"
      >
        <meta name="description" content={description} />
      </Helmet>
    </HelmetProvider>
  );
};
