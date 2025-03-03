
import React, { ReactNode } from "react";

interface FormSectionProps {
  title?: string;
  children: ReactNode;
  cols?: 1 | 2 | 3;
}

const FormSection: React.FC<FormSectionProps> = ({ 
  title, 
  children, 
  cols = 1 
}) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3"
  };

  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-sm font-medium text-[#272f3c]">{title}</h3>
      )}
      <div className={`grid ${gridCols[cols]} gap-4`}>
        {children}
      </div>
    </div>
  );
};

export default FormSection;
