import { useEffect, useState } from 'react';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { fetchProductFields, parseCustomFields, type CustomFieldItem } from './productHelpers';

type ProductFields = { specs: CustomFieldItem[]; features: CustomFieldItem[] };

/** Short specs + long "المميزات" copy for a product: from the payload, else fetched from Salla metadata. */
export function useProductFields(product: Product, initialProduct?: Product): ProductFields {
  const fromPayload = (): ProductFields => {
    for (const p of [product, initialProduct]) {
      const r = p && parseCustomFields(p);
      if (r && (r.specs.length || r.features.length)) return r;
    }
    return { specs: [], features: [] };
  };
  const [fields, setFields] = useState<ProductFields>(fromPayload);

  useEffect(() => {
    const current = fromPayload();
    if (current.specs.length || current.features.length) {
      setFields(current);
      return;
    }
    let active = true;
    fetchProductFields(product.id).then((r) => active && r && setFields(r));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id, product, initialProduct]);

  return fields;
}
