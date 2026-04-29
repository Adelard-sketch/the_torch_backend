/**
 * Response Utility Functions
 * Standardized API response helpers
 */

/**
 * Success response
 */
function successResponse(res, data, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    status: statusCode,
    message,
    data
  });
}

/**
 * Error response
 */
function errorResponse(res, message = 'Error', statusCode = 500, errors = null) {
  const response = {
    success: false,
    status: statusCode,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
}

/**
 * Validation error response
 */
function validationError(res, errors) {
  return errorResponse(res, 'Validation failed', 400, errors);
}

/**
 * Not found response
 */
function notFoundResponse(res, resource = 'Resource') {
  return errorResponse(res, `${resource} not found`, 404);
}

/**
 * Unauthorized response
 */
function unauthorizedResponse(res, message = 'Unauthorized') {
  return errorResponse(res, message, 401);
}

/**
 * Forbidden response
 */
function forbiddenResponse(res, message = 'Forbidden') {
  return errorResponse(res, message, 403);
}

/**
 * Created response
 */
function createdResponse(res, data, message = 'Created successfully') {
  return successResponse(res, data, message, 201);
}

/**
 * Pagination response
 */
function paginationResponse(res, data, pagination) {
  return res.status(200).json({
    success: true,
    status: 200,
    data,
    pagination: {
      total: pagination.total || data.length,
      limit: pagination.limit,
      offset: pagination.offset,
      hasMore: pagination.hasMore || false
    }
  });
}

module.exports = {
  successResponse,
  errorResponse,
  validationError,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  createdResponse,
  paginationResponse
};
