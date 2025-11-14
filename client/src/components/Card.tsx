import { cn } from "@/lib/utils";

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

interface CardHeaderProps {
  icon: string;
  title: string;
  subtitle: string;
  iconBg: string;
}

export function Card({ className, children }: CardProps) {
  return (
    <div className={cn("bg-card rounded-lg border border-border shadow-lg p-6 space-y-6", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ icon, title, subtitle, iconBg }: CardHeaderProps) {
  return (
    <div className="flex items-center space-x-3">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconBg)}>
        <i className={cn(icon, "text-white")}></i>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
