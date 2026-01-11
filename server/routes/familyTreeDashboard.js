/**
 * Family Tree Dashboard Routes
 * 
 * Dedicated API routes for the Family Tree Dashboard
 * Completely separated from CMS Dashboard routes
 * 
 * Features:
 * - Family members CRUD operations
 * - Tree structure management
 * - Lineage records
 * - Family Tree specific backups
 * - Role-based access (family-tree permission required)
 */

const express = require('express');
const router = express.Router();
const {
    authenticateToken,
    requireAdmin,
    requirePermission,
    requireSuperAdmin
} = require('../middleware/auth');
const { Person, Backup, BackupSettings, AuditLog } = require('../models');
const BackupService = require('../services/BackupService');

// ==================== FAMILY TREE DASHBOARD STATS ====================

/**
 * Get Family Tree Dashboard statistics
 */
router.get('/stats', authenticateToken, requireAdmin, requirePermission('family-tree'), async (req, res) => {
    try {
        const totalPersons = await Person.countDocuments();
        const totalGenerations = await Person.distinct('generation').then(gens => gens.length);
        const rootAncestors = await Person.countDocuments({ isRoot: true });
        const livingMembers = await Person.countDocuments({ isAlive: true });
        const deceasedMembers = await Person.countDocuments({ isAlive: false });

        // Get latest backup info
        const latestBackup = await Backup.getLatestBackup('family-tree');
        const totalBackups = await Backup.getBackupCount('family-tree');

        // Get generation breakdown
        const generationBreakdown = await Person.aggregate([
            { $group: { _id: '$generation', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            data: {
                totalPersons,
                totalGenerations,
                rootAncestors,
                livingMembers,
                deceasedMembers,
                generationBreakdown: generationBreakdown.map(g => ({
                    generation: g._id,
                    count: g.count
                })),
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
        console.error('Family Tree stats error:', error);
        res.status(500).json({ success: false, message: 'خطأ في جلب إحصائيات شجرة العائلة' });
    }
});

// ==================== BACKUP MANAGEMENT ====================

/**
 * Get list of Family Tree backups
 */
router.get('/backups', authenticateToken, requireAdmin, requirePermission('family-tree'), async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const backups = await BackupService.getBackups('family-tree', limit);

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
router.get('/backups/:backupId', authenticateToken, requireAdmin, requirePermission('family-tree'), async (req, res) => {
    try {
        const { backupId } = req.params;
        const includeData = req.query.includeData === 'true';
        const backup = await BackupService.getBackupDetails(backupId, includeData);

        if (!backup) {
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
 * Create manual Family Tree backup
 * Accessible by any user with family-tree permission
 */
router.post('/backups/create', authenticateToken, requireAdmin, requirePermission('family-tree'), async (req, res) => {
    try {
        const result = await BackupService.createFamilyTreeBackup(
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
 * Restore Family Tree from backup
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

        const result = await BackupService.restoreFamilyTreeBackup(
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
 * Delete a Family Tree backup
 * Super Admin only
 */
router.delete('/backups/:backupId', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const { backupId } = req.params;
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
 * Get backup settings
 * Super Admin only
 */
router.get('/backup-settings', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const settings = await BackupSettings.getSettings();
        res.json({
            success: true,
            data: {
                familyTreeBackup: settings.familyTreeBackup,
                globalSettings: settings.globalSettings
            }
        });
    } catch (error) {
        console.error('Get backup settings error:', error);
        res.status(500).json({ success: false, message: 'خطأ في جلب إعدادات النسخ الاحتياطي' });
    }
});

/**
 * Update backup settings
 * Super Admin only
 */
router.put('/backup-settings', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const { enabled, intervalHours, maxBackupsToKeep } = req.body;

        const updates = {};
        if (enabled !== undefined) updates['familyTreeBackup.enabled'] = enabled;
        if (intervalHours !== undefined) updates['familyTreeBackup.intervalHours'] = intervalHours;
        if (maxBackupsToKeep !== undefined) updates['familyTreeBackup.maxBackupsToKeep'] = maxBackupsToKeep;

        const settings = await BackupSettings.updateSettings(updates, req.user.username);

        res.json({
            success: true,
            message: 'تم تحديث إعدادات النسخ الاحتياطي',
            data: settings.familyTreeBackup
        });
    } catch (error) {
        console.error('Update backup settings error:', error);
        res.status(500).json({ success: false, message: 'خطأ في تحديث إعدادات النسخ الاحتياطي' });
    }
});

// ==================== AUDIT LOGS ====================

/**
 * Get Family Tree related audit logs
 * Super Admin only
 */
router.get('/audit-logs', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const logs = await AuditLog.find({
            $or: [
                { dashboard: 'family-tree-dashboard' },
                { resource: 'persons' },
                { 'details.backupType': 'family-tree' }
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
