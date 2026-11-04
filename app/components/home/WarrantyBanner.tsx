import { memo } from 'react';

export interface WarrantyBannerData {
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  image: string;
}

// 1. Isolated section data defined above the component
const DEFAULT_DATA: WarrantyBannerData = {
  title: 'ضمان منتجك',
  description: 'فعّل ضمان منتجك باستخدام الرقم التسلسلي الموجود على المنتج.',
  buttonText: 'تفعيل الضمان',
  buttonUrl: '#warranty',
  image: '/assets/theme/warranty_shield_3d.webp',
};

export interface WarrantyBannerProps {
  data?: Partial<WarrantyBannerData> & {
    btnname?: string;
    url?: string;
    [key: string]: unknown;
  };
}

export const WarrantyBanner = memo(function WarrantyBanner({ data }: WarrantyBannerProps) {
  const content = {
    title: (data?.title as string) || DEFAULT_DATA.title,
    description: (data?.description as string) || DEFAULT_DATA.description,
    buttonText: (data?.btnname as string) || (data?.buttonText as string) || DEFAULT_DATA.buttonText,
    buttonUrl: (data?.url as string) || (data?.buttonUrl as string) || DEFAULT_DATA.buttonUrl,
    image: (data?.image as string) || DEFAULT_DATA.image,
  };

  return (
    <section id="warranty" className="w-full py-12 sm:py-16 lg:py-20 overflow-visible scroll-mt-20 relative">
      <span id="warranty-banner" className="absolute -top-20 pointer-events-none" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl border border-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 overflow-visible"
          style={{
            backgroundColor: '#AF7E20',
            backgroundImage: 'linear-gradient(135deg, #94640F 0%, #BA8522 45%, #94640F 100%)',
          }}
        >
          {/* Right side (Desktop): 3D Shield + Text */}
          <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 lg:gap-8 text-center md:text-start z-10">
            {/* 3D Golden Shield Badge (protrudes past the top and bottom on desktop / top on mobile) */}
            <div className="shrink-0 -mt-16 sm:-mt-20 md:my-[-40px] lg:my-[-50px] pointer-events-none select-none">
              <img
                src={content.image}
                alt={content.title}
                className="w-28 sm:w-36 md:w-40 lg:w-48 h-auto object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.35)]"
                loading="lazy"
              />
            </div>

            {/* Text Content */}
            <div className="max-w-xl">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-2 sm:mb-2.5 tracking-tight leading-tight drop-shadow-sm">
                {content.title}
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-amber-50/90 leading-relaxed font-normal">
                {content.description}
              </p>
            </div>
          </div>

          {/* Left side: White CTA Button */}
          <div className="z-10 shrink-0">
            <a
              href={content.buttonUrl}
              className="inline-flex items-center justify-center px-8 sm:px-9 py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base bg-white hover:bg-amber-50/95 text-[#A77317] transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              {content.buttonText}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
});

export default WarrantyBanner;
