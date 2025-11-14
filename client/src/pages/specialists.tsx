import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import type { Specialist, ChatRoom } from '@shared/types';
import { Button } from '@/components/ui/button';
import { LogOut, MessageCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SpecialistsPage() {
  const { user, signOut } = useSupabaseAuth();
  const { toast } = useToast();
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [chatRooms, setChatRooms] = useState<Record<string, ChatRoom>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSpecialists();
    if (user) {
      loadChatRooms();
    }
  }, [user]);

  async function loadSpecialists() {
    try {
      const { data, error } = await supabase
        .from('specialists')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      setSpecialists(data || []);
    } catch (error) {
      console.error('Error loading specialists:', error);
      toast({
        title: 'Error',
        description: 'Failed to load specialists',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadChatRooms() {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_archived', false);

      if (error) throw error;

      const roomsMap: Record<string, ChatRoom> = {};
      (data || []).forEach((room) => {
        roomsMap[room.specialist_id] = room as ChatRoom;
      });

      setChatRooms(roomsMap);
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    }
  }

  function getSpecialistGradient(primary: string, secondary: string) {
    return `linear-gradient(135deg, ${primary}, ${secondary})`;
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-black/80 border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #FF006B, #FF4D94)',
                }}
              >
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">RELOVE</h1>
                <p className="text-xs text-white/60">Your Recovery Experts</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
              className="text-white/60 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Choose Your Specialist</h2>
          <p className="text-white/60">
            Tap to start a conversation with any of our expert coaches
          </p>
        </div>

        {/* Specialists List */}
        <div className="space-y-3">
          {specialists.map((specialist) => {
            const hasChat = chatRooms[specialist.id];

            return (
              <Link
                key={specialist.id}
                href={`/chat/${specialist.slug}`}
              >
                <div className="ios-list-item p-4 cursor-pointer active:scale-[0.98] transition-transform">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg"
                      style={{
                        background: getSpecialistGradient(
                          specialist.color_primary,
                          specialist.color_secondary
                        ),
                      }}
                    >
                      {specialist.name[0]}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">
                          {specialist.name}
                        </h3>
                        <span className="text-xs text-white/50">
                          {specialist.role}
                        </span>
                      </div>
                      <p className="text-sm text-white/60 line-clamp-1">
                        {specialist.description}
                      </p>
                      {hasChat && (
                        <div className="flex items-center gap-1 mt-1">
                          <MessageCircle className="w-3 h-3 text-blue-400" />
                          <span className="text-xs text-blue-400">
                            Active conversation
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="text-white/30">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Specialty tags */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {specialist.specialty.split(',').map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/70"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            AI-Powered Guidance
          </h3>
          <p className="text-sm text-white/60">
            Each specialist is powered by advanced AI and trained on proven relationship recovery methodologies. Your conversations are private and designed to help you heal and grow.
          </p>
        </div>
      </main>
    </div>
  );
}
