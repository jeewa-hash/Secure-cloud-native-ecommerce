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


// Protect middleware to authenticate requests via JWT
export const protect = (req, res, next) => {
    let token = req.headers.authorization;

    if (token && token.startsWith('Bearer ')) {
        try {
            token = token.split(' ')[1];
            const secret = process.env.JWT_SECRET || 'fallback_secret_key';
            const decoded = jwt.verify(token, secret);
            
            // Set user payload on request
            req.user = decoded.user || decoded;
            next();
        } catch (error) {
            console.error('JWT Verification Error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token validation failed' });
        }
    } else {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};
