import React from 'react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

interface MenuItemProps {
  label: string;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

interface OptionsMenuProps {
  trigger: React.ReactNode;
  items: MenuItemProps[];
  className?: string;
  align?: 'start' | 'end' | 'center';
}

const OptionsMenu: React.FC<OptionsMenuProps> = ({
  trigger,
  items,
  className,
  align = 'end'
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className={cn("min-w-[150px]", className)}
      >
        {items.map((item, index) => (
          <React.Fragment key={`${item.label}-${index}`}>
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                item.onClick();
              }}
              className={cn(item.className)}
              disabled={item.disabled}
            >
              {item.label}
            </DropdownMenuItem>
            {index < items.length - 1 && <DropdownMenuSeparator />}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OptionsMenu; 