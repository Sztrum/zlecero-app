import { LucideIcon } from 'lucide-react';

import { cn } from '@/utils/cn';

export type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  iconColor: string;
  valueColor?: string;
  subColor?: string;
};

export const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  iconColor,
  valueColor = 'text-[#33251D]',
  subColor = 'text-muted-foreground',
}: StatCardProps) => {
  return (
    <div
      aria-label={label}
      role="group"
      className="rounded-xl border border-[#EADBCD] bg-white p-5 shadow-sm"
    >
      <div
        className={cn(
          'flex size-10 items-center justify-center rounded-lg',
          iconColor,
        )}
      >
        <Icon className="size-5" />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      <p
        className={cn('mt-1 font-display text-3xl font-extrabold', valueColor)}
      >
        {value}
      </p>
      {sub ? (
        <p className={cn('mt-1 text-xs font-semibold', subColor)}>{sub}</p>
      ) : null}
    </div>
  );
};
