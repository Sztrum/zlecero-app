import { Meta, StoryObj } from '@storybook/react';
import { Wallet } from 'lucide-react';

import { StatCard } from './stat-card';

const meta: Meta<typeof StatCard> = {
  component: StatCard,
};

export default meta;

type Story = StoryObj<typeof StatCard>;

export const Default: Story = {
  args: {
    icon: Wallet,
    label: 'Łączna wartość',
    value: '225 650,00 zł',
    iconColor: 'bg-primary/10 text-primary',
  },
};
