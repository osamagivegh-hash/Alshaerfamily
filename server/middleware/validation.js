const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({
      success: false,
      message: 'بيانات غير صحيحة',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  };
};

// Validation rules
const newsValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('العنوان مطلوب')
    .isLength({ min: 5, max: 200 })
    .withMessage('العنوان يجب أن يكون بين 5 و 200 حرف'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('المحتوى مطلوب')
    .isLength({ min: 20 })
    .withMessage('المحتوى يجب أن يكون 20 حرف على الأقل'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('تاريخ غير صحيح'),
  body('author')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('اسم الكاتب طويل جداً'),
  body('reporter')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('اسم المراسل طويل جداً'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('الوسوم يجب أن تكون مصفوفة'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('الفئة طويل جداً'),
  body('summary')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('الملخص طويل جداً')
];

const articleValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('العنوان مطلوب')
    .isLength({ min: 5, max: 200 })
    .withMessage('العنوان يجب أن يكون بين 5 و 200 حرف'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('المحتوى مطلوب')
    .isLength({ min: 20 })
    .withMessage('المحتوى يجب أن يكون 20 حرف على الأقل'),
  body('author')
    .trim()
    .notEmpty()
    .withMessage('الكاتب مطلوب')
    .isLength({ max: 100 })
    .withMessage('اسم الكاتب طويل جداً'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('تاريخ غير صحيح'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('الوسوم يجب أن تكون مصفوفة'),
  body('summary')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('الملخص طويل جداً')
];

const conversationValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('العنوان مطلوب')
    .isLength({ min: 5, max: 200 })
    .withMessage('العنوان يجب أن يكون بين 5 و 200 حرف'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('المحتوى مطلوب')
    .isLength({ min: 20 })
    .withMessage('المحتوى يجب أن يكون 20 حرف على الأقل'),
  body('participants')
    .isArray({ min: 1 })
    .withMessage('يجب أن يكون هناك مشارك واحد على الأقل'),
  body('moderator')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('اسم الميسر طويل جداً'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('تاريخ غير صحيح'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('الوسوم يجب أن تكون مصفوفة')
];

const contactValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('الاسم مطلوب')
    .isLength({ min: 2, max: 100 })
    .withMessage('الاسم يجب أن يكون بين 2 و 100 حرف'),
  body('email')
    .isEmail()
    .withMessage('بريد إلكتروني غير صحيح')
    .normalizeEmail(),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('الرسالة مطلوبة')
    .isLength({ min: 10, max: 2000 })
    .withMessage('الرسالة يجب أن تكون بين 10 و 2000 حرف')
];

const commentValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('الاسم مطلوب')
    .isLength({ min: 2, max: 100 })
    .withMessage('الاسم يجب أن يكون بين 2 و 100 حرف'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('بريد إلكتروني غير صحيح')
    .normalizeEmail(),
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('التعليق مطلوب')
    .isLength({ min: 5, max: 1000 })
    .withMessage('التعليق يجب أن يكون بين 5 و 1000 حرف'),
  body('contentType')
    .isIn(['article', 'news', 'conversation'])
    .withMessage('نوع المحتوى غير صحيح'),
  body('contentId')
    .notEmpty()
    .withMessage('معرف المحتوى مطلوب')
];

const familyTickerNewsValidation = [
  body('headline')
    .trim()
    .notEmpty()
    .withMessage('العنوان مطلوب')
    .isLength({ min: 5, max: 300 })
    .withMessage('العنوان يجب أن يكون بين 5 و 300 حرف'),
  body('active')
    .optional()
    .isBoolean()
    .withMessage('الحالة يجب أن تكون true أو false'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('الترتيب يجب أن يكون رقم صحيح موجب')
];

const palestineValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('العنوان مطلوب')
    .isLength({ min: 5, max: 200 })
    .withMessage('العنوان يجب أن يكون بين 5 و 200 حرف'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('المحتوى مطلوب')
    .isLength({ min: 20 })
    .withMessage('المحتوى يجب أن يكون 20 حرف على الأقل')
];

const galleryValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('العنوان مطلوب')
    .isLength({ min: 5, max: 200 })
    .withMessage('العنوان يجب أن يكون بين 5 و 200 حرف'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('الوصف مطلوب')
    .isLength({ min: 10, max: 1000 })
    .withMessage('الوصف يجب أن يكون بين 10 و 1000 حرف'),
  body('images')
    .optional()
    .isArray()
    .withMessage('الصور يجب أن تكون مصفوفة')
];

// HTML entity escaping for XSS prevention
const escapeHtml = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Deep sanitization helper for nested objects
const deepSanitize = (obj, allowHtml = false) => {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    // Strip HTML tags unless explicitly allowed
    const stripped = allowHtml ? obj : obj.replace(/<[^>]*>/g, '');
    return stripped.trim();
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepSanitize(item, allowHtml));
  }

  if (typeof obj === 'object') {
    const sanitized = {};
    for (const key of Object.keys(obj)) {
      // Allow HTML in specific fields (like rich text content)
      const isHtmlField = ['content', 'biography', 'notes'].includes(key);
      sanitized[key] = deepSanitize(obj[key], isHtmlField);
    }
    return sanitized;
  }

  return obj;
};

// Sanitization middleware
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    req.body = deepSanitize(req.body);
  }
  if (req.query) {
    req.query = deepSanitize(req.query);
  }
  if (req.params) {
    req.params = deepSanitize(req.params);
  }
  next();
};

module.exports = {
  validate,
  newsValidation,
  articleValidation,
  conversationValidation,
  contactValidation,
  commentValidation,
  familyTickerNewsValidation,
  palestineValidation,
  galleryValidation,
  sanitizeInput
};

