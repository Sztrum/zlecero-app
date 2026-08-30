export const formatDate = (value: number | string | null) => {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
};
