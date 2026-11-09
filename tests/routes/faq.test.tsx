import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { Route } from '../../app/routes/faq';

const Faq = (Route as any).options.component;
let settings: Record<string, unknown> = { warranty_api_url: 'https://api.test' };
vi.mock('@salla.sa/twilight-theme-engine/hooks/useTheme', () => ({ useTheme: () => ({ settings }) }));
vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({ t: (_: string, fb?: string) => fb ?? _, locale: 'ar' }),
}));

describe('faq contact form', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    vi.stubEnv('VITE_SHIELDO_API_URL', ''); // a developer's local .env must not leak into tests
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    settings = { warranty_api_url: 'https://api.test' };
    (import.meta.env as any).DEV = true;
  });
  afterEach(() => {
    vi.unstubAllEnvs(); cleanup(); (import.meta.env as any).DEV = true; });

  const fillAndSubmit = (bot = '') => {
    cleanup();
    render(<Faq />);
    const name = screen.getByPlaceholderText('الاسم الكامل') as HTMLInputElement;
    fireEvent.change(name, { target: { value: 'User' } });
    if (bot) fireEvent.change(document.querySelector('input[name="website"]')!, { target: { value: bot } });
    fireEvent.submit(name.form!);
    return name;
  };

  it('201 shows success, clears fields, and sends honeypot', async () => {
    fetchMock.mockResolvedValueOnce({ status: 201, json: async () => ({}) });
    const name = fillAndSubmit('bot-val');
    await waitFor(() => expect(screen.getByText('تم إرسال الرسالة')).toBeTruthy());
    expect(name.value).toBe('');
    expect(fetchMock).toHaveBeenCalledWith('https://api.test/contact', expect.objectContaining({
      body: expect.stringContaining('"website":"bot-val"'),
    }));
  });

  it('429 and 500 show errors', async () => {
    fetchMock.mockResolvedValueOnce({ status: 429, json: async () => ({}) });
    fillAndSubmit();
    await waitFor(() => expect(screen.getByText('محاولات كثيرة، حاول مرة أخرى بعد دقيقة.')).toBeTruthy());
    fetchMock.mockResolvedValueOnce({ status: 500, json: async () => ({}) });
    fillAndSubmit();
    await waitFor(() => expect(screen.getByText('تعذر إرسال رسالتك، حاول مرة أخرى.')).toBeTruthy());
  });

  it('no base in production path sends nothing', async () => {
    (import.meta.env as any).DEV = false;
    settings = {};
    fillAndSubmit();
    await waitFor(() => expect(screen.getByText('تعذر إرسال رسالتك، حاول مرة أخرى.')).toBeTruthy());
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('trims whitespace from form fields before sending', async () => {
    fetchMock.mockResolvedValueOnce({ status: 201, json: async () => ({}) });
    cleanup();
    render(<Faq />);
    const name = screen.getByPlaceholderText('الاسم الكامل');
    const email = screen.getByPlaceholderText('البريد الإلكتروني');
    const message = screen.getByPlaceholderText('اكتب رسالتك هنا ...');
    fireEvent.change(name, { target: { value: '  User Name  ' } });
    fireEvent.change(email, { target: { value: '  test@example.com  ' } });
    fireEvent.change(message, { target: { value: '  Hello world  ' } });
    fireEvent.submit((name as HTMLInputElement).form!);
    await waitFor(() => expect(screen.getByText('تم إرسال الرسالة')).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledWith('https://api.test/contact', expect.objectContaining({
      body: JSON.stringify({
        fullName: 'User Name',
        email: 'test@example.com',
        subject: '',
        message: 'Hello world',
        website: '',
      }),
    }));
  });
});
