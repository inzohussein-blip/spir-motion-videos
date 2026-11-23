# brand-kits

هوية كل شركة نعمل لها فيديوهات، كل شركة في مجلد مستقل.

```
brand-kits/
├── _template/        ← انسخه لإضافة شركة جديدة
├── spir-default/     ← الأسلوب الافتراضي عند عدم تحديد عميل
└── <client-id>/
    ├── brand.json    ← البيانات التي تقرؤها القوالب تلقائياً
    ├── README.md     ← دليل الهوية للبشر + الناقص
    └── logo.svg
```

## حقول `brand.json`
| الحقل | الوصف |
|---|---|
| `id` | معرّف بأحرف إنجليزية صغيرة وشرطات، مطابق لاسم المجلد |
| `status` | `draft` (ناقصة/مؤقتة) أو `approved` (معتمدة من العميل) |
| `colors` | `background` و`primary` و`accent` بصيغة HEX |
| `typography.fontFamily` | أحد الخطوط المدعومة في القوالب: `Cairo`، `Tajawal`، `Almarai`، `IBM Plex Sans Arabic`، `Readex Pro` |
| `logo.text` | نص الشعار (يُستخدم إن لم يتوفر ملف) |
| `logo.file` | اسم ملف الشعار داخل المجلد |
| `voice` | اللغة، اللهجة، النبرة، وما يجب تجنّبه، وتستخدمها سكلز كتابة السكربت |
| `cta` | الدعوة للإجراء الافتراضية |

## الشركات الحالية
| الشركة | المجلد | الحالة |
|---|---|---|
| SPIR (افتراضي) | `spir-default` | ✅ approved |
| 1R Partners | `1r-partners` | 📝 draft |

## إضافة شركة جديدة
1. انسخ `_template/` إلى مجلد باسم معرّف الشركة.
2. املأ `brand.json` و`README.md` وضع الشعار.
3. سجّلها في `src/brands.ts` في كل قالب Remotion (سطر import وسطر في `BRANDS`).
4. أضفها لجدول الشركات أعلاه.
