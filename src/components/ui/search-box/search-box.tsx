import { Search } from 'lucide-react';

import { cn } from '@/utils/cn';

export type SearchBoxProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
};

export const SearchBox = ({
  value,
  onChange,
  placeholder,
  className,
}: SearchBoxProps) => {
  return (
    <div
      className={cn(
        'flex min-w-0 items-center gap-2 rounded-lg border border-[#EADBCD] bg-white px-3 py-2',
        className,
      )}
    >
      <Search className="size-4 shrink-0 text-muted-foreground" />
      <input
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        aria-label={placeholder}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
};
