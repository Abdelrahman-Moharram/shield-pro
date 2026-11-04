import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { EnhancedSlider } from '../../../app/components/home/EnhancedSlider';

vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({ t: (_k: string, fb?: string) => fb ?? _k }),
}));

describe('EnhancedSlider', () => {
  it('renders hero section with id hero and home-screen class', () => {
    const { container } = render(<EnhancedSlider data={{}} />);
    const section = container.querySelector('section#hero');
    expect(section).toBeTruthy();
    expect(section?.classList.contains('home-screen')).toBe(true);
  });

  it('renders default hero title and description when no data provided', () => {
    const { getByText } = render(<EnhancedSlider data={{}} />);
    expect(getByText('حماية تدوم وراحة تستحقها سيارتك')).toBeTruthy();
    expect(
      getByText('حلول متقدمة لعزل الحرارة وحماية طلاء سيارتك، مصممة لتمنحك راحة أكبر وتحافظ على مظهر سيارتك.')
    ).toBeTruthy();
  });

  it('renders custom title and description from first slide', () => {
    const { getByText } = render(
      <EnhancedSlider
        data={{
          slides: [
            {
              title: 'عنوان الحماية الفائقة',
              description: 'وصف مخصص لحماية سيارتك باحترافية',
            },
          ],
        }}
      />
    );
    expect(getByText('عنوان الحماية الفائقة')).toBeTruthy();
    expect(getByText('وصف مخصص لحماية سيارتك باحترافية')).toBeTruthy();
  });

  it('renders custom title and description from slider_banner fallback', () => {
    const { getByText } = render(
      <EnhancedSlider
        data={{
          slider_banner: [
            {
              title: 'بانر عازل حراري',
              description: 'أفضل درجات العزل الحراري',
            },
          ],
        }}
      />
    );
    expect(getByText('بانر عازل حراري')).toBeTruthy();
    expect(getByText('أفضل درجات العزل الحراري')).toBeTruthy();
  });

  it('falls back to default title and description when slide contains demo placeholder text', () => {
    const { getByText } = render(
      <EnhancedSlider
        data={{
          slides: [
            {
              title: 'روّج لمنتجاتك الأكثر مبيعاً',
              description: 'التي تود إبرازها للعملاء',
            },
          ],
        }}
      />
    );
    expect(getByText('حماية تدوم وراحة تستحقها سيارتك')).toBeTruthy();
    expect(
      getByText('حلول متقدمة لعزل الحرارة وحماية طلاء سيارتك، مصممة لتمنحك راحة أكبر وتحافظ على مظهر سيارتك.')
    ).toBeTruthy();
  });

  it('renders default CTA button with link to #products', () => {
    const { getByText } = render(<EnhancedSlider data={{}} />);
    const button = getByText('اكتشف منتجات الحماية');
    expect(button).toBeTruthy();
    const link = button.closest('a');
    expect(link?.getAttribute('href')).toBe('#products');
  });

  it('renders custom CTA button label and target url', () => {
    const { getByText } = render(
      <EnhancedSlider
        data={{
          slides: [
            {
              btnname: 'احجز موعدك الآن',
              url: '/booking',
            },
          ],
        }}
      />
    );
    const button = getByText('احجز موعدك الآن');
    expect(button).toBeTruthy();
    const link = button.closest('a');
    expect(link?.getAttribute('href')).toBe('/booking');
  });

  it('uses default fallback car image when slide image is a demo placeholder', () => {
    const { container } = render(
      <EnhancedSlider
        data={{
          slides: [
            {
              image: 'https://salla.sa/demo-placeholder.png',
            },
          ],
        }}
      />
    );
    const imgs = container.querySelectorAll('img');
    expect(imgs.length).toBeGreaterThanOrEqual(1);
    expect(imgs[0].getAttribute('src')).toBe('/assets/theme/hero_car_transparent.webp');
  });

  it('uses custom car image when valid image is provided', () => {
    const { container } = render(
      <EnhancedSlider
        data={{
          slides: [
            {
              image: '/custom/hero-car.webp',
            },
          ],
        }}
      />
    );
    const imgs = container.querySelectorAll('img');
    expect(imgs.length).toBeGreaterThanOrEqual(1);
    expect(imgs[0].getAttribute('src')).toBe('/custom/hero-car.webp');
  });
});
