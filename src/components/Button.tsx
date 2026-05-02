import React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { cn } from '../lib/utils';

type ButtonProps = HTMLMotionProps<"button"> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
};

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-primary text-black hover:bg-primary/90 font-bold',
    secondary: 'bg-neutral-100 dark:bg-white/5 text-neutral-900 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-white/10 hover:text-black dark:hover:text-white',
    outline: 'border border-neutral-200 dark:border-white/20 bg-transparent text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-white/5',
    ghost: 'hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={cn(
        'inline-flex items-center justify-center rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider',
        variants[variant],
        sizes[size],
        className as string
      )}
      disabled={isLoading || (props.disabled as boolean)}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </motion.button>
  );
}
