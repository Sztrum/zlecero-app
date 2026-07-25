export const formatMoney = (cents: number, currency = 'PLN') =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(cents / 100);
