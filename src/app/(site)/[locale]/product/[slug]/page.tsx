import { ProductRoutePage, productGenerateMetadata, type ProductRouteProps } from '../../produit/productRoute';

// Canonical EN product URL: /en/product/<slug>. /fr/product/<slug> 308s to
// /fr/produit/<slug>. Implementation shared with produit/[slug].

export const revalidate = 60;

export const generateMetadata = productGenerateMetadata;

export default function ProductDetailPage(props: ProductRouteProps) {
  return <ProductRoutePage {...props} segment="product" />;
}
