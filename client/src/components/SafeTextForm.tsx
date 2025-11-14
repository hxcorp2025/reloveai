import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader } from "./Card";
import { apiCall } from "@/lib/api";
import type { SafeTextRequest, SafeTextResponse } from "@shared/schema";

const STORAGE_KEY = "relove_safe_text";

interface FormData {
  text: string;
}

export default function SafeTextForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    text: ""
  });
  const [result, setResult] = useState<SafeTextResponse | null>(null);

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

  const mutation = useMutation({
    mutationFn: (data: SafeTextRequest) => apiCall("/api/safetext_rewrite", data),
    onSuccess: (response) => {
      setResult(response as SafeTextResponse);
      toast({
        title: "Text Rewritten!",
        description: "Your safe text version is ready."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to rewrite text. Please try again.",
        variant: "destructive"
      });
      console.error("SafeText error:", error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.text.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to rewrite.",
        variant: "destructive"
      });
      return;
    }
    mutation.mutate(formData as SafeTextRequest);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: "Text copied to clipboard."
      });
    });
  };

  return (
    <Card>
      <CardHeader
        icon="fas fa-shield-alt"
        title="SafeText Rewriter"
        subtitle="Transform risky texts into confident ones"
        iconBg="bg-accent"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="text" className="block text-sm font-medium text-card-foreground mb-2">
            Your Text
          </Label>
          <Textarea
            id="text"
            placeholder="I miss you so much, please reply to me, I can't live without you."
            value={formData.text}
            onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
            rows={4}
            className="resize-none"
            data-testid="textarea-text"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          disabled={mutation.isPending}
          data-testid="button-rewrite-text"
        >
          <i className="fas fa-edit mr-2"></i>
          {mutation.isPending ? "Rewriting..." : "Rewrite Safely"}
        </Button>
      </form>

      {result && (
        <div className="bg-muted rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                result.score >= 8 ? 'bg-green-500' :
                result.score >= 5 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}>
                <span className="text-white text-sm font-bold" data-testid="text-safety-score">
                  {result.score}
                </span>
              </div>
              <span className="text-sm font-medium text-card-foreground">Safety Score</span>
            </div>
            <div className="flex space-x-1">
              {result.issues.map((issue) => (
                <span
                  key={issue}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive"
                  data-testid={`tag-issue-${issue}`}
                >
                  {issue}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-card-foreground">Rewritten Text</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(result.rewritten)}
                data-testid="button-copy-rewritten"
              >
                <i className="fas fa-copy"></i>
              </Button>
            </div>
            <p className="text-sm bg-background p-3 rounded border border-border" data-testid="text-rewritten">
              {result.rewritten}
            </p>
          </div>

          {result.alternatives.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-card-foreground">Alternative Options</Label>
              {result.alternatives.map((alt, index) => (
                <div key={index} className="flex items-center justify-between bg-background p-3 rounded border border-border">
                  <p className="text-sm" data-testid={`text-alternative-${index}`}>{alt}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(alt)}
                    className="ml-2"
                    data-testid={`button-copy-alternative-${index}`}
                  >
                    <i className="fas fa-copy"></i>
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <strong>Notes:</strong> <span data-testid="text-notes">{result.notes.join(", ")}</span>
          </div>
        </div>
      )}
    </Card>
  );
}
