import { useEffect, useState, useRef } from 'react';
import { useRoute, Link } from 'wouter';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import type { Specialist, ChatRoom, Message } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Paperclip, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function ChatPage() {
  const [, params] = useRoute('/chat/:slug');
  const { user } = useSupabaseAuth();
  const { toast } = useToast();

  const [specialist, setSpecialist] = useState<Specialist | null>(null);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (params?.slug && user) {
      loadSpecialist(params.slug);
    }
  }, [params?.slug, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function loadSpecialist(slug: string) {
    try {
      // Load specialist
      const { data: specialistData, error: specError } = await supabase
        .from('specialists')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (specError) throw specError;

      setSpecialist(specialistData);

      // Get or create chat room
      const { data: existingRoom } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('user_id', user?.id)
        .eq('specialist_id', specialistData.id)
        .single();

      if (existingRoom) {
        setRoom(existingRoom as ChatRoom);
        await loadMessages(existingRoom.id);
      } else {
        // Create new room
        const { data: newRoom, error: roomError } = await supabase
          .from('chat_rooms')
          .insert({
            user_id: user?.id,
            specialist_id: specialistData.id,
          })
          .select()
          .single();

        if (roomError) throw roomError;

        setRoom(newRoom as ChatRoom);

        // Send welcome message
        await sendWelcomeMessage(newRoom.id, specialistData);
      }
    } catch (error) {
      console.error('Error loading specialist:', error);
      toast({
        title: 'Error',
        description: 'Failed to load specialist',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function sendWelcomeMessage(roomId: string, spec: Specialist) {
    const welcomeMessages: Record<string, string> = {
      alex: "Hey there! I'm Alex, your recovery coach. I'm here to help you navigate this difficult time with proven strategies from the no contact method. How are you feeling today?",
      sarah: "Hi! I'm Sarah, your text strategist. I specialize in helping you craft messages that create attraction and maintain momentum. Want to run a message by me, or need help figuring out what to say?",
      'dr-marcus': "Hello, I'm Dr. Marcus. As a relationship psychologist, I'm here to help you understand the deeper patterns in your situation. What brings you here today?",
      maya: "Hey! I'm Maya, your momentum coach! Let's focus on building the amazing life that naturally attracts others. What's one thing you did for yourself today?",
      lucas: "What's up! I'm Lucas, your social media strategist. Let's craft an online presence that shows your growth without looking desperate. Ready to level up your digital game?",
      emma: "Hi sweetie, I'm Emma. I know you're going through a lot right now, and I'm here to listen and support you. You're not alone in this. What's on your mind?",
    };

    const welcomeText = welcomeMessages[spec.slug] || `Hi! I'm ${spec.name}. How can I help you today?`;

    const { error } = await supabase
      .from('messages')
      .insert({
        room_id: roomId,
        sender_type: 'specialist',
        content: welcomeText,
      });

    if (!error) {
      await loadMessages(roomId);
    }
  }

  async function loadMessages(roomId: string) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      setMessages(data as Message[] || []);

      // Mark as read
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('room_id', roomId)
        .eq('sender_type', 'specialist')
        .is('read_at', null);

      await supabase
        .from('chat_rooms')
        .update({ unread_count: 0 })
        .eq('id', roomId);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }

  async function sendMessage() {
    if (!newMessage.trim() || !room || !specialist || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);
    setIsTyping(true);

    try {
      // Insert user message
      const { data: userMsg, error: userError } = await supabase
        .from('messages')
        .insert({
          room_id: room.id,
          sender_type: 'user',
          content: messageContent,
        })
        .select()
        .single();

      if (userError) throw userError;

      // Update UI immediately
      setMessages((prev) => [...prev, userMsg as Message]);

      // Get conversation history
      const history = messages
        .slice(-10)
        .map((msg) => ({
          role: msg.sender_type === 'user' ? 'user' : 'assistant',
          content: msg.content,
        }));

      // Call AI API endpoint
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;

      const response = await fetch(`/api/chat/rooms/${room.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: messageContent,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const result = await response.json();

      // Add AI response to messages
      setMessages((prev) => [...prev, result.specialist_message]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
      setIsTyping(false);
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function formatMessageTime(timestamp: string) {
    return format(new Date(timestamp), 'h:mm a');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }

  if (!specialist) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-xl mb-4">Specialist not found</h2>
          <Link href="/specialists">
            <Button>Back to Specialists</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-black/80 border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/specialists">
            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
              style={{
                background: `linear-gradient(135deg, ${specialist.color_primary}, ${specialist.color_secondary})`,
              }}
            >
              {specialist.name[0]}
            </div>
            <div>
              <h1 className="font-semibold">{specialist.name}</h1>
              <p className="text-xs text-white/50">{specialist.role}</p>
            </div>
          </div>

          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
            <Info className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6" style={{ paddingBottom: '120px' }}>
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((message) => {
            const isUser = message.sender_type === 'user';

            return (
              <div
                key={message.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`${
                      isUser ? 'message-bubble-user' : 'message-bubble-specialist'
                    } max-w-[75%]`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                  <span className="text-xs text-white/40 mt-1 px-2">
                    {formatMessageTime(message.created_at)}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="message-bubble-specialist">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 backdrop-blur-xl bg-black/80 border-t border-white/10 p-4">
        <div className="max-w-2xl mx-auto flex items-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/60 hover:text-white mb-2"
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          <div className="flex-1 bg-white/10 rounded-2xl border border-white/20 focus-within:border-blue-500 transition-colors">
            <Textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Message..."
              className="bg-transparent border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-white/40"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>

          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            size="icon"
            className="bg-blue-500 hover:bg-blue-600 rounded-full w-11 h-11 mb-2"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
