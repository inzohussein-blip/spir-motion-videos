import * as Cairo from "@remotion/google-fonts/Cairo";
import * as Tajawal from "@remotion/google-fonts/Tajawal";
import * as Almarai from "@remotion/google-fonts/Almarai";
import * as IBMPlexSansArabic from "@remotion/google-fonts/IBMPlexSansArabic";
import * as ReadexPro from "@remotion/google-fonts/ReadexPro";

/** الخطوط العربية المدعومة وأوزانها المتوفرة (العنوان / النص) */
const FONTS = {
  Cairo: { mod: Cairo, heading: "800", body: "400" },
  Tajawal: { mod: Tajawal, heading: "800", body: "400" },
  Almarai: { mod: Almarai, heading: "800", body: "400" },
  "IBM Plex Sans Arabic": { mod: IBMPlexSansArabic, heading: "700", body: "400" },
  "Readex Pro": { mod: ReadexPro, heading: "700", body: "400" },
} as const;

export type FontName = keyof typeof FONTS;
export const FONT_NAMES = Object.keys(FONTS) as FontName[];

export type LoadedFont = { fontFamily: string; heading: number; body: number };

const cache = new Map<FontName, LoadedFont>();

/** يحمّل الخط عند الحاجة فقط (مرة واحدة لكل خط) */
export const getFont = (name: string): LoadedFont => {
  const key = (name in FONTS ? name : "Cairo") as FontName;
  const hit = cache.get(key);
  if (hit) return hit;
  const f = FONTS[key];
  const { fontFamily } = (f.mod as typeof Cairo).loadFont("normal", {
    weights: [f.body, f.heading] as ("400" | "800")[],
    subsets: ["arabic", "latin"],
  });
  const loaded = { fontFamily, heading: Number(f.heading), body: Number(f.body) };
  cache.set(key, loaded);
  return loaded;
};
