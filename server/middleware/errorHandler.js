import { ZodError } from 'zod';

export const errorHandler = (err, req, res, next) => {
  // Log unexpected errors
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error] ${err.name}: ${err.message}`);
  }

  // Zod Validation Error
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message
    }));
    return res.status(400).json({
      success: false,
      message: errors[0]?.message || 'Validation error',
      errors
    });
  }

  // MongoDB Unique Index Violation (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    let userMsg = `Duplicate entry for ${field}.`;
    if (field === 'email') userMsg = 'An account with this email address already exists.';
    if (field === 'bookingDate') userMsg = 'This date has already been booked. Please choose another date.';
    return res.status(409).json({
      success: false,
      message: userMsg,
      field
    });
  }

  // Mongoose CastError (invalid ObjectId or format)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid identifier format for ${err.path}`
    });
  }

  // Default response
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected server error occurred'
  });
};
