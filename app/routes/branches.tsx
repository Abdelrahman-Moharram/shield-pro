import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';

/**
 * Branch shape — matches what the merchant adds in twilight.json installation_centers setting.
 * Each branch is a plain object stored in settings.installation_centers (array).
 */
interface BranchItem {
  name: string;
  city: string;
  district?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  mapUrl?: string;
  hours?: string;
  services?: string; // comma-separated
}

export const Route = (createFileRoute as any)('/{-$locale}/branches')({
  head: () => ({
    meta: [
      { title: 'مراكز التركيب المعتمدة | شيلدو برو Shieldo Pro' },
      { name: 'description', content: 'فروع ومراكز تركيب شيلدو برو المعتمدة في مختلف مدن المملكة.' },
    ],
  }),
  component: BranchesPage,
});

function BranchesPage() {
  const { t } = useTranslation();
  const { theme } = useTwilight();
  const settings = (theme?.settings || {}) as Record<string, any>;

  // Branches come from twilight.json setting `installation_centers` (array of objects).
  // See twilight.json: settings[].id = "installation_centers"
  const branches: BranchItem[] = Array.isArray(settings.installation_centers)
    ? settings.installation_centers
    : [];

  const cities = useMemo(() => {
    const unique = Array.from(new Set(branches.map((b) => b.city).filter(Boolean)));
    return ['الكل', ...unique];
  }, [branches]);

  const [selectedCity, setSelectedCity] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    return branches.filter((b) => {
      const matchCity = selectedCity === 'الكل' || b.city === selectedCity;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        b.name?.toLowerCase().includes(q) ||
        b.city?.toLowerCase().includes(q) ||
        b.district?.toLowerCase().includes(q) ||
        b.address?.toLowerCase().includes(q);
      return matchCity && matchSearch;
    });
  }, [branches, selectedCity, searchQuery]);

  return (
    <div className="branches-page min-h-screen bg-[#FDFBF7] py-8 sm:py-12 text-start">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-gray-500 font-medium">
          <Link to="/" className="hover:text-[#CCA352] transition-colors">
            {t('blocks.header.home', 'الرئيسية')}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-bold">مراكز التركيب المعتمدة</span>
        </nav>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
            مراكز التركيب المعتمدة
          </h1>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            أقرب مركز معتمد في مدينتك لتركيب أفلام العزل الحراري وحماية الطلاء بأيدي فنيين
            محترفين وضمان رسمي.
          </p>
        </div>

        {/* No data state — tell merchant to add branches */}
        {branches.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300 mb-12">
            <svg
              className="w-10 h-10 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="text-gray-400 font-medium text-sm">
              لم تُضف مراكز تركيب بعد.
            </p>
            <p className="text-gray-400 text-xs mt-1">
              أضف مراكزك عبر{' '}
              <strong className="text-gray-600">
                إعدادات المظهر &rarr; installation_centers
              </strong>
            </p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                {cities.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setSelectedCity(city)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      selectedCity === city
                        ? 'bg-[#CCA352] text-white shadow-sm'
                        : 'bg-[#F3F4F6] text-gray-600 hover:bg-gray-200/80'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
              <div className="relative w-full md:w-72 shrink-0">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث بالحي أو المدينة..."
                  className="w-full h-10 bg-[#F9FAFB] border border-gray-200 focus:border-[#CCA352] rounded-xl ps-9 pe-3 text-xs text-gray-800 placeholder-gray-400 focus:outline-none transition-all"
                />
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Grid */}
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {filtered.map((branch, idx) => {
                  const serviceList = branch.services
                    ? branch.services.split(',').map((s) => s.trim()).filter(Boolean)
                    : [];
                  return (
                    <div
                      key={idx}
                      className="bg-white border border-gray-200/80 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between transition-all hover:border-[#CCA352]/60 hover:shadow-md"
                    >
                      <div>
                        {/* City Badge */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#F3EDE2] text-[#8B6B23]">
                            {branch.city}
                          </span>
                        </div>

                        {/* Name */}
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 leading-snug">
                          {branch.name}
                        </h3>
                        {branch.district && (
                          <p className="text-xs text-gray-500 mb-3">{branch.district}</p>
                        )}

                        {/* Address */}
                        {branch.address && (
                          <div className="flex items-start gap-2 text-xs text-gray-600 mb-2">
                            <svg
                              className="w-4 h-4 text-[#CCA352] shrink-0 mt-0.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span>{branch.address}</span>
                          </div>
                        )}

                        {/* Hours */}
                        {branch.hours && (
                          <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                            <svg
                              className="w-4 h-4 text-gray-400 shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span>{branch.hours}</span>
                          </div>
                        )}

                        {/* Services */}
                        {serviceList.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {serviceList.map((srv, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded text-[11px] bg-gray-100 text-gray-600"
                              >
                                {srv}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                        {branch.mapUrl && (
                          <a
                            href={branch.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 h-9 rounded-lg bg-[#CCA352] hover:bg-[#b89143] text-neutral-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                              />
                            </svg>
                            <span>الاتجاهات</span>
                          </a>
                        )}
                        {branch.whatsapp && (
                          <a
                            href={`https://wa.me/${branch.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] flex items-center justify-center transition-colors"
                            aria-label="WhatsApp"
                          >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.529 1.83.81 2.788.81 3.18 0 5.767-2.587 5.768-5.766.001-3.181-2.587-5.796-5.765-5.796zm3.385 8.199c-.143.401-.734.733-1.018.78-.284.047-.655.074-1.077-.063-.332-.109-.768-.261-1.341-.508-1.523-.657-2.508-2.186-2.584-2.288-.076-.102-.62-8.24-.62-1.572 0-.748.39-1.116.529-1.267.14-.15.305-.188.406-.188.102 0 .203.001.292.006.094.004.22-.036.344.263.127.307.433 1.056.471 1.133.038.077.064.167.013.269-.051.103-.076.167-.152.257-.076.09-.16.201-.229.27-.077.077-.157.161-.067.315.09.153.399.658.855 1.064.587.523 1.082.686 1.235.763.153.076.242.064.331-.039.09-.102.383-.445.485-.598.102-.153.204-.128.344-.077.14.051.89.42 1.043.496.152.077.254.115.292.179.038.064.038.371-.105.772z" />
                            </svg>
                          </a>
                        )}
                        {branch.phone && (
                          <a
                            href={`tel:${branch.phone}`}
                            className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
                            aria-label="Call"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 mb-12">
                <p className="text-gray-500 font-medium text-sm">لم يتم العثور على فروع مطابقة.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
