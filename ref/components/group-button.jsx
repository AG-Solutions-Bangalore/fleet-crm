import React from "react";
import { cn } from "@/lib/utils";

export function GroupButton({ options = [], value, onChange, className }) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center rounded-xl bg-gradient-to-b from-muted/80 to-muted p-1.5 shadow-inner gap-1",
        className
      )}
      role="group"
    >
      {options.map((option) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "relative px-5 py-2 border rounded-lg text-sm  font-medium  transition-all duration-300",
              "transform active:scale-95",
              isActive
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02] border-primary"
                : "bg-white text-foreground hover:shadow-md border-border"
            )}
            aria-pressed={isActive}
          >
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
