import type { MenuItem } from '@salla.sa/twilight-theme-engine/types';

/**
 * Navbar Navigation Items targeting Shieldo Pro Pages and Landing Sections
 * Schema conforms to Salla MenuItem backend structure
 */
export const navbarData: MenuItem[] = [
  {
    id: 1,
    order: 1,
    title: 'الرئيسية',
    url: '/#hero',
    target: '_self',
    has_children: false,
    children: [],
  },
  {
    id: 2,
    order: 2,
    title: 'المنتجات',
    url: '/products',
    target: '_self',
    has_children: false,
    children: [],
  },
  {
    id: 3,
    order: 3,
    title: 'خدماتنا',
    url: '/#services',
    target: '_self',
    has_children: false,
    children: [],
  },
  {
    id: 4,
    order: 4,
    title: 'لماذا شيلدو برو',
    url: '/#why-us',
    target: '_self',
    has_children: false,
    children: [],
  },
  {
    id: 5,
    order: 5,
    title: 'مراكز التركيب',
    url: '/#installers',
    target: '_self',
    has_children: false,
    children: [],
  },
  {
    id: 6,
    order: 6,
    title: 'الضمان',
    url: '/#warranty',
    target: '_self',
    has_children: false,
    children: [],
  },
  {
    id: 7,
    order: 7,
    title: 'كيف تبدأ',
    url: '/#how-it-works',
    target: '_self',
    has_children: false,
    children: [],
  },
];

export default navbarData;
