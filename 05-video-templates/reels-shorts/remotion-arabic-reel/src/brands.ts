// هويات الشركات — المصدر: 03-design-assets/brand-kits/<id>/brand.json
// لإضافة شركة: أضف سطر import وسطراً في BRANDS.
import spirDefault from "../../../../03-design-assets/brand-kits/spir-default/brand.json";
import oneRPartners from "../../../../03-design-assets/brand-kits/1r-partners/brand.json";

export type Brand = {
  id: string;
  name: string;
  status: string;
  colors: { background: string; primary: string; accent: string };
  typography: { fontFamily: string };
  logo: { text: string; file: string | null };
  cta: string;
};

export const BRANDS = {
  "spir-default": spirDefault,
  "1r-partners": oneRPartners,
} satisfies Record<string, Brand>;

export type BrandId = keyof typeof BRANDS;
export const BRAND_IDS = Object.keys(BRANDS) as [BrandId, ...BrandId[]];
