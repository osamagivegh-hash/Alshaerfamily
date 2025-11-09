# عائلة الشاعر - Al-Sha'er Family Website

موقع عائلة الشاعر - موقع عائلي باللغة العربية يحتفظ بتاريخ وتراث العائلة الفلسطينية.

## المميزات

- **تصميم عربي**: دعم كامل للغة العربية مع اتجاه RTL
- **ألوان فلسطينية**: مستوحاة من ألوان العلم الفلسطيني (أحمر، أسود، أبيض، أخضر)
- **أقسام شاملة**:
  - الأخبار
  - حوارات
  - شجرة العائلة
  - فلسطين
  - مقالات
  - معرض الصور
  - تواصل معنا
- **لوحة إدارة شاملة**: إدارة كامل المحتوى مع عمليات CRUD
- **نظام مصادقة آمن**: حماية لوحة الإدارة بكلمة مرور
- **تصميم متجاوب**: يعمل على جميع الأجهزة
- **رسوم شجرة الزيتون**: رمز فلسطيني أصيل

## التقنيات المستخدمة

### Frontend
- React.js مع Vite
- Tailwind CSS
- خطوط عربية (Cairo, Tajawal)
- تصميم متجاوب وحديث

### Backend
- Node.js مع Express
- REST API مع عمليات CRUD كاملة
- نظام مصادقة JWT
- قاعدة بيانات MongoDB Atlas
- معالجة نماذج التواصل
- رفع الملفات والصور
- حماية من الهجمات (Rate Limiting)

## التثبيت والتشغيل

### المتطلبات
- Node.js (v16 أو أحدث)
- npm أو yarn

### التثبيت
```bash
# تثبيت جميع التبعيات
npm run install:all

# إعداد متغيرات البيئة
cp env.example .env
# قم بتعديل ملف .env وإضافة رابط MongoDB Atlas

# إضافة البيانات التجريبية (اختياري)
cd server && node scripts/initializeData.js

# تشغيل في وضع التطوير
npm run dev

# بناء للإنتاج
npm run build

# تشغيل الإنتاج
npm start
```

### الأوامر المتاحة

```bash
# تشغيل الخادم والعميل معاً في وضع التطوير
npm run dev

# تشغيل الخادم فقط
npm run server:dev

# تشغيل العميل فقط
npm run client:dev

# بناء العميل للإنتاج
npm run build

# تشغيل الخادم في وضع الإنتاج
npm start

# تثبيت جميع التبعيات
npm run install:all
```

## البنية التنظيمية

```
myfamily/
├── client/                 # تطبيق React
│   ├── src/
│   │   ├── components/     # مكونات React
│   │   ├── utils/         # أدوات مساعدة
│   │   ├── App.jsx        # المكون الرئيسي
│   │   └── main.jsx       # نقطة الدخول
│   ├── public/            # الملفات العامة
│   └── package.json       # تبعيات العميل
├── server/                # خادم Express
│   ├── routes/           # مسارات API
│   ├── data/             # ملفات البيانات JSON
│   ├── server.js         # الخادم الرئيسي
│   └── package.json      # تبعيات الخادم
├── render.yaml           # إعدادات النشر
├── package.json          # إعدادات المشروع الرئيسي
└── README.md            # هذا الملف
```

## API Endpoints

### الأقسام العامة
- `GET /api/sections` - جلب جميع بيانات الأقسام
- `GET /api/sections/:section` - جلب قسم محدد
- `POST /api/contact` - إرسال رسالة تواصل

### لوحة الإدارة
#### المصادقة
- `GET /api/admin/verify` - التحقق من صحة الرمز المميز

#### إدارة المحتوى (CRUD)
- `GET /api/admin/:section` - جلب جميع عناصر القسم
- `GET /api/admin/:section/:id` - جلب عنصر محدد
- `POST /api/admin/:section` - إضافة عنصر جديد
- `PUT /api/admin/:section/:id` - تحديث عنصر
- `DELETE /api/admin/:section/:id` - حذف عنصر
- `POST /api/admin/bulk-delete/:section` - حذف متعدد

