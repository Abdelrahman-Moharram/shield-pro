import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { ProductSpecs } from '../../../app/components/product/ProductSpecs';
import { ProductFeatures } from '../../../app/components/product/ProductFeatures';
import { ProductInstallBanner } from '../../../app/components/product/ProductInstallBanner';
import {
  getProductCustomFields,
  getProductFeatures,
  isAutomotiveTintProduct,
  cleanDescriptionHtml,
} from '../../../app/components/product/productHelpers';

vi.mock('@salla.sa/twilight-theme-engine/providers', () => ({
  useTwilight: () => ({
    theme: {
      settings: {
        product_show_specs: true,
        product_show_features: true,
        product_show_install_banner: true,
      },
    },
    store: { settings: {} },
  }),
}));

const makeChairProduct = (): Product =>
  ({
    id: 101,
    name: 'كرسي خشبي حسب الطلب 100',
    description: '&lt;p&gt;كرسي طعام خشبي مريح وعالي الجودة&lt;/p&gt;',
    price: 3,
    status: 'sale',
    type: 'product',
    url: '/chair',
    category: { id: 1, name: 'أثاث منزلي' },
    is_out_of_stock: false,
    options: [],
    tags: [],
  }) as unknown as Product;

const makeFilmProduct = (): Product =>
  ({
    id: 202,
    name: 'فيلم عزل حراري نانو سيراميك',
    subtitle: 'Shieldo Ceramic Series',
    description: '<p>فيلم عزل عالي الجودة للسيارات</p>',
    price: 500,
    status: 'sale',
    type: 'product',
    url: '/tint',
    category: { id: 2, name: 'عازل حراري' },
    is_out_of_stock: false,
    custom_fields: [
      { label: 'VLT', value: '35%' },
      { label: 'TSER', value: '92%' },
    ],
    features: [
      { title: 'عزل حراري فائق', desc: 'يقلل الحرارة حتى 85%' },
    ],
    tags: [{ id: 1, name: 'تظليل' }],
  }) as unknown as Product;

