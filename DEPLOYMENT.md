# دليل النشر - Deployment Guide

## النشر على Render.com

### المتطلبات الأساسية
- حساب على [Render.com](https://render.com)
- حساب GitHub مع المشروع مرفوع عليه
- Node.js v16+ للتطوير المحلي

### خطوات النشر

#### الطريقة الأولى: النشر التلقائي باستخدام render.yaml
1. **رفع المشروع إلى GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Al-Sha'er Family Website"
   git branch -M main
   git remote add origin https://github.com/username/al-shaer-family.git
   git push -u origin main
   ```

2. **ربط المستودع مع Render**
   - اذهب إلى [Render Dashboard](https://dashboard.render.com)
   - انقر على "New +"
   - اختر "Web Service"
   - اربط حساب GitHub الخاص بك
   - اختر المستودع `al-shaer-family`

3. **الإعدادات التلقائية**
   - Render سيكتشف ملف `render.yaml` تلقائياً
   - سيتم تطبيق جميع الإعدادات المحددة في الملف
   - انقر على "Create Web Service"

#### الطريقة الثانية: النشر اليدوي
1. **إنشاء خدمة ويب جديدة**
   - اذهب إلى Render Dashboard
   - انقر على "New +" → "Web Service"
   - اختر "Build and deploy from a Git repository"

2. **إعدادات المشروع**
   ```
   Name: al-shaer-family-website
   Environment: Node
   Region: اختر الأقرب لك
   Branch: main
   Build Command: npm run install:all && npm run build
   Start Command: npm start
   ```

3. **متغيرات البيئة**
   ```
   NODE_ENV=production
   PORT=10000
   ```

4. **إعدادات إضافية**
   - Auto-Deploy: Yes (للنشر التلقائي عند التحديث)
   - Health Check Path: /

### إعداد النطاق المخصص (اختياري)

1. **في لوحة تحكم Render**
   - اذهب إلى إعدادات الخدمة
   - انقر على "Custom Domains"
   - أضف النطاق المطلوب (مثل: alshaerfamily.com)

2. **إعداد DNS**
   - أضف CNAME record يشير إلى render service URL
   - انتظر انتشار DNS (قد يستغرق حتى 24 ساعة)

### مراقبة الخدمة

#### لوحة المراقبة
- **Logs**: لمراقبة سجلات الخادم
- **Metrics**: لمراقبة الأداء
- **Events**: لمتابعة عمليات النشر

#### التحديثات التلقائية
عند دفع تحديثات إلى المستودع، سيتم:
1. تشغيل عملية البناء تلقائياً
2. نشر النسخة الجديدة
3. إرسال إشعارات في حالة الفشل

### استكشاف الأخطاء

#### مشاكل شائعة وحلولها

1. **خطأ في البناء**
   ```
   الحل: تأكد من أن جميع التبعيات مثبتة صحيحاً
   npm run install:all
   npm run build
   ```

2. **خطأ في بدء الخادم**
   ```
   الحل: تأكد من أن PORT متغير صحيح
   تحقق من server.js
   ```

3. **مشاكل في البيانات**
   ```
   الحل: تأكد من وجود مجلد server/data
   تحقق من صلاحيات الكتابة
   ```

#### فحص الحالة المحلي
```bash
# تشغيل محلي للاختبار
npm run dev

# فحص البناء
npm run build
npm start
```

### النسخ الاحتياطي

#### بيانات التواصل
- يتم حفظ رسائل التواصل في `server/data/contacts.json`
- قم بعمل نسخة احتياطية دورية من مجلد `data`

#### كود المصدر
- استخدم Git للنسخ الاحتياطي
- احتفظ بنسخة على GitHub

### الأمان

#### متغيرات البيئة الحساسة
```bash
# لا تضع معلومات حساسة في الكود
# استخدم متغيرات البيئة في Render
DATABASE_URL=your_database_url
SECRET_KEY=your_secret_key
```

#### تحديث التبعيات
```bash
# فحص التحديثات الأمنية
npm audit
npm audit fix
```

### الأداء

#### تحسينات مقترحة
1. **ضغط الصور**: استخدم تنسيقات WebP
2. **CDN**: فكر في استخدام CDN للصور
3. **Caching**: إضافة آليات التخزين المؤقت

#### مراقبة الأداء
- استخدم أدوات Render المدمجة
- راقب استهلاك الذاكرة والمعالج
- تتبع أوقات الاستجابة

---

## English Deployment Guide

### Render.com Deployment

#### Quick Start
1. Push to GitHub
2. Connect to Render.com
3. Use render.yaml for automatic configuration
4. Deploy with one click

#### Manual Configuration
- Build Command: `npm run install:all && npm run build`
- Start Command: `npm start`
- Environment: Node.js
- Health Check: `/`

#### Environment Variables
```
NODE_ENV=production
PORT=10000
```

### Troubleshooting
- Check build logs for errors
- Verify all dependencies are installed
- Ensure data directory has proper permissions
- Monitor service health and metrics

---

**للدعم التقني، تواصل معنا على: info@alshaerfamily.com**
