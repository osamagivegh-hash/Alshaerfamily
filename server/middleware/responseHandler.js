// Success response helper
const successResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message: message,
    timestamp: new Date().toISOString()
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  return res.status(statusCode).json(response);
};

// Error response helper
const errorResponse = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message: message,
    timestamp: new Date().toISOString()
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return res.status(statusCode).json(response);
};

// Paginated response helper
const paginatedResponse = (res, message, data, pagination) => {
  return res.json({
    success: true,
    message: message,
    data: data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      pages: Math.ceil(pagination.total / pagination.limit)
    },
    timestamp: new Date().toISOString()
  });
};

// Response middleware - adds helper methods to response object
const responseHandler = (req, res, next) => {
  res.success = (statusCode, message, data) => successResponse(res, statusCode, message, data);
  res.error = (statusCode, message, errors) => errorResponse(res, statusCode, message, errors);
  res.paginated = (message, data, pagination) => paginatedResponse(res, message, data, pagination);
  next();
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  responseHandler
};

