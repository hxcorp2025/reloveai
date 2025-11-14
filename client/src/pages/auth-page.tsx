// Authentication page with login and registration forms using blueprint:javascript_auth_all_persistance
import { useState } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Heart, Brain, MessageSquare } from "lucide-react";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ username: "", email: "", password: "" });

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = loginSchema.safeParse(loginForm);
    if (!result.success) return;
    
    loginMutation.mutate(loginForm);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = insertUserSchema.safeParse(registerForm);
    if (!result.success) return;
    
    registerMutation.mutate(registerForm);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="space-y-6 text-center lg:text-left">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Welcome to RELOVE AI
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Your AI-powered breakup recovery coach
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 justify-center lg:justify-start">
              <Heart className="h-6 w-6 text-red-500" />
              <span className="text-gray-700 dark:text-gray-300">
                Personalized daily guidance for healing
              </span>
            </div>
            <div className="flex items-center space-x-3 justify-center lg:justify-start">
              <MessageSquare className="h-6 w-6 text-blue-500" />
              <span className="text-gray-700 dark:text-gray-300">
                Safe text rewriting to avoid relationship mistakes
              </span>
            </div>
            <div className="flex items-center space-x-3 justify-center lg:justify-start">
              <Brain className="h-6 w-6 text-purple-500" />
              <span className="text-gray-700 dark:text-gray-300">
                Smart decision support for when to reach out
              </span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <p className="text-gray-600 dark:text-gray-400">
              "RELOVE AI helped me navigate my breakup with confidence and clarity. 
              The daily guidance kept me focused on healing rather than dwelling on the past."
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">- Sarah M.</p>
          </div>
        </div>

        {/* Authentication Forms */}
        <div className="flex justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>
                Create an account or sign in to begin your recovery journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-username">Username</Label>
                      <Input
                        id="login-username"
                        data-testid="input-login-username"
                        type="text"
                        value={loginForm.username}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        data-testid="input-login-password"
                        type="password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      data-testid="button-login"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-username">Username</Label>
                      <Input
                        id="register-username"
                        data-testid="input-register-username"
                        type="text"
                        value={registerForm.username}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, username: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        data-testid="input-register-email"
                        type="email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        data-testid="input-register-password"
                        type="password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                        minLength={6}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      data-testid="button-register"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}