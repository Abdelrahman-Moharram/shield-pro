import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { getProductFeatures, type ProductFeatureItem } from './productHelpers';

interface ProductFeaturesProps {
  product: Product;
}

function ThermometerHeatIcon() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4v16a5 5 0 1 0 0 8 5 5 0 0 0 0-8V4a2 2 0 1 0-4 0v16" />
      <path d="M14 26a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor" />
      <path d="M22 8l2-2M24 14h3M22 20l2 2M6 14h3M8 8L6 6M8 20l-2 2" />
    </svg>
  );
}

function PrivacyEyeIcon() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 16s5-9 13-9 13 9 13 9-5 9-13 9-13-9-13-9z" />
      <circle cx="16" cy="16" r="4" fill="currentColor" />
      <path d="M16 3v2M9 5l1.5 1.5M23 5l-1.5 1.5" />
    </svg>
  );
}

function UvShieldIcon() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="16" r="6" />
      <circle cx="16" cy="16" r="10" strokeDasharray="3 3" />
      <path d="M16 2v3M16 27v3M2 16h3M27 16h3M6.1 6.1l2.1 2.1M23.8 23.8l2.1 2.1M6.1 25.9l2.1-2.1M23.8 8.2l2.1-2.1" />
    </svg>
  );
}

function PaintShieldIcon() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 3L5 7v9c0 8 11 13 11 13s11-5 11-13V7L16 3z" />
      <path d="M12 16l3 3 6-6" />
    </svg>
  );
}

function FeatureIcon({ item, index }: { item: ProductFeatureItem; index: number }) {
  const t = item.title.toLowerCase();
  const icon = item.icon?.toLowerCase();

  if (icon === 'heat' || t.includes('حرار') || t.includes('heat') || t.includes('نانو'))
    return <ThermometerHeatIcon />;
  if (icon === 'privacy' || icon === 'eye' || t.includes('خصوص') || t.includes('وضوح') || t.includes('رؤي') || t.includes('privacy'))
    return <PrivacyEyeIcon />;
  if (icon === 'shield' || t.includes('طلاء') || t.includes('ppf') || t.includes('خدوش'))
    return <PaintShieldIcon />;
  if (icon === 'uv' || t.includes('ضوء') || t.includes('أشعة') || t.includes('شمس'))
    return <UvShieldIcon />;
  return [<ThermometerHeatIcon />, <PrivacyEyeIcon />, <UvShieldIcon />][index % 3];
}

/**
 * "لماذا تختار هذا المنتج؟" section.
 *
 * Data priority:
 * 1. product.features / custom_fields section "المميزات" / tags "ميزة: ..."  (from Salla backend)
 * 2. Category-based automatic derivation (getProductCategoryFeatures inside getProductFeatures)
 *
 * Section title comes from theme setting `product_features_title`.
 * Returns null if neither source yields data.
 */
export function ProductFeatures({ product }: ProductFeaturesProps) {
  const { theme } = useTwilight();
  const settings = (theme?.settings || {}) as Record<string, any>;

  if (settings.product_show_features === false) return null;

  const features = getProductFeatures(product);
  if (features.length === 0) return null;

  const sectionTitle = (settings.product_features_title as string) || 'لماذا تختار هذا المنتج؟';

  return (
    <section className="product-features mb-14 sm:mb-20 text-center">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-10 text-center">{sectionTitle}</h2>
      <div
        className={`grid grid-cols-1 gap-8 sm:gap-10 ${
          features.length >= 3 ? 'md:grid-cols-3' : features.length === 2 ? 'md:grid-cols-2 max-w-2xl mx-auto' : 'max-w-sm mx-auto'
        }`}
      >
        {features.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#FFF9EB] border border-[#F5EFE3] text-[#CCA352] flex items-center justify-center mb-4">
              <FeatureIcon item={item} index={idx} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
            {item.desc && (
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{item.desc}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
