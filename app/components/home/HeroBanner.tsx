import { PrimaryButton } from '../shared/buttons/PrimaryButton';

export interface HeroSlideData {
  title?: string;
  subtitle?: string;
  description?: string;
  btnname?: string;
  url?: string;
  image?: string;
}

export interface HeroBannerProps {
  data?: {
    slides?: HeroSlideData[];
    slider_banner?: HeroSlideData[];
    title?: string;
    description?: string;
    url?: string;
    btnname?: string;
    [key: string]: unknown;
  };
}

export function HeroBanner({ data }: HeroBannerProps) {
  const firstSlide = data?.slides?.[0] || data?.slider_banner?.[0];

  // Sanitize: filter out Salla default demo wireframe placeholders
  const isDemoImage =
    !firstSlide?.image ||
    firstSlide.image.includes('salla.sa') ||
    firstSlide.image.includes('MopzhoqpTkDObcKc') ||
    firstSlide.image.includes('3gOhYSaIhaHxhH2I') ||
    firstSlide.image.includes('placeholder');

  const carImage = isDemoImage
    ? '/assets/theme/hero_car_transparent.png'
    : firstSlide.image;

  const isDemoTitle =
    !firstSlide?.title ||
    firstSlide.title.includes('روِّج') ||
    firstSlide.title.includes('روّج') ||
    firstSlide.title.includes('شجّع');

  const title =
    !isDemoTitle && firstSlide?.title
      ? firstSlide.title
      : data?.title && !data.title.includes('روّج')
        ? data.title
        : 'حماية تدوم وراحة تستحقها سيارتك';

  const isDemoDesc =
    !firstSlide?.description ||
    firstSlide.description.includes('التي تود إبرازها') ||
    firstSlide.description.includes('اعرض المنتجات');

  const description =
    !isDemoDesc && firstSlide?.description
      ? firstSlide.description
      : data?.description && !data.description.includes('التي تود إبرازها')
        ? data.description
        : 'حلول متقدمة لعزل الحرارة وحماية طلاء سيارتك، مصممة لتمنحك راحة أكبر وتحافظ على مظهر سيارتك.';

  const buttonText =
    firstSlide?.btnname || data?.btnname || 'اكتشف منتجات الحماية';
  const buttonUrl = firstSlide?.url || data?.url || '#products';

  return (
    <section
      id="hero"
      dir="rtl"
      className="relative bg-secondary text-white overflow-hidden min-h-[580px] lg:min-h-[660px] flex items-center scroll-mt-20"
    >
      {/* Decorative Subtle Background Lightning Vector */}
      <div className="absolute inset-0 pointer-events-none opacity-20 select-none overflow-hidden">
        <svg
          viewBox="0 0 1440 747"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover"
        >
          <path
            d="M1293.41 -156.243C1298.63 -159.631 1314 -151.281 1312.69 -138.402C1306.57 -78.1601 1297.3 -18.0624 1288.88 42.0106L1244.69 359.433C1280.57 360.033 1555.77 356.065 1567.6 362.811C1569.54 363.914 1572 365.191 1572 366.381C1572 371.142 1566.38 376.808 1563.58 380.543C1542.96 408.083 1519.94 434.797 1498.14 461.755L1375.26 614.185C1240.59 781.003 1107.37 948.572 975.552 1116.87C972.016 1121.24 967.865 1124.21 961.195 1124.9C950.809 1125.96 944.222 1118.39 945.405 1110.54C948.173 1092.23 951.394 1073.95 954.402 1055.66L972.697 948.98"
            stroke="#D89F2D"
            strokeWidth="2.5"
          />
        </svg>
      </div>

      {/*
        Desktop Layout:
        - Car is pinned to the exact LEFT edge (left: 0) with ZERO gaps, reaching across to center.
        - Text is positioned on the right and shifted toward the center so the flying rocks are right beside it.
      */}
      <div
        className="hidden lg:flex absolute left-0 bottom-0 top-0 w-[54%] xl:w-[52%] 2xl:w-[50%] items-center justify-start pointer-events-none select-none z-10"
        dir="ltr"
      >
        <img
          src={carImage}
          alt="Shieldo Pro Protection Car"
          className="w-auto h-[92%] max-h-[640px] object-contain object-left drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]"
          loading="eager"
        />
      </div>

      <div className="w-full max-w-7xl mx-auto relative z-20 flex flex-col lg:flex-row items-center justify-start py-12 lg:py-16">
        {/* On desktop in dir="rtl", justify-start puts this column naturally on the RIGHT side */}
        <div className="w-full lg:w-[48%] xl:w-[45%] flex flex-col items-center lg:items-start text-center lg:text-right">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[50px] xl:text-[54px] font-extrabold text-white leading-[1.22] mb-5 tracking-tight">
            {title}
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed mb-8 max-w-lg">
            {description}
          </p>

          <div>
            <PrimaryButton
              href={buttonUrl}
              variant="primary"
              size="lg"
              className="text-base font-bold px-8 py-3.5 shadow-lg shadow-primary/20 hover:shadow-primary/40 rounded-xl"
            >
              {buttonText}
            </PrimaryButton>
          </div>
        </div>

        {/* Mobile Car Graphic (only shown on screens below lg) */}
        <div className="w-full mt-8 lg:hidden flex justify-center z-10" dir="ltr">
          <img
            src={carImage}
            alt="Shieldo Pro Protection Car"
            className="w-full max-w-lg object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
}
