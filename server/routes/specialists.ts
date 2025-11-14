import { Router } from 'express';
import { supabase } from '../supabase';
import type { Specialist } from '@shared/types';

const router = Router();

/**
 * GET /api/specialists
 * Get all active specialists
 */
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('specialists')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    res.json(data as Specialist[]);
  } catch (error) {
    console.error('Error fetching specialists:', error);
    res.status(500).json({ error: 'Failed to fetch specialists' });
  }
});

/**
 * GET /api/specialists/:id
 * Get a single specialist by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('specialists')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Specialist not found' });
    }

    res.json(data as Specialist);
  } catch (error) {
    console.error('Error fetching specialist:', error);
    res.status(500).json({ error: 'Failed to fetch specialist' });
  }
});

export default router;
