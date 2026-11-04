import { useEffect, useState } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { SallaSearch } from '@salla.sa/twilight-components-react/search';
import { SallaSocial } from '@salla.sa/twilight-components-react/social';
import { SallaCartSummary } from '@salla.sa/twilight-components-react/cart-summary';
import { useTwilight, useIsHome } from '@salla.sa/twilight-theme-engine/providers';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { PageAdvertisements } from '@salla.sa/twilight-theme-engine/layout';
import { MapPinIcon, SearchIcon, ShoppingBagIcon } from '../icons';
import { useHydrated } from '../../hooks/useHydrated';
import { HOME_ROUTE_ID, PRODUCT_ROUTE_ID } from '../../lib/routeIds';
import { HeaderMainMenu } from './HeaderMainMenu';
import { HeaderNav } from './HeaderNav';
import { HeaderTopnav } from './HeaderTopnav';
import { ShieldoLogo } from '../shared/icons/BrandIcons';
import { PrimaryButton } from '../shared/buttons/PrimaryButton';
import { openStoreSwitcher } from '../../lib/storeSwitchers';

/** Opens the Salla search modal (the `<SallaSearch />` at the end of the header). */
const openSearch = () => window.salla?.event?.dispatch('search::open');

const openScopes = () => window.salla?.event?.dispatch('scopes::open');

const hasSocialLinks = (social?: object) =>
  Object.entries(social ?? {}).some(([key, value]) => Boolean(value) && key !== 'whatsapp');

/** Search trigger — opens the Salla search modal via the `search::open` event. */
function SearchButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="header-action site-header__search"
      aria-label={label}
      onClick={openSearch}
    >
      <SearchIcon aria-hidden="true" />
    </button>
  );
}

/** Branch / scope trigger */
function ScopeButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      data-testid="store-header-scope-btn"
      className="header-action site-header__scope"
      aria-label={label}
      aria-haspopup="dialog"
      title={label}
      onClick={openScopes}
    >
      <MapPinIcon aria-hidden="true" />
    </button>
  );
}

function HeaderIntro() {
  const { store } = useTwilight();
  const isHome = useIsHome();
  const hydrated = useHydrated();
  const Title = hydrated && isHome ? 'h1' : 'p';
  const hasSocial = hasSocialLinks(store?.social);

  return (
    <div className="site-header__intro">
      <div className="container site-header__intro-inner">
        <Title className="site-header__intro-title">{store?.name}</Title>
        {store?.description && (
          <div
            className="site-header__intro-text"
            dangerouslySetInnerHTML={{ __html: store.description }}
          />
        )}
        <div className={`site-header__social-slot${hasSocial ? ' has-links' : ''}`}>
          <SallaSocial className="site-header__social" />
        </div>
      </div>
    </div>
  );
}

interface HeaderProps {
  navOpen?: boolean;
  onNavOpenChange?: (open: boolean) => void;
}

