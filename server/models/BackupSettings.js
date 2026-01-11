/**
 * Backup Settings Schema
 * Configuration for automated backup scheduling and retention
 */

const mongoose = require('mongoose');

const backupSettingsSchema = new mongoose.Schema({
    // Settings identifier (singleton pattern)
    settingsId: {
        type: String,
        default: 'default',
        unique: true
    },

    // Family Tree Backup Settings
    familyTreeBackup: {
        enabled: { type: Boolean, default: true },
        intervalHours: { type: Number, default: 48 }, // Every 48 hours
        maxBackupsToKeep: { type: Number, default: 20 },
        lastAutoBackup: { type: Date },
        nextScheduledBackup: { type: Date }
    },

    // CMS Backup Settings
    cmsBackup: {
        enabled: { type: Boolean, default: true },
        intervalHours: { type: Number, default: 48 }, // Every 48 hours
        maxBackupsToKeep: { type: Number, default: 20 },
        lastAutoBackup: { type: Date },
        nextScheduledBackup: { type: Date }
    },

    // Global Settings
    globalSettings: {
        // Whether to include images/media in backups
        includeMedia: { type: Boolean, default: false },
        // Compression level (0 = none, 1 = fast, 2 = balanced, 3 = max)
        compressionLevel: { type: Number, default: 1 },
        // Whether to send email notifications on backup completion
        emailNotifications: { type: Boolean, default: false },
        notificationEmail: { type: String }
    },

    // Updated tracking
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: String }
}, {
    collection: 'backup_settings'
});

// Pre-save to update timestamp
backupSettingsSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// Static method to get or create settings
backupSettingsSchema.statics.getSettings = async function () {
    let settings = await this.findOne({ settingsId: 'default' });
    if (!settings) {
        settings = await this.create({ settingsId: 'default' });
    }
    return settings;
};

// Static method to update settings
backupSettingsSchema.statics.updateSettings = async function (updates, updatedBy = 'system') {
    const settings = await this.findOneAndUpdate(
        { settingsId: 'default' },
        {
            ...updates,
            updatedAt: new Date(),
            updatedBy
        },
        { new: true, upsert: true }
    );
    return settings;
};

// Method to calculate next backup time
backupSettingsSchema.methods.calculateNextBackup = function (backupType) {
    const config = backupType === 'family-tree'
        ? this.familyTreeBackup
        : this.cmsBackup;

    if (!config.enabled) return null;

    const lastBackup = config.lastAutoBackup || new Date();
    const nextBackup = new Date(lastBackup);
    nextBackup.setHours(nextBackup.getHours() + config.intervalHours);

    return nextBackup;
};

const BackupSettings = mongoose.model('BackupSettings', backupSettingsSchema);

module.exports = BackupSettings;
