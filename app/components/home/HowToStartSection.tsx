import { memo } from 'react';

export interface StepItem {
  id: number | string;
  number: number | string;
  title: string;
  description: string;
}

// 1. Isolated data defined above the component
const STEPS_DATA: StepItem[] = [
  {
    id: 1,
    number: '1',
    title: 'اختر الحل',
    description: 'حدد نوع الحماية التي تحتاجها.',
  },
  {
    id: 2,
    number: '2',
    title: 'اختر المنتج',
    description: 'قارن المنتجات واختر ما يناسب احتياجك.',
  },
  {
    id: 3,
    number: '3',
    title: 'أكمل طلبك',
    description: 'أضف المنتج إلى السلة وأكمل للدفع.',
  },
  {
    id: 4,
    number: '4',
    title: 'استلم منتجك',
    description: 'استلم طلبك وفق خيارات التوصيل المتاحة.',
  },
];

// 2. Sub-card component created inside the file
function StepCard({ step }: { step: StepItem }) {
  return (
    <div
      className="relative rounded-2xl p-5 pt-8 sm:p-6 sm:pt-9 min-h-[140px] sm:min-h-[150px] flex flex-col justify-end text-right transition-transform duration-300 hover:-translate-y-1 shadow-[0_4px_20px_rgba(0,0,0,0.035)] overflow-hidden"
      style={{ backgroundColor: '#FBF5EA' }}
    >
      {/* Top right cutout notch */}
      <svg
        className="absolute top-0 right-0 w-12 h-10 sm:w-14 sm:h-11 pointer-events-none text-white fill-current"
        viewBox="0 0 52 42"
        preserveAspectRatio="none"
      >
        <path d="M0 0C14 0 20 8 20 20C20 32 28 42 42 42H52V0H0Z" />
      </svg>

      {/* Step number in the top-right notch */}
      <span className="absolute top-1 right-3 sm:top-1.5 sm:right-3.5 text-xl sm:text-2xl font-black text-[#D89F2D] select-none">
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
    items?: StepItem[];
    [key: string]: unknown;
  };
}

// 3. Main component looping over the data
export const HowToStartSection = memo(function HowToStartSection({ data }: HowToStartProps) {
  const title = (data?.title as string) || 'كيف تبدأ ؟';
  const steps = (data?.items as StepItem[]) || STEPS_DATA;

  return (
    <section id="how-it-works" dir="rtl" className="w-full py-10 sm:py-14 lg:py-16 bg-white scroll-mt-20 relative">
      <span id="how-to-start" className="absolute -top-20 pointer-events-none" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-neutral-900 mb-8 sm:mb-12 tracking-tight">
          {title}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {steps.map((step) => (
            <StepCard key={step.id} step={step} />
          ))}
        </div>
      </div>
    </section>
  );
});

export default HowToStartSection;
