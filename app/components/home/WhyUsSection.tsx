import { memo } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import {
  FeatureChipIcon,
  FeatureShieldIcon,
  FeatureSpeedIcon,
  FeatureMedalIcon,
} from '../icons';
import { FeatureCardItem } from '../shared/cards/FeatureCardItem';

const WHY_US_FEATURES = [
  {
    id: 1,
    titleKey: 'blocks.home.why_us_f1_title',
    titleDefault: 'تقنية متقدمة',
    descKey: 'blocks.home.why_us_f1_desc',
    descDefault: 'حلول هندسية مبتكرة بأحدث التقنيات لضمان أداء عالٍ وجمالية مثالية.',
    Icon: FeatureChipIcon,
  },
  {
    id: 2,
    titleKey: 'blocks.home.why_us_f2_title',
    titleDefault: 'حماية موثوقة',
    descKey: 'blocks.home.why_us_f2_desc',
    descDefault: 'ضمان الجودة العالية في كل منتج لتحمي سيارتك بثقة وموثوقية.',
    Icon: FeatureShieldIcon,
  },
  {
    id: 3,
    titleKey: 'blocks.home.why_us_f3_title',
    titleDefault: 'أداء طويل الأمد',
    descKey: 'blocks.home.why_us_f3_desc',
    descDefault: 'نتائج تدوم لسنوات بفضل اختبارات دقيقة ومعايير أداء صارمة.',
    Icon: FeatureSpeedIcon,
  },
  {
    id: 4,
    titleKey: 'blocks.home.why_us_f4_title',
    titleDefault: 'ضمان للمنتج',
    descKey: 'blocks.home.why_us_f4_desc',
    descDefault: 'راحة بال كاملة مع ضمان موثوق يدعمك ويحمي استثمارك.',
    Icon: FeatureMedalIcon,
  },
];

export interface WhyUsSectionProps {
  data?: {
    title?: string;
    [key: string]: unknown;
  };
}

export const WhyUsSection = memo(function WhyUsSection({ data }: WhyUsSectionProps) {
  const { t } = useTranslation();
  return (
    <section
      id="why-us"
      className="relative overflow-hidden py-16 sm:py-20 lg:py-24 bg-[#FBF5EA] dark:bg-[#1A1A1A] w-full scroll-mt-20"
    >
      {/* Decorative Background Lightning Vector */}
      <div className="absolute left-[-2%] bottom-[-10%] top-0 w-[40%] max-w-[450px] pointer-events-none select-none opacity-[0.06] dark:opacity-[0.04] text-[#D89F2D] flex items-center justify-start" dir="ltr">
        <svg viewBox="0 0 154 180" fill="currentColor" className="w-full h-full object-contain">
          <path d="M77 0C77.54 0.04 82.68 3.42 83.63 3.98C89.65 7.57 96 10.63 102.6 13.12C114.04 17.5 125.6 20.05 137.75 21.58C140.2 21.9 142.65 22.14 145.11 22.3C148.15 22.5 152.8 22.05 153.33 25.91C153.57 27.65 153.66 29.43 153.78 31.19C154.06 35.42 154.25 39.66 154.34 43.9C155.09 77.58 147.74 110.55 128.62 139.02C117.44 155.6 103.04 169.91 86.22 181.16C84.21 182.51 79.43 185.83 77.22 186.28L77.12 186.27C74.88 186.11 69.8 182.43 67.8 181.08C50.41 169.41 35.58 154.53 24.14 137.33L23.87 136.92C9.82 115.22 2.32 91.41 0.18 65.97L0.13 65.37C-0.37 59.13 -0.49 52.9 0.49 46.64C0.61 41.62 0.9 36.58 1.22 31.57C1.34 29.72 1.3 27.59 1.73 25.77L1.77 25.6C1.78 25.56 1.79 25.53 1.8 25.49L1.83 25.39C2.14 24.34 2.81 23.51 3.83 23.03C5.3 22.34 11.33 22.2 13.23 22.03C30.79 20.45 48.58 15.95 64.24 7.99L64.61 7.8C69.25 5.42 73.54 2.64 77 0Z" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Section Heading */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2A2A2A] dark:text-white tracking-tight mb-12 sm:mb-16 text-start">
          {t('blocks.home.why_us_heading_prefix', 'لماذا')} <span className="text-[#D89F2D]">{t('blocks.home.why_us_heading_suffix', 'شيلدو بــــرو ؟')}</span>
        </h2>

        {/* 4 Feature Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
          {WHY_US_FEATURES.map((feature) => (
            <FeatureCardItem
              key={feature.id}
              feature={{
                id: feature.id,
                Icon: feature.Icon,
                title: t(feature.titleKey, feature.titleDefault),
                description: t(feature.descKey, feature.descDefault),
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
});

export default WhyUsSection;
