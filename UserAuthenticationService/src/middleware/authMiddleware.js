import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null;

    if (!token) {
        return res.status(401).json({ message: 'Authentication token is required' });
    }

    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET environment variable is not configured');
        return res.status(500).json({ message: 'Authentication is not configured' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user ?? decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired authentication token' });
    }
};

export const requireAdmin = (req, res, next) => {
    const roles = req.user?.roles ?? (req.user?.role ? [req.user.role] : []);

    if (!roles.includes('admin')) {
        return res.status(403).json({ message: 'Admin access is required' });
    }

    next();
};
