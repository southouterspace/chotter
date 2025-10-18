import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  direction?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
}

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  (
    {
      direction = 'vertical',
      spacing = 'md',
      align = 'stretch',
      justify = 'start',
      wrap = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'flex',
          {
            // Direction
            'flex-col': direction === 'vertical',
            'flex-row': direction === 'horizontal',

            // Spacing - vertical
            'gap-0': spacing === 'none',
            'gap-1': spacing === 'xs',
            'gap-2': spacing === 'sm',
            'gap-4': spacing === 'md',
            'gap-6': spacing === 'lg',
            'gap-8': spacing === 'xl',
            'gap-12': spacing === '2xl',

            // Align items
            'items-start': align === 'start',
            'items-center': align === 'center',
            'items-end': align === 'end',
            'items-stretch': align === 'stretch',

            // Justify content
            'justify-start': justify === 'start',
            'justify-center': justify === 'center',
            'justify-end': justify === 'end',
            'justify-between': justify === 'between',
            'justify-around': justify === 'around',
            'justify-evenly': justify === 'evenly',

            // Wrap
            'flex-wrap': wrap,
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

Stack.displayName = 'Stack';
