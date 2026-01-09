/**
 * Public API Routes for Family Tree (Persons)
 * These routes are accessible without authentication
 */

const express = require('express');
const mongoose = require('mongoose');
const Person = require('../models/Person');

const router = express.Router();

/**
 * @route   GET /api/persons
 * @desc    Get all persons (flat list)
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 100,
            search,
            generation,
            sort = 'generation'
        } = req.query;

        const query = {};

        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { nickname: { $regex: search, $options: 'i' } }
            ];
        }

        if (generation !== undefined) {
            query.generation = parseInt(generation);
        }

        const persons = await Person.find(query)
            .populate('fatherId', 'fullName')
            .sort({ [sort]: 1, siblingOrder: 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Person.countDocuments(query);

        res.json({
            success: true,
            data: persons,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('خطأ في جلب الأشخاص:', error);
        res.status(500).json({
            success: false,
            error: 'خطأ في جلب البيانات',
            message: error.message
        });
    }
});

/**
 * @route   GET /api/persons/tree
 * @desc    Get full family tree structure
 * @access  Public
 */
router.get('/tree', async (req, res) => {
    try {
        const tree = await Person.buildTree();

        if (!tree) {
            return res.json({
                success: true,
                data: null,
                message: 'لا توجد شجرة عائلة بعد. يرجى إضافة الجد الأكبر أولاً.'
            });
        }

        res.json({
            success: true,
            data: tree
        });
    } catch (error) {
        console.error('خطأ في جلب الشجرة:', error);
        res.status(500).json({
            success: false,
            error: 'خطأ في جلب شجرة العائلة',
            message: error.message
        });
    }
});

/**
 * @route   GET /api/persons/tree/:id
 * @desc    Get branch from specific person
 * @access  Public
 */
router.get('/tree/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: 'معرف غير صالح'
            });
        }

        const branch = await Person.buildTree(id);

        if (!branch) {
            return res.status(404).json({
                success: false,
                error: 'الشخص غير موجود'
            });
        }

        res.json({
            success: true,
            data: branch
        });
    } catch (error) {
        console.error('خطأ في جلب الفرع:', error);
        res.status(500).json({
            success: false,
            error: 'خطأ في جلب الفرع',
            message: error.message
        });
    }
});

/**
 * @route   GET /api/persons/eligible-fathers
 * @desc    Get eligible fathers for a new person (generation-based filtering)
 * @access  Public
 */
router.get('/eligible-fathers', async (req, res) => {
    try {
        const { generation, excludeId } = req.query;

        let query = { gender: 'male' };

        if (generation !== undefined) {
            const targetGen = parseInt(generation);
            if (targetGen > 0) {
                query.generation = targetGen - 1;
            } else {
                return res.json({
                    success: true,
                    data: [],
                    message: 'الجيل الأول لا يحتاج إلى أب'
                });
            }
        }

        if (excludeId) {
            query._id = { $ne: excludeId };
        }

        const eligibleFathers = await Person.find(query)
            .select('_id fullName nickname generation fatherId')
            .populate('fatherId', 'fullName')
            .sort({ generation: 1, fullName: 1 });

        res.json({
            success: true,
            data: eligibleFathers.map(p => ({
                _id: p._id,
                fullName: p.fullName,
                nickname: p.nickname,
                generation: p.generation,
                fatherName: p.fatherId?.fullName || null,
                displayName: p.fatherId
                    ? `${p.fullName} بن ${p.fatherId.fullName}`
                    : p.fullName
            })),
            total: eligibleFathers.length
        });
    } catch (error) {
        console.error('خطأ في جلب الآباء المؤهلين:', error);
        res.status(500).json({
            success: false,
            error: 'خطأ في جلب الآباء المؤهلين',
            message: error.message
        });
    }
});

/**
 * @route   GET /api/persons/by-generation/:generation
 * @desc    Get all persons from a specific generation
 * @access  Public
 */
router.get('/by-generation/:generation', async (req, res) => {
    try {
        const generation = parseInt(req.params.generation);

        const persons = await Person.find({ generation })
            .select('_id fullName nickname generation fatherId')
            .populate('fatherId', 'fullName')
            .sort({ siblingOrder: 1, fullName: 1 });

        res.json({
            success: true,
            data: persons.map(p => ({
                _id: p._id,
                fullName: p.fullName,
                nickname: p.nickname,
                generation: p.generation,
                fatherName: p.fatherId?.fullName || null,
                displayName: p.fatherId
                    ? `${p.fullName} بن ${p.fatherId.fullName}`
                    : p.fullName
            })),
            generation,
            total: persons.length
        });
    } catch (error) {
        console.error('خطأ في جلب أشخاص الجيل:', error);
        res.status(500).json({
            success: false,
            error: 'خطأ في جلب البيانات',
            message: error.message
        });
    }
});

