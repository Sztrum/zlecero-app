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
      getHref: () => '/app/inquiries',
    },
    inquiryDetail: {
      path: 'inquiries/:inquiryId',
      getHref: (inquiryId: string) => `/app/inquiries/${inquiryId}`,
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
