import { useState, type FormEvent, type ReactNode } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { PrimaryButton } from '../components/shared/buttons/PrimaryButton';

/** What the backend returns for an approved serial number. */
interface Warranty {
  number: string;
  product: string;
  activatedAt: string; // ISO date
  expiresAt: string; // ISO date
}

/** POST { serial } → Warranty (200) or an error status. Backend: see the chat notes. */
const ACTIVATE_URL = '/api/warranty/activate';

async function activate(serial: string): Promise<Warranty> {
  // Design preview: `pnpm dev` approves any serial so both screens can be reviewed.
  if (import.meta.env.DEV) {
    const now = new Date();
    const end = new Date(now);
    end.setFullYear(now.getFullYear() + 10);
    return { number: 'WR-902341', product: 'Shieldo Ultra PPF', activatedAt: now.toISOString(), expiresAt: end.toISOString() };
  }
  const res = await fetch(ACTIVATE_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ serial }),
  });
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

export const Route = (createFileRoute as any)('/{-$locale}/warranty')({
  head: () => ({ meta: [{ title: 'تفعيل الضمان | شيلدو برو Shieldo Pro' }] }),
  component: WarrantyPage,
});

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="container flex justify-center py-12 sm:py-16">
      <div className="w-full max-w-[700px] rounded-3xl border border-border-subtle bg-surface-card p-8 text-center shadow-default sm:p-14">
        {children}
      </div>
    </div>
  );
}

function WarrantyPage() {
  const { t } = useTranslation();
  const [serial, setSerial] = useState('');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [warranty, setWarranty] = useState<Warranty | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFailed(false);
    try {
      setWarranty(await activate(serial.trim()));
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  if (warranty) {
    const date = (iso: string) =>
      new Date(iso).toLocaleDateString(`${document.documentElement.lang || 'ar'}-u-nu-latn`, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    const rows: [string, string, string?][] = [
      [t('pages.warranty.number', 'رقم الضمان'), warranty.number],
      [t('pages.warranty.product', 'اسم المنتج'), warranty.product],
      [t('pages.warranty.activated_at', 'تاريخ التفعيل'), date(warranty.activatedAt)],
      [t('pages.warranty.expires_at', 'تاريخ انتهاء الضمان'), date(warranty.expiresAt), 'text-primary'],
    ];
    return (
      <Card>
        <svg viewBox="0 0 24 24" className="mx-auto mb-8 h-32 w-32 rounded-full bg-green-500 p-8 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
        <h1 className="mb-10 text-3xl font-extrabold text-secondary">{t('pages.warranty.success', 'تم تفعيل الضمان بنجاح')}</h1>
        <dl className="mb-10 grid grid-cols-2 gap-8 rounded-2xl bg-gray-100 p-8">
          {rows.map(([label, value, color]) => (
            <div key={label}>
              <dt className="mb-2 text-sm text-gray-500">{label}</dt>
              <dd className={`font-bold ${color ?? 'text-secondary'}`}>{value}</dd>
            </div>
          ))}
        </dl>
        <Link to="/" className="inline-flex w-full justify-center rounded-xl bg-primary py-3.5 font-bold text-secondary-dark hover:bg-primary-hover">
          {t('pages.warranty.back_home', 'العودة للرئيسية')}
        </Link>
      </Card>
    );
  }

  return (
    <Card>
      <img src="/assets/theme/warranty_shield_3d.png" alt="" className="mx-auto mb-8 h-36 w-auto" />
      <h1 className="mb-3 text-3xl font-extrabold text-secondary">{t('pages.warranty.title', 'فعل ضمان منتجك')}</h1>
      <p className="mb-10 text-lg text-gray-500">{t('pages.warranty.subtitle', 'لتفعيل الضمان أدخل الرقم التسلسلي الموجود على منتج.')}</p>

      <form onSubmit={submit} className="text-start">
        <label htmlFor="serial" className="mb-2 block text-sm font-bold text-secondary">
          {t('pages.warranty.serial', 'الرقم التسلسلي')}
        </label>
        <div className="relative">
          <input
            id="serial"
            required
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
            placeholder={t('pages.warranty.serial_placeholder', 'ادخل الرقم التسلسلي')}
            className="w-full rounded-xl border border-border-subtle bg-gray-100 py-3 pe-12 ps-4"
          />
          <svg viewBox="0 0 24 24" className="pointer-events-none absolute end-4 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3m4 0v4h-4m-3-1v-3" />
          </svg>
        </div>
        <p className={`mt-3 text-center text-xs ${failed ? 'text-danger' : 'text-gray-500'}`}>
          {failed
            ? t('pages.warranty.error', 'تعذر تفعيل الضمان، تأكد من الرقم التسلسلي وحاول مرة أخرى.')
            : t('pages.warranty.serial_hint', 'يمكنك العثور على الرقم التسلسلي على ملصق المنتج.')}
        </p>
        <PrimaryButton type="submit" size="lg" disabled={busy} className="mt-10 w-full">
          {t('pages.warranty.activate', 'تفعيل الضمان')}
        </PrimaryButton>
      </form>

      <Link to="/" className="mt-6 inline-block text-sm font-medium text-secondary">
        {t('pages.warranty.back_home', 'العودة للرئيسية')}
      </Link>
    </Card>
  );
}
