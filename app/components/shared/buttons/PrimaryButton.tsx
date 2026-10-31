import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { ArrowLeftCtaIcon } from '../icons/BrandIcons';

export type ButtonVariant = 'primary' | 'secondary' | 'cream' | 'white' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  arrow?: boolean;
  className?: string;
  href?: string;
  icon?: ReactNode;
}

type ButtonProps = BaseButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps>;

export function PrimaryButton({
  children,
  variant = 'primary',
  size = 'md',
  arrow = false,
  className = '',
  href,
  icon,
  ...rest
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-bold transition-all duration-200 select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-[0.98]';

  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-4 py-2 text-xs rounded-lg gap-1.5',
    md: 'px-6 py-2.5 text-sm rounded-xl gap-2',
    lg: 'px-8 py-3.5 text-base rounded-xl gap-2.5',
  };

  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      'bg-primary text-[#2B2B2B] hover:bg-primary-hover shadow-sm hover:shadow active:bg-primary-dark',
    secondary:
      'bg-secondary text-white hover:bg-secondary-dark shadow-sm hover:shadow',
    cream:
      'bg-[#F3E1BE] text-[#2B2B2B] hover:bg-[#E8C782] shadow-sm',
    white:
      'bg-white text-primary hover:bg-[#FFFAF1] shadow-sm hover:shadow',
    outline:
      'bg-transparent border border-primary text-primary hover:bg-primary/10',
  };

  const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  const content = (
    <>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {arrow && <ArrowLeftCtaIcon className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-1" />}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`group ${combinedClasses}`}>
        {content}
      </Link>
    );
  }

  return (
    <button className={`group ${combinedClasses}`} {...rest}>
      {content}
    </button>
  );
}
