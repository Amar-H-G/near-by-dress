/**
 * Standard API response helper
 */

const sendSuccess = (res, data = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, ...data });
};

const sendError = (res, message = 'Server Error', statusCode = 500, errors = null) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

const sendPaginated = (res, data, page, limit, total) => {
  return res.status(200).json({
    success: true,
    data,
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / limit),
  });
};

module.exports = { sendSuccess, sendError, sendPaginated };
