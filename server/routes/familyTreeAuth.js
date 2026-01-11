/**
 * Family Tree Authentication Routes
 * 
 * COMPLETELY SEPARATE from CMS authentication routes.
 * Handles:
 * - Login for Family Tree Dashboard
 * - User creation (ft-super-admin only)
 * - Password management
 * - Token refresh
 * 
 * SECURITY: Uses separate JWT secret and user collection.
 */

const express = require('express');
const router = express.Router();
const {
    generateFTToken,
    authenticateFTToken,
    requireFTSuperAdmin,
    ftAuthLimiter,
    FamilyTreeAdmin
} = require('../middleware/familyTreeAuth');
const { AuditLog } = require('../models');

// Helper to get client IP
const getClientIP = (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.connection?.remoteAddress ||
        req.ip ||
        'unknown';
};

// ==================== LOGIN ====================

/**
 * POST /api/family-tree-auth/login
 * Family Tree Dashboard login - separate from CMS login
 */
router.post('/login', ftAuthLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'اسم المستخدم وكلمة المرور مطلوبان',
                code: 'MISSING_CREDENTIALS'
            });
        }

        // Find user with password field
        const admin = await FamilyTreeAdmin.findOne({
            $or: [
                { username: username.toLowerCase().trim() },
                { email: username.toLowerCase().trim() }
            ]
        }).select('+password');

        if (!admin) {
            // Log failed attempt
            await AuditLog.logAction({
                action: 'FT_LOGIN_FAILED',
                category: 'auth',
                resource: 'family-tree-auth',
                user: username,
                userRole: 'unknown',
                ipAddress: getClientIP(req),
                userAgent: req.headers['user-agent'],
                dashboard: 'family-tree-dashboard',
                details: { reason: 'User not found' },
                success: false,
                errorMessage: 'المستخدم غير موجود'
            });

            return res.status(401).json({
                success: false,
                message: 'اسم المستخدم أو كلمة المرور غير صحيحة',
                code: 'INVALID_CREDENTIALS'
            });
        }

        // Check if account is locked
        if (admin.isLocked()) {
            const unlockTime = new Date(admin.lockedUntil).toLocaleTimeString('ar-SA');
            return res.status(401).json({
                success: false,
                message: `الحساب مقفل. يرجى المحاولة بعد ${unlockTime}`,
                code: 'ACCOUNT_LOCKED'
            });
        }

        // Check if account is active
        if (!admin.isActive) {
            return res.status(401).json({
                success: false,
                message: 'الحساب معطل. تواصل مع المسؤول',
                code: 'ACCOUNT_DISABLED'
            });
        }

        // Verify password
        const isValidPassword = await admin.comparePassword(password);

        if (!isValidPassword) {
            await admin.incrementFailedAttempts();

            // Log failed attempt
            await AuditLog.logAction({
                action: 'FT_LOGIN_FAILED',
                category: 'auth',
                resource: 'family-tree-auth',
                user: admin.username,
                userRole: admin.role,
                ipAddress: getClientIP(req),
                userAgent: req.headers['user-agent'],
                dashboard: 'family-tree-dashboard',
                details: {
                    reason: 'Invalid password',
                    failedAttempts: admin.failedLoginAttempts
                },
                success: false,
                errorMessage: 'كلمة المرور غير صحيحة'
            });

            return res.status(401).json({
                success: false,
                message: 'اسم المستخدم أو كلمة المرور غير صحيحة',
                code: 'INVALID_CREDENTIALS'
            });
        }

        // Reset failed attempts on successful login
        await admin.resetFailedAttempts();

        // Generate token
        const token = generateFTToken(admin);

        // Log successful login
        await AuditLog.logAction({
            action: 'FT_LOGIN_SUCCESS',
            category: 'auth',
            resource: 'family-tree-auth',
            user: admin.username,
            userRole: admin.role,
            ipAddress: getClientIP(req),
            userAgent: req.headers['user-agent'],
            dashboard: 'family-tree-dashboard',
            details: { method: 'password' },
            success: true
        });

        res.json({
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            token,
            user: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                displayName: admin.displayName,
                role: admin.role,
                permissions: admin.permissions
            }
        });
    } catch (error) {
        console.error('[FT-AUTH] Login error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تسجيل الدخول',
            code: 'SERVER_ERROR'
        });
    }
});

