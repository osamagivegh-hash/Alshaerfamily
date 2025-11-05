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

// Sanitization helper
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Remove HTML tags and trim
        req.body[key] = req.body[key].trim().replace(/<[^>]*>/g, '');
      } else if (Array.isArray(req.body[key])) {
        // Sanitize array elements
        req.body[key] = req.body[key].map(item => {
          if (typeof item === 'string') {
            return item.trim().replace(/<[^>]*>/g, '');
          }
          return item;
        });
      }
    });
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

