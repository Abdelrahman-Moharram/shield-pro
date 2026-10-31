import type { HTMLAttributes, ReactNode } from 'react';

export interface BaseCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'white' | 'warm' | 'dark' | 'outline';
  hoverEffect?: boolean;
  className?: string;
}

export function BaseCard({
  children,
  variant = 'white',
  hoverEffect = true,
  className = '',
  ...props
}: BaseCardProps) {
  const baseClasses =
    'relative rounded-2xl overflow-hidden transition-all duration-300';

  const variantClasses = {
    white: 'bg-white border border-[#E8E4DB] text-[#2B2B2B] shadow-sm',
    warm: 'bg-[#FFFAF1] border border-[#F3E1BE]/60 text-[#2B2B2B]',
    dark: 'bg-[#363636] border border-white/10 text-white shadow-md',
    outline: 'bg-transparent border border-[#E8E4DB] text-[#2B2B2B]',
  };

  const hoverClasses = hoverEffect
    ? 'hover:-translate-y-1 hover:shadow-md'
    : '';

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
