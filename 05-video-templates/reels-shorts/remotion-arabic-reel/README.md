# remotion-arabic-reel

![preview](preview.gif)

قالب Reel عربي عمودي بحركات نصوص (Kinetic Typography)، مبني بالكود عبر [Remotion](https://www.remotion.dev).
تعدّل النصوص والألوان، فيتولد الفيديو تلقائياً، ويتغير طوله حسب عدد المشاهد.

| الحقل | القيمة |
|---|---|
| النوع | قالب فيديو كامل |
| البرنامج | Remotion 4 (React + TypeScript) |
| المقاس | 1080x1920 (9:16) |
| المدة | ثانيتان لكل مشهد + ثانيتان للخاتمة (افتراضياً 8 ث) |
| FPS | 30 |
| الخط | Cairo (Google Fonts) يُحمّل تلقائياً |
| الترخيص | خاص |
| الوسوم | `reel` `arabic` `kinetic-typography` `remotion` |

## التشغيل
المتطلبات: Node.js 18 أو أحدث.

```bash
npm install
npm run studio     # يفتح محرر Remotion في المتصفح للمعاينة والتعديل المباشر
npm run render     # يصدّر الفيديو إلى out/reel.mp4
npm run still      # صورة معاينة من الإطار 45
```

## التخصيص
عدّل `defaultProps` في `src/Root.tsx`، أو من لوحة Props داخل Studio:

```ts
scenes: [
  { text: "هل تعلم؟", accent: "٩٠٪" },          // سطر عادي + كلمة مميزة
  { text: "من المشاهدين يقررون", accent: "في أول ٣ ثوانٍ" },
],
cta: "تابعنا للمزيد",
brand: "SPIR",
colors: { background: "#0B0B14", primary: "#FFFFFF", accent: "#7C5CFF" },
```

أو مرّر الخصائص عند التصدير دون تعديل الكود:
```bash
npx remotion render ArabicReel out/promo.mp4 --props=my-props.json
```

- لتغيير مدة المشهد: `SCENE_FRAMES` في `src/ArabicReel.tsx` (30 إطار = ثانية).
- لإضافة موسيقى: ضع الملف في `public/` واستخدم `<Audio src={staticFile("music.mp3")} />` داخل `ArabicReel`.

## مكونات الحركة
- **Background:** إضاءتان دائريتان تتحركان ببطء.
- **Scene:** السطر ينزلق للأعلى بحركة spring، والكلمة المميزة تظهر بنبضة ثم يُرسم تحتها خط، والمشهد يتلاشى مع تصغير خفيف.
- **Outro:** الشعار يدور ويكبر، ثم يظهر زر الدعوة للإجراء.

## ملاحظات
- النص العربي يُكتب هنا في الكود وليس داخل صور مولّدة بالذكاء الاصطناعي، فيبقى سليماً وواضحاً.
- إذا ظهرت مشكلة في تحميل المتصفح عند التصدير، مرّر مسار Chrome: `--browser-executable=/path/to/chrome`.
