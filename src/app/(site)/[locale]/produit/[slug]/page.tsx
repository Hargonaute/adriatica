import { ProductRoutePage, productGenerateMetadata, type ProductRouteProps } from '../productRoute';

// Canonical FR product URL: /fr/produit/<slug>. /en/produit/<slug> 308s to
// /en/product/<slug>. Implementation shared with product/[slug].

export const revalidate = 60;

export const generateMetadata = productGenerateMetadata;

export default function ProduitDetailPage(props: ProductRouteProps) {
  return <ProductRoutePage {...props} segment="produit" />;
}
