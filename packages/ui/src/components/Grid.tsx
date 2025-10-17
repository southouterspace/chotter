import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
}

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ cols = 1, gap = 'md', responsive = true, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'grid',
          // Column classes based on responsive prop
          !responsive && {
            'grid-cols-1': cols === 1,
            'grid-cols-2': cols === 2,
            'grid-cols-3': cols === 3,
            'grid-cols-4': cols === 4,
            'grid-cols-6': cols === 6,
            'grid-cols-12': cols === 12,
          },
          responsive && {
            'grid-cols-1': cols === 1,
            'grid-cols-1 sm:grid-cols-2': cols === 2,
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3': cols === 3,
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4': cols === 4,
            'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6': cols === 6,
            'grid-cols-4 sm:grid-cols-6 lg:grid-cols-12': cols === 12,
          },
          // Gap sizes
          {
            'gap-0': gap === 'none',
            'gap-2': gap === 'sm',
            'gap-4': gap === 'md',
            'gap-6': gap === 'lg',
            'gap-8': gap === 'xl',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';
