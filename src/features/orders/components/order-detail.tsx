import { Order } from '@/types/api';
import { formatMoney } from '@/utils/format-money';

type OrderDetailProps = {
  order: Order;
};

export const OrderDetail = ({ order }: OrderDetailProps) => (
  <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
    <div className="border bg-white p-4">
      <h2 className="mb-4 text-sm font-semibold text-gray-900">Order Items</h2>
      <div className="space-y-3 text-sm">
        {order.items.map((item) => (
          <div key={item.id} className="border-b pb-3 last:border-b-0">
            <div className="font-medium text-gray-900">{item.name}</div>
            <div className="text-gray-500">
              {item.quantity} {item.unit} ·{' '}
              {formatMoney(item.grossCents, order.currency)}
            </div>
            {item.description && (
              <div className="mt-2 whitespace-pre-wrap text-gray-700">
                {item.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>

    <div className="space-y-6">
      <div className="border bg-white p-4">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Summary</h2>
        <dl className="space-y-3 text-sm">
          <SummaryLine label="Number" value={order.number} />
          <SummaryLine label="Status" value={order.status} />
          <SummaryLine label="Accepted" value={order.acceptedDate} />
          <SummaryLine
            label="Payment due"
            value={order.paymentDueDate || '-'}
          />
          <SummaryLine
            label="Total"
            value={formatMoney(order.totalGrossCents, order.currency)}
            strong
          />
          <SummaryLine
            label="Deposit"
            value={formatMoney(order.depositCents, order.currency)}
          />
        </dl>
      </div>

      <div className="border bg-white p-4">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Terms</h2>
        <div className="whitespace-pre-wrap text-sm text-gray-700">
          {order.terms || '-'}
        </div>
      </div>
    </div>
  </div>
);

const SummaryLine = ({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) => (
  <div className="flex items-center justify-between gap-4">
    <dt className="text-gray-500">{label}</dt>
    <dd className={strong ? 'font-semibold text-gray-900' : 'text-gray-900'}>
      {value}
    </dd>
  </div>
);
