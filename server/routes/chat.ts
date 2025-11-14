import { Router } from 'express';
import { supabase, supabaseAdmin } from '../supabase';
import { generateAIResponse, analyzeScreenshot } from '../services/ai-providers';
import type { ChatRoom, Message, Specialist, SendMessageRequest } from '@shared/types';

const router = Router();

/**
 * GET /api/chat/rooms
 * Get all chat rooms for the authenticated user
 */
router.get('/rooms', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { data, error } = await supabase
      .from('chat_rooms')
      .select(`
        *,
        specialists (*)
      `)
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .order('last_message_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({ error: 'Failed to fetch chat rooms' });
  }
});

/**
 * POST /api/chat/rooms
 * Create or get existing chat room with a specialist
 */
router.post('/rooms', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { specialist_id } = req.body;

    if (!specialist_id) {
      return res.status(400).json({ error: 'specialist_id is required' });
    }

    // Check if room already exists
    const { data: existing } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('user_id', user.id)
      .eq('specialist_id', specialist_id)
      .single();

    if (existing) {
      return res.json(existing);
    }

    // Create new room
    const { data: newRoom, error } = await supabase
      .from('chat_rooms')
      .insert({
        user_id: user.id,
        specialist_id,
      })
      .select()
      .single();

    if (error) throw error;

    res.json(newRoom);
  } catch (error) {
    console.error('Error creating chat room:', error);
    res.status(500).json({ error: 'Failed to create chat room' });
  }
});

/**
 * GET /api/chat/rooms/:roomId/messages
 * Get messages for a chat room
 */
router.get('/rooms/:roomId/messages', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { roomId } = req.params;
    const { limit = 50, before } = req.query;

    // Verify user owns this room
    const { data: room } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', roomId)
      .eq('user_id', user.id)
      .single();

    if (!room) {
      return res.status(404).json({ error: 'Chat room not found' });
    }

    let query = supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(Number(limit));

    if (before) {
      query = query.lt('created_at', before as string);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Mark messages as read
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('room_id', roomId)
      .eq('sender_type', 'specialist')
      .is('read_at', null);

    // Reset unread count
    await supabase
      .from('chat_rooms')
      .update({ unread_count: 0 })
      .eq('id', roomId);

    res.json((data || []).reverse());
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

/**
 * POST /api/chat/rooms/:roomId/messages
 * Send a message in a chat room
 */
router.post('/rooms/:roomId/messages', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { roomId } = req.params;
    const { content, attachments }: SendMessageRequest = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Verify user owns this room and get specialist
    const { data: room } = await supabase
      .from('chat_rooms')
      .select(`
        *,
        specialists (*)
      `)
      .eq('id', roomId)
      .eq('user_id', user.id)
      .single();

    if (!room) {
      return res.status(404).json({ error: 'Chat room not found' });
    }

    const specialist = room.specialists as unknown as Specialist;

    // Insert user message
    const { data: userMessage, error: userMsgError } = await supabase
      .from('messages')
      .insert({
        room_id: roomId,
        sender_type: 'user',
        content: content.trim(),
        attachments: attachments || [],
      })
      .select()
      .single();

    if (userMsgError) throw userMsgError;

    // Get conversation history (last 10 messages)
    const { data: history } = await supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(10);

    const conversationHistory = (history || [])
      .reverse()
      .slice(0, -1) // Remove the message we just sent
      .map(msg => ({
        role: msg.sender_type === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content,
      }));

    // Generate AI response
    const aiResponse = await generateAIResponse({
      specialist,
      conversationHistory,
      userMessage: content,
      attachments,
    });

    // Insert specialist response
    const { data: specialistMessage, error: specialistMsgError } = await supabase
      .from('messages')
      .insert({
        room_id: roomId,
        sender_type: 'specialist',
        content: aiResponse,
      })
      .select()
      .single();

    if (specialistMsgError) throw specialistMsgError;

    // Update room's last_message_at
    await supabase
      .from('chat_rooms')
      .update({
        last_message_at: new Date().toISOString(),
      })
      .eq('id', roomId);

    res.json({
      user_message: userMessage,
      specialist_message: specialistMessage,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

/**
 * POST /api/chat/upload
 * Upload a screenshot/image
 */
router.post('/upload', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // This would handle file upload
    // For now, return a placeholder
    res.json({
      message: 'Upload endpoint ready',
      note: 'Implement multipart/form-data handling',
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

export default router;
