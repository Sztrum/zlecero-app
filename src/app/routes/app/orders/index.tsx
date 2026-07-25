import { OrdersList } from '@/features/orders/components/orders-list';

export const AppOrdersRoute = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
      <p className="text-sm text-gray-500">
        Orders created from accepted offers.
      </p>
    </div>
    <OrdersList />
  </div>
);

export default AppOrdersRoute;