// ==================== CURRENT USER ====================

/**
 * GET /api/family-tree-auth/me
 * Get current logged in user info
 */
router.get('/me', authenticateFTToken, async (req, res) => {
    try {
        const admin = await FamilyTreeAdmin.findById(req.ftUser.id);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود',
                code: 'USER_NOT_FOUND'
            });
        }

        res.json({
            success: true,
            user: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                displayName: admin.displayName,
                role: admin.role,
                permissions: admin.permissions,
                lastLogin: admin.lastLogin,
                createdAt: admin.createdAt
            }
        });
    } catch (error) {
        console.error('[FT-AUTH] Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب بيانات المستخدم',
            code: 'SERVER_ERROR'
        });
    }
});

// ==================== VERIFY TOKEN ====================

/**
 * GET /api/family-tree-auth/verify
 * Verify if token is valid
 */
router.get('/verify', authenticateFTToken, (req, res) => {
    res.json({
        success: true,
        valid: true,
        user: req.ftUser
    });
});

// ==================== LOGOUT ====================

/**
 * POST /api/family-tree-auth/logout
 * Logout and log the action
 */
router.post('/logout', authenticateFTToken, async (req, res) => {
    try {
        await AuditLog.logAction({
            action: 'FT_LOGOUT',
            category: 'auth',
            resource: 'family-tree-auth',
            user: req.ftUser.username,
            userRole: req.ftUser.role,
            ipAddress: getClientIP(req),
            userAgent: req.headers['user-agent'],
            dashboard: 'family-tree-dashboard',
            success: true
        });

        res.json({
            success: true,
            message: 'تم تسجيل الخروج بنجاح'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في تسجيل الخروج'
        });
    }
});

// ==================== USER MANAGEMENT (Super Admin Only) ====================

/**
 * GET /api/family-tree-auth/users
 * List all Family Tree admins (ft-super-admin only)
 */
router.get('/users', authenticateFTToken, requireFTSuperAdmin, async (req, res) => {
    try {
        const users = await FamilyTreeAdmin.find({})
            .select('-passwordResetToken -passwordResetExpires')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('[FT-AUTH] List users error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب المستخدمين'
        });
    }
});

/**
 * POST /api/family-tree-auth/users
 * Create new Family Tree admin (ft-super-admin only)
 */
router.post('/users', authenticateFTToken, requireFTSuperAdmin, async (req, res) => {
    try {
        const { username, email, password, displayName, role } = req.body;

        // Validation
        if (!username || !email || !password || !displayName) {
            return res.status(400).json({
                success: false,
                message: 'جميع الحقول مطلوبة'
            });
        }

        // Password strength validation
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
            });
        }

        // Check if username or email already exists
        const existing = await FamilyTreeAdmin.findOne({
            $or: [
                { username: username.toLowerCase().trim() },
                { email: email.toLowerCase().trim() }
            ]
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'اسم المستخدم أو البريد الإلكتروني موجود مسبقاً'
            });
        }

        // Determine role and permissions
        const userRole = role === 'ft-super-admin' ? 'ft-super-admin' : 'ft-editor';
        const permissions = FamilyTreeAdmin.getDefaultPermissions(userRole);

        // Create new admin
        const newAdmin = new FamilyTreeAdmin({
            username: username.toLowerCase().trim(),
            email: email.toLowerCase().trim(),
            password,
            displayName: displayName.trim(),
            role: userRole,
            permissions,
            isActive: true,
            createdBy: req.ftUser.username
        });

        await newAdmin.save();

        // Log the action
        await AuditLog.logAction({
            action: 'FT_USER_CREATED',
            category: 'user-management',
            resource: 'family-tree-admin',
            resourceId: newAdmin._id.toString(),
            user: req.ftUser.username,
            userRole: req.ftUser.role,
            ipAddress: getClientIP(req),
            userAgent: req.headers['user-agent'],
            dashboard: 'family-tree-dashboard',
            details: {
                newUsername: newAdmin.username,
                newRole: newAdmin.role
            },
            success: true
        });

        res.status(201).json({
            success: true,
            message: 'تم إنشاء المستخدم بنجاح',
            data: {
                id: newAdmin._id,
                username: newAdmin.username,
                email: newAdmin.email,
                displayName: newAdmin.displayName,
                role: newAdmin.role,
                permissions: newAdmin.permissions
            }
        });
    } catch (error) {
        console.error('[FT-AUTH] Create user error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء المستخدم'
        });
    }
});

