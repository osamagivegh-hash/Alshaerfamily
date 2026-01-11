/**
 * Backup Scheduler Job
 * Runs automated backups every 48 hours for both Family Tree and CMS data
 * 
 * Features:
 * - Checks backup settings for configuration
 * - Runs backups at configured intervals
 * - Logs all automated backup actions
 */

const BackupService = require('../services/BackupService');
const { BackupSettings, AuditLog } = require('../models');

let backupCheckInterval = null;
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // Check every hour

/**
 * Check if a backup is due and run it
 * @param {string} backupType - 'family-tree' or 'cms'
 */
async function checkAndRunBackup(backupType) {
    try {
        const settings = await BackupSettings.getSettings();
        const config = backupType === 'family-tree'
            ? settings.familyTreeBackup
            : settings.cmsBackup;

        if (!config.enabled) {
            return;
        }

        const lastBackup = config.lastAutoBackup;
        const intervalMs = config.intervalHours * 60 * 60 * 1000;
        const now = new Date();

        // Check if backup is due
        const backupDue = !lastBackup || (now - new Date(lastBackup)) >= intervalMs;

        if (backupDue) {
            console.log(`[backup-scheduler] Running scheduled ${backupType} backup...`);

            await AuditLog.logAction({
                action: 'SCHEDULED_BACKUP_TRIGGERED',
                category: 'system',
                resource: 'backup',
                user: 'system',
                userRole: 'system',
                dashboard: backupType === 'family-tree' ? 'family-tree-dashboard' : 'cms-dashboard',
                details: { backupType, intervalHours: config.intervalHours },
                success: true
            });

            let result;
            if (backupType === 'family-tree') {
                result = await BackupService.createFamilyTreeBackup('auto', 'system', null);
            } else {
                result = await BackupService.createCMSBackup('auto', 'system', null);
            }

            if (result.success) {
                console.log(`[backup-scheduler] ${backupType} backup completed successfully. ID: ${result.backup.backupId}`);
            } else {
                console.error(`[backup-scheduler] ${backupType} backup failed:`, result.error);
            }
        }
    } catch (error) {
        console.error(`[backup-scheduler] Error checking ${backupType} backup:`, error);
    }
}

/**
 * Main scheduler loop
 */
async function runScheduler() {
    console.log('[backup-scheduler] Running backup check...');

    try {
        await checkAndRunBackup('family-tree');
        await checkAndRunBackup('cms');
    } catch (error) {
        console.error('[backup-scheduler] Scheduler error:', error);
    }
}

/**
 * Start the backup scheduler
 */
function startBackupScheduler() {
    console.log('[backup-scheduler] Starting backup scheduler...');
    console.log(`[backup-scheduler] Will check for due backups every ${CHECK_INTERVAL_MS / 1000 / 60} minutes`);

    // Run immediately on startup
    setTimeout(async () => {
        console.log('[backup-scheduler] Running initial backup check after startup...');
        await runScheduler();
    }, 10000); // Wait 10 seconds after server start

    // Then run at interval
    backupCheckInterval = setInterval(runScheduler, CHECK_INTERVAL_MS);

    return true;
}

/**
 * Stop the backup scheduler
 */
function stopBackupScheduler() {
    if (backupCheckInterval) {
        clearInterval(backupCheckInterval);
        backupCheckInterval = null;
        console.log('[backup-scheduler] Backup scheduler stopped');
    }
}

/**
 * Manually trigger a scheduled backup check
 */
async function triggerBackupCheck() {
    await runScheduler();
}

/**
 * Get scheduler status
 */
function getSchedulerStatus() {
    return {
        running: backupCheckInterval !== null,
        checkIntervalMs: CHECK_INTERVAL_MS,
        checkIntervalHours: CHECK_INTERVAL_MS / 1000 / 60 / 60
    };
}

module.exports = {
    startBackupScheduler,
    stopBackupScheduler,
    triggerBackupCheck,
    getSchedulerStatus
};
