/**
 * Backup Service
 * Handles all backup and restore operations for Family Tree and CMS data
 * 
 * Features:
 * - Separate backups for Family Tree and CMS data
 * - Automated scheduled backups (every 48 hours)
 * - Manual backup triggers
 * - Restore with confirmation requirements
 * - Full audit logging
 */

const crypto = require('crypto');
const {
    Person,
    News,
    Articles,
    Conversations,
    Palestine,
    Gallery,
    Contacts,
    Comments,
    FamilyTickerNews,
    PalestineTickerNews,
    TickerSettings,
    HeroSlide,
    Backup,
    AuditLog,
    BackupSettings
} = require('../models');

class BackupService {
    /**
     * Create a Family Tree backup
     * @param {string} triggerType - 'auto' or 'manual'
     * @param {string} createdBy - Username or 'system'
     * @param {Object} req - Request object for audit logging
     * @returns {Object} Backup record
     */
    static async createFamilyTreeBackup(triggerType = 'manual', createdBy = 'system', req = null) {
        const backupId = Backup.generateBackupId('family-tree', triggerType);

        try {
            // Log backup initiation
            await AuditLog.logBackupAction('BACKUP_CREATED', backupId, createdBy, {
                dashboard: 'family-tree-dashboard',
                triggerType,
                status: 'initiated'
            }, req);

            // Create pending backup record
            const backup = new Backup({
                backupId,
                backupType: 'family-tree',
                triggerType,
                sourceDashboard: triggerType === 'auto' ? 'system' : 'family-tree-dashboard',
                createdBy,
                status: 'in-progress',
                data: {},
                stats: { totalRecords: 0, collections: [] }
            });
            await backup.save();

            // Fetch all family tree data
            const persons = await Person.find({}).lean();

            // Calculate statistics
            const totalRecords = persons.length;
            const dataToBackup = {
                persons,
                metadata: {
                    collectionVersion: 1,
                    exportedAt: new Date().toISOString()
                }
            };

            // Calculate checksum
            const dataString = JSON.stringify(dataToBackup);
            const checksum = crypto.createHash('sha256').update(dataString).digest('hex');
            const sizeInBytes = Buffer.byteLength(dataString, 'utf8');

            // Update backup with data
            backup.data = dataToBackup;
            backup.status = 'completed';
            backup.completedAt = new Date();
            backup.stats = {
                totalRecords,
                collections: [
                    { name: 'persons', count: persons.length }
                ],
                sizeInBytes
            };
            backup.metadata = {
                mongodbVersion: '4.x',
                nodeVersion: process.version,
                serverTimestamp: new Date(),
                checksumSHA256: checksum
            };
            await backup.save();

            // Update backup settings with last backup time
            await BackupSettings.updateSettings({
                'familyTreeBackup.lastAutoBackup': new Date()
            });

            // Cleanup old backups
            const settings = await BackupSettings.getSettings();
            const deletedCount = await Backup.cleanupOldBackups(
                'family-tree',
                settings.familyTreeBackup.maxBackupsToKeep
            );

            if (deletedCount > 0) {
                await AuditLog.logBackupAction('BACKUP_CLEANUP', null, 'system', {
                    dashboard: 'family-tree-dashboard',
                    deletedCount,
                    backupType: 'family-tree'
                });
            }

            // Log successful completion
            await AuditLog.logBackupAction('BACKUP_CREATED', backupId, createdBy, {
                dashboard: 'family-tree-dashboard',
                triggerType,
                status: 'completed',
                stats: backup.stats
            }, req);

            return {
                success: true,
                backup: {
                    id: backup._id,
                    backupId: backup.backupId,
                    backupType: backup.backupType,
                    triggerType: backup.triggerType,
                    status: backup.status,
                    stats: backup.stats,
                    createdAt: backup.createdAt,
                    completedAt: backup.completedAt
                }
            };

        } catch (error) {
            console.error('Family Tree backup failed:', error);

            // Try to update backup status to failed
            try {
                await Backup.findOneAndUpdate(
                    { backupId },
                    {
                        status: 'failed',
                        errorInfo: {
                            message: error.message,
                            stack: error.stack,
                            timestamp: new Date()
                        }
                    }
                );
            } catch (updateError) {
                console.error('Failed to update backup status:', updateError);
            }

            // Log failure
            await AuditLog.logBackupAction('BACKUP_FAILED', backupId, createdBy, {
                dashboard: 'family-tree-dashboard',
                triggerType,
                errorMessage: error.message
            }, req);

            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Create a CMS backup
     * @param {string} triggerType - 'auto' or 'manual'
     * @param {string} createdBy - Username or 'system'
     * @param {Object} req - Request object for audit logging
     * @returns {Object} Backup record
     */
    static async createCMSBackup(triggerType = 'manual', createdBy = 'system', req = null) {
        const backupId = Backup.generateBackupId('cms', triggerType);

        try {
            // Log backup initiation
            await AuditLog.logBackupAction('BACKUP_CREATED', backupId, createdBy, {
                dashboard: 'cms-dashboard',
                triggerType,
                status: 'initiated'
            }, req);

            // Create pending backup record
            const backup = new Backup({
                backupId,
                backupType: 'cms',
                triggerType,
                sourceDashboard: triggerType === 'auto' ? 'system' : 'cms-dashboard',
                createdBy,
                status: 'in-progress',
                data: {},
                stats: { totalRecords: 0, collections: [] }
            });
            await backup.save();

            // Fetch all CMS data
            const [news, articles, conversations, palestine, gallery, contacts, comments,
                familyTickerNews, palestineTickerNews, tickerSettings, heroSlides] = await Promise.all([
                    News.find({}).lean(),
                    Articles.find({}).lean(),
                    Conversations.find({}).lean(),
                    Palestine.find({}).lean(),
                    Gallery.find({}).lean(),
                    Contacts.find({}).lean(),
                    Comments.find({}).lean(),
                    FamilyTickerNews.find({}).lean(),
                    PalestineTickerNews.find({}).lean(),
                    TickerSettings.findOne({}).lean(),
                    HeroSlide.find({}).lean()
                ]);

            // Calculate statistics
            const collections = [
                { name: 'news', count: news.length },
                { name: 'articles', count: articles.length },
                { name: 'conversations', count: conversations.length },
                { name: 'palestine', count: palestine.length },
                { name: 'gallery', count: gallery.length },
                { name: 'contacts', count: contacts.length },
                { name: 'comments', count: comments.length },
                { name: 'familyTickerNews', count: familyTickerNews.length },
                { name: 'palestineTickerNews', count: palestineTickerNews.length },
                { name: 'tickerSettings', count: tickerSettings ? 1 : 0 },
                { name: 'heroSlides', count: heroSlides.length }
            ];

            const totalRecords = collections.reduce((sum, c) => sum + c.count, 0);

            const dataToBackup = {
                news,
                articles,
                conversations,
                palestine,
                gallery,
                contacts,
                comments,
                familyTickerNews,
                palestineTickerNews,
                tickerSettings,
                heroSlides,
                metadata: {
                    collectionVersion: 1,
                    exportedAt: new Date().toISOString()
                }
            };

            // Calculate checksum
            const dataString = JSON.stringify(dataToBackup);
            const checksum = crypto.createHash('sha256').update(dataString).digest('hex');
            const sizeInBytes = Buffer.byteLength(dataString, 'utf8');

            // Update backup with data
            backup.data = dataToBackup;
            backup.status = 'completed';
            backup.completedAt = new Date();
            backup.stats = {
                totalRecords,
                collections,
                sizeInBytes
            };
            backup.metadata = {
                mongodbVersion: '4.x',
                nodeVersion: process.version,
                serverTimestamp: new Date(),
                checksumSHA256: checksum
            };
            await backup.save();

            // Update backup settings with last backup time
            await BackupSettings.updateSettings({
                'cmsBackup.lastAutoBackup': new Date()
            });

            // Cleanup old backups
            const settings = await BackupSettings.getSettings();
            const deletedCount = await Backup.cleanupOldBackups(
                'cms',
                settings.cmsBackup.maxBackupsToKeep
            );

            if (deletedCount > 0) {
                await AuditLog.logBackupAction('BACKUP_CLEANUP', null, 'system', {
                    dashboard: 'cms-dashboard',
                    deletedCount,
                    backupType: 'cms'
                });
            }

            // Log successful completion
            await AuditLog.logBackupAction('BACKUP_CREATED', backupId, createdBy, {
                dashboard: 'cms-dashboard',
                triggerType,
                status: 'completed',
                stats: backup.stats
            }, req);

            return {
                success: true,
                backup: {
                    id: backup._id,
                    backupId: backup.backupId,
                    backupType: backup.backupType,
                    triggerType: backup.triggerType,
                    status: backup.status,
                    stats: backup.stats,
                    createdAt: backup.createdAt,
                    completedAt: backup.completedAt
                }
            };

        } catch (error) {
            console.error('CMS backup failed:', error);

            // Try to update backup status to failed
            try {
                await Backup.findOneAndUpdate(
                    { backupId },
                    {
                        status: 'failed',
                        errorInfo: {
                            message: error.message,
                            stack: error.stack,
                            timestamp: new Date()
                        }
                    }
                );
            } catch (updateError) {
                console.error('Failed to update backup status:', updateError);
            }

            // Log failure
            await AuditLog.logBackupAction('BACKUP_FAILED', backupId, createdBy, {
                dashboard: 'cms-dashboard',
                triggerType,
                errorMessage: error.message
            }, req);

            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Restore Family Tree data from a backup
     * Only accessible by Super Admin
     * @param {string} backupId - ID of the backup to restore
     * @param {string} username - Username of the admin performing restore
     * @param {Object} req - Request object for audit logging
     * @returns {Object} Restore result
     */
    static async restoreFamilyTreeBackup(backupIdToRestore, username, req = null) {
        try {
            // Log restore initiation
            await AuditLog.logRestoreAction('RESTORE_INITIATED', backupIdToRestore, username, {
                dashboard: 'family-tree-dashboard',
                userRole: 'super-admin'
            }, req);

            // Find the backup
            const backup = await Backup.findOne({
                backupId: backupIdToRestore,
                backupType: 'family-tree',
                status: 'completed'
            });

            if (!backup) {
                await AuditLog.logRestoreAction('RESTORE_FAILED', backupIdToRestore, username, {
                    dashboard: 'family-tree-dashboard',
                    errorMessage: 'Backup not found or not completed'
                }, req);
                return { success: false, error: 'النسخة الاحتياطية غير موجودة أو غير مكتملة' };
            }

            // Create a pre-restore backup first (safety measure)
            const preRestoreBackup = await this.createFamilyTreeBackup('manual', 'system-pre-restore', req);
            if (!preRestoreBackup.success) {
                await AuditLog.logRestoreAction('RESTORE_FAILED', backupIdToRestore, username, {
                    dashboard: 'family-tree-dashboard',
                    errorMessage: 'Failed to create pre-restore backup'
                }, req);
                return { success: false, error: 'فشل إنشاء نسخة احتياطية قبل الاستعادة' };
            }

            // Clear existing data and restore from backup
            const personsData = backup.data.persons || [];

            // Delete all existing persons
            await Person.deleteMany({});

            // Insert backup data
            if (personsData.length > 0) {
                // Remove _id fields to avoid conflicts, let MongoDB generate new ones
                const personsToInsert = personsData.map(p => {
                    const { _id, __v, ...rest } = p;
                    return rest;
                });
                await Person.insertMany(personsToInsert, { ordered: false });
            }

            // Log successful restore
            await AuditLog.logRestoreAction('RESTORE_COMPLETED', backupIdToRestore, username, {
                dashboard: 'family-tree-dashboard',
                restoredRecords: personsData.length,
                preRestoreBackupId: preRestoreBackup.backup.backupId
            }, req);

            return {
                success: true,
                message: 'تمت الاستعادة بنجاح',
                restoredRecords: personsData.length,
                preRestoreBackupId: preRestoreBackup.backup.backupId
            };

        } catch (error) {
            console.error('Family Tree restore failed:', error);

            await AuditLog.logRestoreAction('RESTORE_FAILED', backupIdToRestore, username, {
                dashboard: 'family-tree-dashboard',
                errorMessage: error.message
            }, req);

            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Restore CMS data from a backup
     * Only accessible by Super Admin
     * @param {string} backupId - ID of the backup to restore
     * @param {string} username - Username of the admin performing restore
     * @param {Object} req - Request object for audit logging
     * @returns {Object} Restore result
     */
    static async restoreCMSBackup(backupIdToRestore, username, req = null) {
        try {
            // Log restore initiation
            await AuditLog.logRestoreAction('RESTORE_INITIATED', backupIdToRestore, username, {
                dashboard: 'cms-dashboard',
                userRole: 'super-admin'
            }, req);

            // Find the backup
            const backup = await Backup.findOne({
                backupId: backupIdToRestore,
                backupType: 'cms',
                status: 'completed'
            });

            if (!backup) {
                await AuditLog.logRestoreAction('RESTORE_FAILED', backupIdToRestore, username, {
                    dashboard: 'cms-dashboard',
                    errorMessage: 'Backup not found or not completed'
                }, req);
                return { success: false, error: 'النسخة الاحتياطية غير موجودة أو غير مكتملة' };
            }

            // Create a pre-restore backup first (safety measure)
            const preRestoreBackup = await this.createCMSBackup('manual', 'system-pre-restore', req);
            if (!preRestoreBackup.success) {
                await AuditLog.logRestoreAction('RESTORE_FAILED', backupIdToRestore, username, {
                    dashboard: 'cms-dashboard',
                    errorMessage: 'Failed to create pre-restore backup'
                }, req);
                return { success: false, error: 'فشل إنشاء نسخة احتياطية قبل الاستعادة' };
            }

            const data = backup.data;
            let totalRestored = 0;

            // Helper to restore a collection
            const restoreCollection = async (Model, dataArray, collectionName) => {
                if (!dataArray || dataArray.length === 0) return 0;
                await Model.deleteMany({});
                const toInsert = dataArray.map(item => {
                    const { _id, __v, ...rest } = item;
                    return rest;
                });
                await Model.insertMany(toInsert, { ordered: false });
                return toInsert.length;
            };

            // Restore all collections
            totalRestored += await restoreCollection(News, data.news, 'news');
            totalRestored += await restoreCollection(Articles, data.articles, 'articles');
            totalRestored += await restoreCollection(Conversations, data.conversations, 'conversations');
            totalRestored += await restoreCollection(Palestine, data.palestine, 'palestine');
            totalRestored += await restoreCollection(Gallery, data.gallery, 'gallery');
            totalRestored += await restoreCollection(Contacts, data.contacts, 'contacts');
            totalRestored += await restoreCollection(Comments, data.comments, 'comments');
            totalRestored += await restoreCollection(FamilyTickerNews, data.familyTickerNews, 'familyTickerNews');
            totalRestored += await restoreCollection(PalestineTickerNews, data.palestineTickerNews, 'palestineTickerNews');
            totalRestored += await restoreCollection(HeroSlide, data.heroSlides, 'heroSlides');

            // Restore ticker settings (single document)
            if (data.tickerSettings) {
                await TickerSettings.deleteMany({});
                const { _id, __v, ...tickerData } = data.tickerSettings;
                await TickerSettings.create(tickerData);
                totalRestored += 1;
            }

            // Log successful restore
            await AuditLog.logRestoreAction('RESTORE_COMPLETED', backupIdToRestore, username, {
                dashboard: 'cms-dashboard',
                restoredRecords: totalRestored,
                preRestoreBackupId: preRestoreBackup.backup.backupId
            }, req);

            return {
                success: true,
                message: 'تمت الاستعادة بنجاح',
                restoredRecords: totalRestored,
                preRestoreBackupId: preRestoreBackup.backup.backupId
            };

        } catch (error) {
            console.error('CMS restore failed:', error);

            await AuditLog.logRestoreAction('RESTORE_FAILED', backupIdToRestore, username, {
                dashboard: 'cms-dashboard',
                errorMessage: error.message
            }, req);

            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get list of backups
     * @param {string} backupType - 'family-tree' or 'cms'
     * @param {number} limit - Number of backups to return
     * @returns {Array} List of backups
     */
    static async getBackups(backupType, limit = 20) {
        const backups = await Backup.find({
            backupType,
            status: 'completed'
        })
            .select('-data') // Exclude large data field
            .sort({ createdAt: -1 })
            .limit(limit);

        return backups;
    }

    /**
     * Get backup details
     * @param {string} backupId - Backup ID
     * @param {boolean} includeData - Whether to include the full data
     * @returns {Object} Backup details
     */
    static async getBackupDetails(backupId, includeData = false) {
        const select = includeData ? {} : { data: 0 };
        return await Backup.findOne({ backupId }).select(select);
    }

    /**
     * Delete a backup (Super Admin only)
     * @param {string} backupId - Backup ID to delete
     * @param {string} username - Username performing deletion
     * @param {Object} req - Request object for audit logging
     * @returns {Object} Deletion result
     */
    static async deleteBackup(backupId, username, req = null) {
        try {
            const backup = await Backup.findOneAndDelete({ backupId });

            if (!backup) {
                return { success: false, error: 'النسخة الاحتياطية غير موجودة' };
            }

            await AuditLog.logBackupAction('BACKUP_DELETED', backupId, username, {
                dashboard: backup.backupType === 'family-tree' ? 'family-tree-dashboard' : 'cms-dashboard',
                backupType: backup.backupType
            }, req);

            return { success: true, message: 'تم حذف النسخة الاحتياطية بنجاح' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = BackupService;
