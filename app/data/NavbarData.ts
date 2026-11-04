import type { MenuItem } from '@salla.sa/twilight-theme-engine/types';

/**
 * Fallback navbar, used only when the store's `menus/header` is empty (the merchant
 * dashboard menu wins). Real pages use their route; the rest are home-page anchors.
 * Schema conforms to Salla MenuItem backend structure
 */
export const navbarData: MenuItem[] = [
  {
    id: 1,
    order: 1,
    title: 'nav.home',
    url: '/',
    target: '_self',
    has_children: false,
    children: [],
  },
  {
    id: 2,
    order: 2,
    title: 'nav.products',
    url: '/products',
    target: '_self',
    has_children: false,
    children: [],
  },
  {
    id: 3,
    order: 3,
    title: 'nav.services',
    url: '/#services',
    target: '_self',
    has_children: false,
    children: [],
  },
  {
    id: 4,
    order: 4,
    title: 'nav.why_us',
    url: '/#why-us',
    target: '_self',
    has_children: false,
    children: [],
  },
  {
    id: 5,
    order: 5,
    title: 'nav.branches',
    url: '/branches',
    target: '_self',
    has_children: false,
    children: [],
  },
  {
    id: 6,
    order: 6,
    title: 'nav.warranty',
    url: '/warranty',
    target: '_self',
    has_children: false,
    children: [],
  },
  {
    id: 7,
    order: 7,
    title: 'nav.how_it_works',
    url: '/#how-it-works',
    target: '_self',
    has_children: false,
    children: [],
  },
  {
    id: 8,
    order: 8,
    title: 'nav.faq',
    url: '/faq',
    target: '_self',
    has_children: false,
    children: [],
  },
];

export default navbarData;
