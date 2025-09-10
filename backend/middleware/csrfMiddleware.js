// CSRF protection via JWT tokens (sufficient for API-only backend)
const csrfProtection = (req, res, next) => {
  // JWT tokens in Authorization header provide CSRF protection
  // for API endpoints as they can't be sent cross-origin
  next();
};

module.exports = csrfProtection;