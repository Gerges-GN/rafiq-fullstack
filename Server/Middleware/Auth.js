const jwt = require('jsonwebtoken');
const User = require('../Models/User');

exports.verifyToken = (req, res, next) => {
  const authorization = req.get('authorization');
  const parts = typeof authorization === 'string' ? authorization.trim().split(/\s+/) : [];
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer' || !parts[1]) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: 'Authentication is unavailable.' });
  }

  try {
    const decoded = jwt.verify(parts[1], process.env.JWT_SECRET);
    if (!decoded || typeof decoded !== 'object' || !decoded.id) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }
    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

exports.requireRole = (...allowedRoles) => async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const account = await User.findById(req.user.id).select('role');
    if (!account) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    req.user.role = account.role;
    if (!allowedRoles.includes(account.role)) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    return next();
  } catch {
    return res.status(500).json({ message: 'Authorization is unavailable.' });
  }
};
