import type { ComponentType, SVGProps } from 'react';

export interface FeatureItem {
  id: string | number;
  title: string;
  description: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export interface FeatureCardItemProps {
  feature: FeatureItem;
}

export function FeatureCardItem({ feature }: FeatureCardItemProps) {
  const { Icon, title, description } = feature;
  return (
    <div className="group flex flex-col items-start text-right transition-all duration-300 p-4 sm:p-5 rounded-2xl hover:bg-white/70 dark:hover:bg-white/5 hover:shadow-[0_8px_25px_rgba(216,159,45,0.1)] hover:-translate-y-1">
      {/* Icon with hover bounce */}
      <div className="mb-4 text-[#D89F2D] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
        <Icon className="w-12 h-12" />
      </div>

      {/* Title */}
      <h3 className="font-extrabold text-[#2A2A2A] dark:text-white text-lg sm:text-xl mb-2 tracking-tight">
        {title}
      </h3>

      {/* Description */}
      <p className="text-xs sm:text-sm text-[#666666] dark:text-gray-400 leading-relaxed font-normal">
        {description}
      </p>
    </div>
  );
}

export default FeatureCardItem;
