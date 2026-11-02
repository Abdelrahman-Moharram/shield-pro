import type { Product } from '@salla.sa/twilight-theme-engine/types';

export interface CustomFieldItem {
  label: string;
  value: string;
}

export interface ProductFeatureItem {
  title: string;
  desc?: string;
  icon?: string;
}

/**
 * Extracts custom fields, metadata, tags, and specifications from the product payload.
 * Supports:
 * - Salla custom_fields (flat or section-nested)
 * - Salla metadata (array, record, or sections)
 * - Attributes, specifications, and properties
 * - Tags in any format (e.g., "VLT: 35%", "VLT 35%", "VLT - 35%", "VLT = 35%", etc.)
 * - Specifications written inside product description as fallbacks
 */
export function getProductCustomFields(product: Product): CustomFieldItem[] {
  const p = product as any;
  const list: CustomFieldItem[] = [];
  const seen = new Set<string>();

  const add = (label?: any, value?: any) => {
    if (label == null || value == null) return;
    const l = String(label).trim();
    const v = String(value).trim();
    if (!l || !v) return;
    const key = l.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    list.push({ label: l, value: v });
  };

  const traverse = (item: any) => {
    if (!item) return;

    if (Array.isArray(item)) {
      item.forEach(traverse);
      return;
    }

    if (typeof item === 'object') {
      if (Array.isArray(item.fields)) {
        item.fields.forEach(traverse);
        return;
      }
      if (Array.isArray(item.items)) {
        item.items.forEach(traverse);
        return;
      }
      if (Array.isArray(item.values)) {
        item.values.forEach(traverse);
        return;
      }
      if (Array.isArray(item.sections)) {
        item.sections.forEach(traverse);
        return;
      }

      const label = item.label || item.name || item.key || item.title;
      const value = item.value || item.val;
      if (label && value != null && typeof value !== 'object') {
        add(label, value);
        return;
      }

      for (const [k, v] of Object.entries(item)) {
        if (v != null && typeof v !== 'object') {
          add(k, v);
        } else if (typeof v === 'object') {
          traverse(v);
        }
      }
    }
  };

  if (p.custom_fields) traverse(p.custom_fields);
  if (p.customFields) traverse(p.customFields);
  if (p.metadata) traverse(p.metadata);
  if (p.meta) traverse(p.meta);
  if (p.fields) traverse(p.fields);

  const extraCollections = [p.attributes, p.specifications, p.properties, p.specs, p.details, p.specs_list];
  for (const coll of extraCollections) {
    if (coll) traverse(coll);
  }

  const rawTags = Array.isArray(p.tags)
    ? p.tags
    : typeof p.tags === 'string'
      ? p.tags.split(',')
      : [];

  for (const rawTag of rawTags) {
    if (!rawTag) continue;
    const text = (
      typeof rawTag === 'string'
        ? rawTag
        : String(rawTag?.name || rawTag?.title || rawTag?.label || '')
    ).trim();

    if (!text) continue;

    // Skip feature tags so they don't mix into specs
    if (text.startsWith('ميزة:') || text.startsWith('feature:')) continue;

    const sepMatch = text.match(/^([^:：=-]+)[:：=-]\s*(.+)$/);
    if (sepMatch) {
      add(sepMatch[1].trim(), sepMatch[2].trim());
      continue;
    }

    const keywordMatch = text.match(
      /^(VLT|VLR|TSER|IRR|UVR|السماكة|الضمان|Thickness|Warranty)\s+(.+)$/i
    );
    if (keywordMatch) {
      add(keywordMatch[1].trim(), keywordMatch[2].trim());
    }
  }

  if (list.length === 0 && p.description) {
    const descText = cleanDescriptionHtml(p.description).replace(/<[^>]+>/g, '\n');
    const lines = descText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    for (const line of lines) {
      const match = line.match(
        /^(VLT|VLR|TSER|IRR|UVR|السماكة|الضمان|\(انتقال الضوء المرئي\)\s*VLT|\(انعكاس الضوء المرئي\)\s*VLR|\(إجمالي الطاقة الشمسية المرفوضة\)\s*TSER)[\s:：=-]+([^\n<]+)$/i
      );
      if (match) {
        add(match[1].trim(), match[2].trim());
      }
    }
  }

  return list;
}

/**
 * Extracts all category names associated with the product.
 * Supports:
 * - product.category (object or string)
 * - product.categories (array of objects or strings)
 * - sub_categories
 * - breadcrumbs
 */
