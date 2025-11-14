import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader } from "./Card";
import { apiCall } from "@/lib/api";
import type { GreenlightRequest, GreenlightResponse } from "@shared/schema";

const STORAGE_KEY = "relove_greenlight";

interface FormData {
  scenario: string;
  silence_hours: number;
  last_response_from_her: string;
  relapse_today: string;
  emotional_checkin: string;
}

export default function GreenlightForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    scenario: "blocked",
    silence_hours: 72,
    last_response_from_her: "none",
    relapse_today: "false",
    emotional_checkin: "calm"
  });
  const [result, setResult] = useState<GreenlightResponse | null>(null);

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
    mutationFn: (data: GreenlightRequest) => apiCall("/api/greenlight", data),
    onSuccess: (response) => {
      setResult(response as GreenlightResponse);
      toast({
        title: "Greenlight Check Complete!",
        description: `Status: ${response.light.toUpperCase()} light`
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to check greenlight status. Please try again.",
        variant: "destructive"
      });
      console.error("Greenlight error:", error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const requestData: GreenlightRequest = {
      scenario: formData.scenario as GreenlightRequest["scenario"],
      silence_hours: formData.silence_hours,
      last_response_from_her: formData.last_response_from_her as GreenlightRequest["last_response_from_her"],
      relapse_today: formData.relapse_today === "true",
      emotional_checkin: formData.emotional_checkin as GreenlightRequest["emotional_checkin"]
    };
    mutation.mutate(requestData);
  };

  const getTrafficLightStyle = (light: string) => {
    switch (light) {
      case "red":
        return "traffic-light-red";
      case "yellow":
        return "traffic-light-yellow";
      case "green":
        return "traffic-light-green";
      default:
        return "";
    }
  };

  const getTrafficLightIcon = (light: string) => {
    switch (light) {
      case "red":
        return "fas fa-times";
      case "yellow":
        return "fas fa-pause";
      case "green":
        return "fas fa-check";
      default:
        return "fas fa-question";
    }
  };

  return (
    <Card>
      <CardHeader
        icon="fas fa-traffic-light"
        title="Greenlight Check"
        subtitle="Should you reach out right now?"
        iconBg="bg-secondary"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="block text-sm font-medium text-card-foreground mb-2">
            Current Scenario
          </Label>
          <Select
            value={formData.scenario}
            onValueChange={(value) => setFormData(prev => ({ ...prev, scenario: value }))}
          >
            <SelectTrigger data-testid="select-greenlight-scenario">
              <SelectValue placeholder="Select scenario" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hot_cold">Hot & Cold</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
              <SelectItem value="no_contact">No Contact</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="block text-sm font-medium text-card-foreground mb-2">
              Silence Hours
            </Label>
            <Input
              type="number"
              value={formData.silence_hours}
              onChange={(e) => setFormData(prev => ({ ...prev, silence_hours: parseInt(e.target.value) || 0 }))}
              min="0"
              data-testid="input-silence-hours"
            />
          </div>
          <div>
            <Label className="block text-sm font-medium text-card-foreground mb-2">
              Last Response
            </Label>
            <Select
              value={formData.last_response_from_her}
              onValueChange={(value) => setFormData(prev => ({ ...prev, last_response_from_her: value }))}
            >
              <SelectTrigger data-testid="select-greenlight-last-response">
                <SelectValue placeholder="Select response" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="block text-sm font-medium text-card-foreground mb-2">
              Relapse Today?
            </Label>
            <Select
              value={formData.relapse_today}
              onValueChange={(value) => setFormData(prev => ({ ...prev, relapse_today: value }))}
            >
              <SelectTrigger data-testid="select-relapse-today">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">No</SelectItem>
                <SelectItem value="true">Yes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="block text-sm font-medium text-card-foreground mb-2">
              Emotional State
            </Label>
            <Select
              value={formData.emotional_checkin}
              onValueChange={(value) => setFormData(prev => ({ ...prev, emotional_checkin: value }))}
            >
              <SelectTrigger data-testid="select-greenlight-emotional">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="calm">Calm</SelectItem>
                <SelectItem value="anxious">Anxious</SelectItem>
                <SelectItem value="emotional">Emotional</SelectItem>
                <SelectItem value="triggered">Triggered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          disabled={mutation.isPending}
          data-testid="button-check-greenlight"
        >
          <i className="fas fa-search mr-2"></i>
          {mutation.isPending ? "Checking..." : "Check Status"}
        </Button>
      </form>

      {result && (
        <div className="bg-muted rounded-lg p-6 space-y-4 text-center">
          {/* Traffic Light Display */}
          <div className="flex justify-center mb-4">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${getTrafficLightStyle(result.light)}`}>
              <i className={`${getTrafficLightIcon(result.light)} text-white text-2xl`} data-testid="icon-traffic-light"></i>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-lg text-card-foreground" data-testid="text-light-status">
              {result.light.toUpperCase()} LIGHT
            </h4>
            <p className="text-sm text-muted-foreground" data-testid="text-light-reason">
              {result.reason}
            </p>
          </div>

          <div className="bg-background p-3 rounded border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-card-foreground">Next Step</span>
              {result.wait_hours > 0 && (
                <span className="text-xs text-muted-foreground" data-testid="text-wait-hours">
                  Wait {result.wait_hours}+ hrs
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground" data-testid="text-next-step">
              {result.next_step}
            </p>
          </div>

          {result.risk_flags.length > 0 && (
            <div className="flex justify-center space-x-2">
              {result.risk_flags.map((flag) => (
                <span
                  key={flag}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive"
                  data-testid={`tag-risk-${flag}`}
                >
                  <i className="fas fa-exclamation-triangle mr-1"></i>
                  {flag.replace("_", " ")}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
