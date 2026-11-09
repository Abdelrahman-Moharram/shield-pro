import { memo, useRef, useEffect, useState } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { product as productApi } from '@salla.sa/twilight-theme-engine/api/product';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { ProductCardItem } from '../shared/cards/ProductCardItem';

export interface FeaturedProductsSectionProps {
  data?: {
    title?: string;
    display_all_url?: string;
    [key: string]: unknown;
  };
}

export const FeaturedProductsSection = memo(function FeaturedProductsSection({
  data,
}: FeaturedProductsSectionProps) {
  const { t } = useTranslation();
  const sliderRef = useRef<HTMLDivElement>(null);
  const title = data?.title || t('blocks.home.featured_products_title', 'منتجات مميزة');
  const viewAllUrl = data?.display_all_url || '#products';

  const [productsList, setProductsList] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Fetch dynamic products from Salla backend
    productApi
      .list({ source: 'latest', perPage: 8 })
      .then((res) => {
        if (isMounted) {
          if (res?.items && res.items.length > 0) {
            setProductsList(res.items);
          }
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setIsLoading(false);
        }
        console.warn('Salla products API:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const scroll = (direction: 'next' | 'prev') => {
    if (!sliderRef.current) return;
    const cardWidth = 320;
    const offset = direction === 'next' ? -cardWidth : cardWidth;
    sliderRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <section
        id="products"
        data-testid="featured-products-skeleton"
        className="py-14 lg:py-20 bg-[#FFFDF9] dark:bg-[#1E1E1E] home-screen scroll-mt-20 min-h-[400px]"
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 dark:bg-neutral-800 rounded mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-gray-200 dark:bg-neutral-800" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (productsList.length === 0) return null;

  return (
    <section id="products" className="py-14 lg:py-20 bg-[#FFFDF9] dark:bg-[#1E1E1E] home-screen flex items-center scroll-mt-20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#363636] dark:text-white tracking-tight">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={viewAllUrl}
              className="text-sm sm:text-base font-bold text-[#D89F2D] hover:underline"
            >
              {t('blocks.home.featured_products_view_all', 'عرض الكل')}
            </a>

            {/* Navigation Arrows */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scroll('prev')}
                aria-label="Previous"
                className="w-8 h-8 rounded-full border border-gray-200 dark:border-neutral-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:border-[#D89F2D] hover:text-[#D89F2D] transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                  <path d="M6 3.5L10.5 8L6 12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => scroll('next')}
                aria-label="Next"
                className="w-8 h-8 rounded-full border border-gray-200 dark:border-neutral-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:border-[#D89F2D] hover:text-[#D89F2D] transition-colors"
              >
                <svg className="w-4 h-4 rotate-180" viewBox="0 0 16 16" fill="none">
                  <path d="M6 3.5L10.5 8L6 12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Carousel / Swiper Track */}
        <div
          ref={sliderRef}
          className="flex gap-5 sm:gap-6 overflow-x-auto scroll-smooth pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {productsList.map((product) => (
            <div
              key={product.id}
              className="flex-none w-[270px] sm:w-[285px] lg:w-[calc(25%-18px)]"
              style={{ scrollSnapAlign: 'start' }}
            >
              <ProductCardItem product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default FeaturedProductsSection;
