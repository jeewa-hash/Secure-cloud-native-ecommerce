import jwt from 'jsonwebtoken';

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
