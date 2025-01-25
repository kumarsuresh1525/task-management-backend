import { Router } from 'express';
import passport from 'passport';
import { 
  register, 
  login, 
  forgotPassword, 
  resetPassword, 
  googleCallback 
} from '../controllers/auth.controller';

const router = Router();

// Local authentication routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/login',
    session: false
  }),
  googleCallback
);

export default router; 