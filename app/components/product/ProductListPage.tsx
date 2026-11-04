import { useState, useMemo, useEffect } from 'react';
import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Breadcrumb, NoContent } from '@salla.sa/twilight-theme-engine/common';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import type { ProductListLoaderData } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { ProductCardItem, type ProductItem } from '../shared/cards/ProductCardItem';
import { ProductListHero } from './ProductListHero';
import { BottomSheet } from '../common';
import { product, parseNextPageToken } from '@salla.sa/twilight-theme-engine/api/product';
import { getProductFilterData } from './productHelpers';

export type CategoryFilter = 'all' | 'thermal' | 'ppf' | 'offers';
export type SortOption = 'latest' | 'price-asc' | 'price-desc' | 'popular';

function isSallaProduct(item: Product | ProductItem): item is Product {
  return 'name' in item;
}

export function ProductListPage({ page, source, query, pagination, products: initialProducts }: ProductListLoaderData) {
  const { theme } = useTwilight();
  const { t, isRTL } = useTranslation();

  const [extra, setExtra] = useState<Product[]>([]);
  const [nextCursor, setNextCursor] = useState(pagination?.next);
  const [loading, setLoading] = useState(false);
  useEffect(() => { setExtra([]); setNextCursor(pagination?.next); }, [pagination?.next]);
  const handleLoadMore = async () => {
    if (!nextCursor || loading) return;
    setLoading(true);
    const { cursor, page: p } = parseNextPageToken(nextCursor);
    const res = await product.list({ source: source?.type ?? 'latest', sourceValue: source?.value, sort: query?.sort, cursor, page: p }).catch(() => null);
    if (res) { setExtra((prev) => [...prev, ...res.items]); setNextCursor(res.next); }
    setLoading(false);
  };

  // Active Category Tab
  const [activeTab, setActiveTab] = useState<CategoryFilter>('all');
  // Search Query
  const [searchQuery, setSearchQuery] = useState('');
  // Sorting
  const [selectedSort, setSelectedSort] = useState<SortOption>('latest');
  // Mobile Filter Drawer
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Multi-select Filters
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTintLevels, setSelectedTintLevels] = useState<string[]>([]);
  const [trafficCompliantOnly, setTrafficCompliantOnly] = useState(false);

  // Read URL query params on mount (e.g. /products?category=thermal)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat === 'thermal' || cat === 'ppf' || cat === 'offers') {
      setActiveTab(cat);
    }
  }, []);

  // Combined product pool: use Salla dynamic products if available
  const baseProducts = useMemo<(Product | ProductItem)[]>(() => {
    return initialProducts?.length ? [...initialProducts, ...extra] : [];
  }, [initialProducts, extra]);

  // Handle Tab Switch
  const handleTabChange = (tab: CategoryFilter) => {
    setActiveTab(tab);
    if (tab === 'thermal') {
      setSelectedCategories(['thermal']);
    } else if (tab === 'ppf') {
      setSelectedCategories(['ppf']);
    } else {
      setSelectedCategories([]);
    }
  };

  // Toggle Category Checkbox
  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Toggle Tint Level Checkbox
  const toggleTintLevel = (level: string) => {
    setSelectedTintLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedTintLevels([]);
    setTrafficCompliantOnly(false);
    setSearchQuery('');
    setActiveTab('all');
  };

  const activeFiltersCount =
    (selectedCategories.length > 0 ? 1 : 0) +
    (selectedTintLevels.length > 0 ? 1 : 0) +
    (trafficCompliantOnly ? 1 : 0) +
    (searchQuery ? 1 : 0);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return baseProducts.filter((p) => {
      // Normalize item properties
      const isSalla = isSallaProduct(p);
      const title = isSalla ? p.name : p.title;
      const desc = isSalla ? p.subtitle || '' : p.description;
      const sf = isSalla ? getProductFilterData(p) : null;
      const category = !isSalla ? p.category : (sf?.category || '');
      const tintLevel = !isSalla ? p.tintLevel : (sf?.tintLevel || '');
      const isTrafficCompliant = !isSalla ? Boolean(p.trafficCompliant) : true;
      const hasDiscount = isSalla ? Boolean(p.is_on_sale) : Boolean(p.originalPrice);

      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = title.toLowerCase().includes(q);
        const matchesDesc = desc.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }

      // 2. Tab Filter
      if (activeTab === 'thermal' && category && category !== 'thermal') return false;
      if (activeTab === 'ppf' && category && category !== 'ppf') return false;
      if (activeTab === 'offers' && !hasDiscount) return false;

      // 3. Category Checkbox Filter
      if (selectedCategories.length > 0 && category) {
        if (!selectedCategories.includes(category)) return false;
      }

      // 4. Tint Level Filter
      if (selectedTintLevels.length > 0 && tintLevel) {
        if (!selectedTintLevels.includes(tintLevel)) return false;
      }

      // 5. Traffic Compliance Filter
      if (trafficCompliantOnly && !isTrafficCompliant) return false;

      return true;
    }).sort((a, b) => {
      const getPrice = (item: Product | ProductItem): number => {
        if ('regular_price' in item || 'sale_price' in item) {
          return Number(item.sale_price ?? item.price ?? 0);
        }
        return Number(item.price);
      };

      if (selectedSort === 'price-asc') {
        return getPrice(a) - getPrice(b);
      }
      if (selectedSort === 'price-desc') {
        return getPrice(b) - getPrice(a);
      }
      return 0; // Default latest/order
    });
  }, [
    baseProducts,
    searchQuery,
    activeTab,
    selectedCategories,
    selectedTintLevels,
    trafficCompliantOnly,
    selectedSort,
  ]);

  return (
    <div className="bg-[#FAF8F5] dark:bg-[#121212] min-h-screen pb-20" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* 1. Hero Banner */}
      <ProductListHero />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="catalog-content">
        {/* Optional Breadcrumbs */}
        {theme?.settings?.product_index_show_breadcrumbs !== false && page && (
          <div className="mb-6">
            <Breadcrumb page={page} />
          </div>
        )}

        <HookSlot name="product:list.start" />

        {/* 2. Top Category Tabs Bar */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-800 p-2 sm:p-3 mb-6">
          <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-8 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => handleTabChange('all')}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base whitespace-nowrap transition-all duration-200 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#D89F2D] text-neutral-900 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-[#D89F2D]'
              }`}
            >
              {t('pages.products.tab_all', 'جميع المنتجات')}
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('thermal')}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base whitespace-nowrap transition-all duration-200 cursor-pointer ${
                activeTab === 'thermal'
                  ? 'bg-[#D89F2D] text-neutral-900 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-[#D89F2D]'
              }`}
            >
              {t('pages.products.tab_thermal', 'العزل الحراري')}
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('ppf')}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base whitespace-nowrap transition-all duration-200 cursor-pointer ${
                activeTab === 'ppf'
                  ? 'bg-[#D89F2D] text-neutral-900 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-[#D89F2D]'
              }`}
            >
              {t('pages.products.tab_ppf', 'حماية الطلاء PPF')}
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('offers')}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base whitespace-nowrap transition-all duration-200 cursor-pointer ${
                activeTab === 'offers'
                  ? 'bg-[#D89F2D] text-neutral-900 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-[#D89F2D]'
              }`}
            >
              {t('pages.products.tab_offers', 'العروض')}
            </button>
          </div>
        </div>

        {/* 3. Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('pages.products.search_placeholder', 'ابحث عن المنتج...')}
              className="w-full h-12 sm:h-14 pr-12 pl-10 bg-white dark:bg-[#1E1E1E] text-gray-800 dark:text-white rounded-2xl border border-gray-200 dark:border-neutral-700 focus:outline-none focus:border-[#D89F2D] focus:ring-2 focus:ring-[#D89F2D]/20 text-sm sm:text-base transition-all shadow-sm"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Mobile Filter & Sort Control Bar */}
        <div className="flex lg:hidden items-center justify-between gap-3 mb-6">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="flex-1 h-11 bg-[#D89F2D] text-neutral-900 font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
            </svg>
            <span>{t('pages.products.filter_btn', 'التصفية')} {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
          </button>

          <div className="relative flex-1">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as SortOption)}
              className="w-full h-11 bg-white dark:bg-[#1E1E1E] text-gray-800 dark:text-gray-200 font-bold text-xs sm:text-sm px-3 rounded-xl border border-gray-200 dark:border-neutral-700 focus:outline-none focus:border-[#D89F2D]"
            >
              <option value="latest">{t('pages.products.sort_latest_prefix', 'الترتيب: الأحدث')}</option>
              <option value="price-asc">{t('pages.products.sort_price_asc_prefix', 'السعر: من الأقل للأعلى')}</option>
              <option value="price-desc">{t('pages.products.sort_price_desc_prefix', 'السعر: من الأعلى للأقل')}</option>
              <option value="popular">{t('pages.products.sort_popular', 'الأكثر طلباً')}</option>
            </select>
          </div>
        </div>

        {/* 4. Desktop Layout: Sidebar Filters + Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-24">
            <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-100 dark:border-neutral-800 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-100 dark:border-neutral-800">
                <h3 className="font-black text-lg text-gray-900 dark:text-white">{t('pages.products.filters_title', 'الفلاتر')}</h3>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-xs font-bold text-[#D89F2D] hover:underline"
                  >
                    {t('pages.products.clear_all', 'مسح الكل')}
                  </button>
                )}
              </div>

              {/* Filter 1: Category */}
              <div className="mb-6">
                <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-3">{t('pages.products.category_filter', 'الفئة')}</h4>
                <div className="space-y-2.5">
                  <label className="flex items-center gap-3 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes('thermal')}
                      onChange={() => toggleCategory('thermal')}
                      className="w-4 h-4 rounded text-[#D89F2D] focus:ring-[#D89F2D] border-gray-300 dark:border-neutral-700 dark:bg-neutral-800"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      {t('pages.products.category_thermal', 'عزل حراري')}
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes('ppf')}
                      onChange={() => toggleCategory('ppf')}
                      className="w-4 h-4 rounded text-[#D89F2D] focus:ring-[#D89F2D] border-gray-300 dark:border-neutral-700 dark:bg-neutral-800"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      {t('pages.products.category_ppf', 'حماية الطلاء')}
                    </span>
                  </label>
                </div>
              </div>

              {/* Filter 2: Insulation Level */}
              <div className="mb-6 pt-5 border-t border-gray-100 dark:border-neutral-800">
                <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-3">{t('pages.products.tint_level_filter', 'مستوى العزل')}</h4>
                <div className="space-y-2.5">
                  <label className="flex items-center gap-3 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      checked={selectedTintLevels.includes('50')}
                      onChange={() => toggleTintLevel('50')}
                      className="w-4 h-4 rounded text-[#D89F2D] focus:ring-[#D89F2D] border-gray-300 dark:border-neutral-700 dark:bg-neutral-800"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      {t('pages.products.tint_50', 'شفاف 50%')}
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      checked={selectedTintLevels.includes('35')}
                      onChange={() => toggleTintLevel('35')}
                      className="w-4 h-4 rounded text-[#D89F2D] focus:ring-[#D89F2D] border-gray-300 dark:border-neutral-700 dark:bg-neutral-800"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      {t('pages.products.tint_35', 'خفيف العتمة 35% (VLT)')}
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      checked={selectedTintLevels.includes('20-25')}
                      onChange={() => toggleTintLevel('20-25')}
                      className="w-4 h-4 rounded text-[#D89F2D] focus:ring-[#D89F2D] border-gray-300 dark:border-neutral-700 dark:bg-neutral-800"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      {t('pages.products.tint_20_25', 'متوسط العتمة 20% - 25%')}
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      checked={selectedTintLevels.includes('10-15')}
                      onChange={() => toggleTintLevel('10-15')}
                      className="w-4 h-4 rounded text-[#D89F2D] focus:ring-[#D89F2D] border-gray-300 dark:border-neutral-700 dark:bg-neutral-800"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      {t('pages.products.tint_10_15', 'معتم 10% - 15%')}
                    </span>
                  </label>
                </div>
              </div>

              {/* Filter 3: Compliance */}
              <div className="mb-6 pt-5 border-t border-gray-100 dark:border-neutral-800">
                <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-3">{t('pages.products.compliance_filter', 'التوافق')}</h4>
                <label className="flex items-center gap-3 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={trafficCompliantOnly}
                    onChange={(e) => setTrafficCompliantOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-[#D89F2D] focus:ring-[#D89F2D] border-gray-300 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    {t('pages.products.traffic_compliant', 'متوافق مع إرشادات المرور')}
                  </span>
                </label>
              </div>

              {/* Filter 4: Sort */}
              <div className="pt-5 border-t border-gray-100 dark:border-neutral-800">
                <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-2">{t('pages.products.sort_by', 'الترتيب حسب')}</h4>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value as SortOption)}
                  className="w-full h-11 bg-gray-50 dark:bg-neutral-800 text-gray-800 dark:text-gray-200 font-bold text-sm px-3 rounded-xl border border-gray-200 dark:border-neutral-700 focus:outline-none focus:border-[#D89F2D]"
                >
                  <option value="latest">{t('pages.products.sort_latest', 'الأحدث')}</option>
                  <option value="price-asc">{t('pages.products.sort_price_asc', 'السعر: من الأقل للأعلى')}</option>
                  <option value="price-desc">{t('pages.products.sort_price_desc', 'السعر: من الأعلى للأقل')}</option>
                  <option value="popular">{t('pages.products.sort_popular', 'الأكثر طلباً')}</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Product Grid Area (3 Columns) */}
          <main className="lg:col-span-9">
            {/* Products Header Bar */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                {t('pages.products.all_products_count', 'جميع المنتجات')}{' '}
                <span className="text-sm font-normal text-gray-500 mr-2">
                  ({filteredProducts.length} {t('pages.products.product_unit', 'منتج')})
                </span>
              </h2>
            </div>

            {/* Grid */}
            {!initialProducts?.length ? (
              <NoContent
                icon="sicon-box-empty"
                message={t('pages.products.no_products', 'لا توجد منتجات حالياً')}
              />
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {filteredProducts.map((prod) => (
                  <ProductCardItem key={prod.id} product={prod} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-12 text-center border border-gray-100 dark:border-neutral-800 shadow-sm my-6">
                <div className="w-16 h-16 bg-[#FFF9ED] text-[#D89F2D] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('pages.products.no_matches_title', 'لا توجد منتجات مطابقة لخياراتك')}
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  {t('pages.products.no_matches_desc', 'جرّب تغيير فلاتر البحث أو مسح الكلمات للوصول إلى المنتجات.')}
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-[#D89F2D] text-neutral-900 font-bold rounded-xl text-sm hover:bg-[#c58f25] transition-colors"
                >
                  {t('pages.products.reset_filters', 'إعادة ضبط الفلاتر')}
                </button>
              </div>
            )}

            {nextCursor && (
              <div className="text-center mt-8">
                <button type="button" onClick={handleLoadMore} disabled={loading}
                  className="px-8 py-3 bg-[#D89F2D] text-neutral-900 font-bold rounded-xl hover:bg-[#c58f25] transition-colors disabled:opacity-50">
                  {loading ? t('pages.products.loading', 'جاري التحميل...') : t('pages.products.show_more', 'عرض المزيد')}
                </button>
              </div>
            )}
          </main>
        </div>

        <HookSlot name="product:list.end" />
      </div>

      {/* Mobile Filters Bottom Sheet */}
      <BottomSheet
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        title={t('pages.products.drawer_title', 'تصفية المنتجات')}
      >
        <div className="p-4 space-y-6 text-start" dir={isRTL ? 'rtl' : 'ltr'}>
          <div>
            <h4 className="font-bold text-base text-gray-900 dark:text-white mb-3">{t('pages.products.category_filter', 'الفئة')}</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes('thermal')}
                  onChange={() => toggleCategory('thermal')}
                  className="w-4 h-4 rounded text-[#D89F2D] focus:ring-[#D89F2D]"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t('pages.products.category_thermal', 'عزل حراري')}</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes('ppf')}
                  onChange={() => toggleCategory('ppf')}
                  className="w-4 h-4 rounded text-[#D89F2D] focus:ring-[#D89F2D]"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t('pages.products.category_ppf', 'حماية الطلاء')}</span>
              </label>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-base text-gray-900 dark:text-white mb-3">{t('pages.products.tint_level_filter', 'مستوى العزل')}</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedTintLevels.includes('50')}
                  onChange={() => toggleTintLevel('50')}
                  className="w-4 h-4 rounded text-[#D89F2D] focus:ring-[#D89F2D]"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t('pages.products.tint_50', 'شفاف 50%')}</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedTintLevels.includes('35')}
                  onChange={() => toggleTintLevel('35')}
                  className="w-4 h-4 rounded text-[#D89F2D] focus:ring-[#D89F2D]"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t('pages.products.tint_35_short', 'خفيف العتمة 35%')}</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedTintLevels.includes('20-25')}
                  onChange={() => toggleTintLevel('20-25')}
                  className="w-4 h-4 rounded text-[#D89F2D] focus:ring-[#D89F2D]"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t('pages.products.tint_20_25', 'متوسط العتمة 20% - 25%')}</span>
              </label>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={trafficCompliantOnly}
                onChange={(e) => setTrafficCompliantOnly(e.target.checked)}
                className="w-4 h-4 rounded text-[#D89F2D] focus:ring-[#D89F2D]"
              />
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                {t('pages.products.traffic_compliant', 'متوافق مع إرشادات المرور')}
              </span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="flex-1 py-3 bg-[#D89F2D] text-neutral-900 font-bold rounded-xl text-center"
            >
              {t('pages.products.view_results', 'عرض النتائج')} ({filteredProducts.length})
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-3 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 font-bold rounded-xl"
            >
              {t('pages.products.cancel', 'إلغاء')}
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}

export default ProductListPage;
