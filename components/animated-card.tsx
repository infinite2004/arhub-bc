"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: "lift" | "glow" | "scale" | "tilt";
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  duration?: number;
}

export function AnimatedCard({
  children,
  className,
  hoverEffect = "lift",
  delay = 0,
  direction = "up",
  duration = 0.3,
}: AnimatedCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  const getHoverClasses = () => {
    switch (hoverEffect) {
      case "lift":
        return "hover:-translate-y-2 hover:shadow-xl";
      case "glow":
        return "hover:shadow-2xl hover:shadow-blue-500/25";
      case "scale":
        return "hover:scale-105";
      case "tilt":
        return "hover:rotate-1 hover:scale-105";
      default:
        return "hover:-translate-y-2 hover:shadow-xl";
    }
  };

  const getDirectionClasses = () => {
    const baseClasses = "transition-all duration-300 ease-out";
    const transformClasses = {
      up: isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
      down: isVisible ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0",
      left: isVisible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0",
      right: isVisible ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0",
    };

    return `${baseClasses} ${transformClasses[direction]}`;
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        getDirectionClasses(),
        getHoverClasses(),
        className
      )}
      style={{ transitionDuration: `${duration}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
}

// Enhanced card with built-in animations
interface EnhancedCardProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  variant?: "default" | "featured" | "minimal";
  hoverEffect?: "lift" | "glow" | "scale" | "tilt";
  delay?: number;
}

export function EnhancedCard({
  title,
  description,
  children,
  className,
  variant = "default",
  hoverEffect = "lift",
  delay = 0,
}: EnhancedCardProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case "featured":
        return "border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20";
      case "minimal":
        return "border-0 shadow-none bg-transparent";
      default:
        return "border border-gray-200 dark:border-gray-700 shadow-lg";
    }
  };

  return (
    <AnimatedCard
      hoverEffect={hoverEffect}
      delay={delay}
      className={cn("group", className)}
    >
      <Card className={cn("h-full transition-all duration-300", getVariantClasses())}>
        {title && (
          <CardHeader className="pb-3">
            <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
              {title}
            </CardTitle>
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {description}
              </p>
            )}
          </CardHeader>
        )}
        {children && (
          <CardContent className={title ? "pt-0" : ""}>
            {children}
          </CardContent>
        )}
      </Card>
    </AnimatedCard>
  );
}

// Floating action card
interface FloatingCardProps {
  children: React.ReactNode;
  className?: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  offset?: number;
}

export function FloatingCard({
  children,
  className,
  position = "bottom-right",
  offset = 20,
}: FloatingCardProps) {
  const getPositionClasses = () => {
    switch (position) {
      case "top-left":
        return `top-${offset} left-${offset}`;
      case "top-right":
        return `top-${offset} right-${offset}`;
      case "bottom-left":
        return `bottom-${offset} left-${offset}`;
      case "bottom-right":
        return `bottom-${offset} right-${offset}`;
      default:
        return `bottom-${offset} right-${offset}`;
    }
  };

  return (
    <div
      className={cn(
        "fixed z-50 animate-in fade-in-0 slide-in-from-bottom-2 duration-500",
        getPositionClasses(),
        className
      )}
    >
      <Card className="shadow-2xl border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
        {children}
      </Card>
    </div>
  );
}

// Interactive card with click effects
interface InteractiveCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  ripple?: boolean;
}

export function InteractiveCard({
  children,
  onClick,
  className,
  disabled = false,
  ripple = true,
}: InteractiveCardProps) {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !onClick) return;

    if (ripple && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newRipple = { id: Date.now(), x, y };
      
      setRipples(prev => [...prev, newRipple]);
      
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 600);
    }

    onClick();
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative overflow-hidden cursor-pointer transition-all duration-200",
        disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95",
        className
      )}
      onClick={handleClick}
    >
      {children}
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="absolute pointer-events-none animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            background: "rgba(59, 130, 246, 0.3)",
            borderRadius: "50%",
          }}
        />
      ))}
    </div>
  );
}
