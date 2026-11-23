# 🎬 Spir Motion Videos

مكتبة مركزية لحفظ كل ما يلزم لإنتاج **فيديوهات احترافية بمساعدة الذكاء الاصطناعي**:
قوالب موشن، حركات، تصاميم، أصوات، قوالب فيديو جاهزة، برومبتات، وسكلز (Skills) للأتمتة.

---

## 📁 هيكل المستودع

```
spir-motion-videos/
├── 01-motion-templates/     قوالب موشن جرافيك
│   ├── intros-outros/         مقدمات وخواتيم
│   ├── lower-thirds/          أشرطة سفلية
│   ├── titles-typography/     عناوين وحركات نصوص
│   ├── transitions/           انتقالات
│   └── logo-reveals/          ظهور الشعارات
├── 02-animations/           حركات قابلة لإعادة الاستخدام
│   ├── presets/               إعدادات حركة جاهزة
│   ├── lottie/                ملفات Lottie
│   └── code/                  حركات بالكود (Remotion / GSAP / CSS)
├── 03-design-assets/        عناصر التصميم
│   ├── backgrounds/           خلفيات
│   ├── overlays/              طبقات تأثيرات
│   ├── icons-shapes/          أيقونات وأشكال
│   ├── fonts/                 خطوط
│   └── brand-kits/            هويات بصرية
├── 04-audio/                الصوتيات
│   ├── sfx/                   مؤثرات صوتية
│   ├── music/                 موسيقى خلفية
│   └── voiceover/             تعليق صوتي
├── 05-video-templates/      قوالب فيديو كاملة
│   ├── reels-shorts/          عمودي 9:16
│   ├── youtube/               أفقي 16:9
│   ├── ads-promos/            إعلانات
│   └── explainers/            فيديوهات شرح
├── 06-ai-prompts/           مكتبة البرومبتات
│   ├── image/  video/  voice-music/  scripts/
├── 07-skills/               سكلز Claude وأدوات AI
├── 08-workflows/            خطوات العمل الموثّقة
├── 09-projects/             مشاريع منجزة كمراجع
├── 10-references/           إلهام ودروس
└── _templates/              قوالب التوثيق
```

كل مجلد يحتوي على `README.md` يشرح محتواه.

---

## 🧭 قواعد التنظيم

### تسمية الملفات
- أحرف إنجليزية صغيرة وشرطات بدل المسافات: `logo-reveal-glitch-01.aep`
- الصيغة المقترحة: `<النوع>-<الوصف>-<الرقم>.<الامتداد>`
- أضف المقاس عند الحاجة: `reel-product-promo-9x16.mp4`

### كل عنصر = مجلد خاص
ضع كل قالب أو أصل في مجلد مستقل يحتوي على:
```
logo-reveal-glitch/
├── README.md        ← انسخه من _templates/asset-card.md
├── preview.gif      ← معاينة سريعة (أقل من 5MB)
└── source/          ← الملفات المصدرية
```

### البرومبتات
احفظ كل برومبت مجرّب باستخدام `_templates/prompt-template.md` مع: الأداة، الإصدار، الإعدادات، والنتيجة.

### السكلز
كل سكل في مجلد داخل `07-skills/` يحتوي على `SKILL.md` (انظر `_templates/skill-template/`).

---

## 🛠️ الأدوات المستهدفة

| المجال | الأدوات |
|---|---|
| موشن ومونتاج | After Effects، Premiere Pro، DaVinci Resolve، CapCut |
| موشن بالكود | Remotion، GSAP، Lottie، Motion Canvas |
| توليد صور | Midjourney، Flux، GPT Image، Ideogram |
| توليد فيديو | Veo، Kling، Runway، Sora، Hailuo |
| صوت وموسيقى | ElevenLabs، Suno، Udio |
| كتابة وأتمتة | Claude، ChatGPT |

---

## 📦 الملفات الكبيرة

ملفات الفيديو والمشاريع (`.mp4`، `.mov`، `.aep`، `.prproj`، `.wav`) كبيرة الحجم. الحد الأقصى لملف واحد في GitHub هو 100MB.
- يُنصح بتفعيل **Git LFS**:
  ```bash
  git lfs install
  git lfs track "*.mp4" "*.mov" "*.aep" "*.prproj" "*.wav" "*.psd"
  ```
- أو احفظ الملفات الضخمة في تخزين سحابي وضع الرابط داخل `README.md` الخاص بالعنصر.

---

## ⚖️ التراخيص

وثّق مصدر وترخيص كل أصل (خط، موسيقى، مؤثر، قالب) في بطاقته. لا تضف محتوى غير مسموح بإعادة استخدامه.
