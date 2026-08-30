import { cn } from '@/utils/cn';

export type BadgeProps = {
  label: string;
  className?: string;
};

export const Badge = ({ label, className }: BadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium',
        className,
      )}
    >
      {label}
    </span>
  );
};
