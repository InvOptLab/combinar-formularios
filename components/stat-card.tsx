"use client";

import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  trend?: "up" | "down" | "neutral";
  variant?: "default" | "success" | "warning" | "error";
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  variant = "default",
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "transition-shadow hover:shadow-md",
        variant === "success" && "border-green-200 bg-green-50/50",
        variant === "warning" && "border-yellow-200 bg-yellow-50/50",
        variant === "error" && "border-red-200 bg-red-50/50"
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div
            className={cn(
              "rounded-lg p-2.5",
              variant === "default" && "bg-primary/10 text-primary",
              variant === "success" && "bg-green-100 text-green-600",
              variant === "warning" && "bg-yellow-100 text-yellow-600",
              variant === "error" && "bg-red-100 text-red-600"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