/**
 * @route   GET /api/persons/stats
 * @desc    Get family tree statistics
 * @access  Public
 */
router.get('/stats', async (req, res) => {
    try {
        const totalPersons = await Person.countDocuments();
        const totalGenerations = await Person.distinct('generation');
        const genderStats = await Person.aggregate([
            { $group: { _id: '$gender', count: { $sum: 1 } } }
        ]);
        const generationStats = await Person.aggregate([
            { $group: { _id: '$generation', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        const verificationStats = await Person.aggregate([
            { $group: { _id: '$verification.status', count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            data: {
                totalPersons,
                totalGenerations: totalGenerations.length,
                maxGeneration: Math.max(...totalGenerations, 0),
                genderStats: genderStats.reduce((acc, item) => {
                    acc[item._id || 'unknown'] = item.count;
                    return acc;
                }, {}),
                generationStats: generationStats.map(item => ({
                    generation: item._id,
                    count: item.count
                })),
                verificationStats: verificationStats.reduce((acc, item) => {
                    acc[item._id || 'pending'] = item.count;
                    return acc;
                }, {})
            }
        });
    } catch (error) {
        console.error('خطأ في جلب الإحصائيات:', error);
        res.status(500).json({
            success: false,
            error: 'خطأ في جلب الإحصائيات',
            message: error.message
        });
    }
});

/**
 * @route   GET /api/persons/:id
 * @desc    Get single person by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: 'معرف غير صالح'
            });
        }

        const person = await Person.findById(id)
            .populate('fatherId', 'fullName generation')
            .populate('motherId', 'fullName');

        if (!person) {
            return res.status(404).json({
                success: false,
                error: 'الشخص غير موجود'
            });
        }

        // Get children
        const children = await Person.find({ fatherId: id })
            .select('fullName gender generation siblingOrder')
            .sort({ siblingOrder: 1 });

        // Get ancestors
        const ancestors = await Person.getAncestors(id);

        // Get descendants count
        const descendantsCount = await Person.getDescendantsCount(id);

        res.json({
            success: true,
            data: {
                ...person.toObject(),
                children,
                ancestors: ancestors.map(a => ({
                    _id: a._id,
                    fullName: a.fullName,
                    generation: a.generation
                })),
                descendantsCount
            }
        });
    } catch (error) {
        console.error('خطأ في جلب الشخص:', error);
        res.status(500).json({
            success: false,
            error: 'خطأ في جلب البيانات',
            message: error.message
        });
    }
});

/**
 * @route   GET /api/persons/:id/ancestors
 * @desc    Get ancestors chain for a person
 * @access  Public
 */
router.get('/:id/ancestors', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: 'معرف غير صالح'
            });
        }

        const ancestors = await Person.getAncestors(id);

        res.json({
            success: true,
            data: ancestors
        });
    } catch (error) {
        console.error('خطأ في جلب الأسلاف:', error);
        res.status(500).json({
            success: false,
            error: 'خطأ في جلب الأسلاف',
            message: error.message
        });
    }
});

/**
 * @route   GET /api/persons/:id/siblings
 * @desc    Get siblings of a person
 * @access  Public
 */
router.get('/:id/siblings', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: 'معرف غير صالح'
            });
        }

        const person = await Person.findById(id);

        if (!person) {
            return res.status(404).json({
                success: false,
                error: 'الشخص غير موجود'
            });
        }

        if (!person.fatherId) {
            return res.json({
                success: true,
                data: [],
                message: 'هذا هو الجد الأكبر، لا يوجد أشقاء'
            });
        }

        const siblings = await Person.find({
            fatherId: person.fatherId,
            _id: { $ne: id }
        }).sort({ siblingOrder: 1 });

        res.json({
            success: true,
            data: siblings
        });
    } catch (error) {
        console.error('خطأ في جلب الأشقاء:', error);
        res.status(500).json({
            success: false,
            error: 'خطأ في جلب الأشقاء',
            message: error.message
        });
    }
});

module.exports = router;
