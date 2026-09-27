import { google } from 'googleapis';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

dotenv.config();

export const googleOAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
);

const googleScopes = ['openid', 'profile', 'email'];

export const googleAuth = (req, res) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_CALLBACK_URL) {
        return res.status(503).json({ message: 'Google authentication is not configured' });
    }

    const authorizationUrl = googleOAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: googleScopes,
        prompt: 'consent'
    });

    res.redirect(authorizationUrl);
};

export const googleAuthCallback = async (req, res) => {
    if (!req.query.code) {
        return res.status(400).json({ message: 'Google authorization code is required' });
    }

    try {
        const { tokens } = await googleOAuth2Client.getToken(req.query.code);
        googleOAuth2Client.setCredentials(tokens);

        const oauth2 = google.oauth2({ version: 'v2', auth: googleOAuth2Client });
        const { data: profile } = await oauth2.userinfo.get();

        if (!profile.email) {
            return res.status(401).json({ message: 'Google account email was not provided' });
        }

        let user = await User.findOne({ email: profile.email });
        if (!user) {
            const userName = `google_${profile.id}`;
            const randomPassword = await bcrypt.hash(`${profile.id}_${Date.now()}`, 10);
            const [firstName = 'Google', ...lastNameParts] = (profile.name || 'User').split(' ');

            user = await User.create({
                userName,
                email: profile.email,
                password: randomPassword,
                firstName,
                lastName: lastNameParts.join(' ') || 'User',
                role: 'customer',
                roles: ['customer'],
                isEmailVerified: true
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: 'JWT authentication is not configured' });
        }

        const token = jwt.sign(
            { user: { id: user._id, role: user.role } },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/oauth/callback?token=${encodeURIComponent(token)}`);
    } catch (error) {
        console.error('Google authentication error:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/oauth/callback?error=${encodeURIComponent('Google authentication failed')}`);
    }
};
