import { PrimaryButton, type ButtonVariant } from '../buttons/PrimaryButton';

export interface CategoryBannerCardProps {
  title: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  buttonHref: string;
  buttonVariant?: ButtonVariant;
  className?: string;
}

export function CategoryBannerCard({
  title,
  description,
  imageUrl,
  buttonText,
  buttonHref,
  buttonVariant = 'primary',
  className = '',
}: CategoryBannerCardProps) {
  return (
    <div
      className={`relative rounded-3xl overflow-hidden min-h-[380px] md:min-h-[460px] flex flex-col justify-end p-6 md:p-10 group shadow-sm transition-all duration-300 hover:shadow-lg ${className}`}
    >
      {/* Background Image */}
      <img
        src={imageUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        loading="lazy"
      />

      {/* Gradient Overlays for readable text */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-white max-w-md">
        <h3 className="text-2xl md:text-3xl font-extrabold mb-2 text-white">
          {title}
        </h3>
        <p className="text-xs md:text-sm text-gray-200 mb-5 leading-relaxed">
          {description}
        </p>
        <PrimaryButton
          href={buttonHref}
          variant={buttonVariant}
          arrow
          size="md"
        >
          {buttonText}
        </PrimaryButton>
      </div>
    </div>
  );
}
