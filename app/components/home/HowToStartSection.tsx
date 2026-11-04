import { memo } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';

export interface StepItem {
  id: number | string;
  number: number | string;
  titleKey: string;
  titleDefault: string;
  descKey: string;
  descDefault: string;
}

// 1. Isolated data defined above the component
const STEPS_DATA: StepItem[] = [
  {
    id: 1,
    number: '1',
    titleKey: 'blocks.home.how_to_start_s1_title',
    titleDefault: 'اختر الحل',
    descKey: 'blocks.home.how_to_start_s1_desc',
    descDefault: 'حدد نوع الحماية التي تحتاجها.',
  },
  {
    id: 2,
    number: '2',
    titleKey: 'blocks.home.how_to_start_s2_title',
    titleDefault: 'اختر المنتج',
    descKey: 'blocks.home.how_to_start_s2_desc',
    descDefault: 'قارن المنتجات واختر ما يناسب احتياجك.',
  },
  {
    id: 3,
    number: '3',
    titleKey: 'blocks.home.how_to_start_s3_title',
    titleDefault: 'أكمل طلبك',
    descKey: 'blocks.home.how_to_start_s3_desc',
    descDefault: 'أضف المنتج إلى السلة وأكمل للدفع.',
  },
  {
    id: 4,
    number: '4',
    titleKey: 'blocks.home.how_to_start_s4_title',
    titleDefault: 'استلم منتجك',
    descKey: 'blocks.home.how_to_start_s4_desc',
    descDefault: 'استلم طلبك وفق خيارات التوصيل المتاحة.',
  },
];

// 2. Sub-card component created inside the file
function StepCard({ step }: { step: { id: number | string; number: number | string; title: string; description: string } }) {
  return (
    <div
      className="relative rounded-2xl p-5 pt-8 sm:p-6 sm:pt-9 min-h-[140px] sm:min-h-[150px] flex flex-col justify-end text-start transition-transform duration-300 hover:-translate-y-1 shadow-[0_4px_20px_rgba(0,0,0,0.035)] overflow-hidden"
      style={{ backgroundColor: '#FBF5EA' }}
    >
      {/* Top right cutout notch */}
      <svg
        className="absolute top-0 start-0 w-12 ltr:-scale-x-100 h-10 sm:w-14 sm:h-11 pointer-events-none text-white fill-current"
        viewBox="0 0 52 42"
        preserveAspectRatio="none"
      >
        <path d="M0 0C14 0 20 8 20 20C20 32 28 42 42 42H52V0H0Z" />
      </svg>

      {/* Step number in the top-right notch */}
      <span className="absolute top-1 start-3 sm:top-1.5 sm:start-3.5 text-xl sm:text-2xl font-black text-[#D89F2D] select-none">
        {step.number}
      </span>

      {/* Card text content */}
      <div className="z-10 mt-auto">
        <h3 className="text-base sm:text-lg font-bold text-[#D89F2D] mb-1.5 leading-snug">
          {step.title}
        </h3>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
          {step.description}
        </p>
      </div>
    </div>
  );
}

export interface HowToStartProps {
  data?: {
    title?: string;
    items?: Array<{ id: number | string; number: number | string; title: string; description: string }>;
    [key: string]: unknown;
  };
}

// 3. Main component looping over the data
export const HowToStartSection = memo(function HowToStartSection({ data }: HowToStartProps) {
  const { t } = useTranslation();
  const title = (data?.title as string) || t('blocks.home.how_to_start_title', 'كيف تبدأ ؟');

  return (
    <section id="how-it-works" className="w-full py-10 sm:py-14 lg:py-16 bg-white scroll-mt-20 relative">
      <span id="how-to-start" className="absolute -top-20 pointer-events-none" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-neutral-900 mb-8 sm:mb-12 tracking-tight">
          {title}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {data?.items
            ? data.items.map((step) => <StepCard key={step.id} step={step} />)
            : STEPS_DATA.map((step) => (
                <StepCard
                  key={step.id}
                  step={{
                    id: step.id,
                    number: step.number,
                    title: t(step.titleKey, step.titleDefault),
                    description: t(step.descKey, step.descDefault),
                  }}
                />
              ))}
        </div>
      </div>
    </section>
  );
});

export default HowToStartSection;
