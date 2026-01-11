/**
 * Development Team Routes
 * Public: Submit messages, view posts, view alerts
 * Admin: Manage messages, posts, and alerts
 */

const express = require('express');
const router = express.Router();
const { DevTeamMessage, DevTeamPost, DevTeamAlert } = require('../models/DevTeam');
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
 * GET /api/dev-team/alerts
 * Get active alerts for display
 */
router.get('/alerts', async (req, res) => {
    try {
        const now = new Date();
        const alerts = await DevTeamAlert.find({
            isActive: true,
            startDate: { $lte: now },
            $or: [
                { endDate: null },
                { endDate: { $gte: now } }
            ]
        }).sort({ order: 1 }).limit(5);

        res.json({
            success: true,
            data: normalizeDocument(alerts)
        });
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب التنبيهات'
        });
    }
});

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
 * GET /api/dev-team/posts/:id
 * Get single post by ID
 */
router.get('/posts/:id', async (req, res) => {
    try {
        const post = await DevTeamPost.findOne({
            _id: req.params.id,
            isPublished: true
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'المنشور غير موجود'
            });
        }

        res.json({
            success: true,
            data: normalizeDocument(post)
        });
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب المنشور'
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

// ==================== ADMIN MESSAGES ROUTES ====================

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
 * Create a new post with rich text
 */
router.post('/admin/posts', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const {
            title, content, summary, postType, icon, isPublished, isPinned,
            author, authorRole, authorAvatar, featuredImage,
            paragraphSpacing, textAlignment, isArticle, maxCollapsedHeight
        } = req.body;

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
            author: author || req.user.username,
            authorRole: authorRole || 'مطور',
            authorAvatar: authorAvatar || '',
            featuredImage: featuredImage || '',
            isPublished: isPublished !== false,
            isPinned: isPinned || false,
            paragraphSpacing: paragraphSpacing || 'normal',
            textAlignment: textAlignment || 'right',
            isArticle: isArticle || false,
            maxCollapsedHeight: maxCollapsedHeight || 0
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
        const {
            title, content, summary, postType, icon, isPublished, isPinned,
            author, authorRole, authorAvatar, featuredImage,
            paragraphSpacing, textAlignment, isArticle, maxCollapsedHeight
        } = req.body;

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
        if (author) post.author = author;
        if (authorRole !== undefined) post.authorRole = authorRole;
        if (authorAvatar !== undefined) post.authorAvatar = authorAvatar;
        if (featuredImage !== undefined) post.featuredImage = featuredImage;
        if (paragraphSpacing) post.paragraphSpacing = paragraphSpacing;
        if (textAlignment) post.textAlignment = textAlignment;
        if (isArticle !== undefined) post.isArticle = isArticle;
        if (maxCollapsedHeight !== undefined) post.maxCollapsedHeight = maxCollapsedHeight;

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

// ==================== ADMIN ALERTS ROUTES ====================

/**
 * GET /api/dev-team/admin/alerts
 * Get all alerts
 */
router.get('/admin/alerts', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const alerts = await DevTeamAlert.find().sort({ order: 1, createdAt: -1 });

        res.json({
            success: true,
            data: normalizeDocument(alerts)
        });
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب التنبيهات'
        });
    }
});

/**
 * POST /api/dev-team/admin/alerts
 * Create a new alert
 */
router.post('/admin/alerts', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const {
            title, content, alertType, backgroundColor, textColor, icon,
            showButton, buttonText, buttonLink,
            isActive, isDismissible, isSticky,
            order, startDate, endDate
        } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'العنوان والمحتوى مطلوبان'
            });
        }

        const newAlert = new DevTeamAlert({
            title,
            content,
            alertType: alertType || 'info',
            backgroundColor: backgroundColor || '#0d9488',
            textColor: textColor || '#ffffff',
            icon: icon || '📢',
            showButton: showButton !== false,
            buttonText: buttonText || 'عرض التفاصيل',
            buttonLink: buttonLink || '/family-tree/dev-team',
            isActive: isActive !== false,
            isDismissible: isDismissible !== false,
            isSticky: isSticky || false,
            order: order || 0,
            startDate: startDate ? new Date(startDate) : new Date(),
            endDate: endDate ? new Date(endDate) : null
        });

        await newAlert.save();

        res.status(201).json({
            success: true,
            message: 'تم إنشاء التنبيه بنجاح',
            data: normalizeDocument(newAlert)
        });
    } catch (error) {
        console.error('Error creating alert:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء التنبيه'
        });
    }
});

/**
 * PUT /api/dev-team/admin/alerts/:id
 * Update an alert
 */
router.put('/admin/alerts/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const {
            title, content, alertType, backgroundColor, textColor, icon,
            showButton, buttonText, buttonLink,
            isActive, isDismissible, isSticky,
            order, startDate, endDate
        } = req.body;

        const alert = await DevTeamAlert.findById(req.params.id);

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'التنبيه غير موجود'
            });
        }

        if (title) alert.title = title;
        if (content) alert.content = content;
        if (alertType) alert.alertType = alertType;
        if (backgroundColor) alert.backgroundColor = backgroundColor;
        if (textColor) alert.textColor = textColor;
        if (icon) alert.icon = icon;
        if (showButton !== undefined) alert.showButton = showButton;
        if (buttonText) alert.buttonText = buttonText;
        if (buttonLink) alert.buttonLink = buttonLink;
        if (isActive !== undefined) alert.isActive = isActive;
        if (isDismissible !== undefined) alert.isDismissible = isDismissible;
        if (isSticky !== undefined) alert.isSticky = isSticky;
        if (order !== undefined) alert.order = order;
        if (startDate) alert.startDate = new Date(startDate);
        if (endDate !== undefined) alert.endDate = endDate ? new Date(endDate) : null;

        await alert.save();

        res.json({
            success: true,
            message: 'تم تحديث التنبيه بنجاح',
            data: normalizeDocument(alert)
        });
    } catch (error) {
        console.error('Error updating alert:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث التنبيه'
        });
    }
});

/**
 * DELETE /api/dev-team/admin/alerts/:id
 * Delete an alert
 */
router.delete('/admin/alerts/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await DevTeamAlert.findByIdAndDelete(req.params.id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'التنبيه غير موجود'
            });
        }

        res.json({
            success: true,
            message: 'تم حذف التنبيه بنجاح'
        });
    } catch (error) {
        console.error('Error deleting alert:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في حذف التنبيه'
        });
    }
});

module.exports = router;
