import { Link } from 'react-router';

import { paths } from '@/config/paths';
import { Order } from '@/types/api';
import { formatMoney } from '@/utils/format-money';

import { useOrders } from '../api/orders';

export const OrdersList = () => {
  const orders = useOrders();

  return (
    <div className="overflow-hidden border bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Payment Due</th>
            <th className="px-4 py-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.data?.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
          {orders.data?.length === 0 && (
            <tr>
              <td className="px-4 py-8 text-center text-gray-500" colSpan={5}>
                No orders found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const OrderRow = ({ order }: { order: Order }) => (
  <tr className="hover:bg-gray-50">
    <td className="px-4 py-3">
      <Link
        to={paths.app.orderDetail.getHref(order.id)}
        className="font-medium text-gray-900 hover:underline"
      >
        {order.number}
      </Link>
    </td>
    <td className="px-4 py-3 text-gray-600">
      {order.customer?.displayName || '-'}
    </td>
    <td className="px-4 py-3 text-gray-600">{order.status}</td>
    <td className="px-4 py-3 text-gray-600">{order.paymentDueDate || '-'}</td>
    <td className="px-4 py-3 text-right font-medium text-gray-900">
      {formatMoney(order.totalGrossCents, order.currency)}
    </td>
  </tr>
);
