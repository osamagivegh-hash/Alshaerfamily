/**
 * Development Team Models
 * - DevTeamMessage: Messages from users to the development team
 * - DevTeamPost: Announcements and posts from the development team
 */

const mongoose = require('mongoose');

// Message Schema - for user contact messages
const DevTeamMessageSchema = new mongoose.Schema({
    // Sender information
    senderName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    senderEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'البريد الإلكتروني غير صالح']
    },
    senderPhone: {
        type: String,
        trim: true
    },

    // Message content
    subject: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    message: {
        type: String,
        required: true,
        maxlength: 5000
    },

    // Message type/category
    category: {
        type: String,
        enum: ['suggestion', 'bug', 'question', 'feedback', 'other'],
        default: 'other'
    },

    // Status tracking
    status: {
        type: String,
        enum: ['new', 'read', 'in_progress', 'resolved', 'archived'],
        default: 'new'
    },

    // Admin response
    response: {
        type: String,
        default: ''
    },
    respondedBy: {
        type: String,
        default: ''
    },
    respondedAt: {
        type: Date
    },

    // Metadata
    ipAddress: String,
    userAgent: String,

    // Priority
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    }
}, {
    timestamps: true
});

// Post Schema - for team announcements
const DevTeamPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    content: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        maxlength: 500
    },

    // Post type
    postType: {
        type: String,
        enum: ['announcement', 'update', 'feature', 'maintenance', 'general'],
        default: 'general'
    },

    // Author
    author: {
        type: String,
        default: 'فريق التطوير'
    },

    // Visibility
    isPublished: {
        type: Boolean,
        default: true
    },
    isPinned: {
        type: Boolean,
        default: false
    },

    // Order for display
    order: {
        type: Number,
        default: 0
    },

    // Icon/emoji for visual
    icon: {
        type: String,
        default: '📢'
    }
}, {
    timestamps: true
});

// Indexes
DevTeamMessageSchema.index({ status: 1, createdAt: -1 });
DevTeamMessageSchema.index({ category: 1 });
DevTeamMessageSchema.index({ senderEmail: 1 });

DevTeamPostSchema.index({ isPublished: 1, createdAt: -1 });
DevTeamPostSchema.index({ isPinned: -1, createdAt: -1 });

const DevTeamMessage = mongoose.model('DevTeamMessage', DevTeamMessageSchema);
const DevTeamPost = mongoose.model('DevTeamPost', DevTeamPostSchema);

module.exports = {
    DevTeamMessage,
    DevTeamPost
};
