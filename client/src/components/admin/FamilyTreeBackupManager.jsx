import React, { useState, useEffect, useCallback } from 'react'
import { useAdmin } from '../../contexts/AdminContext'
import { familyTreeDashboardApi } from '../../utils/adminApi'
import toast from 'react-hot-toast'

/**
 * Family Tree Backup Manager Component
 * 
 * Features:
 * - List all Family Tree backups
 * - Create manual backups
 * - Restore from backup (Super Admin only)
 * - Delete backups (Super Admin only)
 * - View backup settings
 */
const FamilyTreeBackupManager = () => {
    const { user } = useAdmin()
    const [backups, setBackups] = useState([])
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const [restoring, setRestoring] = useState(null)
    const [confirmingRestore, setConfirmingRestore] = useState(null)
    const [stats, setStats] = useState(null)

    const isSuperAdmin = user?.role === 'super-admin'

    // Fetch backups
    const fetchBackups = useCallback(async () => {
        try {
            setLoading(true)
            const [backupsRes, statsRes] = await Promise.all([
                familyTreeDashboardApi.getBackups(20),
                familyTreeDashboardApi.getStats()
            ])
            setBackups(backupsRes.data || [])
            setStats(statsRes.data || null)
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchBackups()
    }, [fetchBackups])

    // Create manual backup
    const handleCreateBackup = async () => {
        if (creating) return

        try {
            setCreating(true)
            const result = await familyTreeDashboardApi.createBackup()
            toast.success(result.message || 'تم إنشاء النسخة الاحتياطية بنجاح')
            fetchBackups()
        } catch (error) {
            toast.error(error.message)
        } finally {
            setCreating(false)
        }
    }

    // Initiate restore (first confirmation)
    const handleInitiateRestore = (backupId) => {
        if (!isSuperAdmin) {
            toast.error('فقط المدير الأعلى يمكنه استعادة النسخ الاحتياطية')
            return
        }
        setConfirmingRestore(backupId)
    }

    // Confirm and execute restore
    const handleConfirmRestore = async () => {
        if (!confirmingRestore || !isSuperAdmin) return

        try {
            setRestoring(confirmingRestore)
            const result = await familyTreeDashboardApi.restoreBackup(confirmingRestore, true)
            toast.success(
                `${result.message}\n` +
                `تمت استعادة ${result.restoredRecords} سجل.\n` +
                `تم إنشاء نسخة احتياطية قبل الاستعادة: ${result.preRestoreBackupId}`
                , { duration: 6000 })
            setConfirmingRestore(null)
            fetchBackups()
        } catch (error) {
            toast.error(error.message)
        } finally {
            setRestoring(null)
        }
    }

    // Delete backup
    const handleDeleteBackup = async (backupId) => {
        if (!isSuperAdmin) {
            toast.error('فقط المدير الأعلى يمكنه حذف النسخ الاحتياطية')
            return
        }

        if (!window.confirm('هل أنت متأكد من حذف هذه النسخة الاحتياطية؟')) return

        try {
            await familyTreeDashboardApi.deleteBackup(backupId)
            toast.success('تم حذف النسخة الاحتياطية بنجاح')
            fetchBackups()
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Format date
    const formatDate = (dateStr) => {
        if (!dateStr) return '-'
        const date = new Date(dateStr)
        return new Intl.DateTimeFormat('ar-SA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date)
    }

    // Format file size
    const formatSize = (bytes) => {
        if (!bytes) return '0 بايت'
        const k = 1024
        const sizes = ['بايت', 'ك.ب', 'م.ب', 'ج.ب']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-2xl">💾</span>
                        النسخ الاحتياطية لشجرة العائلة
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        إدارة النسخ الاحتياطية لبيانات شجرة العائلة
                    </p>
                </div>

                <button
                    onClick={handleCreateBackup}
                    disabled={creating}
                    className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all
            ${creating
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl'
                        }`}
                >
                    {creating ? (
                        <>
                            <span className="animate-spin">⏳</span>
                            جاري الإنشاء...
                        </>
                    ) : (
                        <>
                            <span>➕</span>
                            إنشاء نسخة احتياطية الآن
                        </>
                    )}
                </button>
            </div>

            {/* Stats Summary */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-blue-600">{stats.totalPersons || 0}</div>
                        <div className="text-sm text-blue-700">أفراد العائلة</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-purple-600">{stats.totalGenerations || 0}</div>
                        <div className="text-sm text-purple-700">أجيال</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-green-600">{stats.backup?.totalBackups || 0}</div>
                        <div className="text-sm text-green-700">نسخ احتياطية</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 text-center">
                        <div className="text-sm text-orange-700 mb-1">آخر نسخة</div>
                        <div className="text-xs text-orange-600 font-medium">
                            {stats.backup?.lastBackup?.createdAt
                                ? formatDate(stats.backup.lastBackup.createdAt)
                                : 'لا توجد'}
                        </div>
                    </div>
                </div>
            )}

            {/* Restore Confirmation Modal */}
            {confirmingRestore && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <div className="text-center mb-4">
                            <span className="text-5xl">⚠️</span>
                        </div>
                        <h3 className="text-xl font-bold text-red-600 text-center mb-4">
                            تأكيد الاستعادة
                        </h3>
                        <p className="text-gray-600 text-center mb-6 leading-relaxed">
                            هل أنت متأكد من استعادة هذه النسخة الاحتياطية؟
                            <br />
                            <strong className="text-red-600">سيتم حذف جميع البيانات الحالية</strong>
                            <br />
                            واستبدالها ببيانات النسخة الاحتياطية.
                            <br />
                            <span className="text-green-600 text-sm">
                                (سيتم إنشاء نسخة احتياطية تلقائية قبل الاستعادة)
                            </span>
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmingRestore(null)}
                                disabled={restoring}
                                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleConfirmRestore}
                                disabled={restoring}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                            >
                                {restoring ? 'جاري الاستعادة...' : 'تأكيد الاستعادة'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Backups List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin text-4xl mb-4">⏳</div>
                    <p className="text-gray-500">جاري تحميل النسخ الاحتياطية...</p>
                </div>
            ) : backups.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-5xl mb-4">📭</div>
                    <p className="text-gray-500 text-lg">لا توجد نسخ احتياطية بعد</p>
                    <p className="text-gray-400 text-sm mt-2">اضغط على "إنشاء نسخة احتياطية الآن" للبدء</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">معرف النسخة</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">التاريخ</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">النوع</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">السجلات</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">الحجم</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">بواسطة</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {backups.map((backup) => (
                                <tr key={backup.backupId} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                            {backup.backupId?.slice(0, 20)}...
                                        </code>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {formatDate(backup.createdAt)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                      ${backup.triggerType === 'auto'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-green-100 text-green-700'}`}>
                                            {backup.triggerType === 'auto' ? '🤖 تلقائي' : '👤 يدوي'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                                        {backup.stats?.totalRecords || 0}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {formatSize(backup.stats?.sizeInBytes)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {backup.createdBy}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-2">
                                            {isSuperAdmin && (
                                                <>
                                                    <button
                                                        onClick={() => handleInitiateRestore(backup.backupId)}
                                                        disabled={restoring === backup.backupId}
                                                        className="px-3 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded text-xs font-medium transition-colors"
                                                        title="استعادة"
                                                    >
                                                        🔄 استعادة
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteBackup(backup.backupId)}
                                                        className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-medium transition-colors"
                                                        title="حذف"
                                                    >
                                                        🗑️ حذف
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Role Notice */}
            {!isSuperAdmin && (
                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-yellow-700">
                        <span className="text-xl">ℹ️</span>
                        <p>يمكنك إنشاء نسخ احتياطية، لكن الاستعادة والحذف متاحة فقط للمدير الأعلى.</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default FamilyTreeBackupManager
