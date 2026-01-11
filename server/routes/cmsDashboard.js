/**
 * CMS Dashboard Routes
 * 
 * Dedicated API routes for the Main CMS Dashboard
 * Completely separated from Family Tree Dashboard routes
 * 
 * Features:
 * - CMS statistics
 * - CMS specific backups
 * - Content management overview
 * - Role-based access (admin/super-admin required)
 */

const express = require('express');
const router = express.Router();
const {
    authenticateToken,
    requireAdmin,
    requireSuperAdmin
} = require('../middleware/auth');
const {
    News,
    Articles,
    Conversations,
    Palestine,
    Gallery,
    Contacts,
    Comments,
    FamilyTickerNews,
    PalestineTickerNews,
    HeroSlide,
    Backup,
    BackupSettings,
    AuditLog,
    Visitor
} = require('../models');
const BackupService = require('../services/BackupService');

// ==================== CMS DASHBOARD STATS ====================

/**
 * Get CMS Dashboard statistics
 */
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        // Only allow access to users with CMS-related permissions
        const cmsPermissions = ['news', 'articles', 'conversations', 'palestine', 'gallery', 'contacts', 'settings'];
        const hasAnyPermission = req.user.role === 'super-admin' ||
            req.user.role === 'admin' ||
            (req.user.permissions && req.user.permissions.some(p => cmsPermissions.includes(p)));

        if (!hasAnyPermission) {
            return res.status(403).json({ success: false, message: 'لا تملك صلاحية الوصول إلى لوحة إدارة المحتوى' });
        }

        const [
            newsCount,
            articlesCount,
            conversationsCount,
            palestineCount,
            galleryCount,
            contactsCount,
            commentsCount,
            familyTickerCount,
            palestineTickerCount,
            heroSlidesCount,
            unreadContacts
        ] = await Promise.all([
            News.countDocuments(),
            Articles.countDocuments(),
            Conversations.countDocuments(),
            Palestine.countDocuments(),
            Gallery.countDocuments(),
            Contacts.countDocuments(),
            Comments.countDocuments(),
            FamilyTickerNews.countDocuments(),
            PalestineTickerNews.countDocuments(),
            HeroSlide.countDocuments(),
            Contacts.countDocuments({ status: 'new' })
        ]);

        // Get latest backup info
        const latestBackup = await Backup.getLatestBackup('cms');
        const totalBackups = await Backup.getBackupCount('cms');

        // Get recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentNews = await News.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
        const recentArticles = await Articles.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

        // Get Visitor Stats
        const today = new Date().toISOString().slice(0, 10);
        const visitorsTodayDoc = await Visitor.findOne({ date: today });
        const visitorsToday = visitorsTodayDoc ? visitorsTodayDoc.count : 0;

        const totalVisitorsAgg = await Visitor.aggregate([
            { $group: { _id: null, total: { $sum: '$count' } } }
        ]);
        const totalVisitors = totalVisitorsAgg.length > 0 ? totalVisitorsAgg[0].total : 0;

        res.json({
            success: true,
            data: {
                visitors: {
                    today: visitorsToday,
                    total: totalVisitors
                },
                content: {
                    news: newsCount,
                    articles: articlesCount,
                    conversations: conversationsCount,
                    palestine: palestineCount,
                    gallery: galleryCount,
                    contacts: contactsCount,
                    comments: commentsCount,
                    unreadContacts
                },
                tickers: {
                    familyTicker: familyTickerCount,
                    palestineTicker: palestineTickerCount,
                    heroSlides: heroSlidesCount
                },
                recentActivity: {
                    newsLast7Days: recentNews,
                    articlesLast7Days: recentArticles
                },
                backup: {
                    totalBackups,
                    lastBackup: latestBackup ? {
                        backupId: latestBackup.backupId,
                        createdAt: latestBackup.createdAt,
                        triggerType: latestBackup.triggerType,
                        stats: latestBackup.stats
                    } : null
                }
            }
        });
    } catch (error) {
        console.error('CMS stats error:', error);
        res.status(500).json({ success: false, message: 'خطأ في جلب إحصائيات لوحة الإدارة' });
    }
});

// ==================== BACKUP MANAGEMENT ====================

/**
 * Get list of CMS backups
 * Admin or Super Admin only
 */
router.get('/backups', authenticateToken, requireAdmin, async (req, res) => {
    try {
        // Only super-admin and admin can access CMS backups
        if (!['super-admin', 'admin'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'صلاحيات المدير مطلوبة لعرض النسخ الاحتياطية' });
        }

        const limit = parseInt(req.query.limit) || 20;
        const backups = await BackupService.getBackups('cms', limit);

        res.json({
            success: true,
            data: backups
        });
    } catch (error) {
        console.error('Get backups error:', error);
        res.status(500).json({ success: false, message: 'خطأ في جلب النسخ الاحتياطية' });
    }
});

/**
 * Get backup details
 */
