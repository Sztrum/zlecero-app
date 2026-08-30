import { Meta, StoryObj } from '@storybook/react';

import { SearchBox } from './search-box';

const meta: Meta<typeof SearchBox> = {
  component: SearchBox,
};

export default meta;

type Story = StoryObj<typeof SearchBox>;

export const Default: Story = {
  args: {
    value: '',
    placeholder: 'Szukaj ofert, klientów...',
  },
};
