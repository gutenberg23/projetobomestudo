"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { FileText, Map, BookOpen, HelpCircle, Music } from "lucide-react";

interface ActionButtonProps {
  icon?: string;
  iconType?: "pdf" | "mapa" | "resumo" | "questoes" | "musica";
  label: string;
  variant?: "default" | "highlight";
  isActive?: boolean;
  onClick?: () => void;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  iconType,
  label,
  variant = "default",
  isActive = false,
  onClick
}) => {
  const getIcon = () => {
    if (icon) {
      return (
        <img 
          src={icon} 
          alt="" 
          className={cn(
            "w-4 h-4 object-contain",
            isActive && variant === "highlight" ? "opacity-100" : "opacity-70"
          )} 
        />
      );
    }
    
    const iconClass = cn(
      "w-4 h-4",
      isActive && variant === "highlight" ? "text-[#5f2ebe]" : "text-[rgba(38,47,60,0.7)]"
    );
    
    switch (iconType) {
      case "pdf":
        return <FileText className={iconClass} />;
      case "mapa":
        return <Map className={iconClass} />;
      case "resumo":
        return <BookOpen className={iconClass} />;
      case "questoes":
        return <HelpCircle className={iconClass} />;
      case "musica":
        return <Music className={iconClass} />;
      default:
        return <HelpCircle className={iconClass} />;
    }
  };
  return (
    <button 
      onClick={onClick} 
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
        "text-[rgba(38,47,60,0.7)] hover:text-[#5f2ebe]",
        "bg-white hover:bg-[#f8f5ff]",
        "border border-[#efefef] hover:border-[#5f2ebe]/20",
        isActive && variant === "highlight" && "text-[#5f2ebe] bg-[#f8f5ff] border-[#5f2ebe]/20"
      )}
    >
      {getIcon()}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};
