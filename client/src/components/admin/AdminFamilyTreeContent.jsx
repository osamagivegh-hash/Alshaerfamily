/**
 * Admin Family Tree Content Management
 * Dashboard for managing all Family Tree content sections:
 * - Founder Appreciation
 * - Founder Discussions
 * - Family Tree Display Settings
 * - Gateway Settings
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useFamilyTreeAuth } from '../../contexts/FamilyTreeAuthContext';
import toast from 'react-hot-toast';
import familyTreeApi from '../../utils/familyTreeApi';

const API_URL = import.meta.env.VITE_API_URL || '';

// Tab Button Component
const TabButton = ({ active, onClick, icon, label, color }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${active
            ? `bg-${color}-600 text-white shadow-lg`
            : `bg-gray-100 text-gray-700 hover:bg-gray-200`
            }`}
        style={active ? { backgroundColor: color === 'black' ? '#1a1a1a' : undefined } : {}}
    >
        <span>{icon}</span>
        <span>{label}</span>
    </button>
);

// Image Upload Component
const ImageUploader = ({ label, value, onChange, className = '' }) => {
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        try {
            const response = await familyTreeApi.content.upload(formData);
            if (response?.url) {
                onChange(response.url);
                toast.success('تم رفع الصورة بنجاح');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('خطأ في رفع الصورة');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="flex items-start gap-4">
                <div className="relative w-40 h-32 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                    {value ? (
                        <img src={value} alt={label} className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <span className="text-3xl">📷</span>
                        </div>
                    )}
                    {uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        className="hidden"
                        id={`upload-${label}`}
                    />
                    <label
                        htmlFor={`upload-${label}`}
                        className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors text-center mb-2"
                    >
                        {uploading ? 'جاري الرفع...' : 'اختر صورة'}
                    </label>
                    {value && (
                        <button
                            onClick={() => onChange('')}
                            className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                        >
                            إزالة الصورة
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Rich Text Editor Wrapper
const RichTextEditor = ({ value, onChange, placeholder }) => {
    // Simple textarea for now - can be replaced with Quill or similar
    return (
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full min-h-[300px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y"
            dir="rtl"
        />
    );
};

// Main Component
const AdminFamilyTreeContent = () => {
    const { isFTSuperAdmin } = useFamilyTreeAuth();
    const [activeTab, setActiveTab] = useState('appreciation');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Content State
    const [appreciation, setAppreciation] = useState({
        title: '',
        founderImage: '',
        treeImage: '',
        content: '',
        summary: '',
        author: '',
        isPublished: true
    });

    const [discussions, setDiscussions] = useState([]);
    const [editingDiscussion, setEditingDiscussion] = useState(null);
    const [showDiscussionForm, setShowDiscussionForm] = useState(false);

    const [treeDisplay, setTreeDisplay] = useState({
        title: 'شجرة العائلة',
        introText: '',
        footerText: '',
        displayMode: 'visual',
        staticTreeImage: '',
        embeddedContent: '',
        isInteractive: true,
        isPublished: true
    });

    const [settings, setSettings] = useState({
        gatewayTitle: 'شجرة عائلة الشاعر',
        gatewaySubtitle: 'اكتشف تاريخ وتراث عائلتنا العريقة',
        gatewayBackground: '',
        buttonLabels: {
            appreciation: 'تقدير ووفاء للمؤسس',
            discussions: 'حوارات مع المؤسس',
            tree: 'شجرة العائلة'
        },
        buttonColors: {
            appreciation: '#1a1a1a',
            discussions: '#CE1126',
            tree: '#007A3D'
        }
    });

    // Stats
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchAppreciation(),
                fetchDiscussions(),
                fetchTreeDisplay(),
                fetchSettings(),
                fetchStats()
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAppreciation = async () => {
        try {
            const res = await familyTreeApi.content.getAppreciation();
            if (res) {
                setAppreciation(res?.data || res);
            }
        } catch (error) {
            console.error('Error fetching appreciation:', error);
        }
    };

    const fetchDiscussions = async () => {
        try {
            const res = await familyTreeApi.content.getDiscussions();
            if (res) {
                setDiscussions(res?.data || res);
            }
        } catch (error) {
            console.error('Error fetching discussions:', error);
        }
    };

    const fetchTreeDisplay = async () => {
        try {
            const res = await familyTreeApi.content.getTreeDisplay();
            if (res) {
                setTreeDisplay(res?.data || res);
            }
        } catch (error) {
            console.error('Error fetching tree display:', error);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await familyTreeApi.content.getSettings();
            if (res) {
                setSettings(res?.data || res);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await familyTreeApi.content.getStats();
            if (res) {
                setStats(res?.data || res);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    // Save Functions
    const saveAppreciation = async () => {
        setSaving(true);
        try {
            const res = await familyTreeApi.content.updateAppreciation(appreciation);
            if (res?.success) {
                toast.success('تم حفظ محتوى التقدير بنجاح');
                fetchStats();
            }
        } catch (error) {
            console.error('Error saving appreciation:', error);
            toast.error('خطأ في حفظ المحتوى');
        } finally {
            setSaving(false);
        }
    };

    const saveTreeDisplay = async () => {
        setSaving(true);
        try {
            const res = await familyTreeApi.content.updateTreeDisplay(treeDisplay);
            if (res?.success) {
                toast.success('تم حفظ إعدادات العرض بنجاح');
                fetchStats();
            }
        } catch (error) {
            console.error('Error saving tree display:', error);
            toast.error('خطأ في حفظ الإعدادات');
        } finally {
            setSaving(false);
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            const res = await familyTreeApi.content.updateSettings(settings);
            if (res?.success) {
                toast.success('تم حفظ الإعدادات بنجاح');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('خطأ في حفظ الإعدادات');
        } finally {
            setSaving(false);
        }
    };

    // Discussion CRUD
    const saveDiscussion = async (discussionData) => {
        setSaving(true);
        try {
            let res;
            if (editingDiscussion) {
                res = await familyTreeApi.content.updateDiscussion(editingDiscussion.id || editingDiscussion._id, discussionData);
            } else {
                res = await familyTreeApi.content.createDiscussion(discussionData);
            }

            if (res?.success) {
                toast.success(editingDiscussion ? 'تم تحديث الحوار بنجاح' : 'تم إضافة الحوار بنجاح');
                fetchDiscussions();
                fetchStats();
                setShowDiscussionForm(false);
                setEditingDiscussion(null);
            }
        } catch (error) {
            console.error('Error saving discussion:', error);
            toast.error('خطأ في حفظ الحوار');
        } finally {
            setSaving(false);
        }
    };

    const deleteDiscussion = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا الحوار؟')) return;

        try {
            const res = await familyTreeApi.content.deleteDiscussion(id);
            if (res?.success) {
                toast.success('تم حذف الحوار بنجاح');
                fetchDiscussions();
                fetchStats();
            }
        } catch (error) {
            console.error('Error deleting discussion:', error);
            toast.error('خطأ في حذف الحوار');
        }
    };

    const toggleDiscussionPublish = async (discussion) => {
        try {
            const id = discussion.id || discussion._id;
            const res = await familyTreeApi.content.toggleDiscussionPublish(id, !discussion.isPublished);
            if (res?.success) {
                toast.success(discussion.isPublished ? 'تم إلغاء النشر' : 'تم النشر');
                fetchDiscussions();
                fetchStats();
            }
        } catch (error) {
            console.error('Error toggling publish:', error);
            toast.error('خطأ في تحديث حالة النشر');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-palestine-green border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6" dir="rtl">
            {/* Header */}
            <div className="bg-gradient-to-r from-palestine-green to-green-700 rounded-xl p-6 text-white">
                <h1 className="text-2xl font-bold mb-2">🌳 إدارة محتوى شجرة العائلة</h1>
                <p className="text-green-100">إدارة الأقسام الثلاثة لصفحة شجرة العائلة</p>

                {/* Stats */}
                {stats && (
                    <div className="flex flex-wrap gap-4 mt-4">
                        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                            <span className="text-sm text-green-100">التقدير:</span>
                            <span className="mr-2 font-bold">{stats.appreciationConfigured ? '✓ نشط' : '○ غير منشور'}</span>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                            <span className="text-sm text-green-100">الحوارات:</span>
                            <span className="mr-2 font-bold">{stats.publishedDiscussions}/{stats.totalDiscussions}</span>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                            <span className="text-sm text-green-100">العرض:</span>
                            <span className="mr-2 font-bold">{stats.treeDisplayConfigured ? '✓ نشط' : '○ غير منشور'}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-3">
                <TabButton
                    active={activeTab === 'appreciation'}
                    onClick={() => setActiveTab('appreciation')}
                    icon="🏆"
                    label="تقدير المؤسس"
                    color="black"
                />
                <TabButton
                    active={activeTab === 'tree'}
                    onClick={() => setActiveTab('tree')}
                    icon="🌳"
                    label="عرض الشجرة"
                    color="green"
                />
                <TabButton
                    active={activeTab === 'settings'}
                    onClick={() => setActiveTab('settings')}
                    icon="⚙️"
                    label="الإعدادات"
                    color="gray"
                />
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                {/* Appreciation Tab */}
                {activeTab === 'appreciation' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-4">تقدير ووفاء لمؤسس العائلة</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">عنوان المقال</label>
                                <input
                                    type="text"
                                    value={appreciation.title}
                                    onChange={(e) => setAppreciation({ ...appreciation, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="تقدير ووفاء لمؤسس شجرة العائلة"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">كاتب المقال</label>
                                <input
                                    type="text"
                                    value={appreciation.author}
                                    onChange={(e) => setAppreciation({ ...appreciation, author: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="اسم الكاتب"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ImageUploader
                                label="صورة المؤسس"
                                value={appreciation.founderImage}
                                onChange={(url) => setAppreciation({ ...appreciation, founderImage: url })}
                            />

                            <ImageUploader
                                label="صورة شجرة العائلة"
                                value={appreciation.treeImage}
                                onChange={(url) => setAppreciation({ ...appreciation, treeImage: url })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ملخص المقال</label>
                            <textarea
                                value={appreciation.summary}
                                onChange={(e) => setAppreciation({ ...appreciation, summary: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-y"
                                rows={3}
                                placeholder="ملخص قصير يظهر في الصفحة الرئيسية..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">محتوى المقال (HTML)</label>
                            <RichTextEditor
                                value={appreciation.content}
                                onChange={(content) => setAppreciation({ ...appreciation, content })}
                                placeholder="اكتب محتوى المقال هنا... يمكنك استخدام HTML للتنسيق"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={appreciation.isPublished}
                                    onChange={(e) => setAppreciation({ ...appreciation, isPublished: e.target.checked })}
                                    className="w-5 h-5 rounded text-green-600 focus:ring-green-500"
                                />
                                <span className="text-gray-700">نشر المحتوى</span>
                            </label>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={saveAppreciation}
                                disabled={saving}
                                className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
                            >
                                {saving ? (
                                    <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                                ) : (
                                    <span>💾</span>
                                )}
                                حفظ التغييرات
                            </button>
                        </div>
                    </div>
                )}

                {/* Tree Display Tab */}
                {activeTab === 'tree' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-4">إعدادات عرض شجرة العائلة</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">عنوان القسم</label>
                            <input
                                type="text"
                                value={treeDisplay.title}
                                onChange={(e) => setTreeDisplay({ ...treeDisplay, title: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                placeholder="شجرة العائلة"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">نص تمهيدي (يظهر فوق الشجرة)</label>
                            <textarea
                                value={treeDisplay.introText}
                                onChange={(e) => setTreeDisplay({ ...treeDisplay, introText: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-y"
                                rows={2}
                                placeholder="نص توضيحي يظهر قبل عرض الشجرة..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">نمط العرض</label>
                            <div className="flex gap-4">
                                {[
                                    { value: 'visual', label: 'شجرة تفاعلية', icon: '🌲' },
                                    { value: 'static', label: 'صورة ثابتة', icon: '🖼️' },
                                    { value: 'embedded', label: 'محتوى مضمن', icon: '📦' }
                                ].map((mode) => (
                                    <label
                                        key={mode.value}
                                        className={`flex-1 p-4 border-2 rounded-lg cursor-pointer transition-all ${treeDisplay.displayMode === mode.value
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="displayMode"
                                            value={mode.value}
                                            checked={treeDisplay.displayMode === mode.value}
                                            onChange={(e) => setTreeDisplay({ ...treeDisplay, displayMode: e.target.value })}
                                            className="hidden"
                                        />
                                        <div className="text-center">
                                            <span className="text-2xl block mb-2">{mode.icon}</span>
                                            <span className="font-medium">{mode.label}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {treeDisplay.displayMode === 'static' && (
                            <ImageUploader
                                label="صورة الشجرة الثابتة"
                                value={treeDisplay.staticTreeImage}
                                onChange={(url) => setTreeDisplay({ ...treeDisplay, staticTreeImage: url })}
                            />
                        )}

                        {treeDisplay.displayMode === 'embedded' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">كود HTML المضمن</label>
                                <textarea
                                    value={treeDisplay.embeddedContent}
                                    onChange={(e) => setTreeDisplay({ ...treeDisplay, embeddedContent: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-y font-mono text-sm"
                                    rows={6}
                                    placeholder="<iframe src='...'></iframe>"
                                    dir="ltr"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">نص ختامي (يظهر أسفل الشجرة)</label>
                            <textarea
                                value={treeDisplay.footerText}
                                onChange={(e) => setTreeDisplay({ ...treeDisplay, footerText: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-y"
                                rows={2}
                                placeholder="نص يظهر بعد عرض الشجرة..."
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={treeDisplay.isPublished}
                                    onChange={(e) => setTreeDisplay({ ...treeDisplay, isPublished: e.target.checked })}
                                    className="w-5 h-5 rounded text-green-600 focus:ring-green-500"
                                />
                                <span className="text-gray-700">نشر إعدادات العرض</span>
                            </label>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={saveTreeDisplay}
                                disabled={saving}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {saving ? (
                                    <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                                ) : (
                                    <span>💾</span>
                                )}
                                حفظ التغييرات
                            </button>
                        </div>
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-4">إعدادات صفحة البوابة</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">عنوان الصفحة</label>
                                <input
                                    type="text"
                                    value={settings.gatewayTitle}
                                    onChange={(e) => setSettings({ ...settings, gatewayTitle: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">وصف الصفحة</label>
                                <input
                                    type="text"
                                    value={settings.gatewaySubtitle}
                                    onChange={(e) => setSettings({ ...settings, gatewaySubtitle: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>

                        <ImageUploader
                            label="صورة خلفية البوابة"
                            value={settings.gatewayBackground}
                            onChange={(url) => setSettings({ ...settings, gatewayBackground: url })}
                        />

                        <div>
                            <h3 className="font-bold text-gray-800 mb-4">نصوص الأزرار</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">زر التقدير (أسود)</label>
                                    <input
                                        type="text"
                                        value={settings.buttonLabels?.appreciation || ''}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            buttonLabels: { ...settings.buttonLabels, appreciation: e.target.value }
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">زر الحوارات (أحمر)</label>
                                    <input
                                        type="text"
                                        value={settings.buttonLabels?.discussions || ''}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            buttonLabels: { ...settings.buttonLabels, discussions: e.target.value }
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">زر الشجرة (أخضر)</label>
                                    <input
                                        type="text"
                                        value={settings.buttonLabels?.tree || ''}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            buttonLabels: { ...settings.buttonLabels, tree: e.target.value }
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={saveSettings}
                                disabled={saving}
                                className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {saving ? (
                                    <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                                ) : (
                                    <span>💾</span>
                                )}
                                حفظ الإعدادات
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Discussion Form Component
const DiscussionForm = ({ discussion, onSave, onCancel, saving }) => {
    const [formData, setFormData] = useState({
        title: discussion?.title || '',
        subtitle: discussion?.subtitle || '',
        coverImage: discussion?.coverImage || '',
        content: discussion?.content || '',
        summary: discussion?.summary || '',
        moderator: discussion?.moderator || '',
        discussionDate: discussion?.discussionDate
            ? new Date(discussion.discussionDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
        readingTime: discussion?.readingTime || 5,
        tags: discussion?.tags?.join(', ') || '',
        isPublished: discussion?.isPublished ?? true,
        participants: discussion?.participants || []
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const submitData = {
            ...formData,
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        };
        onSave(submitData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                    {discussion ? 'تعديل الحوار' : 'إضافة حوار جديد'}
                </h3>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">عنوان الحوار *</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">عنوان فرعي</label>
                    <input
                        type="text"
                        value={formData.subtitle}
                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الحوار</label>
                    <input
                        type="date"
                        value={formData.discussionDate}
                        onChange={(e) => setFormData({ ...formData, discussionDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">المحاور</label>
                    <input
                        type="text"
                        value={formData.moderator}
                        onChange={(e) => setFormData({ ...formData, moderator: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">وقت القراءة (دقائق)</label>
                    <input
                        type="number"
                        value={formData.readingTime}
                        onChange={(e) => setFormData({ ...formData, readingTime: parseInt(e.target.value) || 5 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        min="1"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">صورة الغلاف</label>
                <input
                    type="text"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="رابط الصورة..."
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ملخص</label>
                <textarea
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-y"
                    rows={2}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">محتوى الحوار (HTML) *</label>
                <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-y min-h-[200px]"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الوسوم (مفصولة بفواصل)</label>
                <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="تاريخ, تراث, قيم..."
                />
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="isPublished"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-5 h-5 rounded text-red-600 focus:ring-red-500"
                />
                <label htmlFor="isPublished" className="text-gray-700">نشر الحوار</label>
            </div>

            <div className="flex justify-end gap-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                    إلغاء
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                    {saving && <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>}
                    {discussion ? 'تحديث' : 'إضافة'}
                </button>
            </div>
        </form>
    );
};

export default AdminFamilyTreeContent;
