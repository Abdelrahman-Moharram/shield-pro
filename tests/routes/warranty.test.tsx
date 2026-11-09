import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WarrantyPage } from '../../app/routes/warranty';

let settings: unknown = { warranty_api_url: 'https://api.example.com' };
vi.mock('@salla.sa/twilight-theme-engine/hooks/useTheme', () => ({ useTheme: () => ({ settings }) }));
vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({ t: (_k: string, fb?: string) => fb ?? _k, locale: 'ar' }),
}));

describe('WarrantyPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_SHIELDO_API_URL', '');
    settings = { warranty_api_url: 'https://api.example.com' }; vi.restoreAllMocks(); });
  afterEach(() => vi.unstubAllEnvs());

  const submit = (serial: string) => {
    render(<WarrantyPage />);
    fireEvent.change(screen.getByPlaceholderText('ادخل الرقم التسلسلي'), { target: { value: serial } });
    fireEvent.click(screen.getByRole('button', { name: 'تفعيل الضمان' }));
  };

  it('shows warranty number on success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify({
      data: { warrantyNumber: 'WR-123456', productName: 'PPF', activatedAt: '2026-01-01', expiresAt: '2036-01-01' }
    }), { status: 200 }));
    submit('SH-123');
    await waitFor(() => expect(screen.getByText('WR-123456')).toBeTruthy());
  });

  it.each([
    [404, 'الرقم التسلسلي غير موجود'],
    [409, 'تم تفعيل ضمان هذا الرقم'],
    [429, 'محاولات كثيرة'],
  ])('maps %i status to message', async (status, text) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(null, { status }));
    submit('SH-123');
    await waitFor(() => expect(screen.getByText(new RegExp(text))).toBeTruthy());
  });

  it('shows information card on 409 with expiresAt details', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify({
      success: false,
      error: { code: 'ALREADY_ACTIVATED', message: 'x', details: { expiresAt: '2027-05-01T00:00:00.000Z' } },
    }), { status: 409 }));
    submit('SH-123');
    await waitFor(() => expect(screen.getByText('تم تفعيل ضمان هذا المنتج من قبل')).toBeTruthy());
    expect(screen.getByText(/2027/)).toBeTruthy();
    expect(screen.getByRole('status')).toBeTruthy();
    expect(document.querySelector('.text-danger')).toBeNull();
    expect(screen.queryByText(/تعذر/)).toBeNull();
    expect(screen.queryByText(/محاولات/)).toBeNull();
  });

  it('falls back to old message when 409 details has null expiresAt', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify({
      success: false,
      error: { code: 'ALREADY_ACTIVATED', details: { expiresAt: null } },
    }), { status: 409 }));
    submit('SH-123');
    await waitFor(() => expect(screen.getByText(/تم تفعيل ضمان هذا الرقم/)).toBeTruthy());
  });

  it('shows generic message on network error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('Failed to fetch'));
    submit('SH-123');
    await waitFor(() => expect(screen.getByText(/تعذر تفعيل الضمان/)).toBeTruthy());
  });

  it('shows generic message and sends no request with no base in prod', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const origDev = import.meta.env.DEV;
    (import.meta.env as any).DEV = false;
    settings = {};
    try {
      submit('SH-123');
      await waitFor(() => expect(screen.getByText(/تعذر تفعيل الضمان/)).toBeTruthy());
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      (import.meta.env as any).DEV = origDev;
    }
  });

  it('trims whitespace from serial before sending', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify({
      data: { warrantyNumber: 'WR-123456', productName: 'PPF', activatedAt: '2026-01-01', expiresAt: '2036-01-01' }
    }), { status: 200 }));
    submit('   SH-TRIMMED   ');
    await waitFor(() => expect(screen.getByText('WR-123456')).toBeTruthy());
    expect(fetchSpy).toHaveBeenCalledWith('https://api.example.com/warranty/activate', expect.objectContaining({
      body: JSON.stringify({ serial: 'SH-TRIMMED' }),
    }));
  });
});
