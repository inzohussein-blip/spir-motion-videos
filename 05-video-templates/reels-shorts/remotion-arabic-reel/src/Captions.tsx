import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CaptionPage } from "./captions";
import { Brand } from "./brands";
import { LoadedFont } from "./fonts";

/**
 * ترجمة متحركة متزامنة مع الصوت:
 * - كل كلمة تظهر لحظة نطقها بنبضة
 * - الكلمة المنطوقة الآن بلون الشركة المميز (accent) وأكبر قليلاً
 * - موضعها فوق المنطقة الآمنة السفلية (لا تغطيها أزرار التطبيق)
 */
export const Captions: React.FC<{
  pages: CaptionPage[];
  colors: Brand["colors"];
  font: LoadedFont;
  bottom?: number;
}> = ({ pages, colors, font, bottom = 560 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const page = pages.find((p) => t >= p.start && t < p.end);
  if (!page) return null;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: bottom,
        paddingLeft: 90,
        paddingRight: 170, // أيقونات التفاعل على اليمين
      }}
    >
      <div
        style={{
          direction: "rtl",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0 28px",
          fontFamily: font.fontFamily,
          fontWeight: font.heading,
          fontSize: 104,
          lineHeight: 1.35,
          textAlign: "center",
        }}
      >
        {page.words.map((w, i) => {
          const startFrame = Math.round(w.start * fps);
          const pop = spring({
            frame: frame - startFrame,
            fps,
            config: { damping: 12, stiffness: 220 },
            durationInFrames: 10,
          });
          const visible = t >= w.start;
          const active = t >= w.start && (t < w.end || i === page.words.length - 1);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                color: active ? colors.accent : colors.primary,
                opacity: visible ? 1 : 0,
                transform: `scale(${visible ? 0.7 + pop * (active ? 0.38 : 0.3) : 0.7})`,
                textShadow: "0 6px 24px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.6)",
                WebkitTextStroke: `3px ${colors.background}`,
                paintOrder: "stroke fill",
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
