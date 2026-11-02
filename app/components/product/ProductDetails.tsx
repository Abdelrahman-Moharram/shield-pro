import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks';
import { HookName } from '@salla.sa/twilight-theme-engine/types/hooks';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useWishlist } from '@salla.sa/twilight-theme-engine/hooks/useWishlist';
import { getActiveCurrency } from '@salla.sa/twilight-theme-engine/api/client';
import { CurrencySymbol } from '@salla.sa/twilight-theme-engine/common';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { cleanDescriptionHtml } from './productHelpers';

interface ProductDetailsProps {
  product: Product;
  sku?: string | null;
  barcode?: string | null;
  showTags?: boolean;
}

const IFRAME_TAG = /<iframe\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi;
function lazyIframes(html: string): string {
  return html.replace(IFRAME_TAG, (tag) =>
    /\sloading\s*=/i.test(tag.replace(/"[^"]*"|'[^']*'/g, '""'))
      ? tag
      : tag.replace(/^<iframe/i, '<iframe loading="lazy"')
  );
}

export function ProductDetails({ product, sku, barcode }: ProductDetailsProps) {
  const { t } = useTranslation();
  const wishlist = useWishlist();
  const priceCurrency = getActiveCurrency(product.currency);

  const activeSku = sku !== undefined ? sku : product.sku;
  const activeBarcode = barcode !== undefined ? barcode : product.barcode;

  // Category badge — comes only from backend
  const categoryLabel =
    product.category?.name ||
    (product as any).categories?.[0]?.name ||
    product.promotion_title ||
    null;

  // Clean description HTML
  const rawDesc = cleanDescriptionHtml(product.description);
  const cleanDesc = rawDesc ? lazyIframes(rawDesc) : '';

  return (
    <div className="product-details-content mb-3 text-start">
      <HookSlot name={HookName.PRODUCT_DESCRIPTION_START} context={{ product }} />

      {/* Hidden wishlist for SDK integrations */}
      <div className="product-details__title-actions hidden">
        <button
          type="button"
          className={`btn--wishlist ${wishlist.has(Number(product.id)) ? 'is-added' : 'not-added'}`}
          data-id={product.id}
          onClick={() => window.salla?.wishlist?.toggle?.(product.id)}
          aria-label={t('pages.products.add_to_wishlist', 'إضافة للمفضلة')}
        />
      </div>

      {/* Category Pill — backend only */}
      {categoryLabel && (
        <div className="mb-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F3F4F6] text-gray-600 tracking-wide">
            {categoryLabel}
          </span>
        </div>
      )}

      {/* Title & Subtitle — backend only */}
      <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#111827] leading-tight tracking-tight mb-1">
        {product.name}
        {product.subtitle && (
          <span className="block font-bold text-xl sm:text-2xl text-[#1F2937] mt-0.5">
            {product.subtitle}
          </span>
        )}
      </h1>

      {/* Description — backend only, rendered as HTML (supports <ul><li> bullet lists) */}
      {cleanDesc && (
        <div
          className="product__description text-gray-500 text-xs sm:text-sm leading-relaxed mb-4 max-w-xl [&>ul]:list-disc [&>ul]:ps-5 [&>ul]:space-y-0.5 [&>ol]:list-decimal [&>ol]:ps-5 [&>p]:mb-1 [&>p:last-child]:mb-0"
          dangerouslySetInnerHTML={{ __html: cleanDesc }}
        />
      )}

      {/* Price */}
      <div className="flex whitespace-nowrap items-baseline gap-2 mb-2">
        {product.is_on_sale ? (
          <>
            <span className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              {product.sale_price} <CurrencySymbol currency={priceCurrency} />
            </span>
            <span className="text-base text-gray-400 line-through">
              {product.regular_price} <CurrencySymbol currency={priceCurrency} />
            </span>
          </>
        ) : (
          <div className="flex items-baseline gap-2">
            {product.starting_price && (
              <span className="text-sm text-gray-500">{t('pages.products.starting_price', 'يبدأ من')}</span>
            )}
            <p className="inline-block text-3xl sm:text-4xl font-black text-gray-900 tracking-tight m-0">
              {product.starting_price ?? product.price} <CurrencySymbol currency={priceCurrency} />
            </p>
          </div>
        )}
      </div>

      {/* Stock status */}
      {product.can_show_remained_quantity ? (
        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold mb-4">
          {product.quantity != null && product.quantity > 0 && !product.is_out_of_stock ? (
            <div className="text-[#16A34A] flex items-center gap-1.5">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{t('blocks.product.in_stock', 'متوفر في المخزون')} ({product.quantity})</span>
            </div>
          ) : (
            <div className="text-red-600 flex items-center gap-1.5">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{t('pages.products.remained', 'المتبقي')} {product.quantity ?? 0}</span>
            </div>
          )}
        </div>
      ) : product.is_out_of_stock ? (
        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-red-600 mb-4">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{t('pages.products.out_of_stock', 'نفدت الكمية')}</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#16A34A] mb-4">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>{t('pages.products.in_stock', 'متوفر في المخزون')}</span>
        </div>
      )}

      {/* SKU & Barcode — backend only */}
      {Boolean(activeSku) && (
        <div className="mb-1 text-xs text-gray-400 flex items-center gap-1.5">
          <span>{t('pages.products.sku', 'رمز المنتج')}:</span>
          <span className="text-unicode font-medium text-gray-600">{activeSku}</span>
        </div>
      )}
      {Boolean(activeBarcode) && (
        <div className="mb-1 text-xs text-gray-400 flex items-center gap-1.5">
          <span>{t('pages.products.barcode', 'الباركود')}:</span>
          <span className="text-unicode font-medium text-gray-600">{activeBarcode}</span>
        </div>
      )}

      <HookSlot name={HookName.PRODUCT_DESCRIPTION} context={{ product }} />
    </div>
  );
}
