/**
 * Permission Guard Component
 * Wraps admin pages to check if user has the required permission
 */

import React from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { useNavigate } from 'react-router-dom';

const PermissionGuard = ({ permission, children }) => {
    const { user } = useAdmin();
    const navigate = useNavigate();

    // Check if user has permission
    const hasPermission = () => {
        if (!user) return false;
        // Super-admin and admin have all permissions
        if (['super-admin', 'admin'].includes(user.role)) return true;
        // Check editor permissions
        return user.permissions && user.permissions.includes(permission);
    };

    if (!hasPermission()) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6" dir="rtl">
                <div className="text-8xl mb-6">🔒</div>
                <h1 className="text-3xl font-bold text-gray-800 mb-4">صلاحيات غير كافية</h1>
                <p className="text-gray-600 mb-6 max-w-md">
                    ليس لديك صلاحية للوصول إلى هذا القسم. يرجى التواصل مع مدير النظام للحصول على الصلاحيات المطلوبة.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="px-6 py-3 bg-palestine-green text-white rounded-lg hover:bg-olive-700 font-medium"
                    >
                        العودة للوحة التحكم
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default PermissionGuard;
