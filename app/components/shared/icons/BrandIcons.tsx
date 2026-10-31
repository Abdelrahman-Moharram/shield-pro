import type { SVGProps } from 'react';

export { ShieldoLogo } from './ShieldoLogo';

/**
 * Feature 1: Advanced Tech (Microchip)
 */
export function TechChipIcon({ className = 'w-10 h-10', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <rect x="12" y="12" width="24" height="24" rx="4" />
      <rect x="18" y="18" width="12" height="12" rx="2" strokeWidth="2" />
      <path d="M18 4V12M30 4V12M18 36V44M30 36V44M4 18H12M4 30H12M36 18H44M36 30H44" />
    </svg>
  );
}

/**
 * Feature 2: Reliable Protection (Shield with Lightning)
 */
export function ReliableShieldIcon({ className = 'w-10 h-10', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M24 6L38 11V23C38 32.5 32 40.5 24 43C16 40.5 10 32.5 10 23V11L24 6Z" />
      <path d="M25 16L18 26H24L23 33L30 23H24L25 16Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Feature 3: Long-Lasting Performance (Speed Rays with Lightning)
 */
export function LongPerformanceIcon({ className = 'w-10 h-10', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M26 8L16 24H24L22 40L34 22H26L26 8Z" />
      <path d="M6 16H12M4 24H10M8 32H14" />
    </svg>
  );
}

/**
 * Feature 4: Product Warranty (Guarantee Ribbon / Medal)
 */
export function WarrantyMedalIcon({ className = 'w-10 h-10', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="24" cy="18" r="12" />
      <path d="M19 28L15 42L24 37L33 42L29 28" />
    </svg>
  );
}

/**
 * Left Arrow for RTL Call-To-Action buttons
 */
export function ArrowLeftCtaIcon({ className = 'w-4 h-4', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M19 12H5M12 19L5 12L12 5" />
    </svg>
  );
}


/**
 * Social Media Icons
 */
export function FacebookIcon({ className = 'w-5 h-5', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
      <path d="M22 12C22 6.48 17.52 2 12 2C6.48 2 2 6.48 2 12C2 16.84 5.44 20.87 10 21.8V15H7.5V12H10V9.5C10 7.01 11.49 5.64 13.76 5.64C14.85 5.64 15.99 5.83 15.99 5.83V8.29H14.73C13.5 8.29 13.11 9.06 13.11 9.84V12H15.88L15.44 15H13.11V21.8C17.66 20.87 22 16.84 22 12Z" />
    </svg>
  );
}

export function InstagramIcon({ className = 'w-5 h-5', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function TwitterXIcon({ className = 'w-5 h-5', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
      <path d="M18.244 2.25H21.552L14.325 10.51L22.825 21.75H16.17L10.957 14.933L4.99 21.75H1.68L9.41 12.915L1.254 2.25H8.08L12.793 8.481L18.244 2.25ZM17.083 19.77H18.916L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

export function LinkedInIcon({ className = 'w-5 h-5', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
      <path d="M19 3A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19M18.5 18.5V13.2A3.26 3.26 0 0 0 15.24 9.94C14.39 9.94 13.4 10.46 12.92 11.24V10.13H10.13V18.5H12.92V13.57C12.92 12.8 13.54 12.17 14.31 12.17A1.4 1.4 0 0 1 15.71 13.57V18.5H18.5M6.88 8.56A1.68 1.68 0 0 0 8.56 6.88C8.56 5.95 7.81 5.19 6.88 5.19A1.69 1.69 0 0 0 5.19 6.88C5.19 7.81 5.95 8.56 6.88 8.56M8.27 18.5V10.13H5.5V18.5H8.27Z" />
    </svg>
  );
}