export function getProductCategoryNames(product: Product): string[] {
  const p = product as any;
  const names: string[] = [];
  const seen = new Set<string>();

  const add = (name?: any) => {
    if (!name) return;
    const str = String(name).trim();
    if (!str || seen.has(str.toLowerCase())) return;
    seen.add(str.toLowerCase());
    names.push(str);
  };

  if (p.category) {
    if (typeof p.category === 'string') add(p.category);
    else if (p.category.name) add(p.category.name);
    else if (p.category.title) add(p.category.title);
  }

  if (Array.isArray(p.categories)) {
    for (const cat of p.categories) {
      if (typeof cat === 'string') add(cat);
      else if (cat?.name) add(cat.name);
      else if (cat?.title) add(cat.title);
    }
  }

  if (Array.isArray(p.category?.sub_categories)) {
    for (const sub of p.category.sub_categories) {
      if (sub?.name) add(sub.name);
    }
  }

  if (Array.isArray(p.breadcrumbs)) {
    for (const b of p.breadcrumbs) {
      if (b?.title && b.title !== 'الرئيسية' && b.title !== 'Home') add(b.title);
    }
  }

  return names;
}

/**
 * Extracts product features or highlights strictly from Salla backend data.
 * Supports:
 * - Dedicated feature collections (p.features, p.highlights, p.benefits)
 * - Custom Fields section named "المميزات" or "Features" or "لماذا تختار هذا المنتج"
 * - Tags prefixed with "ميزة:" or "feature:"
 * - Description section under "المميزات"
 */
export function getProductFeatures(product: Product): ProductFeatureItem[] {
  const p = product as any;
  const list: ProductFeatureItem[] = [];
  const seenTitles = new Set<string>();

  const add = (title?: any, desc?: any, icon?: any) => {
    if (!title) return;
    const t = String(title).trim();
    if (!t) return;
    const norm = t.toLowerCase();
    if (seenTitles.has(norm)) return;
    seenTitles.add(norm);
    list.push({
      title: t,
      desc: desc ? String(desc).trim() : undefined,
      icon: icon ? String(icon).trim() : undefined,
    });
  };

  // 1. Dedicated feature collections from Salla
  const featureCollections = [
    p.features,
    p.highlights,
    p.benefits,
    p.product_features,
    p.metadata?.features,
    p.metadata?.highlights,
  ];

  for (const coll of featureCollections) {
    if (Array.isArray(coll)) {
      for (const item of coll) {
        if (typeof item === 'string') {
          add(item);
        } else if (item && typeof item === 'object') {
          add(
            item.title || item.name || item.label,
            item.desc || item.description || item.value,
            item.icon
          );
        }
      }
    }
  }

  // 2. Custom Fields section named "المميزات" or "Features"
  if (Array.isArray(p.custom_fields)) {
    for (const section of p.custom_fields) {
      const sectionName = (section?.title || section?.name || '').toLowerCase();
      if (
        sectionName.includes('ميز') ||
        sectionName.includes('feature') ||
        sectionName.includes('لماذا')
      ) {
        const items = section.fields || section.items || [];
        if (Array.isArray(items)) {
          for (const item of items) {
            add(item.title || item.name || item.label, item.desc || item.description || item.value);
          }
        }
      }
    }
  }

  // 3. Tags prefixed with "ميزة:" or "feature:" (e.g. "ميزة: تخفيض فوري للحرارة - يقلل بشكل كبير...")
  const rawTags = Array.isArray(p.tags)
    ? p.tags
    : typeof p.tags === 'string'
      ? p.tags.split(',')
      : [];

  for (const rawTag of rawTags) {
    const text = (
      typeof rawTag === 'string'
        ? rawTag
        : String(rawTag?.name || rawTag?.title || rawTag?.label || '')
    ).trim();

    if (text.startsWith('ميزة:') || text.startsWith('feature:') || text.startsWith('مميزات:')) {
      const content = text.replace(/^(ميزة|feature|مميزات)[:：]\s*/i, '');
      if (content.includes('-') || content.includes(':')) {
        const [t, ...rest] = content.split(/[-:]/);
        add(t.trim(), rest.join('-').trim());
      } else {
        add(content);
      }
    }
  }

  // 4. Automatic category-based features (derived dynamically when no manual features are set)
  if (list.length === 0) {
    const catFeatures = getProductCategoryFeatures(product);
    for (const f of catFeatures) {
      add(f.title, f.desc, f.icon);
    }
  }

  return list;
}

