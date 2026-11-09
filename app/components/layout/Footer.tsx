import { memo, useState } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { ShieldoLogo } from '../shared/icons/BrandIcons';

export interface FooterLink {
  labelKey: string;
  url: string;
}

export interface FooterSection {
  titleKey: string;
  links: FooterLink[];
}

export interface ContactInfo {
  titleKey: string;
  phone: string;
  phoneUrl: string;
  addressKey: string;
  email: string;
  emailUrl: string;
}

export interface SocialItem {
  name: string;
  icon: 'linkedin' | 'x' | 'instagram' | 'facebook';
  url: string;
}

// 1. Isolated Footer Data defined above the component
const FOOTER_DATA = {
  descriptionKey: 'blocks.footer.description',
  newsletterPlaceholderKey: 'blocks.footer.newsletter_placeholder',
  copyrightKey: 'blocks.footer.copyright',
  socials: [
    { name: 'LinkedIn', icon: 'linkedin' as const, url: '#' },
    { name: 'X', icon: 'x' as const, url: '#' },
    { name: 'Instagram', icon: 'instagram' as const, url: '#' },
    { name: 'Facebook', icon: 'facebook' as const, url: '#' },
  ],
  contact: {
    titleKey: 'blocks.footer.contact_title',
    phone: '0592052080',
    phoneUrl: 'tel:0592052080',
    addressKey: 'blocks.footer.contact_address',
    email: 'info@shieldopro.com',
    emailUrl: 'mailto:info@shieldopro.com',
  },
  sections: [
    {
      titleKey: 'blocks.footer.sec_products',
      links: [
        { labelKey: 'blocks.footer.link_thermal', url: '/products?category=thermal' },
        { labelKey: 'blocks.footer.link_ppf', url: '/products?category=ppf' },
      ],
    },
    {
      titleKey: 'blocks.footer.sec_help',
      links: [
        { labelKey: 'blocks.footer.link_faq', url: '/faq' },
        { labelKey: 'blocks.footer.link_shipping', url: '#shipping' },
        { labelKey: 'blocks.footer.link_returns', url: '#returns' },
      ],
    },
    {
      titleKey: 'blocks.footer.sec_brand',
      links: [
        { labelKey: 'blocks.footer.link_about', url: '#about' },
        { labelKey: 'blocks.footer.link_warranty', url: '/warranty' },
        { labelKey: 'blocks.footer.link_branches', url: '/branches' },
      ],
    },
  ],
};

// 2. Minimalist SVG Icons
function LinkedInIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

function XIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.704 0-1.498.046-1.785.344-.396.411-.341 1.25-.341 2.279v1.361h3.702l-.582 3.667h-3.12v7.98c-1.391.242-2.784.242-4.175 0z" />
    </svg>
  );
}

function PhoneIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.24.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z" />
    </svg>
  );
}

function PinIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
    </svg>
  );
}

function MailIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );
}

function SendIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

const SOCIAL_ICONS = {
  linkedin: LinkedInIcon,
  x: XIcon,
  instagram: InstagramIcon,
  facebook: FacebookIcon,
};

export interface FooterProps {
  data?: {
    description?: string;
    copyright?: string;
    [key: string]: unknown;
  };
}

