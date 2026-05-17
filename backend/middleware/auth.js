const jwt = require('jsonwebtoken');
const User = require('../models/User');

const normalizeEmail = (value = '') => String(value || '').trim().toLowerCase();

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded?.isSuperAdmin && decoded?.role === 'admin') {
      const configuredEmail = normalizeEmail(process.env.SUPER_ADMIN_EMAIL || 'bryan@muwas.ca');
      const tokenEmail = normalizeEmail(decoded.email || '');

      if (tokenEmail !== configuredEmail) {
        return res.status(401).json({ message: 'Token is not valid' });
      }

      req.user = {
        _id: decoded.userId || 'super-admin',
        name: decoded.name || process.env.SUPER_ADMIN_NAME || 'Bryan Anderson',
        email: configuredEmail,
        role: 'admin',
        isApproved: true,
        authProvider: 'local',
        isSuperAdmin: true,
      };

      return next();
    }

    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    if (!user.isApproved && user.role !== 'admin') {
      user.isApproved = true;
      await user.save();
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.' 
      });
    }
    next();
  };
};

module.exports = { auth, authorize };
