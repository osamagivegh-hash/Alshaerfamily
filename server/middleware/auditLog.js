/**
 * Security Audit Logging Middleware
 * Tracks all admin actions for security compliance
 */

const fs = require('fs-extra');
const path = require('path');

const AUDIT_LOG_DIR = path.join(__dirname, '../logs');
const AUDIT_LOG_FILE = path.join(AUDIT_LOG_DIR, 'audit.log');

// Ensure log directory exists
fs.ensureDirSync(AUDIT_LOG_DIR);

/**
 * Log entry format:
 * {
 *   timestamp: ISO date string,
 *   action: string (CREATE, UPDATE, DELETE, LOGIN, etc.),
 *   resource: string (persons, news, etc.),
 *   resourceId: string (optional),
 *   user: string (username),
 *   ip: string,
 *   userAgent: string,
 *   details: object (optional additional context)
 * }
 */

const logAuditEntry = async (entry) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        ...entry
    };

    const logLine = JSON.stringify(logEntry) + '\n';

    try {
        await fs.appendFile(AUDIT_LOG_FILE, logLine);
    } catch (error) {
        console.error('Failed to write audit log:', error);
    }
};

/**
 * Middleware to automatically log admin actions
 */
const auditMiddleware = (action, resource) => {
    return (req, res, next) => {
        // Store original send function
        const originalSend = res.send;
        const originalJson = res.json;

        // Override to capture response
        res.send = function (body) {
            logAdminAction(req, res, action, resource);
            return originalSend.call(this, body);
        };

        res.json = function (body) {
            logAdminAction(req, res, action, resource);
            return originalJson.call(this, body);
        };

        next();
    };
};

/**
 * Helper to log admin action
 */
const logAdminAction = (req, res, action, resource) => {
    // Only log successful operations (2xx status codes)
    if (res.statusCode >= 200 && res.statusCode < 300) {
        logAuditEntry({
            action,
            resource,
            resourceId: req.params.id || null,
            user: req.user?.username || 'anonymous',
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent') || 'unknown',
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode
        });
    }
};

/**
 * Log authentication attempts (success and failure)
 */
const logAuthAttempt = async (username, success, ip, userAgent, reason = null) => {
    await logAuditEntry({
        action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
        resource: 'auth',
        user: username,
        ip,
        userAgent,
        details: reason ? { reason } : null
    });
};

/**
 * Log sensitive operations
 */
const logSensitiveOperation = async (req, operation, details = {}) => {
    await logAuditEntry({
        action: operation,
        resource: 'sensitive',
        user: req.user?.username || 'anonymous',
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent') || 'unknown',
        details
    });
};

module.exports = {
    logAuditEntry,
    auditMiddleware,
    logAuthAttempt,
    logSensitiveOperation
};
