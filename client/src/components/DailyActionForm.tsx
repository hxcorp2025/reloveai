import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader } from "./Card";
import { apiCall } from "@/lib/api";
import type { DailyActionRequest, DailyActionResponse } from "@shared/schema";

const STORAGE_KEY = "relove_daily_action";

interface FormData {
  scenario: string;
  day_index: number;
  last_contact_hours: number;
  last_response_from_her: string;
  emotional_checkin: string;
}

export default function DailyActionForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    scenario: "hot_cold",
    day_index: 3,
    last_contact_hours: 56,
    last_response_from_her: "neutral",
    emotional_checkin: "calm"
  });
  const [result, setResult] = useState<DailyActionResponse | null>(null);

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
    mutationFn: (data: DailyActionRequest) => apiCall("/api/select_daily_action", data),
    onSuccess: (response) => {
      setResult(response as DailyActionResponse);
      toast({
        title: "Action Generated!",
        description: "Your daily action plan is ready."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to get daily action. Please try again.",
        variant: "destructive"
      });
      console.error("Daily action error:", error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData as DailyActionRequest);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: "Content copied to clipboard."
      });
    });
  };

  return (
    <Card>
      <CardHeader
        icon="fas fa-calendar-day"
        title="Action of the Day"
        subtitle="Get your personalized daily guidance"
        iconBg="bg-primary"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="scenario" className="block text-sm font-medium text-card-foreground mb-2">
            Scenario
          </Label>
          <Select
            value={formData.scenario}
            onValueChange={(value) => setFormData(prev => ({ ...prev, scenario: value }))}
          >
            <SelectTrigger data-testid="select-scenario">
              <SelectValue placeholder="Select scenario" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hot_cold">Hot & Cold</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
              <SelectItem value="no_contact">No Contact</SelectItem>
              <SelectItem value="breadcrumbs">Breadcrumbs</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="day_index" className="block text-sm font-medium text-card-foreground mb-2">
              Day Index
            </Label>
            <Input
              id="day_index"
              type="number"
              value={formData.day_index}
              onChange={(e) => setFormData(prev => ({ ...prev, day_index: parseInt(e.target.value) || 1 }))}
              min="1"
              max="365"
              data-testid="input-day-index"
            />
          </div>
          <div>
            <Label htmlFor="last_contact_hours" className="block text-sm font-medium text-card-foreground mb-2">
              Last Contact (hrs)
            </Label>
            <Input
              id="last_contact_hours"
              type="number"
              value={formData.last_contact_hours}
              onChange={(e) => setFormData(prev => ({ ...prev, last_contact_hours: parseInt(e.target.value) || 0 }))}
              min="0"
              data-testid="input-last-contact-hours"
            />
          </div>
        </div>

        <div>
          <Label className="block text-sm font-medium text-card-foreground mb-2">
            Last Response From Her
          </Label>
          <Select
            value={formData.last_response_from_her}
            onValueChange={(value) => setFormData(prev => ({ ...prev, last_response_from_her: value }))}
          >
            <SelectTrigger data-testid="select-last-response">
              <SelectValue placeholder="Select response type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="block text-sm font-medium text-card-foreground mb-2">
            Emotional Check-in
          </Label>
          <Select
            value={formData.emotional_checkin}
            onValueChange={(value) => setFormData(prev => ({ ...prev, emotional_checkin: value }))}
          >
            <SelectTrigger data-testid="select-emotional-checkin">
              <SelectValue placeholder="Select emotional state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="calm">Calm</SelectItem>
              <SelectItem value="anxious">Anxious</SelectItem>
              <SelectItem value="sad">Sad</SelectItem>
              <SelectItem value="angry">Angry</SelectItem>
              <SelectItem value="hopeful">Hopeful</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={mutation.isPending}
          data-testid="button-get-action"
        >
          <i className="fas fa-magic mr-2"></i>
          {mutation.isPending ? "Getting Action..." : "Get My Action"}
        </Button>
      </form>

      {result && (
        <div className="bg-muted rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              result.action === 'mission' ? 'bg-secondary text-secondary-foreground' :
              result.action === 'message' ? 'bg-primary text-primary-foreground' :
              'bg-accent text-accent-foreground'
            }`}>
              {result.action.charAt(0).toUpperCase() + result.action.slice(1)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(`${result.title}\n\n${result.content}\n\nWhy: ${result.why}`)}
              data-testid="button-copy-action"
            >
              <i className="fas fa-copy"></i>
            </Button>
          </div>
          <h4 className="font-semibold text-card-foreground" data-testid="text-action-title">
            {result.title}
          </h4>
          <p className="text-sm text-muted-foreground" data-testid="text-action-content">
            {result.content}
          </p>
          <div className="text-xs text-muted-foreground">
            <strong>Why:</strong> <span data-testid="text-action-why">{result.why}</span>
          </div>
          {result.sources && result.sources.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <strong>Sources:</strong> {result.sources.join(", ")}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
