import { hookRegistry, HookName, type HookContext } from '@salla.sa/twilight-theme-engine/hooks';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { AddProductToast } from '../components/cart';
import { DigitalFilesSettings } from '../components/product';

function ThankYouWarrantyCard() {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-md p-4 md:p-6 mt-6 shadow-sm text-start flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-1">
          {t('pages.thank_you.warranty_title', 'ضمان منتجك')}
        </h3>
        <p className="text-sm text-gray-600">
          {t('pages.thank_you.warranty_text', 'احتفظ بالرقم التسلسلي المطبوع على المنتج، وفعّل ضمانك من هنا بعد الاستلام.')}
        </p>
      </div>
      <Link to="/warranty" className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold rounded-lg bg-primary text-gray-900 hover:bg-primary-hover transition-colors shrink-0">
        {t('pages.thank_you.warranty_button', 'تفعيل الضمان')}
      </Link>
    </div>
  );
}

export function registerThemeHooks() {
  // Register AddProductToast at body:end hook slot. Default on (twilight.json
  // ships the setting `"value": true`); only an explicit `false` turns it off.
  hookRegistry.register(
    HookName.BODY_END,
    (context: HookContext) => {
      const { twilight } = context;
      if (twilight?.theme?.settings?.enable_add_product_toast === false) return null;
      return <AddProductToast />;
    },
    50
  );

  // Register DigitalFilesSettings at product:single.description hook slot
  // Receives product from ProductDetails via context prop
  hookRegistry.register(
    HookName.PRODUCT_DESCRIPTION,
    (context: HookContext) => {
      const { product } = context as { product?: Product };
      if (!product?.digital_files_settings) return null;
      return <DigitalFilesSettings {...product.digital_files_settings} />;
    },
    50
  );

  // Register warranty reminder card at thank-you:end hook slot
  hookRegistry.register(
    HookName.THANK_YOU_END,
    () => <ThankYouWarrantyCard />,
    50
  );
}
