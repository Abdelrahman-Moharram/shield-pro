import type { ReactNode } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { ScrollCarousel, type ScrollCarouselProps } from '../../common/ScrollCarousel';

export interface SharedCarouselProps extends ScrollCarouselProps {
  title?: string;
  subtitle?: string;
  actionText?: string;
  actionHref?: string;
  children: ReactNode;
}

export function SharedCarousel({
  title,
  subtitle,
  actionText,
  actionHref,
  children,
  prevLabel,
  nextLabel,
  autoPlay = false,
  className = '',
}: SharedCarouselProps) {
  const { t } = useTranslation();
  const resolvedPrev = prevLabel ?? t('common.elements.prev', 'السابق');
  const resolvedNext = nextLabel ?? t('common.elements.next', 'التالي');

  return (
    <div className="w-full">
      {(title || actionText) && (
        <div className="flex items-end justify-between mb-8">
          <div>
            {title && (
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#2B2B2B]">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-[#7D7D7D] mt-1">{subtitle}</p>
            )}
          </div>
          {actionText && actionHref && (
            <a
              href={actionHref}
              className="text-primary hover:text-primary-hover font-bold text-sm transition-colors"
            >
              {actionText}
            </a>
          )}
        </div>
      )}

      <ScrollCarousel
        prevLabel={resolvedPrev}
        nextLabel={resolvedNext}
        autoPlay={autoPlay}
        className={className}
      >
        {children}
      </ScrollCarousel>
    </div>
  );
}
