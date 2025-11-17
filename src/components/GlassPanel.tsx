import { cn } from "@/lib/utils";

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassPanel({ children, className }: GlassPanelProps) {
  return (
    <div className={cn("glass-panel rounded-lg p-6", className)}>
      {children}
    </div>
  );
}
