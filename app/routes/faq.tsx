import { useMemo, useState, type FormEvent } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { getApiBase, postJson } from '../lib/backendApi';
import { PrimaryButton } from '../components/shared/buttons/PrimaryButton';

export const Route = (createFileRoute as any)('/{-$locale}/faq')({
  head: ({ params }: { params?: { locale?: string } }) => {
    const isEn = params?.locale === 'en';
    return {
      meta: [
        {
          title: isEn
            ? 'Frequently Asked Questions | Shieldo Pro'
            : 'الأسئلة الشائعة | شيلدو برو Shieldo Pro',
        },
      ],
    };
  },
  component: FaqPage,
});

interface FaqItem {
  id: number;
  questionKey: string;
  questionFallback: string;
  answerKey: string;
  answerFallback: string;
}

const FAQS: FaqItem[] = [
  {
    id: 1,
    questionKey: 'pages.faq.q1',
    questionFallback: 'كيف يمكنني تفعيل ضمان منتجي؟',
    answerKey: 'pages.faq.a1',
    answerFallback:
      'لتفعيل الضمان، انتقل إلى صفحة "الضمانات" في حسابك، ثم أدخل الرقم التسلسلي للمنتج المطبوع على العلبة أو الفاتورة. اتبع الخطوات الموضحة لإتمام التفعيل.',
  },
  {
    id: 2,
    questionKey: 'pages.faq.q2',
    questionFallback: 'ما هي سياسة الاسترجاع الخاصة بكم؟',
    answerKey: 'pages.faq.a2',
    answerFallback:
      'يمكنك طلب استرجاع المنتجات غير المستخدمة في عبوتها الأصلية خلال 14 يوماً من تاريخ الاستلام.',
  },
  {
    id: 3,
    questionKey: 'pages.faq.q3',
    questionFallback: 'هل توفرون خدمات تركيب؟',
    answerKey: 'pages.faq.a3',
    answerFallback:
      'نعم، نوفر خدمات التركيب الاحترافية من خلال شبكة مراكز التركيب المعتمدة لدينا في مختلف المدن.',
  },
  {
    id: 4,
    questionKey: 'pages.faq.q4',
    questionFallback: 'كيف اتواصل مع الدعم الفني؟',
    answerKey: 'pages.faq.a4',
    answerFallback:
      'يمكنك التواصل مع فريق الدعم الفني عبر الواتساب أو البريد الإلكتروني أو الاتصال المباشر برقم خدمة العملاء.',
  },
  {
    id: 5,
    questionKey: 'pages.faq.q5',
    questionFallback: 'ما هي خيارات الدفع المتاحة؟',
    answerKey: 'pages.faq.a5',
    answerFallback:
      'نقبل بطاقات مدى، فيزا، ماستركارد، أبل باي، بالإضافة إلى خيارات الدفع بالتقسيط تابي وتمارا.',
  },
  {
    id: 6,
    questionKey: 'pages.faq.q6',
    questionFallback: 'هل يمكنني تغيير عنوان الشحن بعد الطلب؟',
    answerKey: 'pages.faq.a6',
    answerFallback:
      'يمكنك تعديل عنوان الشحن قبل شحن الطلب عن طريق التواصل المباشر مع خدمة العملاء مع ذكر رقم الطلب.',
  },
  {
    id: 7,
    questionKey: 'pages.faq.q7',
    questionFallback: 'ما هي مدة الشحن التقديرية؟',
    answerKey: 'pages.faq.a7',
    answerFallback:
      'تستغرق مدة الشحن والتوصيل التقديرية من 2 إلى 5 أيام عمل لجميع مناطق المملكة العربية السعودية.',
  },
];