export function Header({ navOpen: navOpenProp, onNavOpenChange }: HeaderProps = {}) {
  const { store, theme } = useTwilight();
  const { t, languageName } = useTranslation();
  const isDefaultLayout = theme?.settings?.header_layout === 'default';
  const stickyEnabled = theme?.settings?.header_is_sticky !== false;
  const [navOpenState, setNavOpenState] = useState(false);
  const navOpen = navOpenProp ?? navOpenState;
  const setNavOpen = (open: boolean) => {
    if (navOpenProp === undefined) setNavOpenState(open);
    onNavOpenChange?.(open);
  };
  const [scrolled, setScrolled] = useState(false);

  const isProductPage = useRouterState({
    select: (state) => Boolean(state.matches?.some((match) => match.routeId === PRODUCT_ROUTE_ID)),
  });

  const isHomeEngine = useIsHome();
  const isHomeRoute = useRouterState({
    select: (state) => Boolean(state.matches?.some((match) => match.routeId === HOME_ROUTE_ID)),
  });
  const isHomePage = isHomeEngine || isHomeRoute;

  const introSettings = theme?.settings as
    | { header_show_store_info?: boolean; header_store_info_home_only?: boolean }
    | undefined;
  const showIntro =
    !isDefaultLayout &&
    introSettings?.header_show_store_info !== false &&
    (introSettings?.header_store_info_home_only === false || isHomePage);

  // Scroll listener: transparent in first h-screen (hero), theme solid after
  useEffect(() => {
    if (!stickyEnabled) {
      setScrolled(false);
      return;
    }

    const onScroll = () => {
      // In first screen (h-screen / hero), stay transparent.
      // Transition to solid theme color after scrolling past the hero (70% viewport or ~500px).
      const threshold = isHomePage ? Math.max(window.innerHeight * 0.7, 500) : 40;
      setScrolled(window.scrollY > threshold);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHomePage, stickyEnabled]);

  const searchLabel = t('blocks.header.search', 'Search');

  return (
    <header
      className={`site-header site-header--${isDefaultLayout ? 'default' : 'lite'}${
        isProductPage ? ' site-header--product' : ''
      }${isHomePage ? ' site-header--home' : ''}${scrolled ? ' is-scrolled' : ''}`}
      suppressHydrationWarning
    >
      <HookSlot name="header:start" />

      <div className={`site-header__ad${isHomePage ? ' hidden' : ''}`}>
        <PageAdvertisements />
      </div>

      <div className={`site-header__bullet lg:hidden${isHomePage ? ' hidden' : ''}`}>
        <salla-bullet-delivery-tag data-testid="store-header-bullet-delivery-mobile" />
      </div>

      {isDefaultLayout ? (
        <div className={isHomePage ? 'hidden' : ''}>
          <HeaderTopnav />
        </div>
      ) : (
        <div className="site-header__bullet site-header__bullet--desktop hidden lg:block">
          <div className="container">
            <salla-bullet-delivery-tag data-testid="store-header-bullet-delivery-desktop" />
          </div>
        </div>
      )}

      <div
        className={`site-header__bar-outer ${
          isHomePage && !scrolled ? 'site-header__bar-outer--transparent' : ''
        }`}
      >
        <div
          className={`site-header__bar ${
            scrolled ? 'is-scrolled' : isHomePage ? 'site-header__bar--transparent' : ''
          }`}
        >
          <div className="container site-header__bar-inner">
            {/* Mobile Nav Toggle */}
            <div className="site-header__nav-toggle">
              <button
                type="button"
                className="header-action"
                aria-label={t('blocks.header.main_menu', 'Menu')}
                aria-expanded={navOpen}
                onClick={() => setNavOpen(true)}
              >
                <span className="site-header__burger" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
              </button>
            </div>

            {/* Brand Logo: Shieldo Pro */}
            <Link className="site-header__brand flex items-center shrink-0" to={store?.url || '/'}>
              <ShieldoLogo light={!scrolled && isHomePage} className="h-9 md:h-10 w-auto" />
              <span className="sr-only">{store?.name || 'Shieldo Pro'}</span>
            </Link>

            {/* Desktop Navigation Mega-Menu */}
            {isDefaultLayout && (
              <nav
                className="site-header__mainmenu"
                aria-label={t('blocks.header.main_menu', 'Menu')}
              >
                <HeaderMainMenu />
              </nav>
            )}

            {/* Actions: Language, Cart, Search, Shop Now Button */}
            <div className="site-header__actions flex items-center gap-2 sm:gap-3 justify-self-end">
              {/* Language Switcher (EN) */}
              <button
                type="button"
                onClick={() => openStoreSwitcher('language')}
                className={`header-lang-btn px-2.5 py-1 text-xs md:text-sm font-bold uppercase transition-colors ${
                  !scrolled && isHomePage
                    ? 'text-white hover:text-primary'
                    : 'text-secondary dark:text-gray-200 hover:text-primary'
                }`}
                aria-label={t('blocks.header.language', 'Language')}
              >
                {languageName === 'العربية' ? 'EN' : 'العربية'}
              </button>

              <SearchButton label={searchLabel} />

              {store?.scope && (
                <ScopeButton label={store.scope.name || t('blocks.header.branches', 'Branches')} />
              )}

              <SallaCartSummary className="header-action">
                <ShoppingBagIcon slot="icon" aria-hidden="true" />
              </SallaCartSummary>

              {/* Shop Now Gold CTA Button from Figma */}
              <PrimaryButton
                href="/products"
                variant="primary"
                size="sm"
                className="hidden sm:inline-flex text-xs md:text-sm font-bold px-4 py-2 rounded-xl text-[#2B2B2B] shadow-sm hover:shadow"
              >
                {t('blocks.header.shop_now', 'تسوق الآن')}
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>

      {showIntro && <HeaderIntro />}

      <HeaderNav open={navOpen} onClose={() => setNavOpen(false)} />

      <SallaSearch suppressHydrationWarning />

      <HookSlot name="header:end" />
    </header>
  );
}