/**
 * PUT /api/family-tree-auth/users/:id
 * Update Family Tree admin (ft-super-admin only)
 */
router.put('/users/:id', authenticateFTToken, requireFTSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { displayName, role, isActive, password } = req.body;

        const admin = await FamilyTreeAdmin.findById(id);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }

        // Prevent self-demotion of super admin
        if (admin._id.toString() === req.ftUser.id && role && role !== 'ft-super-admin') {
            return res.status(400).json({
                success: false,
                message: 'لا يمكنك تغيير صلاحياتك الخاصة'
            });
        }

        // Update fields
        if (displayName) admin.displayName = displayName.trim();
        if (role) {
            admin.role = role;
            admin.permissions = FamilyTreeAdmin.getDefaultPermissions(role);
        }
        if (typeof isActive === 'boolean') admin.isActive = isActive;
        if (password && password.length >= 8) admin.password = password;

        await admin.save();

        // Log the action
        await AuditLog.logAction({
            action: 'FT_USER_UPDATED',
            category: 'user-management',
            resource: 'family-tree-admin',
            resourceId: admin._id.toString(),
            user: req.ftUser.username,
            userRole: req.ftUser.role,
            ipAddress: getClientIP(req),
            userAgent: req.headers['user-agent'],
            dashboard: 'family-tree-dashboard',
            details: {
                targetUsername: admin.username,
                changes: { displayName, role, isActive, passwordChanged: !!password }
            },
            success: true
        });

        res.json({
            success: true,
            message: 'تم تحديث المستخدم بنجاح',
            data: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                displayName: admin.displayName,
                role: admin.role,
                permissions: admin.permissions,
                isActive: admin.isActive
            }
        });
    } catch (error) {
        console.error('[FT-AUTH] Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث المستخدم'
        });
    }
});

/**
 * DELETE /api/family-tree-auth/users/:id
 * Delete Family Tree admin (ft-super-admin only)
 */
router.delete('/users/:id', authenticateFTToken, requireFTSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent self-deletion
        if (id === req.ftUser.id) {
            return res.status(400).json({
                success: false,
                message: 'لا يمكنك حذف حسابك الخاص'
            });
        }

        const admin = await FamilyTreeAdmin.findById(id);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }

        await FamilyTreeAdmin.findByIdAndDelete(id);

        // Log the action
        await AuditLog.logAction({
            action: 'FT_USER_DELETED',
            category: 'user-management',
            resource: 'family-tree-admin',
            resourceId: id,
            user: req.ftUser.username,
            userRole: req.ftUser.role,
            ipAddress: getClientIP(req),
            userAgent: req.headers['user-agent'],
            dashboard: 'family-tree-dashboard',
            details: {
                deletedUsername: admin.username,
                deletedRole: admin.role
            },
            success: true
        });

        res.json({
            success: true,
            message: 'تم حذف المستخدم بنجاح'
        });
    } catch (error) {
        console.error('[FT-AUTH] Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في حذف المستخدم'
        });
    }
});

// ==================== CHANGE PASSWORD ====================

/**
 * PUT /api/family-tree-auth/change-password
 * Change own password
 */
router.put('/change-password', authenticateFTToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'كلمة المرور الحالية والجديدة مطلوبتان'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل'
            });
        }

        const admin = await FamilyTreeAdmin.findById(req.ftUser.id).select('+password');

        const isValid = await admin.comparePassword(currentPassword);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'كلمة المرور الحالية غير صحيحة'
            });
        }

        admin.password = newPassword;
        await admin.save();

        // Log the action
        await AuditLog.logAction({
            action: 'FT_PASSWORD_CHANGED',
            category: 'auth',
            resource: 'family-tree-auth',
            user: req.ftUser.username,
            userRole: req.ftUser.role,
            ipAddress: getClientIP(req),
            userAgent: req.headers['user-agent'],
            dashboard: 'family-tree-dashboard',
            success: true
        });

        res.json({
            success: true,
            message: 'تم تغيير كلمة المرور بنجاح'
        });
    } catch (error) {
        console.error('[FT-AUTH] Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تغيير كلمة المرور'
        });
    }
});

module.exports = router;
