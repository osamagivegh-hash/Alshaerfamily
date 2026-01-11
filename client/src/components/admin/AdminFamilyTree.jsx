/**
 * Admin Family Tree Component
 * Full CRUD management for family tree persons
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useFamilyTreeAuth } from '../../contexts/FamilyTreeAuthContext';
import toast from 'react-hot-toast';
import { familyTreeDashboardApi } from '../../utils/familyTreeApi';
import TreeVisualization from '../FamilyTree/TreeVisualization';

const API_URL = import.meta.env.VITE_API_URL || '';

const AdminFamilyTree = () => {
    const { isFTSuperAdmin, user } = useFamilyTreeAuth(); // Get user details for debugging

    // Debug logging for role verification
    React.useEffect(() => {
        console.log('[AdminFamilyTree] User role check:', {
            user: user?.username,
            role: user?.role,
            isFTSuperAdmin: isFTSuperAdmin
        });
    }, [user, isFTSuperAdmin]);
    const [persons, setPersons] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGeneration, setSelectedGeneration] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingPerson, setEditingPerson] = useState(null);
    const [eligibleFathers, setEligibleFathers] = useState([]);
    const [formLoading, setFormLoading] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'tree'
    const [tree, setTree] = useState(null);

    const [formData, setFormData] = useState({
        fullName: '',
        nickname: '',
        fatherId: '',
        gender: 'male',
        birthDate: '',
        deathDate: '',
        isAlive: true,
        birthPlace: '',
        currentResidence: '',
        occupation: '',
        biography: '',
        notes: '',
        siblingOrder: 0,
        targetGeneration: ''
    });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);

            // Fetch persons list
            try {
                const personsRes = await familyTreeDashboardApi.getPersons(searchTerm, selectedGeneration);
                if (personsRes?.success) {
                    setPersons(personsRes.data || []);
                }
            } catch (err) {
                console.error('Persons fetch error:', err);
                toast.error('خطأ في جلب القائمة');
            }

            // Fetch stats
            try {
                const statsRes = await familyTreeDashboardApi.getStats();
                if (statsRes?.success) {
                    setStats(statsRes.data);
                }
            } catch (err) {
                console.error('Stats fetch error:', err);
            }

            // Fetch tree (public API)
            try {
                const treeRes = await fetch(`${API_URL}/api/persons/tree`);
                const treeData = await treeRes.json();
                if (treeData.success) {
                    setTree(treeData.data);
                }
            } catch (err) {
                console.error('Tree fetch error:', err);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('خطأ في تحميل البيانات');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, selectedGeneration]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const fetchEligibleFathers = async (generation) => {
        if (!generation || generation === '0') {
            setEligibleFathers([]);
            return;
        }
        try {
            // Public API - keep using fetch
            const res = await fetch(
                `${API_URL}/api/persons/eligible-fathers?generation=${generation}${editingPerson ? `&excludeId=${editingPerson.id || editingPerson._id}` : ''}`
            );
            const data = await res.json();
            if (data.success) {
                setEligibleFathers(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching eligible fathers:', error);
        }
    };

    const handleGenerationChange = (e) => {
        const gen = e.target.value;
        setFormData(prev => ({ ...prev, targetGeneration: gen, fatherId: '' }));
        fetchEligibleFathers(gen);
    };

    const openAddModal = () => {
        setEditingPerson(null);
        setFormData({
            fullName: '',
            nickname: '',
            fatherId: '',
            gender: 'male',
            birthDate: '',
            deathDate: '',
            isAlive: true,
            birthPlace: '',
            currentResidence: '',
            occupation: '',
            biography: '',
            notes: '',
            siblingOrder: 0,
            targetGeneration: ''
        });
        setEligibleFathers([]);
        setShowModal(true);
    };

    const openEditModal = (person) => {
        setEditingPerson(person);
        setFormData({
            fullName: person.fullName || '',
            nickname: person.nickname || '',
            fatherId: person.fatherId?._id || person.fatherId || '',
            gender: person.gender || 'male',
            birthDate: person.birthDate || '',
            deathDate: person.deathDate || '',
            isAlive: person.isAlive !== false,
            birthPlace: person.birthPlace || '',
            currentResidence: person.currentResidence || '',
            occupation: person.occupation || '',
            biography: person.biography || '',
            notes: person.notes || '',
            siblingOrder: person.siblingOrder || 0,
            targetGeneration: String(person.generation || 0)
        });
        fetchEligibleFathers(String(person.generation || 0));
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prevent duplicate submissions
        if (formLoading) {
            return;
        }

        if (!formData.fullName.trim()) {
            toast.error('الاسم الكامل مطلوب');
            return;
        }

        setFormLoading(true);
        try {
            const payload = {
                ...formData,
                fatherId: formData.fatherId || null
            };

            let response;
            if (editingPerson) {
                response = await familyTreeDashboardApi.updatePerson(editingPerson.id || editingPerson._id, payload);
            } else {
                response = await familyTreeDashboardApi.createPerson(payload);
            }

            if (response?.success) {
                toast.success(editingPerson ? 'تم تحديث البيانات بنجاح' : 'تمت إضافة الشخص بنجاح');
                setShowModal(false);
                fetchData();
            } else {
                toast.error(response?.message || 'حدث خطأ');
            }
        } catch (error) {
            console.error('Error saving person:', error);
            const msg = error.message || 'خطأ في حفظ البيانات';
            toast.error(msg);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (person) => {
        // Log current user state for debugging
        console.log('[AdminFamilyTree] Delete attempt:', {
            personId: person.id || person._id,
            personName: person.fullName,
            currentUser: user?.username,
            currentRole: user?.role,
            isFTSuperAdmin: isFTSuperAdmin
        });

        // Strict Role Check
        if (!isFTSuperAdmin) {
            console.warn('[AdminFamilyTree] Delete blocked: User is not ft-super-admin', {
                actualRole: user?.role
            });
            toast.error(`غير مصرح لك بحذف البيانات. هذه الصلاحية للمدير الأعلى فقط. (دورك الحالي: ${user?.role || 'غير محدد'})`);
            return false;
        }

        // First confirmation
        console.log('[AdminFamilyTree] Showing first confirmation dialog...');
        const confirmMsg = `هل أنت متأكد من حذف "${person.fullName}"؟`;
        let firstConfirm;
        try {
            firstConfirm = window.confirm(confirmMsg);
            console.log('[AdminFamilyTree] First confirmation result:', firstConfirm);
        } catch (err) {
            console.error('[AdminFamilyTree] Error in first confirmation:', err);
            toast.error('خطأ في عرض نافذة التأكيد');
            return false;
        }

        if (!firstConfirm) {
            console.log('[AdminFamilyTree] User cancelled first confirmation');
            return false;
        }

        // Second confirmation
        console.log('[AdminFamilyTree] Showing second confirmation dialog...');
        const doubleConfirmMsg = `تأكيد نهائي: هل أنت متأكد تماماً؟ هذا الإجراء لا يمكن التراجع عنه.`;
        let secondConfirm;
        try {
            secondConfirm = window.confirm(doubleConfirmMsg);
            console.log('[AdminFamilyTree] Second confirmation result:', secondConfirm);
        } catch (err) {
            console.error('[AdminFamilyTree] Error in second confirmation:', err);
            toast.error('خطأ في عرض نافذة التأكيد الثانية');
            return false;
        }

        if (!secondConfirm) {
            console.log('[AdminFamilyTree] User cancelled second confirmation');
            return false;
        }

        try {
            console.log('[AdminFamilyTree] Calling delete API for:', person.id || person._id);
            const response = await familyTreeDashboardApi.deletePerson(person.id || person._id);

            console.log('[AdminFamilyTree] Delete response:', response);

            if (response?.success) {
                toast.success('تم حذف الشخص بنجاح');
                fetchData();
                return true;
            } else {
                console.error('[AdminFamilyTree] Delete failed:', response);
                toast.error(response?.message || 'خطأ في الحذف');
                return false;
            }
        } catch (error) {
            console.error('[AdminFamilyTree] Delete error:', error);
            const errorMessage = error.message || '';

            // Check for specific permission errors
            if (errorMessage.includes('403') || errorMessage.includes('غير مصرح') || errorMessage.includes('SUPER_ADMIN_REQUIRED')) {
                console.error('[AdminFamilyTree] Permission denied by server');
                toast.error('رفض الخادم طلب الحذف: صلاحيات المدير الأعلى مطلوبة. تأكد أن حسابك هو ft-super-admin.');
                return false;
            }

            // Check for authentication errors
            if (errorMessage.includes('401') || errorMessage.includes('غير مصدق') || errorMessage.includes('TOKEN')) {
                console.error('[AdminFamilyTree] Authentication error');
                toast.error('خطأ في المصادقة. يرجى تسجيل الخروج وإعادة تسجيل الدخول.');
                return false;
            }

            // Handle cascading delete suggestion
            if (errorMessage.includes('أبناء') || errorMessage.includes('لا يمكن حذف') || errorMessage.includes('cascade')) {
                console.log('[AdminFamilyTree] Person has children, prompting for cascade delete');
                if (window.confirm(`هذا الشخص لديه أبناء. هل تريد حذفهم جميعاً؟`)) {
                    try {
                        console.log('[AdminFamilyTree] Attempting cascade delete');
                        const cascadeRes = await familyTreeDashboardApi.deletePerson(person.id || person._id, true);
                        console.log('[AdminFamilyTree] Cascade delete response:', cascadeRes);
                        if (cascadeRes?.success) {
                            toast.success('تم حذف الشخص وأبنائه بنجاح');
                            fetchData();
                            return true;
                        } else {
                            toast.error(cascadeRes?.message || 'خطأ في الحذف المتسلسل');
                        }
                    } catch (cascadeError) {
                        console.error('[AdminFamilyTree] Cascade delete error:', cascadeError);
                        toast.error(cascadeError.message || 'خطأ في الحذف المتسلسل');
                    }
                }
            } else {
                toast.error(error.message || 'خطأ في حذف الشخص');
            }
            return false;
        }
    };

    const getGenerationOptions = () => {
        // Fallback to 5 generations if stats are not loaded or failed
        const maxGen = (stats && typeof stats.maxGeneration === 'number') ? stats.maxGeneration : 5;
        const options = [];
        for (let i = 0; i <= maxGen + 1; i++) {
            options.push(
                <option key={i} value={i}>
                    {i === 0 ? 'الجيل الأول (الجد الأكبر)' : `الجيل ${i}`}
                </option>
            );
        }
        return options;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-palestine-black">🌳 إدارة شجرة العائلة</h1>
                    <p className="text-gray-600 mt-1">إضافة وتعديل وإدارة أفراد العائلة</p>
                    {/* User Role Indicator */}
                    <div className="mt-2 flex items-center gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${isFTSuperAdmin
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                            {isFTSuperAdmin ? '👑 مدير أعلى' : '✏️ محرر'}
                            <span className="mr-1 text-gray-500">({user?.username || 'غير معروف'})</span>
                        </span>
                        {!isFTSuperAdmin && (
                            <span className="text-xs text-gray-500">
                                ⚠️ لا تملك صلاحية الحذف
                            </span>
                        )}
                    </div>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-palestine-green text-white rounded-xl hover:bg-opacity-90 transition-colors font-medium"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    إضافة شخص جديد
                </button>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">👥</span>
                            <div>
                                <p className="text-2xl font-bold text-palestine-green">{stats.totalPersons}</p>
                                <p className="text-xs text-gray-500">إجمالي الأشخاص</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">📊</span>
                            <div>
                                <p className="text-2xl font-bold text-blue-600">{stats.totalGenerations}</p>
                                <p className="text-xs text-gray-500">عدد الأجيال</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">👨</span>
                            <div>
                                <p className="text-2xl font-bold text-teal-600">{stats.genderStats?.male || 0}</p>
                                <p className="text-xs text-gray-500">ذكور</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">👩</span>
                            <div>
                                <p className="text-2xl font-bold text-pink-600">{stats.genderStats?.female || 0}</p>
                                <p className="text-xs text-gray-500">إناث</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">البحث</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="ابحث بالاسم..."
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-palestine-green focus:border-transparent"
                        />
                    </div>
                    <div className="w-full md:w-48">
                        <label className="block text-sm font-medium text-gray-700 mb-1">الجيل</label>
                        <select
                            value={selectedGeneration}
                            onChange={(e) => setSelectedGeneration(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-palestine-green focus:border-transparent"
                        >
                            <option value="">جميع الأجيال</option>
                            {getGenerationOptions()}
                        </select>
                    </div>
                    <div className="w-full md:w-48">
                        <label className="block text-sm font-medium text-gray-700 mb-1">طريقة العرض</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-palestine-green text-white' : 'bg-gray-100 text-gray-700'
                                    }`}
                            >
                                قائمة
                            </button>
                            <button
                                onClick={() => setViewMode('tree')}
                                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${viewMode === 'tree' ? 'bg-palestine-green text-white' : 'bg-gray-100 text-gray-700'
                                    }`}
                            >
                                شجرة
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-palestine-green"></div>
                </div>
            ) : viewMode === 'list' ? (
                /* List View */
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    {/* List Header with Count */}
                    <div className="bg-gray-50 border-b px-4 py-3 flex items-center justify-between">
                        <h3 className="font-bold text-gray-800">قائمة أفراد العائلة</h3>
                        <span className="bg-palestine-green text-white px-3 py-1 rounded-full text-sm font-medium">
                            {persons.length} شخص
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">الاسم</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">الأب</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">الجيل</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">الجنس</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">الحالة</th>
                                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {persons.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                            لا يوجد أشخاص
                                        </td>
                                    </tr>
                                ) : (
                                    persons.map((person) => (
                                        <tr key={person.id || person._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${person.isRoot ? 'bg-yellow-500' : person.gender === 'female' ? 'bg-pink-500' : 'bg-palestine-green'
                                                        }`}>
                                                        {person.fullName?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{person.fullName}</p>
                                                        {person.nickname && (
                                                            <p className="text-xs text-gray-500">({person.nickname})</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {person.fatherId?.fullName || (person.isRoot ? '👑 الجد الأكبر' : '-')}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                                    الجيل {person.generation}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-lg ${person.gender === 'female' ? 'text-pink-500' : 'text-blue-500'}`}>
                                                    {person.gender === 'female' ? '👩' : '👨'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${person.isAlive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {person.isAlive ? '💚 حي' : '🕊️ متوفى'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-2">

                                                    <button
                                                        onClick={() => openEditModal(person)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="تعديل"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    {isFTSuperAdmin && (
                                                        <button
                                                            onClick={() => handleDelete(person)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="حذف"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* Tree View (Graphical) */
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ height: '700px' }}>
                    {tree ? (
                        <TreeVisualization
                            data={tree}
                            onNodeClick={(node) => {
                                // Find the full person object from the persons list to edit
                                // The tree node might contain limited data, so best to find from list or fetch
                                const personToEdit = persons.find(p => (p.id || p._id) === node._id);
                                if (personToEdit) {
                                    openEditModal(personToEdit);
                                } else {
                                    // Fallback if not in current list (though list should have everything usually, or fetch it)
                                    // For now just try to open with node data or fetch details
                                    openEditModal(node);
                                }
                            }}
                            zoom={0.8}
                            className="h-full bg-gray-50"
                            style={{ height: '100%', maxHeight: 'none' }}
                        />
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            لا توجد شجرة بعد
                        </div>
                    )}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-palestine-green text-white p-4 rounded-t-2xl flex items-center justify-between">
                            <h2 className="text-xl font-bold">
                                {editingPerson ? 'تعديل بيانات الشخص' : 'إضافة شخص جديد'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-white hover:text-gray-200"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4" dir="rtl">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        الاسم الكامل <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-palestine-green focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">اللقب / الكنية</label>
                                    <input
                                        type="text"
                                        value={formData.nickname}
                                        onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-palestine-green focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">الجنس</label>
                                <select
                                    value={formData.gender}
                                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-palestine-green focus:border-transparent"
                                >
                                    <option value="male">ذكر</option>
                                    <option value="female">أنثى</option>
                                </select>
                            </div>

                            {/* Generation & Father */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">الجيل المستهدف</label>
                                    <select
                                        value={formData.targetGeneration}
                                        onChange={handleGenerationChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-palestine-green focus:border-transparent"
                                    >
                                        <option value="">-- اختر الجيل --</option>
                                        {getGenerationOptions()}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">اختر الجيل لتحديد قائمة الآباء</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">الأب</label>
                                    <select
                                        value={formData.fatherId}
                                        onChange={(e) => setFormData(prev => ({ ...prev, fatherId: e.target.value }))}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-palestine-green focus:border-transparent"
                                        disabled={!formData.targetGeneration || formData.targetGeneration === '0'}
                                    >
                                        <option value="">
                                            {formData.targetGeneration === '0'
                                                ? '-- بدون أب (الجد الأكبر) --'
                                                : formData.targetGeneration
                                                    ? '-- اختر الأب --'
                                                    : '-- اختر الجيل أولاً --'}
                                        </option>
                                        {eligibleFathers.map((father) => (
                                            <option key={father._id} value={father._id}>
                                                {father.displayName} (الجيل {father.generation})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الميلاد</label>
                                    <input
                                        type="text"
                                        value={formData.birthDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                                        placeholder="مثال: 1950 أو 1950/01/15"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-palestine-green focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">مكان الميلاد</label>
                                    <input
                                        type="text"
                                        value={formData.birthPlace}
                                        onChange={(e) => setFormData(prev => ({ ...prev, birthPlace: e.target.value }))}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-palestine-green focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isAlive}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isAlive: e.target.checked }))}
                                        className="w-5 h-5 text-palestine-green rounded focus:ring-palestine-green"
                                    />
                                    <span>على قيد الحياة</span>
                                </label>
                            </div>

                            {/* Death Date (if not alive) */}
                            {!formData.isAlive && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الوفاة</label>
                                    <input
                                        type="text"
                                        value={formData.deathDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, deathDate: e.target.value }))}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-palestine-green focus:border-transparent"
                                    />
                                </div>
                            )}

                            {/* More Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">المهنة</label>
                                    <input
                                        type="text"
                                        value={formData.occupation}
                                        onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-palestine-green focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">مكان الإقامة</label>
                                    <input
                                        type="text"
                                        value={formData.currentResidence}
                                        onChange={(e) => setFormData(prev => ({ ...prev, currentResidence: e.target.value }))}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-palestine-green focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">الترتيب بين الإخوة</label>
                                <input
                                    type="number"
                                    value={formData.siblingOrder}
                                    onChange={(e) => setFormData(prev => ({ ...prev, siblingOrder: parseInt(e.target.value) || 0 }))}
                                    min="0"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-palestine-green focus:border-transparent"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    rows="3"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-palestine-green focus:border-transparent"
                                ></textarea>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="flex-1 px-6 py-3 bg-palestine-green text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium disabled:opacity-50"
                                >
                                    {formLoading ? 'جاري الحفظ...' : editingPerson ? 'حفظ التعديلات' : 'إضافة الشخص'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                >
                                    إلغاء
                                </button>
                                {editingPerson && isFTSuperAdmin && (
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            const success = await handleDelete(editingPerson);
                                            if (success) {
                                                setShowModal(false);
                                            }
                                        }}
                                        className="px-6 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium border border-red-200"
                                    >
                                        حذف
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper function to render tree as text
function renderTreeText(node, level = 0) {
    if (!node) return '';

    const indent = '  '.repeat(level);
    const prefix = level === 0 ? '👑 ' : node.gender === 'female' ? '👩 ' : '👨 ';
    let text = `${indent}${prefix}${node.fullName} (الجيل ${node.generation})\n`;

    if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
            text += renderTreeText(child, level + 1);
        });
    }

    return text;
}

export default AdminFamilyTree;
