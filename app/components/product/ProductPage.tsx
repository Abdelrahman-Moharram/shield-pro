import { Fragment, useEffect, useMemo, useState } from 'react';
import { SallaOffer } from '@salla.sa/twilight-components-react/offer';
import { SallaComments } from '@salla.sa/twilight-components-react/comments';
import { SallaMetadata } from '@salla.sa/twilight-components-react/metadata';
import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useProduct } from '@salla.sa/twilight-theme-engine/hooks/useProduct';
import { useComments } from '@salla.sa/twilight-theme-engine/hooks/useComments';
import { RenderWhenVisible } from '@salla.sa/twilight-theme-engine/common';
import { PageBlocks } from '@salla.sa/twilight-theme-engine/home';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import type { ProductPageProps } from '@salla.sa/twilight-theme-engine/routes/product';
import { ProductGallery } from './ProductGallery';
import { ProductDetails } from './ProductDetails';
import { AddToCartForm } from './AddToCartForm';
import { ProductSpecs } from './ProductSpecs';
import { ProductFeatures } from './ProductFeatures';
import { ProductInstallBanner } from './ProductInstallBanner';
import { BlockHookSlot } from '../common';
import { ProductsSlider } from '../home';

/**
 * "Similar products" section.
 * Defaults to 'related' products and falls back to 'latest' so the section
 * is always populated with items matching the Figma mockup.
 */
function RelatedProducts({
  productId,
  categoryId,
  title,
}: {
  productId: number;
  categoryId?: number;
  title: string;
}) {
  const [source, setSource] = useState<'related' | 'categories' | 'latest'>('related');
  const [isEmpty, setIsEmpty] = useState(false);

  const handleResolve = (count: number) => {
    if (count === 0 && source === 'related') {
      if (categoryId) {
        setSource('categories');
      } else {
        setSource('latest');
      }
      return;
    }
    if (count === 0 && source === 'categories') {
      setSource('latest');
      return;
    }
    if (count === 0) {
      setIsEmpty(true);
    }
  };

  const sourceValue =
    source === 'related' ? productId : source === 'categories' && categoryId ? [categoryId] : null;

  return (
    <>
      <HookSlot name="product:related.start" />
      {!isEmpty && (
        <RenderWhenVisible estimatedHeight="0px">
          <div className="container py-10">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 text-start">
              {title || 'منتجات قد تناسبك'}
            </h2>
            <ProductsSlider
              key={source}
              data={{
                products: {
                  source,
                  source_value: sourceValue,
                  exclude_id: productId,
                },
                title: '',
                limit: 10,
                display_all_url: '',
              }}
              onResolve={handleResolve}
            />
          </div>
        </RenderWhenVisible>
      )}
      <HookSlot name="product:related.end" />
    </>
  );
}

/**
 * Shieldo Pro Theme ProductPage.
 *
 * Implements the Figma product page design with clean, minimal, dynamic code:
 *  - Top fold: Gallery (Right) + Details & Options Buy Box (Left)
 *  - Similar Products ("منتجات قد تناسبك")
 *  - Customer Reviews (if enabled)
 */
export function ProductPage({ product: initialProduct, page }: ProductPageProps) {
  const { theme, store } = useTwilight();
  const { t } = useTranslation();
  const { product } = useProduct(initialProduct);
  const { commentsKey } = useComments();
  const blockScope = useMemo(() => ({ product_id: product.id }), [product.id]);

  useEffect(() => {
    const salla = window.salla;
    if (!salla?.config?.set) return;
    if (salla.config.get('user.can_comment') != null) return;
    const canComment = salla.config.get('store.settings.product.user_can_comment');
    if (typeof canComment !== 'boolean') return;
    salla.config.set('user', { ...(salla.config.get('user') || {}), can_comment: canComment });
  }, []);

  useState(() => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage?.removeItem('breadcrumb-referrer');
    } catch {
      /* sessionStorage unavailable */
    }
  });

  return (
    <Fragment key={product.id}>
      {/* App-block hook `product.single.before_product_info` */}
      <BlockHookSlot
        name="product.single.before_product_info"
        wrapper="s-before-product-info"
        className="!mt-0"
        scope={blockScope}
      />

      <div className="container pt-4 md:pt-6">
        <HookSlot name="product:start" />

        {/* Top Fold: 2-Column Grid */}
        <div className="flex flex-col items-start md:flex-row gap-8 lg:gap-12" id={`product-${product.id}`}>
          {/* Gallery (Right in RTL) */}
          <ProductGallery product={product} />

          {/* Details & Form (Left in RTL) */}
          <div className="main-content md:sticky md:overflow-hidden md:top-24 w-full md:w-2/4 pb-8 md:pb-16">
            <HookSlot name="product:details.start" />
            <ProductDetails
              product={initialProduct}
              sku={product.sku}
              barcode={product.barcode}
              showTags={theme.settings.show_tags}
            />
            <HookSlot name="product:details.end" />

            <HookSlot name="product:single.form.start" />
            <AddToCartForm
              product={product}
              initialProduct={initialProduct}
              stickyAddToCart={theme.settings.sticky_add_to_cart}
            />
            <HookSlot name="product:single.form.end" />

            <HookSlot name="product:single.description.end" context={{ product }} />
            <PageBlocks hook="product:single.description.end" scope={blockScope} />
          </div>
        </div>

        <SallaOffer />

        {/* Hidden metadata bridge to ensure Salla engine initializes product metadata */}
        <SallaMetadata entity="product" entityId={product.id} style={{ display: 'none' }} />

        {/* 1. المواصفات الفنية */}
        <ProductSpecs product={product} initialProduct={initialProduct} />

        {/* 2. لماذا تختار هذا المنتج؟ */}
        <ProductFeatures product={product} />

        {/* 3. ترغب في تركيب المنتج؟ */}
        <div className="my-4">
          <ProductInstallBanner product={product} />
        </div>
      </div>

      {/* Customer Reviews if enabled */}
      <BlockHookSlot
        name="product.single.before_customer_reviews"
        wrapper="s-before-reviews"
        scope={blockScope}
      />

      {store.settings?.rating?.show_on_product && (
        <RenderWhenVisible estimatedHeight="0px" className="s-block--full-bg">
          <SallaComments key={commentsKey} itemId={product.id} type={'product' as never} />
        </RenderWhenVisible>
      )}

      {/* Section: منتجات قد تناسبك */}
      <BlockHookSlot
        name="product.single.before_product_recommendations"
        wrapper="s-before-related"
        scope={blockScope}
      />

      <RelatedProducts
        productId={product.id}
        categoryId={product.category?.id}
        title={t('pages.products.similar_products', 'منتجات قد تناسبك')}
      />

      <BlockHookSlot
        name="product.single.after_product_recommendations"
        wrapper="s-after-related"
        scope={blockScope}
      />

      <HookSlot name="product:end" />
    </Fragment>
  );
}