function FaqPage() {
  const { t, locale } = useTranslation();
  const { settings } = useTheme();
  const contactPhone = (settings as any)?.contact_phone;
  const contactEmail = (settings as any)?.contact_email;
  const contactWhatsapp = (settings as any)?.contact_whatsapp;

  // Contact form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // FAQ accordion state: first open by default
  const [openFaqId, setOpenFaqId] = useState<number | null>(1);

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    const base = getApiBase(settings);
    const done = () => { setSubmitted(true); setFullName(''); setEmail(''); setSubject(''); setMessage(''); setWebsite(''); setTimeout(() => setSubmitted(false), 4000); };
    if (import.meta.env.DEV && !base) return done();
    if (!base) return setError('error');
    setBusy(true);
    try {
      const res = await postJson(base, '/contact', {
        fullName: fullName.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
        website: website.trim(),
      });
      if (res.status === 201) done(); else setError(res.status === 429 ? '429' : 'error');
    } catch { setError('error'); } finally { setBusy(false); }
  };

  const toggleFaq = (id: number) => {
    setOpenFaqId((current) => (current === id ? null : id));
  };

  const [showAll, setShowAll] = useState(false);

  const displayFaqs = useMemo(() => {
    const raw = ((settings as any)?.faq_items ?? []) as Array<Record<string, string>>;
    const getField = (item: Record<string, string>, field: string) =>
      item[field] || item[`faq_items.${field}`] || '';

    const parsed = raw
      .map((item, idx) => {
        const qAr = getField(item, 'question');
        const aAr = getField(item, 'answer');
        const qEn = getField(item, 'question_en');
        const aEn = getField(item, 'answer_en');
        return {
          id: idx + 1,
          question: locale === 'en' && qEn ? qEn : qAr,
          answer: locale === 'en' && aEn ? aEn : aAr,
        };
      })
      .filter((i) => i.question && i.answer);

    if (parsed.length > 0) return parsed;
    return FAQS.map((f) => ({
      id: f.id,
      question: t(f.questionKey, f.questionFallback),
      answer: t(f.answerKey, f.answerFallback),
    }));
  }, [(settings as any)?.faq_items, locale, t]);

  const visibleFaqs = showAll ? displayFaqs : displayFaqs.slice(0, 7);

  return (
    <>
      {/* Section A: Hero / Contact (dark band) */}
      <section className="bg-secondary py-16 lg:pb-[72px] lg:pt-24">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Start (Right in RTL) Column: Text + Contacts */}
            <div className="text-start">
              <h1 className="text-3xl font-extrabold text-white lg:text-[48px] lg:leading-tight">
                {t('pages.faq.hero_title', 'نحن هنا للإجابة على تساؤلاتك')}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-[#BDBDBD] lg:text-xl">
                {t(
                  'pages.faq.hero_subtitle',
                  'سواء كنت تواجه مشكلة فنية، أو ترغب في الاستفسار عن خدماتنا، لا تتردد في التواصل معنا. فريقنا متواجد لخدمتك.'
                )}
              </p>

              {/* Contact list: 4 rows */}
              <div className="mt-8 flex flex-col gap-4">
                {/* 1. Main Office */}
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-primary/25 text-primary">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-base font-bold text-white">
                      {t('pages.faq.contact_office_title', 'المكتب الرئيسي')}
                    </span>
                    <p className="mt-1 text-[13px] text-[#BDBDBD]">
                      {t('pages.faq.contact_office_desc', 'طريق الملك فهد، حي المروج، الرياض، المملكة العربية السعودية')}
                    </p>
                  </div>
                </div>

                {/* 2. Phone */}
                {contactPhone && (
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-primary/25 text-primary">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-base font-bold text-white">
                      {t('pages.faq.contact_phone_title', 'اتصل بنا')}
                    </span>
                    <a
                      href={`tel:${contactPhone}`}
                      dir="ltr"
                      className="mt-1 inline-block text-[13px] text-[#BDBDBD] hover:text-white"
                    >
                      {contactPhone}
                    </a>
                  </div>
                </div>
                )}

                {/* 3. Email */}
                {contactEmail && (
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-primary/25 text-primary">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-base font-bold text-white">
                      {t('pages.faq.contact_email_title', 'الدعم عبر البريد الإلكتروني')}
                    </span>
                    <a
                      href={`mailto:${contactEmail}`}
                      className="mt-1 inline-block text-[13px] text-[#BDBDBD] hover:text-white"
                    >
                      {contactEmail}
                    </a>
                  </div>
                </div>
                )}

                {/* 4. WhatsApp */}
                {contactWhatsapp && (
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-primary/25 text-primary">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-base font-bold text-white">
                      {t('pages.faq.contact_whatsapp_title', 'تواصل عبر الواتساب')}
                    </span>
                    <a
                      href={`https://wa.me/${contactWhatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      dir="ltr"
                      className="mt-1 inline-block text-[13px] text-[#BDBDBD] hover:text-white"
                    >
                      {contactWhatsapp}
                    </a>
                  </div>
                </div>
                )}
              </div>
            </div>

            {/* End (Left in RTL) Column: Form Card */}
            <div className="self-start">
              <div className="rounded-2xl bg-white p-6 sm:p-8 text-start shadow-sm">
                <h2 className="text-xl font-bold text-[#363636]">
                  {t('pages.faq.form_title', 'أرسل لنا رسالة')}
                </h2>

                <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
                  <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="sr-only" />
                  {/* Row 1: Full name & Email */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="faq-name" className="mb-2 block text-sm font-bold text-[#363636]">
                        {t('pages.faq.form_name_label', 'الاسم الكامل')}
                      </label>
                      <input
                        id="faq-name"
                        type="text"
                        required
                        maxLength={80}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={t('pages.faq.form_name_placeholder', 'الاسم الكامل')}
                        className="h-12 w-full rounded-lg border border-[#E0E0E0] bg-[#F3F3F3] px-4 text-sm text-[#363636] placeholder:text-gray-400 focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="faq-email" className="mb-2 block text-sm font-bold text-[#363636]">
                        {t('pages.faq.form_email_label', 'البريد الإلكتروني')}
                      </label>
                      <input
                        id="faq-email"
                        type="email"
                        required
                        maxLength={120}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('pages.faq.form_email_placeholder', 'البريد الإلكتروني')}
                        className="h-12 w-full rounded-lg border border-[#E0E0E0] bg-[#F3F3F3] px-4 text-sm text-[#363636] placeholder:text-gray-400 focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="faq-subject" className="mb-2 block text-sm font-bold text-[#363636]">
                      {t('pages.faq.form_subject_label', 'الموضوع')}
                    </label>
                    <div className="relative">
                      <select
                        id="faq-subject"
                        required
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="h-12 w-full appearance-none rounded-lg border border-[#E0E0E0] bg-[#F3F3F3] pe-10 ps-4 text-sm text-[#363636] focus:border-primary focus:outline-none"
                      >
                        <option value="" disabled>
                          {t('pages.faq.form_subject_placeholder', 'اختر الموضوع')}
                        </option>
                        <option value="general">
                          {t('pages.faq.subject_general', 'استفسار عام')}
                        </option>
                        <option value="warranty">
                          {t('pages.faq.subject_warranty', 'الضمان')}
                        </option>
                        <option value="orders">
                          {t('pages.faq.subject_orders', 'الطلبات والشحن')}
                        </option>
                        <option value="support">
                          {t('pages.faq.subject_support', 'الدعم الفني')}
                        </option>
                      </select>
                      <svg
                        viewBox="0 0 20 20"
                        className="pointer-events-none absolute end-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="faq-message" className="mb-2 block text-sm font-bold text-[#363636]">
                      {t('pages.faq.form_message_label', 'الرسالة')}
                    </label>
                    <textarea
                      id="faq-message"
                      required
                      maxLength={2000}
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t('pages.faq.form_message_placeholder', 'اكتب رسالتك هنا ...')}
                      className="h-[110px] w-full resize-none rounded-lg border border-[#E0E0E0] bg-[#F3F3F3] p-4 text-sm text-[#363636] placeholder:text-gray-400 focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={busy}
                    className="h-12 w-full rounded-lg bg-primary font-bold text-[#363636] transition-colors hover:bg-primary-hover active:bg-primary-dark disabled:opacity-50"
                  >
                    {submitted
                      ? t('pages.faq.form_submitted', 'تم إرسال الرسالة')
                      : t('pages.faq.form_submit', 'إرسال الرسالة')}
                  </button>
                  {error && (
                    <p className="mt-2 text-center text-xs text-danger">
                      {error === '429'
                        ? t('pages.faq.form_error_rate', 'محاولات كثيرة، حاول مرة أخرى بعد دقيقة.')
                        : t('pages.faq.form_error', 'تعذر إرسال رسالتك، حاول مرة أخرى.')}
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section B & C: FAQ Accordion + CTA Banner (light background) */}
      <section className="bg-[#FDFCF8] pb-16 pt-16 lg:pb-24 lg:pt-24">
        <div className="container">
          {/* FAQ Heading */}
          <h2 className="mb-12 text-center text-2xl font-extrabold text-[#363636] lg:text-[32px]">
            {t('pages.faq.section_title', 'الأسئلة الشائعة')}
          </h2>

          {/* Accordion list */}
          <div className="flex flex-col gap-6">
            {visibleFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-xl border border-[#E5E5E5] bg-white p-6 sm:px-8 sm:py-6 text-start shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    className="flex w-full items-center justify-between gap-4 text-start"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base font-bold text-[#363636] sm:text-lg">
                      {faq.question}
                    </span>
                    <svg
                      viewBox="0 0 24 24"
                      className={`h-5 w-5 shrink-0 text-[#363636] transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {isOpen && (
                    <p className="mt-3 text-sm leading-relaxed text-[#6B6B6B]">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {displayFaqs.length > 7 && !showAll && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="text-sm font-bold text-primary hover:text-primary-hover"
              >
                {t('pages.faq.show_more', 'عرض المزيد')}
              </button>
            </div>
          )}

          {/* Section C: Didn't find an answer? CTA Card */}
          <div className="mt-12 rounded-2xl bg-gradient-to-b from-[#1E1E1E] to-[#2A2A2A] px-5 py-8 text-center text-white sm:px-8 sm:py-14">
            <h2 className="text-2xl font-extrabold lg:text-[40px]">
              {t('pages.faq.cta_title', 'لم تجد إجابة لسؤالك؟')}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-[#BDBDBD] lg:text-base">
              {t(
                'pages.faq.cta_subtitle',
                'فريق الدعم لدينا جاهز لمساعدتك في أي وقت عبر الدردشة المباشرة أو البريد الإلكتروني.'
              )}
            </p>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {contactWhatsapp && (
                <a
                  href={`https://wa.me/${contactWhatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-[#2B2B2B] shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow active:scale-[0.98] active:bg-primary-dark sm:w-auto"
                >
                  {t('pages.faq.cta_chat_now', 'تحدث معنا الآن')}
                </a>
              )}
              {contactEmail && (
                <a
                  href={`mailto:${contactEmail}`}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-white bg-transparent px-6 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-white/10 active:scale-[0.98] sm:w-auto"
                >
                  {t('pages.faq.cta_send_email', 'ارسل بريداً إلكترونياً')}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
