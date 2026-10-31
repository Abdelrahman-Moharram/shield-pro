export interface StepCardProps {
  stepNumber: number | string;
  title: string;
  description: string;
  className?: string;
}

export function StepCard({ stepNumber, title, description, className = '' }: StepCardProps) {
  return (
    <div
      className={`relative bg-[#FFFDF9] border border-[#E8E4DB] rounded-2xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300 hover:border-primary/50 hover:shadow-sm ${className}`}
    >
      <div className="flex items-start justify-between mb-6">
        <span className="text-3xl md:text-4xl font-extrabold text-primary font-sans select-none">
          {stepNumber}
        </span>
      </div>

      <div>
        <h4 className="text-base md:text-lg font-bold text-[#2B2B2B] mb-2">
          {title}
        </h4>
        <p className="text-xs md:text-sm text-[#7D7D7D] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
