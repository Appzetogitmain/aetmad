import jwt from 'jsonwebtoken';
import { config } from '../../config/env.js';

function sanitizeToken(token) {
    if (!token || typeof token !== 'string') return null;
    let clean = token.trim();
    if (!clean || clean === 'undefined' || clean === 'null' || clean === 'false') return null;

    if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
        clean = clean.slice(1, -1).trim();
    }
    if (clean.startsWith('{')) {
        try {
            const parsed = JSON.parse(clean);
            clean = parsed.token || parsed.accessToken || parsed.jwt || clean;
        } catch (e) {}
    }
    if (typeof clean === 'string' && /^Bearer\s+/i.test(clean)) {
        clean = clean.replace(/^Bearer\s+/i, '').trim();
    }
    if (typeof clean === 'string' && ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'")))) {
        clean = clean.slice(1, -1).trim();
    }
    if (!clean || clean === 'undefined' || clean === 'null' || clean === 'false') return null;
    return clean;
}

export const signAccessToken = (payload) => {
    return jwt.sign(payload, config.jwtAccessSecret, {
        expiresIn: config.jwtAccessExpiresIn
    });
};

export const signRefreshToken = (payload) => {
    return jwt.sign(payload, config.jwtRefreshSecret, {
        expiresIn: config.jwtRefreshExpiresIn
    });
};

export const verifyAccessToken = (token) => {
    const cleanToken = sanitizeToken(token);
    if (!cleanToken) {
        throw new Error('Invalid or missing authentication token');
    }
    try {
        return jwt.verify(cleanToken, config.jwtAccessSecret);
    } catch (err) {
        if (config.jwtSecret && config.jwtSecret !== config.jwtAccessSecret) {
            try {
                return jwt.verify(cleanToken, config.jwtSecret);
            } catch (e) {}
        }
        throw err;
    }
};

export const verifyRefreshToken = (token) => {
    const cleanToken = sanitizeToken(token);
    if (!cleanToken) {
        throw new Error('Invalid or missing refresh token');
    }
    return jwt.verify(cleanToken, config.jwtRefreshSecret);
};


