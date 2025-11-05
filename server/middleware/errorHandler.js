// Custom App Error Class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Global Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Development mode - show full error details
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
  }

  // Production mode - handle specific errors

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const message = `${field} موجود مسبقاً`;
    err = new AppError(message, 400);
  }

  // MongoDB validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    const message = `بيانات غير صحيحة: ${errors.join(', ')}`;
    err = new AppError(message, 400);
  }

  // MongoDB cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    const message = `معرف غير صحيح: ${err.value}`;
    err = new AppError(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    err = new AppError('رمز الوصول غير صالح', 401);
  }

  if (err.name === 'TokenExpiredError') {
    err = new AppError('انتهت صلاحية رمز الوصول', 401);
  }

  // Default error
  const message = err.isOperational ? err.message : 'حدث خطأ في الخادم';
  
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: message,
    timestamp: new Date().toISOString()
  });
};

// Async handler wrapper to catch errors in async functions
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  errorHandler,
  asyncHandler
};

