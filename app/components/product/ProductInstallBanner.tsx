import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { isAutomotiveTintProduct } from './productHelpers';

interface ProductInstallBannerProps {
  product?: Product;
}

/**
 * "ترغب في تركيب المنتج؟" banner.
 * Only shown for automotive tint / film products.
 * All text comes from theme settings — hidden entirely if no title is set.
 */
export function ProductInstallBanner({ product }: ProductInstallBannerProps) {
  const { t } = useTranslation();
  const { theme } = useTwilight();
  const settings = (theme?.settings || {}) as Record<string, any>;

  if (settings.product_show_install_banner === false) return null;
  if (product && !isAutomotiveTintProduct(product)) return null;

  const title = (settings.product_install_banner_title as string) || t('pages.products.install_banner_title', 'ترغب في تركيب المنتج؟');
  const desc =
    (settings.product_install_banner_desc as string) ||
    t('pages.products.install_banner_desc', 'يمكنك الوصول إلى مراكز التركيب المعتمدة من شيلدو برو للحصول على أفضل جودة تركيب.');
  const btnText = (settings.product_install_banner_btn as string) || t('pages.products.install_banner_btn', 'عرض مراكز التركيب');
  const rawUrl = ((settings.product_install_banner_url as string) || '').trim() || '/branches';
  const btnUrl = rawUrl.startsWith('/') || rawUrl.startsWith('http') ? rawUrl : `/${rawUrl}`;

  return (
    <section className="product-install-banner mb-14 sm:mb-20 text-start">
      <div className="relative rounded-2xl overflow-hidden bg-[#242424] text-white p-6 sm:p-8 md:p-10 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl text-start">
            {title && (
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-2.5">
                {title}
              </h3>
            )}
            {desc && (
              <p className="text-xs sm:text-sm md:text-base text-gray-300 font-medium leading-relaxed">
                {desc}
              </p>
            )}
          </div>
          {btnText && (
            <div className="shrink-0 w-full md:w-auto">
              <Link
                to={btnUrl}
                className="inline-flex items-center justify-center w-full md:w-auto px-7 py-3 rounded-xl bg-[#CCA352] hover:bg-[#b89143] active:bg-[#a68037] text-neutral-900 font-black text-sm sm:text-base transition-all shadow-md text-center cursor-pointer"
              >
                {btnText}
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
