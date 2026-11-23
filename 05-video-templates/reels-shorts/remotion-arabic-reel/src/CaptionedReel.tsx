import { z } from "zod";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BRANDS, BRAND_IDS, Brand } from "./brands";
import { getFont, LoadedFont } from "./fonts";
import { Captions } from "./Captions";
import { CaptionPage, parseWords, toPages } from "./captions";
import { Background, Outro } from "./ArabicReel";
import { CameraFx, FxCue } from "./fx/camera";

export const OUTRO_SECONDS = 2;

export const captionedReelSchema = z.object({
  brandId: z.enum(BRAND_IDS),
  /** ملف الصوت داخل public/ */
  audio: z.string(),
  /** ملف توقيتات الكلمات داخل public/ (صيغة ElevenLabs Speech-to-Text) */
  words: z.string(),
  /** حد أقصى للكلمات في سطر الترجمة */
  maxWordsPerPage: z.number().int().min(1).max(6),
  cta: z.string().optional(),
  /** مؤثرات تلقائية: حبيبات فيلم خفيفة + ضربة زوم صغيرة مع بداية كل سطر ترجمة */
  autoFx: z.boolean().optional(),
});

export type CaptionedReelProps = z.infer<typeof captionedReelSchema> & {
  /** تُحسب تلقائياً في calculateMetadata — لا تُمرّر يدوياً */
  pages?: CaptionPage[];
};

/** شعار صغير ثابت أعلى الشاشة داخل المنطقة الآمنة */
const Watermark: React.FC<{ text: string; colors: Brand["colors"]; font: LoadedFont }> = ({
  text,
  colors,
  font,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 15 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 270 }}>
      <div
        style={{
          fontFamily: font.fontFamily,
          fontWeight: font.heading,
          fontSize: 44,
          letterSpacing: 6,
          color: colors.primary,
          opacity: 0.85 * enter,
          padding: "10px 28px",
          borderRadius: 999,
          border: `3px solid ${colors.accent}`,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

/** حبيبات طوال الفيديو + ضربة صغيرة على كل سطر جديد (أقوى قليلاً على الأول) + ضربة على الخاتمة */
export const autoCues = (pages: CaptionPage[], fps: number, durationInFrames: number, outroFrames: number): FxCue[] => [
  { fx: "grain", f: 0, dur: durationInFrames, amt: 0.03, fade: 1 },
  ...pages.map((p, i): FxCue => ({ fx: "punch", f: Math.round(p.start * fps), dur: 6, amt: i === 0 ? 0.035 : 0.018, blur: 1.2 })),
  { fx: "punch", f: durationInFrames - outroFrames, dur: 8, amt: 0.04, blur: 2 },
];

export const CaptionedReel: React.FC<CaptionedReelProps> = ({ brandId, audio, pages = [], cta, autoFx = true }) => {
  const brand: Brand = BRANDS[brandId];
  const font = getFont(brand.typography.fontFamily);
  const { fps, durationInFrames } = useVideoConfig();
  const outroFrames = OUTRO_SECONDS * fps;
  const cues = autoFx ? autoCues(pages, fps, durationInFrames, outroFrames) : [];

  return (
    <CameraFx cues={cues}>
      <Background colors={brand.colors} />
      <Audio src={staticFile(audio)} />
      <Sequence durationInFrames={durationInFrames - outroFrames}>
        <Watermark text={brand.logo.text} colors={brand.colors} font={font} />
        <Captions pages={pages} colors={brand.colors} font={font} />
      </Sequence>
      <Sequence from={durationInFrames - outroFrames}>
        <Outro cta={cta ?? brand.cta} logoText={brand.logo.text} colors={brand.colors} font={font} />
      </Sequence>
    </CameraFx>
  );
};

/** يقرأ ملف التوقيتات ويحسب الصفحات ومدة الفيديو (آخر كلمة + الخاتمة) */
export const loadCaptions = async (props: CaptionedReelProps) => {
  const res = await fetch(staticFile(props.words));
  const words = parseWords(await res.json());
  const pages = toPages(words, props.maxWordsPerPage);
  const lastEnd = words.length ? words[words.length - 1].end : 0;
  return { pages, seconds: lastEnd + 0.4 + OUTRO_SECONDS };
};
