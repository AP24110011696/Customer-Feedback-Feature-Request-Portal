const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT for a user id.
 * Expiration is configurable via JWT_EXPIRES_IN (default 7d).
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = generateToken;
