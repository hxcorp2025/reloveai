import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader } from "./Card";
import { apiCall } from "@/lib/api";
import type { AgentRequest, AgentResponse } from "@shared/schema";

const STORAGE_KEY = "relove_agent";

const LOADING_PHRASES = [
  "Please wait, we are developing the best path...",
  "Searching in the Relove global knowledge base...",
  "Basing decision on users' success cases...",
  "Analyzing your situation with AI expertise...",
  "Consulting the breakup recovery database...",
  "Preparing personalized guidance for you..."
];

interface FormData {
  input: string;
}

export default function AgentPassthrough() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    input: ""
  });
  const [result, setResult] = useState<AgentResponse | null>(null);
  const [loadingPhrase, setLoadingPhrase] = useState("");

  const mutation = useMutation({
    mutationFn: (data: AgentRequest) => apiCall("/api/agent", data),
    onSuccess: (response) => {
      setResult(response as AgentResponse);
      toast({
        title: "AI Response Ready!",
        description: "The AI coach has provided guidance."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please check your API configuration.",
        variant: "destructive"
      });
      console.error("Agent error:", error);
    }
  });

  // Update loading phrase periodically
  useEffect(() => {
    if (mutation.isPending) {
      const randomPhrase = LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)];
      setLoadingPhrase(randomPhrase);
      
      const interval = setInterval(() => {
        const newPhrase = LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)];
        setLoadingPhrase(newPhrase);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [mutation.isPending]);

  // Load saved form data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setFormData(parsedData);
      } catch (error) {
        console.error("Failed to load saved form data:", error);
      }
    }
  }, []);

  // Save form data when it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.input.trim()) {
      toast({
        title: "Error",
        description: "Please describe your situation.",
        variant: "destructive"
      });
      return;
    }
    mutation.mutate(formData as AgentRequest);
  };

  return (
    <div className="mt-8">
      <Card>
        <CardHeader
          icon="fas fa-robot"
          title="AI Agent (Advanced)"
          subtitle="Direct access to the AI coach for complex situations"
          iconBg="bg-gradient-to-br from-primary to-accent"
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="agent_input" className="block text-sm font-medium text-card-foreground mb-2">
              Describe Your Situation
            </Label>
            <Textarea
              id="agent_input"
              placeholder="Day 3 of breakup, she said she needs space but keeps liking my social media posts. What should I do?"
              value={formData.input}
              onChange={(e) => setFormData(prev => ({ ...prev, input: e.target.value }))}
              rows={3}
              className="resize-none"
              data-testid="textarea-agent-input"
            />
          </div>

          <Button
            type="submit"
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-medium"
            disabled={mutation.isPending}
            data-testid="button-ask-ai"
          >
            <i className="fas fa-brain mr-2"></i>
            {mutation.isPending ? "Asking AI Coach..." : "Ask AI Coach"}
          </Button>
        </form>

        {mutation.isPending && (
          <div className="mt-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-card-foreground mb-1">Processing your request...</h4>
                <div className="text-sm text-muted-foreground" data-testid="text-loading-phrase">
                  {loadingPhrase}
                </div>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-4 border border-primary/20">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <i className="fas fa-robot text-white text-sm"></i>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-card-foreground mb-2">AI Coach Response</h4>
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap" data-testid="text-ai-response">
                  {result.response}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Response generated at {new Date(result.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
