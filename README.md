# الأمل الصامت — Silent Hope Platform Prototype

منصة Prototype متقدمة (Next.js + Zustand) للتعليم البصري وتنمية المواهب لفئة الصم.

## التشغيل

```bash
npm install
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000)

## حسابات تجريبية

كلمة المرور لجميع الحسابات: `demo123`

| البريد | الدور |
|--------|------|
| admin@silenthope.local | مدير عام |
| content@silenthope.local | مدير المحتوى |
| talent@silenthope.local | مدير المواهب |
| moderator@silenthope.local | مشرف |
| student@silenthope.local | طالب |

## الميزات

- واجهة عامة RTL + لوحة تحكم SaaS
- Zustand + sessionStorage (persist لكل domain)
- CRUD كامل للطلبة، الوكلاء، المواد، الدروس، المواهب، التصنيفات، الاشتراكات، الإشعارات، البلاغات
- Activity Log + بحث شامل `Ctrl+K`
- مراجعة المواهب (Approve / Reject مع سبب)
- محرر دروس بصري (sections)
- إعدادات + Dark/Light/System + إعادة تعيين بيانات التجربة

## الهوية البصرية

مستخرجة من الموقع الحالي ومطوّرة:

- خط Tajawal
- كحلي + ذهبي + خلفيات كريمية دافئة
- RTL أولاً وإمكانية وصول بصرية

## ملاحظة

هذه نسخة Prototype بدون Backend. كل البيانات Mock وتعيش داخل جلسة المتصفح.
