import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { hapticImpact } from '@salla.sa/twilight-theme-engine/native-app';
import { getActiveCurrency } from '@salla.sa/twilight-theme-engine/api/client';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import type { Product, ProductOption } from '@salla.sa/twilight-theme-engine/types';
import { isAutomotiveTintProduct } from './productHelpers';
import { useProductFields } from './useProductFields';

interface AddToCartFormProps {
  product: Product;
  initialProduct?: Product;
  stickyAddToCart?: boolean;
  giftingIntro?: string;
  formStartSlot?: ReactNode;
  formEndSlot?: ReactNode;
}

/**
 * Renders one product option field matching the type returned by Salla backend.
 */
function renderProductOptionField(opt: ProductOption, priceCurrency: any, t: (key: string, def: string) => string) {
  const values = opt.details || opt.values || [];
  const type = (opt.type || '').toLowerCase();
  const baseInput = 'w-full h-11 bg-[#F3F4F6] hover:bg-gray-200/80 focus:bg-white border border-transparent focus:border-[#CCA352] rounded-xl px-4 text-xs sm:text-sm text-gray-700 font-medium focus:outline-none transition-all box-border';

  if (type === 'text' || type === 'string') {
    return <input type="text" name={`options[${opt.id}]`} required={opt.required} placeholder={`${t('pages.products.enter_option', 'أدخل')} ${opt.name}`} className={baseInput} />;
  }
  if (type === 'textarea') {
    return <textarea name={`options[${opt.id}]`} required={opt.required} rows={2} placeholder={`${t('pages.products.enter_option', 'أدخل')} ${opt.name}...`} className="w-full min-h-[44px] bg-[#F3F4F6] hover:bg-gray-200/80 focus:bg-white border border-transparent focus:border-[#CCA352] rounded-xl py-2.5 px-4 text-xs sm:text-sm text-gray-700 font-medium focus:outline-none transition-all resize-none box-border" />;
  }
  if (type === 'date') {
    return <input type="date" name={`options[${opt.id}]`} required={opt.required} className={baseInput + ' cursor-pointer'} />;
  }
  if (type === 'time') {
    return <input type="time" name={`options[${opt.id}]`} required={opt.required} className={baseInput + ' cursor-pointer'} />;
  }
  if (type === 'datetime' || type === 'date-time') {
    return <input type="datetime-local" name={`options[${opt.id}]`} required={opt.required} className={baseInput + ' cursor-pointer'} />;
  }
  if (type === 'color' && values.length > 0) {
    return (
      <div className="flex flex-wrap gap-2 pt-1">
        {values.map((val) => {
          const colorHex = (val as any).color || (val as any).option_value || '#ccc';
          return (
            <label key={val.id} className="relative flex items-center justify-center cursor-pointer" title={val.name}>
              <input type="radio" name={`options[${opt.id}]`} value={val.id} required={opt.required} className="sr-only peer" />
              <span className="w-7 h-7 rounded-full border border-gray-300 peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-[#CCA352] transition-all" style={{ backgroundColor: colorHex }} />
            </label>
          );
        })}
      </div>
    );
  }
  if ((type === 'image' || type === 'thumbnail') && values.length > 0) {
    return (
      <div className="flex flex-wrap gap-2 pt-1">
        {values.map((val) => {
          const imgUrl = (val as any).image || (val as any).image_url;
          return (
            <label key={val.id} className="relative flex items-center justify-center cursor-pointer" title={val.name}>
              <input type="radio" name={`options[${opt.id}]`} value={val.id} required={opt.required} className="sr-only peer" />
              {imgUrl ? (
                <img src={imgUrl} alt={val.name} width={40} height={40} className="w-10 h-10 object-cover rounded-lg border border-gray-200 peer-checked:border-[#CCA352] peer-checked:ring-2 peer-checked:ring-[#CCA352] transition-all" />
              ) : (
                <span className="px-3 py-1.5 rounded-lg border border-gray-200 peer-checked:border-[#CCA352] peer-checked:bg-[#CCA352]/10 text-xs font-medium">{val.name}</span>
              )}
            </label>
          );
        })}
      </div>
    );
  }
  if (type === 'radio' && values.length > 0) {
    return (
      <div className="flex flex-wrap gap-2 pt-1">
        {values.map((val) => (
          <label key={val.id} className="cursor-pointer">
            <input type="radio" name={`options[${opt.id}]`} value={val.id} required={opt.required} className="sr-only peer" />
            <span className="inline-block px-3.5 py-2 rounded-lg bg-[#F3F4F6] hover:bg-gray-200/80 peer-checked:bg-[#CCA352] peer-checked:text-white text-xs text-gray-700 font-medium transition-all">{val.name}</span>
          </label>
        ))}
      </div>
    );
  }
  if (type === 'checkbox' && values.length > 0) {
    return (
      <div className="flex flex-col gap-1.5 pt-1">
        {values.map((val) => (
          <label key={val.id} className="inline-flex items-center gap-2 cursor-pointer text-xs text-gray-700">
            <input type="checkbox" name={`options[${opt.id}][]`} value={val.id} className="rounded text-[#CCA352] focus:ring-[#CCA352]" />
            <span>{val.name}</span>
          </label>
        ))}
      </div>
    );
  }
  if (type === 'file') {
    return <input type="file" name={`options[${opt.id}]`} required={opt.required} className="w-full text-xs text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#F3F4F6] file:text-gray-700 hover:file:bg-gray-200" />;
  }

  // Default: select / dropdown
  return (
    <div className="relative w-full">
      <select
        name={`options[${opt.id}]`}
        defaultValue=""
        required={opt.required}
        className="w-full h-11 appearance-none bg-[#F3F4F6] hover:bg-gray-200/80 focus:bg-white border border-transparent focus:border-[#CCA352] rounded-xl ps-4 pe-10 text-xs sm:text-sm text-gray-700 font-medium focus:outline-none transition-all cursor-pointer box-border"
      >
        <option value="" disabled>{t('pages.products.select_option', 'اختر')}</option>
        {values.map((val) => {
          const extraPrice = (val as any).additional_price ?? (val as any).price;
          return (
            <option key={val.id} value={val.id}>
              {val.name}{extraPrice ? ` (+${extraPrice} ${priceCurrency})` : ''}
            </option>
          );
        })}
      </select>
      <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3.5 text-gray-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

export function AddToCartForm({
  product,
  initialProduct,
  formStartSlot,
  formEndSlot,
}: AddToCartFormProps) {
  const { t } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);
  const [quantity, setQuantity] = useState(1);
  const priceCurrency = getActiveCurrency(product.currency);
  const { theme } = useTwilight();
  const settings = (theme?.settings || {}) as Record<string, any>;

  // Traffic compliance text — shown only on automotive tint products, customizable in theme settings
  const trafficTitle =
    (settings.product_traffic_compliance_title as string) || t('pages.products.traffic_compliance_title', 'التوافق مع إرشادات المرور');
  const trafficText =
    (settings.product_traffic_compliance_text as string) ||
    t('pages.products.traffic_compliance_text', 'هذا المنتج متوافق مع إرشادات المرور السعودي، يرجى مراجعة أنظمة المرور المحلية قبل الاستخدام.');

  const { specs } = useProductFields(product, initialProduct);

  const handleQuantityChange = (newQty: number) => {
    setQuantity(newQty);
    const form = formRef.current;
    if (!form) return;
    const optionsEl = form.querySelector('salla-product-options') as any;
    if (optionsEl?.validateAndScroll) {
      optionsEl.validateAndScroll().then((valid: boolean) => {
        if (valid && window.salla?.product?.getPrice) window.salla.product.getPrice(new FormData(form));
      });
      return;
    }
    const isComplete = Array.from(form.elements).every((el: any) => !el.willValidate || el.validity.valid);
    if (isComplete && window.salla?.product?.getPrice) window.salla.product.getPrice(new FormData(form));
  };

  const handleFormChange = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const target = (e.target || (e.nativeEvent as any)?.target) as HTMLInputElement | null;
    const name = target?.getAttribute?.('name') || (target as any)?.name;
    if (name === 'qty-stepper' || target?.closest?.('salla-quantity-input')) {
      const optionsEl = form.querySelector('salla-product-options') as any;
      if (typeof optionsEl?.validateAndScroll === 'function') { optionsEl.validateAndScroll(); return; }
    }
    const isComplete = Array.from(form.elements).every((el: any) => !el.willValidate || el.validity.valid);
    if (isComplete && window.salla?.product?.getPrice) window.salla.product.getPrice(new FormData(form));
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;
    hapticImpact('medium');
    const optionsEl = form.querySelector('salla-product-options') as any;
    if (optionsEl?.validateAndScroll && !(await optionsEl.validateAndScroll())) return;
    if (typeof form.reportValidity === 'function' && !form.reportValidity()) return;
    try {
      await (window.salla?.cart?.addItem as any)?.(new FormData(form));
      await window.salla?.cart?.submit();
    } catch {
      // Handled by Salla SDK events
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    hapticImpact('medium');
    window.salla?.form?.onSubmit?.('cart.addItem', e);
  };

  // Show at most 3 key specs in the KPI row inside the buy box
  const kpiSpecs = specs.slice(0, 3);

  return (
    <form
      ref={formRef}
      className="form product-form flex flex-col gap-3.5 text-start"
      encType="multipart/form-data"
      method="post"
      onSubmit={handleSubmit}
      onChange={handleFormChange}
    >
      <input type="hidden" name="id" value={product.id} />
      <input type="hidden" name="quantity" value={quantity} />
      {formStartSlot}

      {/* KPI Specs Row (UVR / IRR / TSER) — shown only when backend provides them */}
      {kpiSpecs.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 mb-1 shadow-sm">
          <div
            className={`grid gap-2 text-center ${
              kpiSpecs.length === 1 ? 'grid-cols-1' : kpiSpecs.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
            } divide-x divide-x-reverse divide-gray-100`}
          >
            {kpiSpecs.map((spec, i) => (
              <div key={i} className="px-1">
                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{spec.label}</div>
                <div className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{spec.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Options Grid — type-aware rendering per Salla backend */}
      {product.options && product.options.length > 0 && (
        <div className="product-options-grid">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {product.options.map((opt) => {
              const optType = (opt.type || '').toLowerCase();
              const isWide = ['textarea', 'file'].includes(optType);
              return (
                <div key={opt.id} className={`flex flex-col ${isWide ? 'sm:col-span-2' : 'col-span-1'}`}>
                  <label className="text-xs font-bold text-gray-900 mb-1 flex items-center gap-0.5">
                    <span>{opt.name}</span>
                    {opt.required && <span className="text-red-500 font-bold">*</span>}
                  </label>
                  {renderProductOptionField(opt, priceCurrency, t)}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {formEndSlot}

      {/* Action Row: [أضف للسلة] [اشتر الآن] [-1+] */}
      <div className="flex items-center gap-3 mt-2">
        <button
          type="submit"
          disabled={product.is_out_of_stock}
          className="flex-1 h-12 rounded-lg bg-[#CCA352] hover:bg-[#b89143] active:bg-[#a68037] text-[#1a1a1a] font-bold text-sm transition-all shadow-sm text-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
        >
          {product.add_to_cart_label || t('pages.products.add_to_cart', 'أضف للسلة')}
        </button>

        <button
          type="button"
          disabled={product.is_out_of_stock}
          onClick={handleBuyNow}
          className="flex-1 h-12 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 active:bg-gray-100 text-gray-900 font-bold text-sm transition-all shadow-sm text-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
        >
          {t('pages.products.buy_now', 'اشتر الآن')}
        </button>

        {!product.is_hidden_quantity && product.type !== 'booking' && (
          <div className="w-32 h-12 bg-[#F9FAFB] border border-gray-200 rounded-lg flex items-center justify-between px-2 shrink-0">
            <button
              type="button"
              onClick={() => handleQuantityChange(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-md bg-[#E5E7EB] hover:bg-gray-300 text-gray-600 font-bold flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="font-bold text-gray-900 text-sm select-none">{quantity}</span>
            <button
              type="button"
              onClick={() => handleQuantityChange(quantity + 1)}
              className="w-8 h-8 rounded-md bg-[#262626] hover:bg-black text-white font-bold flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        )}
      </div>

      {/* Hidden Salla web-component hosts for SDK compatibility */}
      <salla-add-product-button style={{ display: 'none' }} width="wide" type="submit" product-id={product.id} />
      {!product.is_hidden_quantity && product.type !== 'booking' && (
        <salla-quantity-input
          style={{ display: 'none' }}
          name="quantity"
          {...(product.max_quantity != null ? { max: product.max_quantity } : {})}
        />
      )}

      {/* Traffic Compliance Advisory — shown only for automotive tint / film products */}
      {isAutomotiveTintProduct(product) && trafficTitle && (
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-4 text-start">
          <div className="flex items-center gap-2 font-bold text-[#2563EB] text-xs sm:text-sm mb-1">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>{trafficTitle}</span>
          </div>
          {trafficText && (
            <p className="text-[#3B82F6] text-xs leading-relaxed">{trafficText}</p>
          )}
        </div>
      )}    </form>
  );
}