/**
 * Maps category names and product keywords dynamically to feature pillars.
 * e.g.:
 * - "أفلام حماية نانو سيراميك" -> "تخفيض فوري للحرارة"
 * - "أفلام حماية عازلة للضوء" -> "عزل ضوء وحماية من الشمس"
 * - "عزل متوسط" / "خصوصية" -> "خصوصية مع وضوح"
 * - "طلاء / PPF" -> "حماية متقدمة للطلاء"
 */
export function getProductCategoryFeatures(product: Product): ProductFeatureItem[] {
  const catNames = getProductCategoryNames(product);
  const text = [
    ...catNames,
    product.name || '',
    product.subtitle || '',
    ...(product.tags || []).map((t) => (typeof t === 'string' ? t : t?.name || '')),
  ]
    .join(' ')
    .toLowerCase();

  const features: ProductFeatureItem[] = [];

  // Thermal / Heat / Nano Ceramic
  if (
    text.includes('نانو') ||
    text.includes('سيراميك') ||
    text.includes('حرار') ||
    text.includes('heat') ||
    text.includes('ceramic')
  ) {
    features.push({
      title: 'تخفيض فوري للحرارة',
      desc: 'يقلل بشكل كبير من حرارة المقصورة لراحة أكبر أثناء القيادة.',
      icon: 'heat',
    });
  }

  // Privacy / Medium Tint
  if (
    text.includes('متوسط') ||
    text.includes('خصوص') ||
    text.includes('privacy') ||
    text.includes('تعتيم')
  ) {
    features.push({
      title: 'خصوصية مع وضوح',
      desc: 'يوفر الخصوصية التي تحتاجها دون التأثير على وضوح الرؤية ليلاً.',
      icon: 'privacy',
    });
  }

  // Light Isolation / UV / Sun
  if (
    text.includes('عازلة للضوء') ||
    text.includes('عازل للضوء') ||
    text.includes('ضوء') ||
    text.includes('أشعة') ||
    text.includes('شمس') ||
    text.includes('uv')
  ) {
    features.push({
      title: 'عزل ضوء وحماية من الشمس',
      desc: 'حماية فائقة من وهج الشمس والأشعة فوق البنفسجية لراحة العين والحفاظ على مقصورة سيارتك.',
      icon: 'uv',
    });
  }

  // Paint Protection / PPF
  if (
    text.includes('طلاء') ||
    text.includes('ppf') ||
    text.includes('خدوش') ||
    text.includes('حماية الطلاء')
  ) {
    features.push({
      title: 'حماية متقدمة لطلاء السيارة',
      desc: 'طبقة شفافة متينة تحمي طلاء السيارة من الخدوش والحصى والعوامل الجوية.',
      icon: 'shield',
    });
  }

  // Deduplicate
  const unique: ProductFeatureItem[] = [];
  const seen = new Set<string>();
  for (const item of features) {
    const key = item.title.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item);
    }
  }

  return unique;
}

/**
 * Decodes HTML entities and cleans up messy raw tags from Quill/Salla editors.
 * Ensures the description renders as clean, formatted text/HTML.
 */
export function cleanDescriptionHtml(raw?: string | null): string {
  if (!raw) return '';
  let str = raw.trim();

  let prev = '';
  while (str !== prev && (str.includes('&lt;') || str.includes('&#') || str.includes('&amp;'))) {
    prev = str;
    str = str
      .replace(/&amp;lt;/g, '<')
      .replace(/&amp;gt;/g, '>')
      .replace(/&amp;quot;/g, '"')
      .replace(/&amp;amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
  }

  return str;
}

/**
 * Detects if a product belongs to the automotive window film / thermal insulation category.
 */
export function isAutomotiveTintProduct(product: Product): boolean {
  const p = product as any;
  if (p.traffic_compliance || p.show_traffic_notice) return true;

  const catNames = getProductCategoryNames(product).join(' ');
  const text = `${product.name || ''} ${product.subtitle || ''} ${catNames} ${(product.tags || []).map((t) => (typeof t === 'string' ? t : t?.name || '')).join(' ')}`.toLowerCase();

  const keywords = ['عزل', 'تظليل', 'حراري', 'vlt', 'window film', 'tint', 'ppf', 'ضوء', 'سيراميك', 'طلاء'];
  return keywords.some((k) => text.includes(k));
}
