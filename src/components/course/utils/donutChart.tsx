
import React from "react";

interface DonutChartProps {
  percentage: number;
  size?: number;
  thickness?: number;
  color?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  percentage,
  size = 80,
  thickness = 10,
  color = "#ea2be2",
}) => {
  const radius = size / 2;
  const innerRadius = radius - thickness;
  const circumference = 2 * Math.PI * innerRadius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={radius}
        cy={radius}
        r={innerRadius}
        fill="none"
        stroke="#E6E6E6"
        strokeWidth={thickness}
      />
      <circle
        cx={radius}
        cy={radius}
        r={innerRadius}
        fill="none"
        stroke={color}
        strokeWidth={thickness}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform={`rotate(-90 ${radius} ${radius})`}
        strokeLinecap="round"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="16"
        fontWeight="bold"
        fill="#333"
      >
        {percentage}%
      </text>
    </svg>
  );
};
