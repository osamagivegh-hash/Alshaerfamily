import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFamilyTreeAuth } from '../../contexts/FamilyTreeAuthContext'
import toast from 'react-hot-toast'

/**
 * Family Tree Login Page
 * 
 * COMPLETELY SEPARATE from CMS login.
 * Uses FamilyTreeAuthContext for authentication.
 * 
 * SECURITY: This login only authenticates for Family Tree Dashboard.
 * CMS credentials will NOT work here.
 */
const FamilyTreeLogin = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const { login, isAuthenticated, loading } = useFamilyTreeAuth()
    const navigate = useNavigate()

    // Redirect if already authenticated
    useEffect(() => {
        if (!loading && isAuthenticated) {
            navigate('/family-dashboard')
        }
    }, [isAuthenticated, loading, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!username.trim() || !password.trim()) {
            toast.error('الرجاء إدخال اسم المستخدم وكلمة المرور')
            return
        }

        setIsLoading(true)

        try {
            const result = await login(username.trim(), password)

            if (result.success) {
                toast.success('تم تسجيل الدخول بنجاح')
                navigate('/family-dashboard')
            } else {
                toast.error(result.message || 'فشل تسجيل الدخول')
            }
        } catch (error) {
            toast.error('حدث خطأ أثناء تسجيل الدخول')
        } finally {
            setIsLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-800 to-teal-900 flex items-center justify-center">
                <div className="text-center text-white">
                    <div className="animate-spin text-5xl mb-4">🌳</div>
                    <p>جاري التحقق...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-900 flex items-center justify-center p-4" dir="rtl">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 text-[200px] opacity-5">🌳</div>
                <div className="absolute bottom-20 left-20 text-[150px] opacity-5">👨‍👩‍👧‍👦</div>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur rounded-2xl mb-4 shadow-xl">
                        <span className="text-5xl">🌳</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        شجرة عائلة الشاعر
                    </h1>
                    <p className="text-emerald-200">
                        لوحة تحكم شجرة العائلة
                    </p>

                    {/* Security Notice */}
                    <div className="mt-4 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                        <p className="text-amber-200 text-sm">
                            ⚠️ هذا النظام منفصل تماماً عن لوحة إدارة المحتوى
                        </p>
                    </div>
                </div>

                {/* Login Form */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username */}
                        <div>
                            <label className="block text-white text-sm font-medium mb-2">
                                اسم المستخدم أو البريد الإلكتروني
                            </label>
                            <div className="relative">
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl">
                                    👤
                                </span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="أدخل اسم المستخدم"
                                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl pr-12 pl-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                                    disabled={isLoading}
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-white text-sm font-medium mb-2">
                                كلمة المرور
                            </label>
                            <div className="relative">
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl">
                                    🔒
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="أدخل كلمة المرور"
                                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl pr-12 pl-12 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                                    disabled={isLoading}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${isLoading
                                    ? 'bg-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <span className="animate-spin">⏳</span>
                                    جاري تسجيل الدخول...
                                </>
                            ) : (
                                <>
                                    <span>🌳</span>
                                    تسجيل الدخول
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Links */}
                <div className="mt-6 text-center space-y-2">
                    <a
                        href="/"
                        className="text-emerald-300 hover:text-white text-sm transition-colors"
                    >
                        ← العودة للموقع الرئيسي
                    </a>

                    <div className="text-white/30 text-xs mt-4">
                        نظام شجرة العائلة المعزول
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FamilyTreeLogin
