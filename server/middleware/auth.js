import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nexura_super_secret_key_2026';

export const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No authentication token, access denied' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role, referenceId }
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token is invalid or expired' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied: insufficient permissions' });
    }
    next();
  };
};
