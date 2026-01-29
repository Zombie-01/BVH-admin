import * as React from 'react';
import { X, Check, ChevronsUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface MultiSelectProps {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Сонгох...',
  disabled = false,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((s) => s !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleRemove = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((s) => s !== value));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between min-h-10 h-auto',
            disabled && 'cursor-not-allowed opacity-50',
            className
          )}
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1">
            {selected.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              selected.map((value) => {
                const option = options.find((o) => o.value === value);
                return (
                  <Badge key={value} variant="secondary" className="mr-1">
                    {option?.label || value}
                    {!disabled && (
                      <button
                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={(e) => handleRemove(value, e)}
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                  </Badge>
                );
              })
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="max-h-60 overflow-auto p-1">
          {options.map((option) => (
            <div
              key={option.value}
              className={cn(
                'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                selected.includes(option.value) && 'bg-accent'
              )}
              onClick={() => handleSelect(option.value)}
            >
              <div
                className={cn(
                  'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                  selected.includes(option.value)
                    ? 'bg-primary text-primary-foreground'
                    : 'opacity-50'
                )}
              >
                {selected.includes(option.value) && <Check className="h-3 w-3" />}
              </div>
              {option.label}
            </div>
          ))}
          {options.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-4">Сонголт байхгүй</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
