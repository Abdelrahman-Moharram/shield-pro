import type { ReactNode } from 'react';

export interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({ icon, title, description, className = '' }: FeatureCardProps) {
  return (
    <div
      className={`flex flex-col items-center text-center p-6 transition-all duration-300 hover:-translate-y-1 ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
        {icon}
      </div>
      <h3 className="text-lg md:text-xl font-bold text-[#2B2B2B] mb-2">
        {title}
      </h3>
      <p className="text-xs md:text-sm text-[#7D7D7D] leading-relaxed max-w-xs">
        {description}
      </p>
    </div>
  );
}
