import { Link, useParams } from 'react-router';

import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';
import { useChangeOrderStatus, useOrder } from '@/features/orders/api/orders';
import { OrderDetail } from '@/features/orders/components/order-detail';
import { OrderStatus } from '@/types/api';

export const AppOrderDetailRoute = () => {
  const { orderId } = useParams();
  const order = useOrder(orderId || '');
  const changeStatus = useChangeOrderStatus();

  if (!orderId) {
    return <div className="text-sm text-red-600">Order route is invalid.</div>;
  }

  if (order.isLoading) {
    return <div className="text-sm text-gray-500">Loading order...</div>;
  }

  if (!order.data) {
    return <div className="text-sm text-gray-500">Order not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {order.data.number}
          </h1>
          <p className="text-sm text-gray-500">{order.data.status}</p>
        </div>
        <Button asChild variant="outline">
          <Link to={paths.app.orders.getHref()}>Back to Orders</Link>
        </Button>
      </div>
      <OrderDetail
        order={order.data}
        isChangingStatus={changeStatus.isPending}
        onStatusChange={(status: OrderStatus) =>
          changeStatus.mutate({ orderId, status })
        }
      />
    </div>
  );
};

export default AppOrderDetailRoute;
