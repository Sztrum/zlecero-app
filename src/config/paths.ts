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
    verifyEmail: {
      path: '/auth/verify-email',
      getHref: (params?: { userId?: string; hash?: string }) => {
        const search = new URLSearchParams();

        if (params?.userId) {
          search.set('user_id', params.userId);
        }

        if (params?.hash) {
          search.set('hash', params.hash);
        }

        const query = search.toString();

        return query ? `/auth/verify-email?${query}` : '/auth/verify-email';
      },
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
    admin: {
      path: 'admin',
      getHref: () => '/app/admin',
    },
    company: {
      path: 'company',
      getHref: () => '/app/company',
    },
    companyUsers: {
      path: 'company/users',
      getHref: () => '/app/company/users',
    },
    customers: {
      path: 'customers',
      getHref: () => '/app/customers',
    },
    customerDetail: {
      path: 'customers/:customerId',
      getHref: (customerId: string) => `/app/customers/${customerId}`,
    },
    inquiries: {
      path: 'inquiries',
      getHref: (params?: { inquiryId?: string; queue?: string }) => {
        const search = new URLSearchParams();

        if (params?.inquiryId) {
          search.set('inquiry', params.inquiryId);
        }

        if (params?.queue) {
          search.set('queue', params.queue);
        }

        const query = search.toString();

        return query ? `/app/inquiries?${query}` : '/app/inquiries';
      },
    },
    offers: {
      path: 'offers',
      getHref: () => '/app/offers',
    },
    offerDetail: {
      path: 'offers/:offerId',
      getHref: (offerId: string) => `/app/offers/${offerId}`,
    },
    orders: {
      path: 'orders',
      getHref: () => '/app/orders',
    },
    orderDetail: {
      path: 'orders/:orderId',
      getHref: (orderId: string) => `/app/orders/${orderId}`,
    },
  },
} as const;
