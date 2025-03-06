
import React from "react";

interface CheckboxGroupProps {
  title: string;
  options: string[];
  selectedValues: string[];
  onChange: (value: string) => void;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  title,
  options,
  selectedValues,
  onChange
}) => {
  return (
    <div className="space-y-2">
      {title && <div className="font-medium text-sm">{title}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {options.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`checkbox-${option}`}
              checked={selectedValues.includes(option)}
              onChange={() => onChange(option)}
              className="h-4 w-4 rounded border-gray-300 text-[#ea2be2] focus:ring-[#ea2be2]"
            />
            <label
              htmlFor={`checkbox-${option}`}
              className="text-sm font-medium text-[#67748a] cursor-pointer"
            >
              {option}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};
