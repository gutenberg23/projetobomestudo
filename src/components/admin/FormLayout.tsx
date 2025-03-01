
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface FormLayoutProps {
  title: string;
  children: React.ReactNode;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
}

export const FormLayout: React.FC<FormLayoutProps> = ({
  title,
  children,
  isSubmitting = false,
  onCancel,
  onSubmit,
  submitLabel = "Salvar",
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-bold text-[#272f3c]">{title}</h2>
      </div>
      <form onSubmit={onSubmit}>
        <div className="space-y-6">{children}</div>
        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-[#ea2be2] hover:bg-[#d026d5]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Salvando..." : submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
};
