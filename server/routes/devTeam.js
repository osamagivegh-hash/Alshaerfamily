/**
 * Development Team Routes
 * Public: Submit messages, view posts
 * Admin: Manage messages and posts
 */

const express = require('express');
const router = express.Router();
const { DevTeamMessage, DevTeamPost } = require('../models/DevTeam');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Helper to normalize MongoDB documents
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

// ==================== PUBLIC ROUTES ====================

/**
 * GET /api/dev-team/posts
 * Get all published posts
 */
router.get('/posts', async (req, res) => {
    try {
        const posts = await DevTeamPost.find({ isPublished: true })
            .sort({ isPinned: -1, createdAt: -1 })
            .limit(20);

        res.json({
            success: true,
            data: normalizeDocument(posts)
        });
    } catch (error) {
        console.error('Error fetching dev team posts:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب المنشورات'
        });
    }
});

/**
 * POST /api/dev-team/messages
 * Submit a new message to the development team
 */
router.post('/messages', async (req, res) => {
    try {
        const { senderName, senderEmail, senderPhone, subject, message, category } = req.body;

        // Validation
        if (!senderName || !senderEmail || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'جميع الحقول المطلوبة يجب ملؤها'
            });
        }

        // Simple rate limiting check (by email)
        const recentMessages = await DevTeamMessage.countDocuments({
            senderEmail,
            createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
        });

        if (recentMessages >= 3) {
            return res.status(429).json({
                success: false,
                message: 'لقد أرسلت عدة رسائل مؤخراً. يرجى الانتظار قليلاً.'
            });
        }

        const newMessage = new DevTeamMessage({
            senderName,
            senderEmail,
            senderPhone: senderPhone || '',
            subject,
            message,
            category: category || 'other',
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent') || 'unknown'
        });

        await newMessage.save();

        res.status(201).json({
            success: true,
            message: 'تم إرسال رسالتك بنجاح. سيتواصل معك فريق التطوير قريباً.',
            data: { id: newMessage._id }
        });
    } catch (error) {
        console.error('Error submitting message:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في إرسال الرسالة'
        });
    }
});

// ==================== ADMIN ROUTES ====================

/**
 * GET /api/dev-team/admin/messages
 * Get all messages (admin only)
 */
router.get('/admin/messages', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { status, category, page = 1, limit = 20 } = req.query;

        const query = {};
        if (status) query.status = status;
        if (category) query.category = category;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [messages, total] = await Promise.all([
            DevTeamMessage.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            DevTeamMessage.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: normalizeDocument(messages),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الرسائل'
        });
    }
});

/**
 * GET /api/dev-team/admin/messages/stats
 * Get message statistics
 */
router.get('/admin/messages/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [total, newCount, inProgress, resolved] = await Promise.all([
            DevTeamMessage.countDocuments(),
            DevTeamMessage.countDocuments({ status: 'new' }),
            DevTeamMessage.countDocuments({ status: 'in_progress' }),
            DevTeamMessage.countDocuments({ status: 'resolved' })
        ]);

        res.json({
            success: true,
            data: {
                total,
                new: newCount,
                inProgress,
                resolved,
                read: await DevTeamMessage.countDocuments({ status: 'read' }),
                archived: await DevTeamMessage.countDocuments({ status: 'archived' })
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الإحصائيات'
        });
    }
});

/**
 * GET /api/dev-team/admin/messages/:id
 * Get single message
 */
router.get('/admin/messages/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const message = await DevTeamMessage.findById(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'الرسالة غير موجودة'
            });
        }

        // Mark as read if new
        if (message.status === 'new') {
            message.status = 'read';
            await message.save();
        }

        res.json({
            success: true,
            data: normalizeDocument(message)
        });
    } catch (error) {
        console.error('Error fetching message:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الرسالة'
        });
    }
});

/**
 * PUT /api/dev-team/admin/messages/:id
 * Update message status/response
 */
router.put('/admin/messages/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { status, response, priority } = req.body;

        const message = await DevTeamMessage.findById(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'الرسالة غير موجودة'
            });
        }

        if (status) message.status = status;
        if (priority) message.priority = priority;
        if (response) {
            message.response = response;
            message.respondedBy = req.user.username;
            message.respondedAt = new Date();
        }

        await message.save();

        res.json({
            success: true,
            message: 'تم تحديث الرسالة بنجاح',
            data: normalizeDocument(message)
        });
    } catch (error) {
        console.error('Error updating message:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث الرسالة'
        });
    }
});

/**
 * DELETE /api/dev-team/admin/messages/:id
 * Delete a message
 */
router.delete('/admin/messages/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await DevTeamMessage.findByIdAndDelete(req.params.id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'الرسالة غير موجودة'
            });
        }

        res.json({
            success: true,
            message: 'تم حذف الرسالة بنجاح'
        });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في حذف الرسالة'
        });
    }
});

// ==================== ADMIN POSTS ROUTES ====================

/**
 * GET /api/dev-team/admin/posts
 * Get all posts (including unpublished)
 */
router.get('/admin/posts', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const posts = await DevTeamPost.find()
            .sort({ isPinned: -1, createdAt: -1 });

        res.json({
            success: true,
            data: normalizeDocument(posts)
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب المنشورات'
        });
    }
});

/**
 * POST /api/dev-team/admin/posts
 * Create a new post
 */
router.post('/admin/posts', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { title, content, summary, postType, icon, isPublished, isPinned } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'العنوان والمحتوى مطلوبان'
            });
        }

        const newPost = new DevTeamPost({
            title,
            content,
            summary: summary || '',
            postType: postType || 'general',
            icon: icon || '📢',
            author: req.user.username,
            isPublished: isPublished !== false,
            isPinned: isPinned || false
        });

        await newPost.save();

        res.status(201).json({
            success: true,
            message: 'تم إنشاء المنشور بنجاح',
            data: normalizeDocument(newPost)
        });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء المنشور'
        });
    }
});

/**
 * PUT /api/dev-team/admin/posts/:id
 * Update a post
 */
router.put('/admin/posts/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { title, content, summary, postType, icon, isPublished, isPinned } = req.body;

        const post = await DevTeamPost.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'المنشور غير موجود'
            });
        }

        if (title) post.title = title;
        if (content) post.content = content;
        if (summary !== undefined) post.summary = summary;
        if (postType) post.postType = postType;
        if (icon) post.icon = icon;
        if (isPublished !== undefined) post.isPublished = isPublished;
        if (isPinned !== undefined) post.isPinned = isPinned;

        await post.save();

        res.json({
            success: true,
            message: 'تم تحديث المنشور بنجاح',
            data: normalizeDocument(post)
        });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث المنشور'
        });
    }
});

/**
 * DELETE /api/dev-team/admin/posts/:id
 * Delete a post
 */
router.delete('/admin/posts/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await DevTeamPost.findByIdAndDelete(req.params.id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'المنشور غير موجود'
            });
        }

        res.json({
            success: true,
            message: 'تم حذف المنشور بنجاح'
        });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في حذف المنشور'
        });
    }
});

module.exports = router;