export const Footer = memo(function Footer({ data }: FooterProps) {
  const { t, isRTL } = useTranslation();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { settings } = useTheme();
  const phone = (settings as any)?.contact_phone;
  const emailAddr = (settings as any)?.contact_email;
  const socials = [
    { name: 'LinkedIn', icon: 'linkedin' as const, url: (settings as any)?.social_linkedin },
    { name: 'X', icon: 'x' as const, url: (settings as any)?.social_x },
    { name: 'Instagram', icon: 'instagram' as const, url: (settings as any)?.social_instagram },
    { name: 'Facebook', icon: 'facebook' as const, url: (settings as any)?.social_facebook },
  ].filter((s) => Boolean(s.url && s.url.trim()));

  const description = (data?.description as string) || t(FOOTER_DATA.descriptionKey, 'نحن نقدم أفضل حلول حماية السيارات في المملكة العربية السعودية بتقنيات عالمية.');
  const copyright = (data?.copyright as string) || t(FOOTER_DATA.copyrightKey, 'جميع الحقوق محفوظة 2026 Shieldo Pro. ©');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer
      id="footer"
      dir={isRTL ? 'rtl' : 'ltr'}
      className="relative w-full text-white overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #3B3B3B 0%, #2B2B2B 100%)',
      }}
    >
      {/* Decorative background watermark contour */}
      <div
        className="absolute left-1/3 top-1/2 -translate-y-1/2 w-80 md:w-[480px] h-full pointer-events-none select-none opacity-[0.035] flex items-center justify-center"
        aria-hidden="true"
      >
        <img
          src="/assets/theme/bg_lightning_contour.svg"
          alt=""
          className="w-full h-auto object-contain"
          loading="lazy"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-16 pb-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Col 1: Brand Info & Newsletter (Right side in RTL) */}
          <div className="lg:col-span-5 flex flex-col items-start text-start">
            <div className="mb-4">
              <ShieldoLogo light={true} className="h-10 w-auto" />
            </div>

            <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-sm mb-6 font-normal">
              {description}
            </p>

            {/* Social Media Links */}
            {socials.length > 0 && (
            <div className="flex items-center gap-3 mb-6">
              {socials.map((social) => {
                const Icon = SOCIAL_ICONS[social.icon];
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    aria-label={social.name}
                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
            )}

            {/* Newsletter Subscription */}
            <form onSubmit={handleSubscribe} className="relative flex items-center w-full max-w-sm">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={subscribed ? t('blocks.footer.newsletter_subscribed', 'شكراً لاشتراكك معنا!') : t(FOOTER_DATA.newsletterPlaceholderKey, 'ادخل بريدك الإلكتروني لتلقي آخر مستجداتنا وعروضنا')}
                disabled={subscribed}
                className="w-full pl-14 pr-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-400 text-xs sm:text-sm focus:outline-none focus:border-[#D89F2D] transition-colors"
                required
              />
              <button
                type="submit"
                aria-label={t('blocks.footer.subscribe_aria', 'Subscribe')}
                className="absolute left-1.5 top-1.5 bottom-1.5 px-3.5 bg-[#D89F2D] hover:bg-[#c58f25] text-neutral-900 rounded-lg flex items-center justify-center transition-colors shadow-sm cursor-pointer"
              >
                <SendIcon className="w-4 h-4 rotate-180" />
              </button>
            </form>
          </div>

          {/* Nav Columns: المنتجات - المساعدة - شيلدو برو */}
          <div className="lg:col-span-4 grid grid-cols-3 gap-4 sm:gap-6 text-start">
            {FOOTER_DATA.sections.map((section) => (
              <div key={section.titleKey}>
                <h3 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-5 tracking-tight">
                  {t(section.titleKey)}
                </h3>
                <ul className="space-y-2.5 sm:space-y-3">
                  {section.links.map((link) => (
                    <li key={link.labelKey}>
                      {link.url.startsWith('/') ? (
                        <Link
                          to={link.url}
                          className="text-xs sm:text-sm text-gray-300 hover:text-[#D89F2D] transition-colors font-normal inline-block"
                        >
                          {t(link.labelKey)}
                        </Link>
                      ) : (
                        <a
                          href={link.url}
                          className="text-xs sm:text-sm text-gray-300 hover:text-[#D89F2D] transition-colors font-normal inline-block"
                        >
                          {t(link.labelKey)}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Col 3: Contact Us (Left side in RTL) */}
          <div className="lg:col-span-3 text-start">
            <h3 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-5 tracking-tight">
              {t(FOOTER_DATA.contact.titleKey, 'تواصل معنا')}
            </h3>
            <ul className="space-y-3.5 text-xs sm:text-sm text-gray-300 font-normal">
              {/* Phone */}
              {phone && (
                <li className="flex items-center justify-start gap-2.5">
                  <span className="text-[#D89F2D] shrink-0">
                    <PhoneIcon className="w-4 h-4" />
                  </span>
                  <a
                    href={`tel:${phone}`}
                    dir="ltr"
                    className="hover:text-[#D89F2D] transition-colors"
                  >
                    {phone}
                  </a>
                </li>
              )}

              {/* Address */}
              <li className="flex items-center justify-start gap-2.5">
                <span className="text-[#D89F2D] shrink-0">
                  <PinIcon className="w-4 h-4" />
                </span>
                <span>{t(FOOTER_DATA.contact.addressKey, '25 شارع الأمير فيصل بن فهد، الخبر')}</span>
              </li>

              {/* Email */}
              {emailAddr && (
                <li className="flex items-center justify-start gap-2.5">
                  <span className="text-[#D89F2D] shrink-0">
                    <MailIcon className="w-4 h-4" />
                  </span>
                  <a
                    href={`mailto:${emailAddr}`}
                    className="hover:text-[#D89F2D] transition-colors"
                  >
                    {emailAddr}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Divider & Copyright */}
        <div className="mt-12 sm:mt-14 pt-6 border-t border-white/10 text-center">
          <p className="text-xs sm:text-sm text-gray-400 font-normal" dir="ltr">
            {copyright}
          </p>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
