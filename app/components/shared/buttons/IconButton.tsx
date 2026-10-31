import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';

export type IconButtonVariant = 'ghost' | 'filled' | 'gold-square' | 'dark-circle';
export type IconButtonSize = 'sm' | 'md' | 'lg';

interface BaseIconButtonProps {
  children: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  className?: string;
  href?: string;
  'aria-label': string;
}

type IconButtonProps = BaseIconButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseIconButtonProps>;

export function IconButton({
  children,
  variant = 'ghost',
  size = 'md',
  className = '',
  href,
  'aria-label': ariaLabel,
  ...rest
}: IconButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center transition-all duration-200 select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-95';

  const sizeClasses: Record<IconButtonSize, string> = {
    sm: 'w-8 h-8 text-xs rounded-lg',
    md: 'w-10 h-10 text-sm rounded-xl',
    lg: 'w-12 h-12 text-base rounded-2xl',
  };

  const variantClasses: Record<IconButtonVariant, string> = {
    ghost:
      'text-secondary hover:text-primary hover:bg-primary/10',
    filled:
      'bg-primary/10 text-primary hover:bg-primary/20',
    'gold-square':
      'bg-primary text-[#2B2B2B] hover:bg-primary-hover rounded-xl shadow-sm hover:shadow',
    'dark-circle':
      'bg-secondary/40 text-white hover:bg-secondary/70 rounded-full border border-white/10 backdrop-blur-sm',
  };

  const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} aria-label={ariaLabel} className={combinedClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button aria-label={ariaLabel} className={combinedClasses} {...rest}>
      {children}
    </button>
  );
}
