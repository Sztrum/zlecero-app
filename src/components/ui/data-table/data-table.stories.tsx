import { Meta, StoryObj } from '@storybook/react';

import { DataTable } from './data-table';

type Row = {
  id: string;
  name: string;
  status: string;
};

const meta: Meta<typeof DataTable<Row>> = {
  component: DataTable,
};

export default meta;

type Story = StoryObj<typeof DataTable<Row>>;

export const Default: Story = {
  args: {
    items: [
      { id: '1', name: 'OF/2026/0001', status: 'Wysłana' },
      { id: '2', name: 'OF/2026/0002', status: 'Zaakceptowana' },
    ],
    getRowKey: (item) => item.id,
    empty: 'Brak pozycji.',
    columns: [
      { key: 'name', label: 'Numer', render: (item) => item.name },
      { key: 'status', label: 'Status', render: (item) => item.status },
    ],
  },
};

export const Empty: Story = {
  args: {
    items: [],
    getRowKey: (item) => item.id,
    empty: 'Brak pozycji.',
    columns: [
      { key: 'name', label: 'Numer', render: (item) => item.name },
      { key: 'status', label: 'Status', render: (item) => item.status },
    ],
  },
};
