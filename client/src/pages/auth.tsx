import { useState } from 'react';
import { useLocation } from 'wouter';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles } from 'lucide-react';

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { signIn, signUp } = useSupabaseAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn({
          email: formData.email,
          password: formData.password,
        });
      } else {
        await signUp({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
        });
      }

      setLocation('/specialists');
    } catch (error) {
      // Error handled in auth hook
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <div
            className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-4 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #FF006B, #FF4D94)',
            }}
          >
            <Sparkles className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold mb-2">RELOVE</h1>
          <p className="text-white/60">Your AI-powered recovery journey</p>
        </div>

        {/* Form */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
          <div className="flex gap-2 mb-8">
            <Button
              onClick={() => setMode('signin')}
              variant={mode === 'signin' ? 'default' : 'ghost'}
              className={`flex-1 rounded-full ${
                mode === 'signin'
                  ? 'bg-white text-black hover:bg-white/90'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Sign In
            </Button>
            <Button
              onClick={() => setMode('signup')}
              variant={mode === 'signup' ? 'default' : 'ghost'}
              className={`flex-1 rounded-full ${
                mode === 'signup'
                  ? 'bg-white text-black hover:bg-white/90'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Sign Up
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-white/80">
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl h-12"
                  placeholder="John Doe"
                  required={mode === 'signup'}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl h-12"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl h-12"
                placeholder="••••••••"
                required
                minLength={6}
              />
              {mode === 'signup' && (
                <p className="text-xs text-white/50">
                  Must be at least 6 characters
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold shadow-lg"
            >
              {loading ? (
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : mode === 'signin' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/50">
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 text-center text-sm text-white/40">
          <p>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
