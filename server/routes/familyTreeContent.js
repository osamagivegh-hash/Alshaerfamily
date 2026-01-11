/**
 * Family Tree Content API Routes
 * CRUD operations for Family Tree sections:
 * - Founder Appreciation
 * - Founder Discussions
 * - Family Tree Display
 * - Family Tree Settings
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
    FounderAppreciation,
    FounderDiscussion,
    FamilyTreeDisplay,
    FamilyTreeSettings
} = require('../models/FamilyTreeContent');

// Helper function to normalize MongoDB documents
const normalizeDocument = (doc) => {
    if (!doc) return null;
    if (Array.isArray(doc)) {
        return doc.map(item => normalizeDocument(item));
    }
    const normalized = doc.toObject ? doc.toObject() : { ...doc };
    if (normalized._id) {
        normalized.id = normalized._id.toString();
    }
    return normalized;
};

// Validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ==================== PUBLIC ROUTES ====================

// GET Family Tree Settings (public - for gateway page)
router.get('/settings', async (req, res) => {
    try {
        let settings = await FamilyTreeSettings.findOne();

        if (!settings) {
            // Create default settings if none exist
            settings = new FamilyTreeSettings();
            await settings.save();
        }

        res.json({ success: true, data: normalizeDocument(settings) });
    } catch (error) {
        console.error('Get family tree settings error:', error);
        res.status(500).json({ success: false, message: 'خطأ في جلب إعدادات شجرة العائلة' });
    }
});

// GET Founder Appreciation (public)
router.get('/appreciation', async (req, res) => {
    try {
        let appreciation = await FounderAppreciation.findOne({ isPublished: true });

        if (!appreciation) {
            // Return empty structure if no content exists
            return res.json({
                success: true,
                data: null,
                message: 'لا يوجد محتوى منشور حالياً'
            });
        }

        res.json({ success: true, data: normalizeDocument(appreciation) });
    } catch (error) {
        console.error('Get founder appreciation error:', error);
        res.status(500).json({ success: false, message: 'خطأ في جلب محتوى التقدير' });
    }
});

// GET All Published Discussions (public)
router.get('/discussions', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const discussions = await FounderDiscussion.find({ isPublished: true })
            .sort({ discussionDate: -1, order: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await FounderDiscussion.countDocuments({ isPublished: true });

        res.json({
            success: true,
            data: normalizeDocument(discussions),
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get founder discussions error:', error);
        res.status(500).json({ success: false, message: 'خطأ في جلب الحوارات' });
    }
});

// GET Single Discussion by ID (public)
router.get('/discussions/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: 'معرف غير صالح' });
        }

        const discussion = await FounderDiscussion.findOne({
            _id: id,
            isPublished: true
        });

        if (!discussion) {
            return res.status(404).json({ success: false, message: 'الحوار غير موجود' });
        }

        res.json({ success: true, data: normalizeDocument(discussion) });
    } catch (error) {
        console.error('Get single discussion error:', error);
        res.status(500).json({ success: false, message: 'خطأ في جلب الحوار' });
    }
});

// GET Family Tree Display Settings (public)
router.get('/tree-display', async (req, res) => {
    try {
        let display = await FamilyTreeDisplay.findOne({ isPublished: true });

        if (!display) {
            return res.json({
                success: true,
                data: null,
                message: 'لا يوجد إعدادات عرض منشورة'
            });
        }

        res.json({ success: true, data: normalizeDocument(display) });
    } catch (error) {
        console.error('Get tree display error:', error);
        res.status(500).json({ success: false, message: 'خطأ في جلب إعدادات العرض' });
    }
});

// ==================== ADMIN ROUTES ====================

// ---------- Settings Management ----------

// GET Settings (Admin)
router.get('/admin/settings', authenticateToken, requireAdmin, async (req, res) => {
    try {
        let settings = await FamilyTreeSettings.findOne();

        if (!settings) {
            settings = new FamilyTreeSettings();
            await settings.save();
        }

        res.json({ success: true, data: normalizeDocument(settings) });
    } catch (error) {
        console.error('Admin get settings error:', error);
        res.status(500).json({ success: false, message: 'خطأ في جلب الإعدادات' });
    }
});

// PUT Update Settings (Admin)
router.put('/admin/settings', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const updateData = { ...req.body, updatedAt: new Date() };

        let settings = await FamilyTreeSettings.findOne();

        if (!settings) {
            settings = new FamilyTreeSettings(updateData);
        } else {
            Object.assign(settings, updateData);
        }

        await settings.save();

        res.json({
            success: true,
            message: 'تم تحديث الإعدادات بنجاح',
            data: normalizeDocument(settings)
        });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ success: false, message: 'خطأ في تحديث الإعدادات' });
    }
});

// ---------- Founder Appreciation Management ----------

// GET Appreciation (Admin - includes unpublished)
router.get('/admin/appreciation', authenticateToken, requireAdmin, async (req, res) => {
    try {
        let appreciation = await FounderAppreciation.findOne();

        if (!appreciation) {
            // Create default empty appreciation if none exists
            appreciation = new FounderAppreciation({
                title: 'تقدير ووفاء لمؤسس شجرة العائلة',
                content: '',
                isPublished: false
            });
            await appreciation.save();
        }

        res.json({ success: true, data: normalizeDocument(appreciation) });
    } catch (error) {
        console.error('Admin get appreciation error:', error);
        res.status(500).json({ success: false, message: 'خطأ في جلب محتوى التقدير' });
    }
});

// PUT Update Appreciation (Admin)
router.put('/admin/appreciation', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const updateData = { ...req.body, updatedAt: new Date() };

        let appreciation = await FounderAppreciation.findOne();

        if (!appreciation) {
            appreciation = new FounderAppreciation(updateData);
        } else {
            Object.assign(appreciation, updateData);
        }

        await appreciation.save();

        res.json({
            success: true,
            message: 'تم تحديث محتوى التقدير بنجاح',
            data: normalizeDocument(appreciation)
        });
    } catch (error) {
        console.error('Update appreciation error:', error);
        res.status(500).json({ success: false, message: 'خطأ في تحديث محتوى التقدير' });
    }
});

// ---------- Founder Discussions Management ----------

// GET All Discussions (Admin - includes unpublished)
router.get('/admin/discussions', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const discussions = await FounderDiscussion.find()
            .sort({ discussionDate: -1, order: 1 });

        res.json({ success: true, data: normalizeDocument(discussions) });
    } catch (error) {
        console.error('Admin get discussions error:', error);
        res.status(500).json({ success: false, message: 'خطأ في جلب الحوارات' });
    }
});

// GET Single Discussion (Admin)
router.get('/admin/discussions/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: 'معرف غير صالح' });
        }

        const discussion = await FounderDiscussion.findById(id);

        if (!discussion) {
            return res.status(404).json({ success: false, message: 'الحوار غير موجود' });
        }

        res.json({ success: true, data: normalizeDocument(discussion) });
    } catch (error) {
        console.error('Admin get single discussion error:', error);
        res.status(500).json({ success: false, message: 'خطأ في جلب الحوار' });
    }
});

// POST Create Discussion (Admin)
router.post('/admin/discussions', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { title, content, discussionDate } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ success: false, message: 'العنوان مطلوب' });
        }

        if (!content || !content.trim()) {
            return res.status(400).json({ success: false, message: 'المحتوى مطلوب' });
        }

        const discussion = new FounderDiscussion({
            ...req.body,
            title: title.trim(),
            content: content.trim(),
            discussionDate: discussionDate || new Date()
        });

        await discussion.save();

        res.status(201).json({
            success: true,
            message: 'تم إضافة الحوار بنجاح',
            data: normalizeDocument(discussion)
        });
    } catch (error) {
        console.error('Create discussion error:', error);
        res.status(500).json({ success: false, message: 'خطأ في إضافة الحوار' });
    }
});

// PUT Update Discussion (Admin)
router.put('/admin/discussions/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: 'معرف غير صالح' });
        }

        const discussion = await FounderDiscussion.findById(id);

        if (!discussion) {
            return res.status(404).json({ success: false, message: 'الحوار غير موجود' });
        }

        const updateData = { ...req.body, updatedAt: new Date() };
        Object.assign(discussion, updateData);
        await discussion.save();

        res.json({
            success: true,
            message: 'تم تحديث الحوار بنجاح',
            data: normalizeDocument(discussion)
        });
    } catch (error) {
        console.error('Update discussion error:', error);
        res.status(500).json({ success: false, message: 'خطأ في تحديث الحوار' });
    }
});

// DELETE Discussion (Admin)
router.delete('/admin/discussions/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: 'معرف غير صالح' });
        }

        const discussion = await FounderDiscussion.findByIdAndDelete(id);

        if (!discussion) {
            return res.status(404).json({ success: false, message: 'الحوار غير موجود' });
        }

        res.json({ success: true, message: 'تم حذف الحوار بنجاح' });
    } catch (error) {
        console.error('Delete discussion error:', error);
        res.status(500).json({ success: false, message: 'خطأ في حذف الحوار' });
    }
});

// PATCH Toggle Discussion Published Status (Admin)
router.patch('/admin/discussions/:id/publish', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { isPublished } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: 'معرف غير صالح' });
        }

        const discussion = await FounderDiscussion.findByIdAndUpdate(
            id,
            { isPublished, updatedAt: new Date() },
            { new: true }
        );

        if (!discussion) {
            return res.status(404).json({ success: false, message: 'الحوار غير موجود' });
        }

        res.json({
            success: true,
            message: isPublished ? 'تم نشر الحوار' : 'تم إلغاء نشر الحوار',
            data: normalizeDocument(discussion)
        });
    } catch (error) {
        console.error('Toggle publish error:', error);
        res.status(500).json({ success: false, message: 'خطأ في تحديث حالة النشر' });
    }
});

// ---------- Family Tree Display Management ----------

// GET Tree Display (Admin)
router.get('/admin/tree-display', authenticateToken, requireAdmin, async (req, res) => {
    try {
        let display = await FamilyTreeDisplay.findOne();

        if (!display) {
            display = new FamilyTreeDisplay({
                title: 'شجرة العائلة',
                displayMode: 'visual',
                isPublished: true
            });
            await display.save();
        }

        res.json({ success: true, data: normalizeDocument(display) });
    } catch (error) {
        console.error('Admin get tree display error:', error);
        res.status(500).json({ success: false, message: 'خطأ في جلب إعدادات العرض' });
    }
});

// PUT Update Tree Display (Admin)
router.put('/admin/tree-display', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const updateData = { ...req.body, updatedAt: new Date() };

        let display = await FamilyTreeDisplay.findOne();

        if (!display) {
            display = new FamilyTreeDisplay(updateData);
        } else {
            Object.assign(display, updateData);
        }

        await display.save();

        res.json({
            success: true,
            message: 'تم تحديث إعدادات العرض بنجاح',
            data: normalizeDocument(display)
        });
    } catch (error) {
        console.error('Update tree display error:', error);
        res.status(500).json({ success: false, message: 'خطأ في تحديث إعدادات العرض' });
    }
});

// ---------- Stats Endpoint ----------

// GET Family Tree Content Stats (Admin)
router.get('/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [appreciationExists, discussionsCount, displayExists] = await Promise.all([
            FounderAppreciation.exists({ isPublished: true }),
            FounderDiscussion.countDocuments(),
            FamilyTreeDisplay.exists({ isPublished: true })
        ]);

        const publishedDiscussions = await FounderDiscussion.countDocuments({ isPublished: true });

        res.json({
            success: true,
            data: {
                appreciationConfigured: !!appreciationExists,
                totalDiscussions: discussionsCount,
                publishedDiscussions,
                treeDisplayConfigured: !!displayExists
            }
        });
    } catch (error) {
        console.error('Get content stats error:', error);
        res.status(500).json({ success: false, message: 'خطأ في جلب الإحصائيات' });
    }
});

module.exports = router;
