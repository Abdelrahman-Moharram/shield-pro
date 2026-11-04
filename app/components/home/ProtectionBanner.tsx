import { memo } from 'react';

export interface ProtectionBannerItem {
  id: string | number;
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  image: string;
}

const BANNER_ITEMS = {
  id            : 'invisible-shield-banner',
  title         : 'درع غير مرئي لطلاء سيارتك',
  description   : 'حماية متقدمة تساعد على الحفاظ على مظهر الطلاء ومقاومته للخدوش والعوامل الخارجية.',
  buttonText    : 'اكتشف أفلام حماية الطلاء',
  buttonUrl     : '#products',
  image         : '/assets/theme/shield_banner_3d.webp',
}
export interface ProtectionBannerProps {
  data?: {
    title?: string;
    description?: string;
    btnname?: string;
    url?: string;
    image?: string;
    [key: string]: unknown;
  };
}

export const ProtectionBanner = memo(function ProtectionBanner({ data }: ProtectionBannerProps) {
  const item = {
    title: (data?.title as string) || BANNER_ITEMS?.title,
    description: (data?.description as string) || BANNER_ITEMS?.description,
    buttonText: (data?.btnname as string) || BANNER_ITEMS?.buttonText,
    buttonUrl: (data?.url as string) || BANNER_ITEMS?.buttonUrl,
    image: (data?.image as string) || BANNER_ITEMS?.image,
  };

  return (
    <section
      id="protection-banner"
      className="w-full py-10 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Always a row: text on the right, image on the left (RTL) */}
        <div
          className="
            relative isolate flex flex-row items-center justify-between
            gap-3 sm:gap-6 lg:gap-12
            rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl
            px-4 py-5 sm:px-8 sm:py-8 lg:px-14 lg:py-12
            min-h-[260px] lg:min-h-[290px] max-h-[350px] overflow-visible
          "
          style={{
            backgroundColor: '#6B6965',
            backgroundImage:
              'linear-gradient(135deg, #4A4846 0%, #6B6965 50%, #454442 100%)',
          }}
        >
          {/* Clipped glow so it stays inside the rounded card */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]"
          >
            <div className="absolute start-[10%] top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-[#D89F2D]/25 blur-3xl sm:h-72 sm:w-72 lg:h-96 lg:w-96" />
          </div>
 
          {/* Text (right side in RTL) */}
          <div className="flex min-w-0 flex-1 flex-col items-start text-start">
            <h2 className="mb-2 text-xl font-extrabold leading-snug tracking-tight text-white sm:mb-3 sm:text-3xl lg:mb-4 lg:text-4xl xl:text-[2.6rem]">
              {item.title}
            </h2>
            <p className="mb-4 max-w-xl text-xs leading-relaxed text-gray-100/90 sm:mb-6 sm:text-base lg:mb-8 lg:text-lg">
              {item.description}
            </p>
            <a
              href={item.buttonUrl}
              className="
                inline-flex items-center justify-center whitespace-nowrap
                rounded-lg bg-[#D89F2D] px-5 py-2.5 text-xs font-bold text-neutral-900
                sm:rounded-xl sm:px-8 sm:py-3.5 sm:text-base
                shadow-lg shadow-black/20 transition duration-300
                hover:-translate-y-0.5 hover:bg-[#c58f25] hover:shadow-xl
                active:translate-y-0
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#4A4846]
                motion-reduce:transition-none motion-reduce:hover:translate-y-0
              "
            >
              {item.buttonText}
            </a>
          </div>
 
          {/* Image (left side in RTL). Breaks out of the card top & bottom */}
          <div className="relative w-[36%] max-w-[130px] sm:max-w-[375px] lg:max-w-[430px] xl:max-w-[480px]">
            <img
              src={item.image}
              alt={item.title}
              loading="lazy"
              className="h-auto w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.45)] lg:drop-shadow-[0_20px_35px_rgba(0,0,0,0.45)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
});

export default ProtectionBanner;
