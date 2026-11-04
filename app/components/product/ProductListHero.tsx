import { memo } from 'react';

export interface ProductListHeroProps {
  onExploreClick?: () => void;
}

export const ProductListHero = memo(function ProductListHero({ onExploreClick }: ProductListHeroProps) {
  const handleScroll = () => {
    if (onExploreClick) {
      onExploreClick();
      return;
    }
    const target = document.getElementById('catalog-content');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      dir="rtl"
      className="relative bg-secondary text-white overflow-hidden py-10 lg:py-16 mb-8 lg:mb-12 rounded-b-[32px] lg:rounded-b-[48px] shadow-lg"
    >
      {/* Decorative Subtle Lightning Background Vector */}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 text-center lg:text-right flex flex-col items-center lg:items-start">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
              منتجات <span className="text-[#D89F2D]">شيلدو بــــرو</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-300 max-w-xl mb-8 leading-relaxed font-normal">
              اكتشف حلولنا المتقدمة لعزل الحرارة وحماية طلاء سيارتك، مصممة لتوفر أعلى أداء ومظهر فاخر يدوم.
            </p>
            <button
              type="button"
              onClick={handleScroll}
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-black text-sm sm:text-base bg-[#D89F2D] text-neutral-900 hover:bg-[#c58f25] active:scale-95 transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              اكتشف منتجاتنا
            </button>
          </div>

          {/* 3D Graphic (Car on Pedestal with Rolls, Shield, and Badges) */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-[380px] sm:max-w-[460px] lg:max-w-[520px]">
              <img
                src="/assets/theme/products_hero_3d.webp"
                alt="منتجات شيلدو برو - حماية وعزل السيارات"
                className="w-full h-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.5)] transition-transform duration-700 hover:scale-105"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default ProductListHero;
