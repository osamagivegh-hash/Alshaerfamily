/**
 * Family Tree Authentication Middleware
 * 
 * COMPLETELY SEPARATE from CMS authentication.
 * Uses its own:
 * - JWT secret (FAMILY_TREE_JWT_SECRET)
 * - User model (FamilyTreeAdmin)
 * - Token validation
 * - Permission checks
 * 
 * SECURITY: This middleware REJECTS any CMS tokens.
 * There is NO cross-authentication between systems.
 */

const jwt = require('jsonwebtoken');
const FamilyTreeAdmin = require('../models/FamilyTreeAdmin');

// Separate JWT secret for Family Tree Dashboard
// MUST be different from main JWT_SECRET
const FAMILY_TREE_JWT_SECRET = process.env.FAMILY_TREE_JWT_SECRET || 'FT_SUPER_SECRET_KEY_MUST_BE_CHANGED_IN_PRODUCTION_2024';
const FAMILY_TREE_JWT_EXPIRES_IN = process.env.FAMILY_TREE_JWT_EXPIRES_IN || '8h';

/**
 * Generate JWT token for Family Tree Admin
 */
const generateFTToken = (admin) => {
    return jwt.sign(
        {
            id: admin._id,
            username: admin.username,
            role: admin.role,
            permissions: admin.permissions,
            type: 'family-tree-token' // Token type identifier
        },
        FAMILY_TREE_JWT_SECRET,
        { expiresIn: FAMILY_TREE_JWT_EXPIRES_IN }
    );
};

/**
 * Verify Family Tree token - CORE AUTHENTICATION
 * 
 * SECURITY NOTES:
 * - Only accepts tokens signed with FAMILY_TREE_JWT_SECRET
 * - Rejects all other tokens including CMS tokens
 * - Validates token type is 'family-tree-token'
 */
const authenticateFTToken = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح - لم يتم توفير رمز المصادقة',
                code: 'NO_TOKEN'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token with Family Tree secret ONLY
        let decoded;
        try {
            decoded = jwt.verify(token, FAMILY_TREE_JWT_SECRET);
        } catch (jwtError) {
            // Token verification failed - likely CMS token or invalid
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'انتهت صلاحية الجلسة - يرجى تسجيل الدخول مجدداً',
                    code: 'TOKEN_EXPIRED'
                });
            }

            return res.status(401).json({
                success: false,
                message: 'رمز مصادقة غير صالح',
                code: 'INVALID_TOKEN'
            });
        }

        // SECURITY: Verify token type is specifically for Family Tree
        if (decoded.type !== 'family-tree-token') {
            console.warn(`[FT-AUTH] Rejected non-FT token for user: ${decoded.username || 'unknown'}`);
            return res.status(401).json({
                success: false,
                message: 'رمز مصادقة غير صالح لهذا النظام',
                code: 'WRONG_TOKEN_TYPE'
            });
        }

        // Find the Family Tree admin
        const admin = await FamilyTreeAdmin.findById(decoded.id);

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'المستخدم غير موجود',
                code: 'USER_NOT_FOUND'
            });
        }

        // Check if account is active
        if (!admin.isActive) {
            return res.status(401).json({
                success: false,
                message: 'الحساب معطل',
                code: 'ACCOUNT_DISABLED'
            });
        }

        // Check if account is locked
        if (admin.isLocked()) {
            return res.status(401).json({
                success: false,
                message: 'الحساب مقفل مؤقتاً بسبب محاولات تسجيل دخول فاشلة',
                code: 'ACCOUNT_LOCKED'
            });
        }

        // Check if password was changed after token was issued
        if (admin.changedPasswordAfter(decoded.iat)) {
            return res.status(401).json({
                success: false,
                message: 'تم تغيير كلمة المرور - يرجى تسجيل الدخول مجدداً',
                code: 'PASSWORD_CHANGED'
            });
        }

        // Attach user to request
        req.ftUser = {
            id: admin._id,
            username: admin.username,
            email: admin.email,
            displayName: admin.displayName,
            role: admin.role,
            permissions: admin.permissions
        };

        next();
    } catch (error) {
        console.error('[FT-AUTH] Authentication error:', error);
        return res.status(500).json({
            success: false,
            message: 'خطأ في المصادقة',
            code: 'AUTH_ERROR'
        });
    }
};

/**
 * Require Family Tree Super Admin role
 */
const requireFTSuperAdmin = (req, res, next) => {
    if (!req.ftUser) {
        return res.status(401).json({
            success: false,
            message: 'غير مصرح',
            code: 'NOT_AUTHENTICATED'
        });
    }

    if (req.ftUser.role !== 'ft-super-admin') {
        console.warn(`[FT-AUTH] Super Admin access denied for: ${req.ftUser.username} (role: ${req.ftUser.role})`);
        return res.status(403).json({
            success: false,
            message: 'صلاحيات المدير الأعلى مطلوبة',
            code: 'SUPER_ADMIN_REQUIRED'
        });
    }

    next();
};

/**
 * Require specific Family Tree permission
 */
const requireFTPermission = (permission) => {
    return (req, res, next) => {
        if (!req.ftUser) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح',
                code: 'NOT_AUTHENTICATED'
            });
        }

        // Super Admin has all permissions
        if (req.ftUser.role === 'ft-super-admin') {
            return next();
        }

        // Check if user has the required permission
        if (!req.ftUser.permissions || !req.ftUser.permissions.includes(permission)) {
            console.warn(`[FT-AUTH] Permission denied for: ${req.ftUser.username} - required: ${permission}`);
            return res.status(403).json({
                success: false,
                message: 'لا تملك الصلاحية المطلوبة',
                code: 'PERMISSION_DENIED'
            });
        }

        next();
    };
};

/**
 * Rate limiter specifically for Family Tree auth endpoints
 */
const rateLimit = require('express-rate-limit');

const ftAuthLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
        success: false,
        message: 'محاولات تسجيل دخول كثيرة. يرجى المحاولة بعد 15 دقيقة',
        code: 'RATE_LIMITED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true
});

/**
 * Initialize Family Tree Super Admin
 */
const initializeFTAdmin = async () => {
    try {
        await FamilyTreeAdmin.initializeSuperAdmin();
    } catch (error) {
        console.error('Failed to initialize Family Tree Admin:', error);
    }
};

module.exports = {
    FAMILY_TREE_JWT_SECRET,
    FAMILY_TREE_JWT_EXPIRES_IN,
    generateFTToken,
    authenticateFTToken,
    requireFTSuperAdmin,
    requireFTPermission,
    ftAuthLimiter,
    initializeFTAdmin,
    FamilyTreeAdmin
};
