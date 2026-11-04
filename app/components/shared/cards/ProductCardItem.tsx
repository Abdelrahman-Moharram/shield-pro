import { useState } from 'react';
import { RiyalIcon } from '../../icons';
import type { Product } from '@salla.sa/twilight-theme-engine/types';

export interface ProductItem {
  id: string | number;
  title: string;
  description: string;
  price: number | string;
  originalPrice?: number | string;
  image: string;
  url?: string;
  has_options?: boolean;
  category?: 'thermal' | 'ppf' | 'offers' | string;
  tintLevel?: string;
  trafficCompliant?: boolean;
  badge?: {
    text: string;
    type?: 'discount' | 'new' | 'featured';
  };
}

export interface ProductCardItemProps {
  product: Product | ProductItem;
  className?: string;
  [key: string]: unknown;
}

function isSallaProduct(product: Product | ProductItem): product is Product {
  return 'name' in product || 'regular_price' in product || 'is_on_sale' in product || 'main_image' in product;
}

export function ProductCardItem({ product, className = '' }: ProductCardItemProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Normalize data whether it's Salla backend Product or demo ProductItem
  const isSalla = isSallaProduct(product);

  const resolvedId = product.id;
  const resolvedTitle = isSalla ? product.name : product.title;
  const rawDesc = isSalla
    ? product.subtitle || (product.description ? product.description.replace(/<[^>]*>/g, '') : '')
    : product.description;
  const resolvedDesc = rawDesc || '';

  const isOnSale = Boolean(isSalla ? product.is_on_sale : product.originalPrice);
  const resolvedPrice = isSalla
    ? (isOnSale && product.sale_price ? product.sale_price : product.price)
    : product.price;
  const resolvedOriginalPrice = isSalla
    ? (isOnSale ? product.regular_price : undefined)
    : product.originalPrice;

  const resolvedImage = isSalla
    ? product.image?.url || (product as any).main_image || '/assets/theme/image_8.webp'
    : product.image;

  const resolvedUrl = isSalla
    ? product.url || `/product/${product.id}`
    : (product.url || '#products');

  const hasOptions = isSalla
    ? Boolean((product.options && product.options.length > 0) || product.type === 'service')
    : Boolean(product.has_options);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAdding) return;

    // If product has options/variants, direct to product details page so user selects options/variants
    if (hasOptions && resolvedUrl && resolvedUrl !== '#products') {
      window.location.href = resolvedUrl;
      return;
    }

    // Call Salla SDK cart API
    if (typeof window !== 'undefined' && window.salla?.cart?.addItem) {
      setIsAdding(true);
      try {
        await window.salla.cart.addItem(Number(resolvedId), 1);
        setIsSuccess(true);
        window.setTimeout(() => setIsSuccess(false), 2000);
      } catch (error) {
        console.error('Failed to add to cart:', error);
        if (resolvedUrl && resolvedUrl !== '#products') {
          window.location.href = resolvedUrl;
        }
      } finally {
        setIsAdding(false);
      }
    } else {
      // Offline / Preview fallback
      setIsAdding(true);
      window.setTimeout(() => {
        setIsAdding(false);
        setIsSuccess(true);
        window.setTimeout(() => setIsSuccess(false), 2000);
      }, 400);
    }
  };

  return (
    <div
      data-testid="product-card"
      className={`group relative bg-white dark:bg-[#252525] rounded-2xl p-3.5 sm:p-4 border border-gray-100 dark:border-neutral-800 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between h-full text-right ${className}`}
      dir="rtl"
    >
      {/* Product Image */}
      <a
        href={resolvedUrl}
        className="block rounded-xl overflow-hidden relative aspect-[16/10] mb-3.5 bg-gray-50 dark:bg-neutral-800"
      >
        <img
          src={resolvedImage}
          alt={resolvedTitle}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
        {/* Custom Badges matching Shieldo Pro Figma design */}
        {(() => {
          const customBadge = !isSalla ? (product as ProductItem).badge : undefined;
          if (customBadge) {
            const badgeClasses =
              customBadge.type === 'discount'
                ? 'bg-[#E53E3E] text-white'
                : customBadge.type === 'new'
                  ? 'bg-[#2B6CB0] text-white'
                  : 'bg-[#D89F2D] text-neutral-900';
            return (
              <span className={`absolute top-2.5 right-2.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 ${badgeClasses}`}>
                {customBadge.type === 'discount' && (
                  <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M2 2a1 1 0 011-1h4.586a1 1 0 01.707.293l6.414 6.414a1 1 0 010 1.414l-4.586 4.586a1 1 0 01-1.414 0L2.293 8.707A1 1 0 012 8V2zm3 2a1 1 0 100 2 1 1 0 000-2z" />
                  </svg>
                )}
                {customBadge.text}
              </span>
            );
          }

          if (resolvedOriginalPrice) {
            return (
              <span className="absolute top-2.5 right-2.5 bg-[#E53E3E] text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2 2a1 1 0 011-1h4.586a1 1 0 01.707.293l6.414 6.414a1 1 0 010 1.414l-4.586 4.586a1 1 0 01-1.414 0L2.293 8.707A1 1 0 012 8V2zm3 2a1 1 0 100 2 1 1 0 000-2z" />
                </svg>
                خصم
              </span>
            );
          }
          return null;
        })()}
      </a>

      {/* Details */}
      <div className="flex-1 flex flex-col">
        <a href={resolvedUrl} className="block">
          <h3 className="font-extrabold text-[#2A2A2A] dark:text-white text-base sm:text-lg mb-1.5 leading-snug hover:text-[#D89F2D] transition-colors">
            {resolvedTitle}
          </h3>
        </a>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4 line-clamp-2">
          {resolvedDesc}
        </p>
      </div>

      {/* Price & Action Button */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-neutral-800 mt-auto">
        <div className="flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-black text-[#2A2A2A] dark:text-white flex items-center gap-1">
            {resolvedPrice}
            <RiyalIcon className="w-4 h-4.5 text-[#2A2A2A] dark:text-white inline-block" />
          </span>
          {resolvedOriginalPrice && (
            <span className="text-xs sm:text-sm text-gray-400 line-through flex items-center gap-0.5">
              {resolvedOriginalPrice}
              <RiyalIcon className="w-3 h-3 text-gray-400 inline-block" />
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isAdding}
          aria-label={isSuccess ? 'تمت الإضافة' : 'أضف للسلة'}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95 shadow-sm ${
            isSuccess
              ? 'bg-emerald-600 text-white'
              : 'bg-[#D89F2D] hover:bg-[#c58f25] text-neutral-900'
          }`}
          title={hasOptions ? 'اختر المواصفات' : 'أضف إلى السلة'}
        >
          {isAdding ? (
            <svg className="w-4 h-4 animate-spin text-neutral-900" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : isSuccess ? (
            <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export default ProductCardItem;