router.get('/backups/:backupId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        if (!['super-admin', 'admin'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'صلاحيات المدير مطلوبة' });
        }

        const { backupId } = req.params;
        const includeData = req.query.includeData === 'true';
        const backup = await BackupService.getBackupDetails(backupId, includeData);

        if (!backup || backup.backupType !== 'cms') {
            return res.status(404).json({ success: false, message: 'النسخة الاحتياطية غير موجودة' });
        }

        res.json({
            success: true,
            data: backup
        });
    } catch (error) {
        console.error('Get backup details error:', error);
        res.status(500).json({ success: false, message: 'خطأ في جلب تفاصيل النسخة الاحتياطية' });
    }
});

/**
 * Create manual CMS backup
 * Admin or Super Admin only
 */
router.post('/backups/create', authenticateToken, requireAdmin, async (req, res) => {
    try {
        if (!['super-admin', 'admin'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'صلاحيات المدير مطلوبة لإنشاء نسخة احتياطية' });
        }

        const result = await BackupService.createCMSBackup(
            'manual',
            req.user.username,
            req
        );

        if (result.success) {
            res.status(201).json({
                success: true,
                message: 'تم إنشاء النسخة الاحتياطية بنجاح',
                data: result.backup
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'فشل إنشاء النسخة الاحتياطية',
                error: result.error
            });
        }
    } catch (error) {
        console.error('Create backup error:', error);
        res.status(500).json({ success: false, message: 'خطأ في إنشاء النسخة الاحتياطية' });
    }
});

/**
 * Restore CMS from backup
 * Super Admin only - requires confirmation
 */
router.post('/backups/:backupId/restore', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const { backupId } = req.params;
        const { confirmRestore } = req.body;

        // Require explicit confirmation
        if (confirmRestore !== true) {
            return res.status(400).json({
                success: false,
                message: 'يجب تأكيد الاستعادة. أرسل confirmRestore: true للمتابعة',
                requireConfirmation: true
            });
        }

        const result = await BackupService.restoreCMSBackup(
            backupId,
            req.user.username,
            req
        );

        if (result.success) {
            res.json({
                success: true,
                message: result.message,
                restoredRecords: result.restoredRecords,
                preRestoreBackupId: result.preRestoreBackupId
            });
        } else {
            res.status(500).json({
                success: false,
                message: result.error
            });
        }
    } catch (error) {
        console.error('Restore backup error:', error);
        res.status(500).json({ success: false, message: 'خطأ في استعادة النسخة الاحتياطية' });
    }
});

/**
 * Delete a CMS backup
 * Super Admin only
 */
router.delete('/backups/:backupId', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const { backupId } = req.params;

        // Verify it's a CMS backup
        const backup = await BackupService.getBackupDetails(backupId, false);
        if (!backup || backup.backupType !== 'cms') {
            return res.status(404).json({ success: false, message: 'النسخة الاحتياطية غير موجودة' });
        }

        const result = await BackupService.deleteBackup(backupId, req.user.username, req);

        if (result.success) {
            res.json({
                success: true,
                message: result.message
            });
        } else {
            res.status(404).json({
                success: false,
                message: result.error
            });
        }
    } catch (error) {
        console.error('Delete backup error:', error);
        res.status(500).json({ success: false, message: 'خطأ في حذف النسخة الاحتياطية' });
    }
});

// ==================== BACKUP SETTINGS ====================

/**
 * Get CMS backup settings
 * Super Admin only
 */
router.get('/backup-settings', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const settings = await BackupSettings.getSettings();
        res.json({
            success: true,
            data: {
                cmsBackup: settings.cmsBackup,
                globalSettings: settings.globalSettings
            }
        });
    } catch (error) {
        console.error('Get backup settings error:', error);
        res.status(500).json({ success: false, message: 'خطأ في جلب إعدادات النسخ الاحتياطي' });
    }
});

/**
 * Update CMS backup settings
 * Super Admin only
 */
router.put('/backup-settings', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const { enabled, intervalHours, maxBackupsToKeep } = req.body;

        const updates = {};
        if (enabled !== undefined) updates['cmsBackup.enabled'] = enabled;
        if (intervalHours !== undefined) updates['cmsBackup.intervalHours'] = intervalHours;
        if (maxBackupsToKeep !== undefined) updates['cmsBackup.maxBackupsToKeep'] = maxBackupsToKeep;

        const settings = await BackupSettings.updateSettings(updates, req.user.username);

        res.json({
            success: true,
            message: 'تم تحديث إعدادات النسخ الاحتياطي',
            data: settings.cmsBackup
        });
    } catch (error) {
        console.error('Update backup settings error:', error);
        res.status(500).json({ success: false, message: 'خطأ في تحديث إعدادات النسخ الاحتياطي' });
    }
});

// ==================== AUDIT LOGS ====================

/**
 * Get CMS related audit logs
 * Super Admin only
 */
router.get('/audit-logs', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const logs = await AuditLog.find({
            $or: [
                { dashboard: 'cms-dashboard' },
                { resource: { $in: ['news', 'articles', 'conversations', 'palestine', 'gallery', 'contacts'] } },
                { 'details.backupType': 'cms' }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(limit);

        res.json({
            success: true,
            data: logs
        });
    } catch (error) {
        console.error('Get audit logs error:', error);
        res.status(500).json({ success: false, message: 'خطأ في جلب سجلات التدقيق' });
    }
});

module.exports = router;
