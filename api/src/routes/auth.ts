import express from 'express';
import { userService } from '../services/userService';
import { signJwt } from '../middleware/auth';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.post('/register', async (req, res) => {
    const { username, password } = req.body ?? {};
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });

    try {
        const user = await userService.createUser(username, password);

        const token = signJwt(user.id, user.username, '2h');
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 2 * 60 * 60 * 1000,
            path: '/'
        });

        return res.status(201).json({ id: user.id, username: user.username, createdAt: user.createdAt });
    } catch (err: any) {
        if (err.message === 'UserExists') return res.status(409).json({ error: 'User already exists' });
        console.error(err);
        return res.status(500).json({ error: 'Failed to create user' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body ?? {};
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });

    const user = await userService.validatePassword(username, password);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signJwt(user.id, user.username, '2h');

    res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 2 * 60 * 60 * 1000, // 2 hours
        path: '/'
    });

    res.status(200).json({ id: user.id, username: user.username });
});

router.post('/logout', (_req, res) => {
    res.clearCookie('token', { path: '/' });
    res.sendStatus(204);
});

router.get('/me', authMiddleware, (req: any, res) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    res.status(200).json({ id: req.user.id, username: req.user.username });
});

export default router;
