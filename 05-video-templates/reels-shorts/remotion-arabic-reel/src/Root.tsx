import { CalculateMetadataFunction, Composition } from "remotion";
import { z } from "zod";
import { ArabicReel, reelSchema, SCENE_FRAMES, OUTRO_FRAMES } from "./ArabicReel";

type Props = z.infer<typeof reelSchema>;

const calculateMetadata: CalculateMetadataFunction<Props> = ({ props }) => ({
  durationInFrames: props.scenes.length * SCENE_FRAMES + OUTRO_FRAMES,
});

const defaultProps: Props = {
  scenes: [
    { text: "هل تعلم؟", accent: "٩٠٪" },
    { text: "من المشاهدين يقررون", accent: "في أول ٣ ثوانٍ" },
    { text: "ابدأ فيديوك بخطّاف", accent: "قوي" },
  ],
  cta: "تابعنا للمزيد",
  brand: "SPIR",
  colors: {
    background: "#0B0B14",
    primary: "#FFFFFF",
    accent: "#7C5CFF",
  },
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ArabicReel"
      component={ArabicReel}
      schema={reelSchema}
      defaultProps={defaultProps}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={1}
      calculateMetadata={calculateMetadata}
    />
  );
};
