/**
 * Family Tree Content Models
 * Schemas for the three sections of the Family Tree module:
 * 1. Founder Appreciation - Tribute to the founder
 * 2. Founder Discussions - Interviews and dialogues
 * 3. Family Tree Display - Visual tree content
 */

const mongoose = require('mongoose');

// ==================== FOUNDER APPRECIATION SCHEMA ====================
// Section 1: Tribute to the Founder
const founderAppreciationSchema = new mongoose.Schema({
    // Article title
    title: {
        type: String,
        required: true,
        default: 'تقدير ووفاء لمؤسس شجرة العائلة'
    },

    // Founder's photo
    founderImage: {
        type: String,
        default: ''
    },

    // Family tree image
    treeImage: {
        type: String,
        default: ''
    },

    // Rich text content (HTML)
    content: {
        type: String,
        required: true,
        default: ''
    },

    // Short summary/excerpt
    summary: {
        type: String,
        default: ''
    },

    // Author of the tribute
    author: {
        type: String,
        default: ''
    },

    // Whether this section is published/visible
    isPublished: {
        type: Boolean,
        default: true
    },

    // SEO metadata
    metaTitle: {
        type: String,
        default: ''
    },
    metaDescription: {
        type: String,
        default: ''
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Indexes
founderAppreciationSchema.index({ isPublished: 1 });
founderAppreciationSchema.index({ updatedAt: -1 });

// ==================== FOUNDER DISCUSSIONS SCHEMA ====================
// Section 2: Discussions and Dialogues with the Founder
const founderDiscussionSchema = new mongoose.Schema({
    // Discussion title
    title: {
        type: String,
        required: true
    },

    // Subtitle or topic
    subtitle: {
        type: String,
        default: ''
    },

    // Cover image for the discussion
    coverImage: {
        type: String,
        default: ''
    },

    // Rich text content (HTML) - the actual dialogue/interview
    content: {
        type: String,
        required: true
    },

    // Summary/excerpt
    summary: {
        type: String,
        default: ''
    },

    // Participants in the discussion
    participants: [{
        name: { type: String, required: true },
        role: { type: String, default: '' },
        image: { type: String, default: '' }
    }],

    // Interviewer/moderator
    moderator: {
        type: String,
        default: ''
    },

    // Date of the discussion/interview
    discussionDate: {
        type: Date,
        required: true
    },

    // Tags for categorization
    tags: [{ type: String }],

    // Display order (for chronological or custom ordering)
    order: {
        type: Number,
        default: 0
    },

    // Whether this discussion is published/visible
    isPublished: {
        type: Boolean,
        default: true
    },

    // Estimated reading time in minutes
    readingTime: {
        type: Number,
        default: 5
    },

    // Gallery of additional images
    gallery: [{ type: String }],

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Indexes
founderDiscussionSchema.index({ isPublished: 1, discussionDate: -1 });
founderDiscussionSchema.index({ order: 1 });
founderDiscussionSchema.index({ tags: 1 });
founderDiscussionSchema.index({ title: 'text', content: 'text', summary: 'text' });

// ==================== FAMILY TREE DISPLAY SCHEMA ====================
// Section 3: Family Tree Display Content
const familyTreeDisplaySchema = new mongoose.Schema({
    // Section title
    title: {
        type: String,
        required: true,
        default: 'شجرة العائلة'
    },

    // Introductory text above the tree
    introText: {
        type: String,
        default: ''
    },

    // Footer/closing text below the tree
    footerText: {
        type: String,
        default: ''
    },

    // Background image for the tree section
    backgroundImage: {
        type: String,
        default: ''
    },

    // Tree display mode: 'visual' (interactive tree), 'static' (image), 'embedded' (external embed)
    displayMode: {
        type: String,
        enum: ['visual', 'static', 'embedded'],
        default: 'visual'
    },

    // Static tree image (if displayMode is 'static')
    staticTreeImage: {
        type: String,
        default: ''
    },

    // Embedded content/iframe (if displayMode is 'embedded')
    embeddedContent: {
        type: String,
        default: ''
    },

    // Whether tree is interactive (allows clicking on nodes)
    isInteractive: {
        type: Boolean,
        default: true
    },

    // Custom CSS for tree styling
    customStyles: {
        type: String,
        default: ''
    },

    // Whether this section is published/visible
    isPublished: {
        type: Boolean,
        default: true
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Indexes
familyTreeDisplaySchema.index({ isPublished: 1 });

// ==================== FAMILY TREE SETTINGS SCHEMA ====================
// Global settings for the Family Tree module
const familyTreeSettingsSchema = new mongoose.Schema({
    // Button colors for the gateway page
    buttonColors: {
        appreciation: { type: String, default: '#1a1a1a' },  // Black
        discussions: { type: String, default: '#CE1126' },   // Red
        tree: { type: String, default: '#007A3D' }           // Green
    },

    // Button labels
    buttonLabels: {
        appreciation: { type: String, default: 'تقدير ووفاء للمؤسس' },
        discussions: { type: String, default: 'حوارات مع المؤسس' },
        tree: { type: String, default: 'شجرة العائلة' }
    },

    // Gateway page title
    gatewayTitle: {
        type: String,
        default: 'شجرة عائلة الشاعر'
    },

    // Gateway page subtitle
    gatewaySubtitle: {
        type: String,
        default: 'اكتشف تاريخ وتراث عائلتنا العريقة'
    },

    // Gateway background image
    gatewayBackground: {
        type: String,
        default: ''
    },

    updatedAt: { type: Date, default: Date.now }
});

// Create Models
const FounderAppreciation = mongoose.model('FounderAppreciation', founderAppreciationSchema);
const FounderDiscussion = mongoose.model('FounderDiscussion', founderDiscussionSchema);
const FamilyTreeDisplay = mongoose.model('FamilyTreeDisplay', familyTreeDisplaySchema);
const FamilyTreeSettings = mongoose.model('FamilyTreeSettings', familyTreeSettingsSchema);

module.exports = {
    FounderAppreciation,
    FounderDiscussion,
    FamilyTreeDisplay,
    FamilyTreeSettings
};