describe('ProductSpecs & Features strict backend compliance', () => {
  it('does NOT render specifications on a wooden chair without custom fields', () => {
    const chair = makeChairProduct();
    const { container } = render(<ProductSpecs product={chair} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders specifications dynamically when backend provides custom fields', () => {
    const film = makeFilmProduct();
    const { getByText } = render(<ProductSpecs product={film} />);
    expect(getByText('المواصفات الفنية')).toBeTruthy();
    expect(getByText('VLT')).toBeTruthy();
    expect(getByText('35%')).toBeTruthy();
    expect(getByText('TSER')).toBeTruthy();
    expect(getByText('92%')).toBeTruthy();
  });

  it('parses specifications from tags in various formats (colon, space, hyphen, string array)', () => {
    const p1 = {
      ...makeChairProduct(),
      tags: ['VLT: 35%', 'TSER 92%', 'VLR - 8%', 'السماكة: 2.0 mil', 'الضمان 10 سنوات'],
    } as unknown as Product;
    const specs1 = getProductCustomFields(p1);
    expect(specs1.length).toBe(5);
    expect(specs1.find((s) => s.label === 'VLT')?.value).toBe('35%');
    expect(specs1.find((s) => s.label === 'TSER')?.value).toBe('92%');
    expect(specs1.find((s) => s.label === 'VLR')?.value).toBe('8%');
    expect(specs1.find((s) => s.label === 'السماكة')?.value).toBe('2.0 mil');
    expect(specs1.find((s) => s.label === 'الضمان')?.value).toBe('10 سنوات');
  });

  it('parses specifications from section-based custom fields', () => {
    const p = {
      ...makeChairProduct(),
      custom_fields: [
        {
          title: 'المواصفات الفنية',
          fields: [
            { name: 'VLT', value: '35%' },
            { name: 'VLR', value: '8%' },
          ],
        },
      ],
    } as unknown as Product;
    const specs = getProductCustomFields(p);
    expect(specs.length).toBe(2);
    expect(specs[0].label).toBe('VLT');
    expect(specs[0].value).toBe('35%');
  });

  it('parses specifications written in description when tags/custom fields are empty', () => {
    const p = {
      ...makeChairProduct(),
      description: '<p>فيلم عزل حراري متميز<br>VLT: 35%<br>TSER: 92%</p>',
    } as unknown as Product;
    const specs = getProductCustomFields(p);
    expect(specs.length).toBe(2);
    expect(specs[0].label).toBe('VLT');
    expect(specs[0].value).toBe('35%');
  });

  it('does NOT render features on a wooden chair without backend features', () => {
    const chair = makeChairProduct();
    const { container } = render(<ProductFeatures product={chair} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders features dynamically when backend provides features', () => {
    const film = makeFilmProduct();
    const { getByText } = render(<ProductFeatures product={film} />);
    expect(getByText('عزل حراري فائق')).toBeTruthy();
    expect(getByText('يقلل الحرارة حتى 85%')).toBeTruthy();
  });

  it('does NOT render installation banner on a wooden chair', () => {
    const chair = makeChairProduct();
    const { container } = render(<ProductInstallBanner product={chair} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders installation banner for automotive tint products', () => {
    const film = makeFilmProduct();
    const { getByText } = render(<ProductInstallBanner product={film} />);
    expect(getByText('ترغب في تركيب المنتج؟')).toBeTruthy();
    expect(getByText('عرض مراكز التركيب')).toBeTruthy();
  });

  it('isAutomotiveTintProduct returns false for wooden chair and true for tint products', () => {
    expect(isAutomotiveTintProduct(makeChairProduct())).toBe(false);
    expect(isAutomotiveTintProduct(makeFilmProduct())).toBe(true);
  });

  it('cleanDescriptionHtml decodes escaped HTML tags properly', () => {
    const messy = '&lt;p class="ql"&gt;&lt;span&gt;مرحبا&lt;/span&gt;&lt;/p&gt;';
    expect(cleanDescriptionHtml(messy)).toBe('<p class="ql"><span>مرحبا</span></p>');
  });

  it('renders exact specs from Salla Dashboard custom fields (الضمان, VLR, السماكة, TSER)', () => {
    const productWithSallaCustomFields = {
      ...makeChairProduct(),
      custom_fields: [
        {
          title: 'المواصفات الفنية',
          fields: [
            { name: 'الضمان', value: '10 سنوات' },
            { name: 'VLR', value: '8%' },
            { name: 'السماكة', value: '2.0 mil' },
            { name: 'TSER', value: '92%' },
          ],
        },
      ],
    } as unknown as Product;

    const specs = getProductCustomFields(productWithSallaCustomFields);
    expect(specs.length).toBe(4);
    expect(specs.find((s) => s.label === 'الضمان')?.value).toBe('10 سنوات');
    expect(specs.find((s) => s.label === 'VLR')?.value).toBe('8%');
    expect(specs.find((s) => s.label === 'السماكة')?.value).toBe('2.0 mil');
    expect(specs.find((s) => s.label === 'TSER')?.value).toBe('92%');

    const { getByText } = render(<ProductSpecs product={productWithSallaCustomFields} />);
    expect(getByText('الضمان')).toBeTruthy();
    expect(getByText('10 سنوات')).toBeTruthy();
    expect(getByText('VLR')).toBeTruthy();
    expect(getByText('8%')).toBeTruthy();
    expect(getByText('السماكة')).toBeTruthy();
    expect(getByText('2.0 mil')).toBeTruthy();
    expect(getByText('TSER')).toBeTruthy();
    expect(getByText('92%')).toBeTruthy();
  });

  it('automatically derives features based on assigned categories', () => {
    // 1. Light isolation category
    const lightIsoProduct = {
      id: 301,
      name: 'فيلم تظليل',
      category: { id: 10, name: 'أفلام حماية عازلة للضوء' },
    } as unknown as Product;
    const lightFeatures = getProductFeatures(lightIsoProduct);
    expect(lightFeatures.some((f) => f.title.includes('عزل ضوء'))).toBe(true);

    // 2. Medium tint category
    const mediumTintProduct = {
      id: 302,
      name: 'فيلم تظليل',
      category: { id: 11, name: 'عزل متوسط' },
    } as unknown as Product;
    const medFeatures = getProductFeatures(mediumTintProduct);
    expect(medFeatures.some((f) => f.title.includes('خصوصية مع وضوح'))).toBe(true);

    // 3. Nano ceramic category
    const nanoProduct = {
      id: 303,
      name: 'فيلم عازل',
      category: { id: 12, name: 'أفلام حماية نانو سيراميك' },
    } as unknown as Product;
    const nanoFeatures = getProductFeatures(nanoProduct);
    expect(nanoFeatures.some((f) => f.title.includes('تخفيض فوري للحرارة'))).toBe(true);
  });
});
