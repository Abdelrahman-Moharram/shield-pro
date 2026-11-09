import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { FeaturedProductsSection } from '../../../app/components/home/FeaturedProductsSection';

const listMock = vi.fn();

vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({
    t: (_k: string, fb?: string) => fb ?? _k,
    isRTL: true,
  }),
}));

vi.mock('@salla.sa/twilight-theme-engine/api/product', () => ({
  product: {
    list: (...args: unknown[]) => listMock(...args),
  },
}));

vi.mock('../../../app/components/shared/cards/ProductCardItem', () => ({
  ProductCardItem: ({ product }: { product: { id?: number; name?: string } }) => (
    <div data-testid="product-card-item">{product.name}</div>
  ),
}));

describe('FeaturedProductsSection', () => {
  beforeEach(() => {
    listMock.mockReset();
  });

  it('shows the skeleton while the request is loading', () => {
    // Unresolved promise simulates ongoing loading
    listMock.mockReturnValue(new Promise(() => {}));

    const { getByTestId } = render(<FeaturedProductsSection />);
    expect(getByTestId('featured-products-skeleton')).toBeTruthy();
  });

  it('returns null when the request finishes with 0 products', async () => {
    listMock.mockResolvedValue({ items: [] });

    const { container } = render(<FeaturedProductsSection />);
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('returns null when the request fails', async () => {
    listMock.mockRejectedValue(new Error('Network failure'));

    const { container } = render(<FeaturedProductsSection />);
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('renders products carousel when request succeeds with items', async () => {
    listMock.mockResolvedValue({
      items: [
        { id: 1, name: 'Product 1' },
        { id: 2, name: 'Product 2' },
      ],
    });

    const { getAllByTestId, getByText } = render(
      <FeaturedProductsSection data={{ title: 'Our Featured' }} />
    );

    await waitFor(() => {
      expect(getAllByTestId('product-card-item')).toHaveLength(2);
    });
    expect(getByText('Our Featured')).toBeTruthy();
  });
});
