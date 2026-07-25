export const paths = {
  home: {
    path: '/',
    getHref: () => '/',
  },

  auth: {
    register: {
      path: '/auth/register',
      getHref: () => '/auth/register',
    },
    login: {
      path: '/login',
      getHref: () => '/login',
    },
    legacyLogin: {
      path: '/auth/login',
      getHref: () => '/auth/login',
    },
  },

  app: {
    root: {
      path: '/app',
      getHref: () => '/app',
    },
    dashboard: {
      path: '',
      getHref: () => '/app',
    },
    profile: {
      path: 'profile',
      getHref: () => '/app/profile',
    },
    company: {
      path: 'company',
      getHref: () => '/app/company',
    },
    companyUsers: {
      path: 'company/users',
      getHref: () => '/app/company/users',
    },
  },
} as const;
