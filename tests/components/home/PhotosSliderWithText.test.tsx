import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { PhotosSliderWithText } from '../../../app/components/home/PhotosSliderWithText';

vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({ t: (_k: string, fb?: string) => fb ?? _k }),
}));

describe('PhotosSliderWithText', () => {
  it('renders section with id services and home-screen class', () => {
    const { container } = render(<PhotosSliderWithText data={{}} />);
    const section = container.querySelector('section#services');
    expect(section).toBeTruthy();
    expect(section?.classList.contains('home-screen')).toBe(true);
  });

  it('renders default section title when none provided', () => {
    const { getByText } = render(<PhotosSliderWithText data={{}} />);
    expect(getByText('ما الذي تحتاجه سيارتك؟')).toBeTruthy();
  });

  it('renders custom section title when provided in data.title', () => {
    const { getByText } = render(<PhotosSliderWithText data={{ title: 'خدمات التظليل والحماية' }} />);
    expect(getByText('خدمات التظليل والحماية')).toBeTruthy();
  });

  it('renders two service cards for thermal insulation and paint protection', () => {
    const { getByText, getAllByRole } = render(<PhotosSliderWithText data={{}} />);
    expect(getByText('العزل الحراري')).toBeTruthy();
    expect(getByText('حماية الطلاء')).toBeTruthy();
    const links = getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0].getAttribute('href')).toBe('#products');
    expect(links[1].getAttribute('href')).toBe('#products');
  });

  it('renders descriptions for each service card', () => {
    const { getByText } = render(<PhotosSliderWithText data={{}} />);
    expect(getByText('تقليل الحرارة وحماية المقصورة من الأشعة الضارة.')).toBeTruthy();
    expect(getByText('حماية طلاء السيارة من الخدوش والعوامل الخارجية.')).toBeTruthy();
  });

  it('renders CTA buttons with correct labels', () => {
    const { getByText } = render(<PhotosSliderWithText data={{}} />);
    expect(getByText('استكشف أفلام العزل')).toBeTruthy();
    expect(getByText('استكشف أفلام حماية الطلاء')).toBeTruthy();
  });

  it('renders service images with webp format', () => {
    const { container } = render(<PhotosSliderWithText data={{}} />);
    const images = container.querySelectorAll('img');
    expect(images.length).toBeGreaterThanOrEqual(2);
    expect(images[0].getAttribute('src')).toContain('.webp');
    expect(images[1].getAttribute('src')).toContain('.webp');
  });
});
