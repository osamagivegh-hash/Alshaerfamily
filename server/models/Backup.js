/**
 * Backup Schema for Family Tree and CMS Data
 * Provides separate, timestamped backups with full audit trail
 * 
 * This schema supports:
 * - Family Tree Data Backups (persons, relationships)
 * - CMS Data Backups (news, articles, conversations, etc.)
 * - Automated and Manual backup triggers
 * - Full audit trail with creator tracking
 */

const mongoose = require('mongoose');

// Backup Schema
const backupSchema = new mongoose.Schema({
    // Backup identifier
    backupId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    // Type of backup: 'family-tree' or 'cms'
    backupType: {
        type: String,
        enum: ['family-tree', 'cms'],
        required: true,
        index: true
    },

    // Trigger type: 'auto' or 'manual'
    triggerType: {
        type: String,
        enum: ['auto', 'manual'],
        required: true
    },

    // Source dashboard that initiated the backup
    sourceDashboard: {
        type: String,
        enum: ['family-tree-dashboard', 'cms-dashboard', 'system'],
        required: true
    },

    // Who created the backup
    createdBy: {
        type: String,
        required: true // 'system' for auto, username for manual
    },

    // Backup status
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'failed'],
        default: 'pending'
    },

    // Backup data stored as JSON
    // For family-tree: { persons: [...], metadata: {...} }
    // For cms: { news: [...], articles: [...], conversations: [...], ... }
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },

    // Statistics about the backup
    stats: {
        totalRecords: { type: Number, default: 0 },
        collections: [{
            name: String,
            count: Number
        }],
        sizeInBytes: { type: Number, default: 0 }
    },

    // Backup metadata
    metadata: {
        mongodbVersion: String,
        nodeVersion: String,
        serverTimestamp: Date,
        checksumSHA256: String
    },

    // Error information if backup failed
    errorInfo: {
        message: String,
        stack: String,
        timestamp: Date
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: false, // We manage createdAt manually
    collection: 'backups'
});

// Indexes for efficient queries
backupSchema.index({ backupType: 1, createdAt: -1 });
backupSchema.index({ triggerType: 1, createdAt: -1 });
backupSchema.index({ createdBy: 1, createdAt: -1 });
backupSchema.index({ status: 1 });

// Static method to generate unique backup ID
backupSchema.statics.generateBackupId = function (type, trigger) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${type.toUpperCase()}_${trigger.toUpperCase()}_${timestamp}_${random}`;
};

// Static method to get latest backup for a type
backupSchema.statics.getLatestBackup = async function (backupType) {
    return await this.findOne({
        backupType,
        status: 'completed'
    }).sort({ createdAt: -1 });
};

// Static method to get backup count
backupSchema.statics.getBackupCount = async function (backupType) {
    return await this.countDocuments({ backupType, status: 'completed' });
};

// Static method to cleanup old backups (keep last N)
backupSchema.statics.cleanupOldBackups = async function (backupType, keepCount = 20) {
    const backups = await this.find({ backupType, status: 'completed' })
        .sort({ createdAt: -1 })
        .skip(keepCount)
        .select('_id');

    if (backups.length > 0) {
        await this.deleteMany({ _id: { $in: backups.map(b => b._id) } });
        return backups.length;
    }
    return 0;
};

// Virtual for human-readable size
backupSchema.virtual('sizeFormatted').get(function () {
    const bytes = this.stats?.sizeInBytes || 0;
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

const Backup = mongoose.model('Backup', backupSchema);

module.exports = Backup;
