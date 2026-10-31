import { memo } from 'react';

export interface InstallationCentersData {
  title: string;
  descriptionPrefix: string;
  brandHighlight: string;
  buttonText: string;
  buttonUrl: string;
  bgImage: string;
}

// 1. Isolated section data defined above the component
const DEFAULT_DATA: InstallationCentersData = {
  title: 'مراكز تركيب معتمدة',
  descriptionPrefix: 'يمكنك الوصول إلى مراكز التركيب المعتمدة لتركيب منتجات',
  brandHighlight: 'شيلدو بــــرو',
  buttonText: 'عرض مراكز التركيب',
  buttonUrl: '#installers',
  bgImage: '/assets/theme/image_9.png',
};

export interface InstallationCentersSectionProps {
  data?: Partial<InstallationCentersData> & {
    btnname?: string;
    url?: string;
    image?: string;
    [key: string]: unknown;
  };
}

export const InstallationCentersSection = memo(function InstallationCentersSection({
  data,
}: InstallationCentersSectionProps) {
  const content = {
    title: (data?.title as string) || DEFAULT_DATA.title,
    descriptionPrefix: (data?.descriptionPrefix as string) || DEFAULT_DATA.descriptionPrefix,
    brandHighlight: (data?.brandHighlight as string) || DEFAULT_DATA.brandHighlight,
    buttonText: (data?.btnname as string) || (data?.buttonText as string) || DEFAULT_DATA.buttonText,
    buttonUrl: (data?.url as string) || (data?.buttonUrl as string) || DEFAULT_DATA.buttonUrl,
    bgImage: (data?.bgImage as string) || (data?.image as string) || DEFAULT_DATA.bgImage,
  };

  return (
    <section
      id="centers"
      dir="rtl"
      className="relative w-full overflow-hidden py-16 sm:py-24 lg:py-32 bg-neutral-900 bg-center bg-cover flex items-center justify-center text-center scroll-mt-20"
      style={{
        backgroundImage: `url(${content.bgImage})`,
      }}
    >
      <span id="installers" className="absolute -top-20 pointer-events-none" aria-hidden="true" />
      <span id="installation-centers" className="absolute -top-20 pointer-events-none" aria-hidden="true" />

      {/* Dark overlay for optimal text contrast */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />

      {/* Decorative Golden Outline Contour on the left */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-44 sm:w-60 md:w-72 lg:w-80 max-h-[90%] pointer-events-none select-none flex items-center justify-start z-[1]"
        aria-hidden="true"
      >
        <img
          src="/assets/theme/bg_lightning_contour.svg"
          alt=""
          className="w-full h-auto object-contain opacity-70"
          loading="lazy"
        />
      </div>

      {/* Centered Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* Title */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3.5 sm:mb-4 tracking-tight leading-tight">
          {content.title}
        </h2>

        {/* Subtitle with Brand Highlight */}
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-200/95 font-medium mb-6 sm:mb-8 leading-relaxed max-w-2xl">
          {content.descriptionPrefix}{' '}
          <span className="text-[#D89F2D] font-bold">{content.brandHighlight}</span>
        </p>

        {/* Action Button */}
        <div>
          <a
            href={content.buttonUrl}
            className="inline-flex items-center justify-center px-8 sm:px-10 py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base bg-[#D89F2D] hover:bg-[#c48f24] text-neutral-900 transition-all duration-300 shadow-xl shadow-black/25 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0"
          >
            {content.buttonText}
          </a>
        </div>
      </div>
    </section>
  );
});

export default InstallationCentersSection;
