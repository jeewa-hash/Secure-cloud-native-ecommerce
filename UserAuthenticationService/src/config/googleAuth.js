import { google } from 'googleapis';
import dotenv from 'dotenv';

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

        // The profile can now be matched to or created as a local user.
        res.status(200).json({ message: 'Google authentication successful', profile });
    } catch (error) {
        console.error('Google authentication error:', error);
        res.status(401).json({ message: 'Google authentication failed' });
    }
};
