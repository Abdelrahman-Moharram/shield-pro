import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { useEffect, useState } from 'react';
import { getProductCustomFields, type CustomFieldItem } from './productHelpers';

interface ProductSpecsProps {
  product: Product;
  initialProduct?: Product;
}

/**
 * "المواصفات الفنية" section.
 * All data from Salla backend custom fields / metadata. Returns null if empty.
 */
export function ProductSpecs({ product, initialProduct }: ProductSpecsProps) {
  const { t } = useTranslation();
  const { theme } = useTwilight();
  const settings = (theme?.settings || {}) as Record<string, any>;

  const getCombinedSpecs = () => {
    const s1 = getProductCustomFields(product);
    if (s1.length > 0) return s1;
    if (initialProduct) {
      const s2 = getProductCustomFields(initialProduct);
      if (s2.length > 0) return s2;
    }
    return [];
  };

  const [specs, setSpecs] = useState<CustomFieldItem[]>(getCombinedSpecs);

  useEffect(() => {
    const current = getCombinedSpecs();
    if (current.length > 0) {
      setSpecs(current);
      return;
    }

    let isMounted = true;
    const fetchMetadata = async () => {
      try {
        const salla = (window as any).salla || (window as any).Salla;
        if (!salla?.api?.metadata?.fetchValues) return;
        const res = await salla.api.metadata.fetchValues('product', product.id);
        const data = res?.data;
        const rawSections = Array.isArray(data)
          ? (data[0]?.sections || data)
          : (data?.sections || res?.sections || []);
        const fetched: CustomFieldItem[] = [];
        for (const sec of rawSections) {
          const fields = Array.isArray(sec?.fields)
            ? sec.fields
            : Array.isArray(sec?.items)
              ? sec.items
              : typeof sec?.fields === 'object' && sec.fields !== null
                ? Object.entries(sec.fields).map(([k, v]) => ({ name: k, value: v }))
                : [];
          for (const f of fields) {
            const label = f.name || f.label || f.title || f.key;
            const value = f.value || f.val;
            if (label && value != null) {
              fetched.push({ label: String(label).trim(), value: String(value).trim() });
            }
          }
        }
        if (isMounted && fetched.length > 0) setSpecs(fetched);
      } catch {
        /* silent */
      }
    };
    fetchMetadata();
    return () => {
      isMounted = false;
    };
  }, [product.id, product, initialProduct]);

  if (settings.product_show_specs === false) return null;
  if (!specs || specs.length === 0) return null;

  // Smart column span: always fill the grid cleanly
  const total = specs.length;
  const getColSpan = (idx: number): string => {
    if (total % 3 === 0) return 'sm:col-span-2';
    if (total === 5) return idx < 3 ? 'sm:col-span-2' : 'sm:col-span-3';
    if (total % 2 === 0) return 'sm:col-span-3';
    // odd remainder: last item fills remaining space
    if (total % 3 === 1 && idx === total - 1) return 'sm:col-span-6';
    if (total % 3 === 2 && idx >= total - 2) return 'sm:col-span-3';
    return 'sm:col-span-2';
  };

  return (
    <section className="product-specs mb-12 sm:mb-16 text-start">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-5 text-start">
        {t('pages.products.specs_title', 'المواصفات الفنية')}
      </h2>
      <div className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 sm:gap-4">
          {specs.map((item, idx) => (
            <div
              key={idx}
              className={`${getColSpan(idx)} bg-[#FDFBF7] border border-[#F3EDE2] rounded-xl p-4 sm:p-5 flex flex-col justify-between min-h-[90px] text-start`}
            >
              <span className="text-xs sm:text-sm text-gray-500 font-medium mb-2">{item.label}</span>
              <span className="text-2xl sm:text-3xl font-black text-[#CCA352] tracking-tight">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
