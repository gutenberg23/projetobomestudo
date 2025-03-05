import React from "react";
import { Region, RegionFilter as RegionFilterType } from "./types";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
interface RegionFilterProps {
  regions: RegionFilterType[];
  activeRegion: Region | null;
  onSelectRegion: (region: Region | null) => void;
}
export const RegionFilter: React.FC<RegionFilterProps> = ({
  regions,
  activeRegion,
  onSelectRegion
}) => {
  return <div className="mb-6">
      
    </div>;
};