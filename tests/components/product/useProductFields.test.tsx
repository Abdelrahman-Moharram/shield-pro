import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProductFields } from '../../../app/components/product/useProductFields';

describe('useProductFields', () => {
  beforeEach(() => {
    delete (window as any).salla;
  });

  afterEach(() => {
    delete (window as any).salla;
    vi.restoreAllMocks();
  });

  it('splits payload with custom_fields sections into specs and features', () => {
    const product = {
      id: 1,
      custom_fields: [
        {
          title: 'المواصفات الفنية',
          fields: [{ label: 'السماكة', value: '8 mil' }],
        },
        {
          title: 'المميزات',
          fields: [{ label: 'حماية فائقة', value: 'مقاومة الخدوش والأشعة' }],
        },
      ],
    } as any;

    const { result } = renderHook(() => useProductFields(product));

    expect(result.current.specs).toEqual([{ label: 'السماكة', value: '8 mil' }]);
    expect(result.current.features).toEqual([{ label: 'حماية فائقة', value: 'مقاومة الخدوش والأشعة' }]);
  });

  it('fetches metadata from window.salla.api when payload has no fields and applies same split', async () => {
    const fetchValues = vi.fn().mockResolvedValue({
      data: [
        {
          sections: [
            {
              title: 'المواصفات',
              fields: [{ name: 'اللون', value: 'شفاف' }],
            },
            {
              title: 'المميزات الرئيسية',
              fields: [{ name: 'عزل حراري', value: 'عزل ممتاز' }],
            },
          ],
        },
      ],
    });

    (window as any).salla = { api: { metadata: { fetchValues } } };
    const product = { id: 2 } as any;

    const { result } = renderHook(() => useProductFields(product));

    await waitFor(() => {
      expect(result.current.specs).toEqual([{ label: 'اللون', value: 'شفاف' }]);
      expect(result.current.features).toEqual([{ label: 'عزل حراري', value: 'عزل ممتاز' }]);
    });
    expect(fetchValues).toHaveBeenCalledWith('product', 2);
  });

  it('places values longer than 40 characters into features even in spec sections', () => {
    const longValue = 'هذا النص طويل جداً ويتجاوز أربعين حرفاً لغرض التحقق من توجيهه للمميزات';
    const product = {
      id: 3,
      custom_fields: [
        {
          title: 'المواصفات',
          fields: [
            { label: 'سماكة', value: '10 mil' },
            { label: 'وصف تفصيلي', value: longValue },
          ],
        },
      ],
    } as any;

    const { result } = renderHook(() => useProductFields(product));

    expect(result.current.specs).toEqual([{ label: 'سماكة', value: '10 mil' }]);
    expect(result.current.features).toEqual([{ label: 'وصف تفصيلي', value: longValue }]);
  });

  it('handles fetch failure gracefully without crash and returns empty arrays', async () => {
    const fetchValues = vi.fn().mockRejectedValue(new Error('Network error'));
    (window as any).salla = { api: { metadata: { fetchValues } } };
    const product = { id: 4 } as any;

    const { result } = renderHook(() => useProductFields(product));

    await waitFor(() => {
      expect(result.current).toEqual({ specs: [], features: [] });
    });
  });
});
