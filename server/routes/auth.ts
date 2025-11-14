import { Router } from 'express';
import { supabase } from '../supabase';
import { SignUpRequestSchema, SignInRequestSchema } from '@shared/types';

const router = Router();

/**
 * POST /api/auth/signup
 * Register a new user
 */
router.post('/signup', async (req, res) => {
  try {
    const validatedData = SignUpRequestSchema.parse(req.body);
    const { email, password, full_name } = validatedData;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
        },
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data.user || !data.session) {
      return res.status(400).json({ error: 'Failed to create user' });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.json({
      user: profile || {
        id: data.user.id,
        email: data.user.email,
        full_name: full_name || null,
        avatar_url: null,
        created_at: data.user.created_at,
        updated_at: data.user.created_at,
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in,
        expires_at: data.session.expires_at,
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({ error: error.message || 'Failed to sign up' });
  }
});

/**
 * POST /api/auth/signin
 * Sign in an existing user
 */
router.post('/signin', async (req, res) => {
  try {
    const validatedData = SignInRequestSchema.parse(req.body);
    const { email, password } = validatedData;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    if (!data.user || !data.session) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.json({
      user: profile || {
        id: data.user.id,
        email: data.user.email,
        full_name: null,
        avatar_url: null,
        created_at: data.user.created_at,
        updated_at: data.user.created_at,
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in,
        expires_at: data.session.expires_at,
      },
    });
  } catch (error: any) {
    console.error('Sign in error:', error);
    res.status(500).json({ error: error.message || 'Failed to sign in' });
  }
});

/**
 * POST /api/auth/signout
 * Sign out the current user
 */
router.post('/signout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Signed out successfully' });
  } catch (error: any) {
    console.error('Sign out error:', error);
    res.status(500).json({ error: error.message || 'Failed to sign out' });
  }
});

/**
 * GET /api/auth/user
 * Get current authenticated user
 */
router.get('/user', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    res.json({
      user: profile || {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: null,
        created_at: user.created_at,
        updated_at: user.created_at,
      },
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({ error: error.message || 'Failed to get user' });
  }
});

export default router;