#### إدارة الرسائل
- `GET /api/admin/contacts` - جلب جميع الرسائل
- `PUT /api/admin/contacts/:id/status` - تحديث حالة الرسالة
- `DELETE /api/admin/contacts/:id` - حذف رسالة

#### شجرة العائلة
- `GET /api/admin/family-tree` - جلب شجرة العائلة
- `PUT /api/admin/family-tree` - تحديث شجرة العائلة

#### رفع الملفات
- `POST /api/admin/upload` - رفع صورة

#### الإحصائيات
- `GET /api/admin/stats` - إحصائيات لوحة التحكم

## إعداد MongoDB Atlas

### إنشاء حساب وقاعدة بيانات
1. **إنشاء حساب**: اذهب إلى [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) وأنشئ حساباً مجانياً
2. **إنشاء Cluster**: اختر الخطة المجانية (M0 Sandbox)
3. **إعداد المستخدم**: 
   - اذهب إلى Database Access
   - أضف مستخدم جديد مع صلاحيات read/write
4. **إعداد الشبكة**:
   - اذهب إلى Network Access
   - أضف IP Address (0.0.0.0/0 للوصول من أي مكان)
5. **الحصول على رابط الاتصال**:
   - انقر على "Connect" في الـ cluster
   - اختر "Connect your application"
   - انسخ connection string

### إعداد متغيرات البيئة
```bash
# في ملف .env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/alshaer-family?retryWrites=true&w=majority
JWT_SECRET=your-very-long-and-secure-jwt-secret-key
ADMIN_PASSWORD=YourSecurePassword123!
```

### إضافة البيانات التجريبية
```bash
cd server
node scripts/initializeData.js
```

النشر)

### مميزات لوحة الإدارة
- **لوحة تحكم شاملة** مع إحصائيات مفصلة
- **إدارة الأخبار**: إضافة، تعديل، حذف الأخبار
- **إدارة المحتوى**: تحكم كامل في جميع الأقسام
- **إدارة الرسائل**: عرض وإدارة رسائل التواصل
- **شجرة العائلة**: تحديث معلومات أفراد العائلة
- **رفع الصور**: إضافة صور لمعرض الصور
- **إعدادات الأمان**: تغيير كلمة المرور ومراقبة النظام
- **عمليات مجمعة**: حذف عدة عناصر مرة واحدة

### الأمان
- **مصادقة JWT**: حماية جميع العمليات الإدارية
- **Rate Limiting**: حماية من الهجمات
- **تشفير كلمات المرور**: باستخدام bcrypt
- **جلسات آمنة**: انتهاء صلاحية تلقائي بعد 24 ساعة

## النشر على Render.com

### الطريقة الأولى: استخدام render.yaml
1. قم برفع المشروع إلى GitHub
2. اربط المستودع مع Render.com
3. سيتم استخدام ملف `render.yaml` تلقائياً

### الطريقة الثانية: النشر اليدوي
1. إنشاء خدمة ويب جديدة على Render.com
2. اختر المستودع
3. استخدم الإعدادات التالية:
   - **Build Command**: `npm run install:all && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node
   - **Plan**: Free (أو حسب الحاجة)

### متغيرات البيئة
```
NODE_ENV=production
PORT=10000
```

## المساهمة

نرحب بمساهمات أفراد العائلة! يمكنكم:
1. إضافة أخبار جديدة
2. رفع صور للمعرض
3. كتابة مقالات
4. تحديث شجرة العائلة
5. مشاركة الذكريات والحوارات

## الدعم

للدعم أو الاستفسارات:
- البريد الإلكتروني: info@alshaerfamily.com
- الهاتف: +970 XX XXX XXXX

## الترخيص

هذا المشروع مخصص لعائلة الشاعر. جميع الحقوق محفوظة.

---

**"فلسطين في القلب... دائماً وأبداً"**

---

## English Summary

Al-Sha'er Family Website - A comprehensive Arabic family website featuring:
- Full RTL Arabic support
- Palestinian flag-inspired color scheme
- Family news, conversations, family tree, Palestine section, articles, photo gallery, and contact form
- Responsive design with olive tree illustrations
- React.js frontend with Tailwind CSS
- Node.js/Express backend with JSON data storage
- Ready for deployment on Render.com
