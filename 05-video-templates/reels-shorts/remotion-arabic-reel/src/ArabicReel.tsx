import { z } from "zod";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import { BRANDS, BRAND_IDS, Brand } from "./brands";
import { getFont, LoadedFont } from "./fonts";

export const SCENE_FRAMES = 60; // ثانيتان لكل مشهد بمعدل 30fps
export const OUTRO_FRAMES = 60;

export const reelSchema = z.object({
  scenes: z.array(z.object({ text: z.string(), accent: z.string() })).min(1),
  /** الشركة — تحدد الألوان والخط والشعار تلقائياً */
  brandId: z.enum(BRAND_IDS),
  /** اختياري: يتجاوز الدعوة للإجراء الافتراضية للشركة */
  cta: z.string().optional(),
});

type Props = z.infer<typeof reelSchema>;
type Colors = Brand["colors"];

/** خلفية بدوائر ضوئية تتحرك ببطء */
export const Background: React.FC<{ colors: Colors }> = ({ colors }) => {
  const frame = useCurrentFrame();
  const x = 50 + Math.sin(frame / 40) * 20;
  const y = 40 + Math.cos(frame / 55) * 15;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${x}% ${y}%, ${colors.accent}55 0%, transparent 45%),
                     radial-gradient(circle at ${100 - x}% ${100 - y}%, ${colors.accent}33 0%, transparent 40%),
                     ${colors.background}`,
      }}
    />
  );
};

/** مشهد: سطر رئيسي ينزلق للأعلى + كلمة مميزة تظهر بنبضة */
const Scene: React.FC<{ text: string; accent: string; colors: Colors; font: LoadedFont }> = ({
  text,
  accent,
  colors,
  font,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 14 } });
  const accentPop = spring({ frame: frame - 8, fps, config: { damping: 9, stiffness: 160 } });
  const exit = interpolate(frame, [SCENE_FRAMES - 10, SCENE_FRAMES], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  const underline = interpolate(frame, [12, 30], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        direction: "rtl",
        fontFamily: font.fontFamily,
        opacity: exit,
        transform: `scale(${0.95 + exit * 0.05})`,
        padding: 80,
        textAlign: "center",
      }}
    >
      <div
        style={{
          color: colors.primary,
          fontSize: 96,
          fontWeight: font.body,
          opacity: enter,
          transform: `translateY(${(1 - enter) * 80}px)`,
        }}
      >
        {text}
      </div>
      <div style={{ display: "inline-block", marginTop: 30, maxWidth: "100%" }}>
        <div
          style={{
            color: colors.accent,
            fontSize: 140,
            fontWeight: font.heading,
            lineHeight: 1.45,
            transform: `scale(${accentPop})`,
          }}
        >
          {accent}
        </div>
        <div
          style={{
            height: 14,
            marginTop: 16,
            borderRadius: 7,
            background: colors.accent,
            width: `${underline}%`,
            marginInlineStart: "auto",
            marginInlineEnd: 0,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

/** الخاتمة: الشعار + الدعوة للإجراء */
export const Outro: React.FC<{ cta: string; logoText: string; colors: Colors; font: LoadedFont }> = ({
  cta,
  logoText,
  colors,
  font,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame, fps, config: { damping: 12 } });
  const ctaIn = spring({ frame: frame - 12, fps, config: { damping: 15 } });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontFamily: font.fontFamily,
        direction: "rtl",
        padding: 80,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: logoText.length > 8 ? 120 : 170,
          fontWeight: font.heading,
          letterSpacing: 8,
          lineHeight: 1.1,
          color: colors.primary,
          transform: `scale(${logo}) rotate(${(1 - logo) * -10}deg)`,
        }}
      >
        {logoText}
      </div>
      <div
        style={{
          marginTop: 50,
          padding: "24px 64px",
          borderRadius: 999,
          background: colors.accent,
          color: colors.primary,
          fontSize: 64,
          fontWeight: font.heading,
          opacity: ctaIn,
          transform: `translateY(${(1 - ctaIn) * 60}px)`,
        }}
      >
        {cta}
      </div>
    </AbsoluteFill>
  );
};

export const ArabicReel: React.FC<Props> = ({ scenes, brandId, cta }) => {
  const brand: Brand = BRANDS[brandId];
  const { colors } = brand;
  const font = getFont(brand.typography.fontFamily);
  return (
    <AbsoluteFill>
      <Background colors={colors} />
      {scenes.map((s, i) => (
        <Sequence key={i} from={i * SCENE_FRAMES} durationInFrames={SCENE_FRAMES}>
          <Scene text={s.text} accent={s.accent} colors={colors} font={font} />
        </Sequence>
      ))}
      <Sequence from={scenes.length * SCENE_FRAMES} durationInFrames={OUTRO_FRAMES}>
        <Outro cta={cta ?? brand.cta} logoText={brand.logo.text} colors={colors} font={font} />
      </Sequence>
    </AbsoluteFill>
  );
};
