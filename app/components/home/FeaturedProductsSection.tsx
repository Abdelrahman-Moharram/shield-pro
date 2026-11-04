import { memo, useRef, useEffect, useState } from 'react';
import { product as productApi } from '@salla.sa/twilight-theme-engine/api/product';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { ProductCardItem, type ProductItem } from '../shared/cards/ProductCardItem';

const FEATURED_PRODUCTS_DATA: ProductItem[] = [
  {
    id: 1,
    title: 'فيلم عزل حراري — VLT 15%',
    description: 'فيلم عزل حراري متقدم يوفر مستوى مرتفعاً من الحماية وراحة أكبر داخل السيارة.',
    price: 400,
    originalPrice: 650,
    image: '/assets/theme/image_8.webp',
    url: '#products',
  },
  {
    id: 2,
    title: 'فيلم عزل حراري — VLT 35%',
    description: 'فيلم عزل حراري متقدم يوفر توازناً بين تقليل الحرارة والوضوح العالي للرؤية.',
    price: 500,
    image: '/assets/theme/image_8.webp',
    url: '#products',
  },
  {
    id: 3,
    title: 'فيلم حماية الطلاء — PPF لامع',
    description: 'حل متقدم لحماية طلاء السيارة من الخدوش والترمل وعوامل الجو القاسية.',
    price: 700,
    image: '/assets/theme/image_7.webp',
    url: '#products',
  },
  {
    id: 4,
    title: 'فيلم حماية الطلاء — PPF مطفي',
    description: 'فيلم حماية بمظهر مطفي فريد يحمي الطلاء الأصلي ويمنحه مظهراً رياضياً جذاباً.',
    price: 800,
    image: '/assets/theme/image_7.webp',
    url: '#products',
  },
];

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
  const sliderRef = useRef<HTMLDivElement>(null);
  const title = data?.title || 'منتجات مميزة';
  const viewAllUrl = data?.display_all_url || '#products';

  const [productsList, setProductsList] = useState<(Product | ProductItem)[]>(FEATURED_PRODUCTS_DATA);

  useEffect(() => {
    let isMounted = true;

    // Fetch dynamic products from Salla backend
    productApi
      .list({ source: 'latest', perPage: 8 })
      .then((res) => {
        if (isMounted && res?.items && res.items.length > 0) {
          setProductsList(res.items);
        }
      })
      .catch((err) => {
        // Fallback to static demo data during local preview or offline mode
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
              عرض الكل
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
