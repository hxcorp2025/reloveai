import DailyActionForm from "@/components/DailyActionForm";
import SafeTextForm from "@/components/SafeTextForm";
import GreenlightForm from "@/components/GreenlightForm";
import AgentPassthrough from "@/components/AgentPassthrough";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

export default function Home() {
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <i className="fas fa-heart text-white text-sm"></i>
                </div>
                <h1 className="text-xl font-bold text-foreground">RELOVE AI</h1>
              </div>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Breakup Recovery Coach
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span data-testid="text-username">Welcome, {user.username}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    data-testid="button-logout"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              )}
              <a
                href="/api/health"
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center space-x-1"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-health"
              >
                <i className="fas fa-heartbeat"></i>
                <span>Health</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Your Recovery Toolkit
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Navigate your healing journey with AI-powered guidance. Choose your
            daily action, rewrite texts safely, and get the green light for your
            next step.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <DailyActionForm />
          <SafeTextForm />
          <GreenlightForm />
        </div>

        <AgentPassthrough />
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                © 2024 RELOVE AI. Supporting your healing journey.
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
