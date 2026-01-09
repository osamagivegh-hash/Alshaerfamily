/**
 * Security Configuration
 * Centralized security settings for the application
 */

module.exports = {
    // Password Policy
    password: {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        // Regex pattern for validation
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
        errorMessage: 'كلمة المرور يجب أن تكون 12 حرف على الأقل وتحتوي على حرف كبير وصغير ورقم ورمز خاص'
    },

    // JWT Configuration
    jwt: {
        expiresIn: '4h',
        algorithm: 'HS256'
    },

    // Rate Limiting
    rateLimit: {
        // General API rate limit
        general: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 500
        },
        // Authentication rate limit (stricter)
        auth: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 5,
            skipSuccessfulRequests: true
        },
        // File upload rate limit
        upload: {
            windowMs: 60 * 60 * 1000, // 1 hour
            max: 100
        }
    },

    // Session Security
    session: {
        // Regenerate session after login
        regenerateOnLogin: true,
        // Invalidate session on password change
        invalidateOnPasswordChange: true
    },

    // Input Validation
    input: {
        maxInputLength: 10000,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedMimeTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp'
        ]
    },

    // Security Headers (applied via Helmet)
    headers: {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                imgSrc: ["'self'", "data:", "https:", "https://res.cloudinary.com"],
                scriptSrc: ["'self'"],
                connectSrc: ["'self'"],
                frameSrc: ["'none'"],
                objectSrc: ["'none'"]
            }
        },
        strictTransportSecurity: {
            maxAge: 31536000, // 1 year
            includeSubDomains: true,
            preload: true
        }
    },

    // CORS Configuration
    cors: {
        allowedOrigins: [
            'https://alshaerfamily.onrender.com'
        ],
        devOrigins: [
            'http://localhost:5173',
            'http://localhost:3000',
            'http://localhost:5000'
        ],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        credentials: true
    },

    // Audit Logging
    audit: {
        enabled: true,
        logPath: 'logs/audit.log',
        // Actions to log
        actions: [
            'LOGIN_SUCCESS',
            'LOGIN_FAILED',
            'LOGOUT',
            'PASSWORD_CHANGE',
            'CREATE',
            'UPDATE',
            'DELETE',
            'BULK_DELETE'
        ]
    },

    // Error Handling
    errors: {
        // Don't expose stack traces in production
        showStackTrace: process.env.NODE_ENV === 'development',
        // Generic error messages for security-sensitive operations
        genericAuthError: 'اسم المستخدم أو كلمة المرور غير صحيحة'
    }
};
