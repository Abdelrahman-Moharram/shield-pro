import { memo } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';

export interface ServiceCard {
  id: string;
  titleKey: string;
  titleDefault: string;
  descKey: string;
  descDefault: string;
  btnKey: string;
  btnDefault: string;
  url: string;
  image: string;
  imagePosition?: string;
  buttonVariant: 'gold' | 'sand';
}

const SERVICES_DATA: ServiceCard[] = [
  {
    id: 'thermal-insulation',
    titleKey: 'blocks.home.services_thermal_title',
    titleDefault: 'العزل الحراري',
    descKey: 'blocks.home.services_thermal_desc',
    descDefault: 'تقليل الحرارة وحماية المقصورة من الأشعة الضارة.',
    btnKey: 'blocks.home.services_thermal_btn',
    btnDefault: 'استكشف أفلام العزل',
    url: '#products',
    image: '/assets/theme/image_6.webp',
    buttonVariant: 'gold',
  },
  {
    id: 'paint-protection',
    titleKey: 'blocks.home.services_ppf_title',
    titleDefault: 'حماية الطلاء',
    descKey: 'blocks.home.services_ppf_desc',
    descDefault: 'حماية طلاء السيارة من الخدوش والعوامل الخارجية.',
    btnKey: 'blocks.home.services_ppf_btn',
    btnDefault: 'استكشف أفلام حماية الطلاء',
    url: '#products',
    image: '/assets/theme/image_5.webp',
    imagePosition: 'object-[center_72%]',
    buttonVariant: 'sand',
  },
];

export interface ServicesSectionProps {
  data?: {
    title?: string;
    [key: string]: unknown;
  };
}

export const ServicesSection = memo(function ServicesSection({ data }: ServicesSectionProps) {
  const { t } = useTranslation();
  const sectionTitle = data?.title || t('blocks.home.services_title', 'ما الذي تحتاجه سيارتك؟');

  return (
    <section id="services" className="py-16 lg:py-24 bg-[#FFFDF9] dark:bg-[#1E1E1E] home-screen flex items-center scroll-mt-20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#363636] dark:text-white text-center mb-10 lg:mb-14 tracking-tight">
          {sectionTitle}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {SERVICES_DATA.map((card) => {
            const cardTitle = t(card.titleKey, card.titleDefault);
            const cardDesc = t(card.descKey, card.descDefault);
            const cardBtn = t(card.btnKey, card.btnDefault);
            return (
              <div
                key={card.id}
                className="group relative h-[380px] sm:h-[440px] lg:h-[480px] rounded-[28px] overflow-hidden shadow-lg transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl"
              >
                {/* Background Image with Hover Zoom */}
                <img
                  src={card.image}
                  alt={cardTitle}
                  className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${card.imagePosition ?? 'object-center'}`}
                  loading="lazy"
                />

                {/* Bottom Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Card Content */}
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10 flex flex-col items-start text-start z-10">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
                    {cardTitle}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-200/90 leading-relaxed mb-6 max-w-md">
                    {cardDesc}
                  </p>
                  <a
                    href={card.url}
                    className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 shadow-md group/btn ${
                      card.buttonVariant === 'gold'
                        ? 'bg-[#D89F2D] hover:bg-[#c58f25] text-neutral-900'
                        : 'bg-[#E5D7C3] hover:bg-[#d8c8b2] text-neutral-900'
                    }`}
                  >
                    <span>{cardBtn}</span>
                    <svg
                      className="w-4 h-4 transition-transform duration-300 rtl:group-hover/btn:-translate-x-1 ltr:group-hover/btn:translate-x-1"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10 3.5L5.5 8L10 12.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});

export default ServicesSection;
