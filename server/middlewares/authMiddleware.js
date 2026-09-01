import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nuva_super_secret_jwt_key_2026_ozone_purity');

      try {
        req.user = await User.findById(decoded.id).select('-password').lean();
      } catch (e) {
        req.user = { _id: decoded.id, role: decoded.role || 'user', name: decoded.name || 'User' };
      }

      if (!req.user) {
        req.user = { _id: decoded.id, role: decoded.role || 'user', name: decoded.name || 'User' };
      }

      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
};

/* Optional auth: fills in req.user when a valid token is present, and lets
   the request through when it isn't. Routes that are public but show more
   to staff — a metaobject's draft entries, say — need this rather than
   `protect`, which would reject the anonymous storefront outright. */
export const attachUser = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer')) return next();

  try {
    const decoded = jwt.verify(
      header.split(' ')[1],
      process.env.JWT_SECRET || 'nuva_super_secret_jwt_key_2026_ozone_purity'
    );
    try {
      req.user = await User.findById(decoded.id).select('-password').lean();
    } catch (e) { /* database offline — fall back to the token's own claims */ }
    if (!req.user) {
      req.user = { _id: decoded.id, role: decoded.role || 'user', name: decoded.name || 'User' };
    }
  } catch (e) {
    // An expired or bogus token is simply treated as anonymous here.
  }

  next();
};

export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin privilege required' });
  }
};
