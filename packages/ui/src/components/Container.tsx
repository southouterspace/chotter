import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ maxWidth = 'lg', padding = true, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'mx-auto w-full',
          {
            'max-w-screen-sm': maxWidth === 'sm',
            'max-w-screen-md': maxWidth === 'md',
            'max-w-screen-lg': maxWidth === 'lg',
            'max-w-screen-xl': maxWidth === 'xl',
            'max-w-screen-2xl': maxWidth === '2xl',
            'max-w-full': maxWidth === 'full',
            'px-4 sm:px-6 lg:px-8': padding,
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

Container.displayName = 'Container';
