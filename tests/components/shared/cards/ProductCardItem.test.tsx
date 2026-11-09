import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ProductCardItem } from '../../../../app/components/shared/cards/ProductCardItem';

vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({
    t: (_k: string, fb?: string) => fb ?? _k,
    isRTL: true,
  }),
}));

describe('ProductCardItem', () => {
  const dummyProduct = {
    id: 101,
    name: 'Shieldo Ceramic Tint',
    price: '250',
    regular_price: '300',
    is_on_sale: true,
    url: '/product/101',
    image: { url: '/test-image.webp' },
    description: 'High quality tint',
  } as any;

  it('does not render the "+" / add-to-cart button (individuals-only store)', () => {
    const { container } = render(<ProductCardItem product={dummyProduct} />);
    const button = container.querySelector('button');
    expect(button).toBeNull();
  });

  it('links the product image and title to the product URL', () => {
    const { container, getByText } = render(<ProductCardItem product={dummyProduct} />);
    const links = container.querySelectorAll('a');
    expect(links.length).toBeGreaterThanOrEqual(2);

    const imageLink = links[0];
    expect(imageLink.getAttribute('href')).toBe('/product/101');

    const titleLink = getByText('Shieldo Ceramic Tint').closest('a');
    expect(titleLink).not.toBeNull();
    expect(titleLink?.getAttribute('href')).toBe('/product/101');
  });

  it('supports demo ProductItem format and links correctly', () => {
    const demoItem = {
      id: 'demo-1',
      title: 'Demo Protection',
      price: 150,
      description: 'Demo description',
      image: '/demo.webp',
      url: '/product/demo-1',
    };

    const { container, getByText } = render(<ProductCardItem product={demoItem} />);
    expect(container.querySelector('button')).toBeNull();

    const titleLink = getByText('Demo Protection').closest('a');
    expect(titleLink?.getAttribute('href')).toBe('/product/demo-1');
  });
});
