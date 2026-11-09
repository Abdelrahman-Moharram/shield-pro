import { useState, type FormEvent, type ReactNode } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { PrimaryButton } from '../components/shared/buttons/PrimaryButton';
import { getApiBase, postJson } from '../lib/backendApi';

/** What the backend returns for an approved serial number. */
interface Warranty {
  warrantyNumber: string;
  productName: string;
  activatedAt: string; // ISO date
  expiresAt: string; // ISO date
}

type ActivationResult =
  | { kind: 'activated'; warranty: Warranty }
  | { kind: 'already'; expiresAt: string };

function formatDate(iso: string, locale?: string) {
  return new Date(iso).toLocaleDateString(`${locale || 'ar'}-u-nu-latn`, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

async function activate(serial: string, base?: string): Promise<ActivationResult> {
  if (import.meta.env.DEV && !base) {
    if (serial.toUpperCase() === 'USED') {
      const now = new Date();
      const end = new Date(now);
      end.setFullYear(now.getFullYear() + 1);
      return { kind: 'already', expiresAt: end.toISOString() };
    }
    const now = new Date();
    const end = new Date(now);
    end.setFullYear(now.getFullYear() + 10);
    return {
      kind: 'activated',
      warranty: {
        warrantyNumber: 'WR-902341', productName: 'Shieldo Ultra PPF',
        activatedAt: now.toISOString(), expiresAt: end.toISOString(),
      },
    };
  }
  if (!base) throw new Error('error');
  const { status, data } = await postJson<any>(base, '/warranty/activate', { serial });
  if (status === 200 && data) return { kind: 'activated', warranty: data as Warranty };
  if (status === 409) {
    const expiresAt = data?.error?.details?.expiresAt;
    if (typeof expiresAt === 'string' && expiresAt.trim()) {
      return { kind: 'already', expiresAt };
    }
  }
  throw new Error(String(status));
}

export const Route = (createFileRoute as any)('/{-$locale}/warranty')({
  head: ({ params }: { params?: { locale?: string } }) => {
    const isEn = params?.locale === 'en';
    return {
      meta: [
        {
          title: isEn
            ? 'Activate Warranty | Shieldo Pro'
            : 'تفعيل الضمان | شيلدو برو Shieldo Pro',
        },
      ],
    };
  },
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

const ERR_MAP: Record<string, [string, string]> = {
  '404': ['error_not_found', 'الرقم التسلسلي غير موجود، تأكد منه وحاول مرة أخرى.'],
  '409': ['error_used', 'تم تفعيل ضمان هذا الرقم التسلسلي من قبل.'],
  '429': ['error_rate', 'محاولات كثيرة، حاول مرة أخرى بعد دقيقة.'],
};

export function WarrantyPage() {
  const { t, locale } = useTranslation();
  const { settings } = useTheme();
  const [serial, setSerial] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ActivationResult | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = serial.trim();
    if (!trimmed) return;
    setBusy(true);
    setError(null);
    try {
      setResult(await activate(trimmed, getApiBase(settings)));
    } catch (e: any) {
      const msg = e?.message;
      setError(msg in ERR_MAP ? msg : 'error');
    } finally {
      setBusy(false);
    }
  };

  const [errKey, defMsg] = (error && ERR_MAP[error]) ?? [
    'error', 'تعذر تفعيل الضمان، تأكد من الرقم التسلسلي وحاول مرة أخرى.',
  ];
  const errMsg = error && t(`pages.warranty.${errKey}` as any, defMsg);

  if (result?.kind === 'already') {
    return (
      <Card>
        <div role="status">
          <svg viewBox="0 0 24 24" className="mx-auto mb-8 h-32 w-32 rounded-full bg-gray-100 p-8 text-secondary" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <h1 className="mb-10 text-2xl font-extrabold text-secondary">{t('pages.warranty.already_title', 'تم تفعيل ضمان هذا المنتج من قبل')}</h1>
          <dl className="mb-10 rounded-2xl bg-gray-100 p-8">
            <div>
              <dt className="mb-2 text-sm text-gray-500">{t('pages.warranty.expires_at', 'تاريخ انتهاء الضمان')}</dt>
              <dd className="font-bold text-primary">{formatDate(result.expiresAt, locale)}</dd>
            </div>
          </dl>
          <Link to="/" className="inline-flex w-full justify-center rounded-xl bg-primary py-3.5 font-bold text-secondary-dark hover:bg-primary-hover">
            {t('pages.warranty.back_home', 'العودة للرئيسية')}
          </Link>
        </div>
      </Card>
    );
  }

  if (result?.kind === 'activated') {
    const { warranty } = result;
    const rows: [string, string, string?][] = [
      [t('pages.warranty.number', 'رقم الضمان'), warranty.warrantyNumber],
      [t('pages.warranty.product', 'اسم المنتج'), warranty.productName],
      [t('pages.warranty.activated_at', 'تاريخ التفعيل'), formatDate(warranty.activatedAt, locale)],
      [t('pages.warranty.expires_at', 'تاريخ انتهاء الضمان'), formatDate(warranty.expiresAt, locale), 'text-primary'],
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
      <img src="/assets/theme/warranty_shield_3d.webp" alt="" width={528} height={658} className="mx-auto mb-8 h-36 w-auto" />
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
            maxLength={64}
            autoComplete="off"
            inputMode="text"
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
            placeholder={t('pages.warranty.serial_placeholder', 'ادخل الرقم التسلسلي')}
            className="w-full rounded-xl border border-border-subtle bg-gray-100 py-3 pe-12 ps-4"
          />
          <svg viewBox="0 0 24 24" className="pointer-events-none absolute end-4 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3m4 0v4h-4m-3-1v-3" />
          </svg>
        </div>
        <p className={`mt-3 text-center text-xs ${error ? 'text-danger' : 'text-gray-500'}`}>
          {error ? errMsg : t('pages.warranty.serial_hint', 'يمكنك العثور على الرقم التسلسلي على ملصق المنتج.')}
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
