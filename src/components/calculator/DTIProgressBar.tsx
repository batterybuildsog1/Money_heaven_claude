"use client";

import { Badge } from "../ui/badge";

interface DTIProgressBarProps {
  currentDTI: number; // Decimal (e.g., 0.43 for 43%)
  baseDTI?: number; // Base DTI (43%)
  maxDTI?: number; // Max DTI (56.99%)
  className?: string;
}

export function DTIProgressBar({ 
  currentDTI, 
  baseDTI = 0.43, 
  maxDTI = 0.5699,
  className = "" 
}: DTIProgressBarProps) {
  const currentPercentage = currentDTI * 100;
  const basePercentage = baseDTI * 100;
  const maxPercentage = maxDTI * 100;
  
  // Calculate progress along the DTI range (43% to 56.99%)
  const progressRange = maxPercentage - basePercentage;
  const currentProgress = Math.max(0, Math.min(100, ((currentPercentage - basePercentage) / progressRange) * 100));
  
  // Color based on DTI level
  const getBarColor = () => {
    if (currentPercentage <= 45) return "bg-gradient-to-r from-orange-400 to-orange-500";
    if (currentPercentage <= 50) return "bg-gradient-to-r from-yellow-400 to-green-400";
    if (currentPercentage <= 55) return "bg-gradient-to-r from-green-400 to-green-500";
    return "bg-gradient-to-r from-green-500 to-green-600";
  };

  const getTextColor = () => {
    if (currentPercentage <= 45) return "text-orange-700";
    if (currentPercentage <= 50) return "text-yellow-700";
    return "text-green-700";
  };

  const isMaxReached = currentPercentage >= maxPercentage;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Current DTI Display */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">
          Current DTI Capacity
        </span>
        <div className="flex items-center gap-2">
          <span className={`font-semibold ${getTextColor()}`}>
            {currentPercentage.toFixed(1)}%
          </span>
          {isMaxReached && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Max DTI Reached
            </Badge>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all duration-700 ease-out ${getBarColor()}`}
            style={{ width: `${currentProgress}%` }}
          />
        </div>
        
        {/* Progress Bar Labels */}
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Base ({basePercentage.toFixed(0)}%)</span>
          <span>Max ({maxPercentage.toFixed(1)}%)</span>
        </div>
      </div>

      {/* Milestone Markers */}
      <div className="relative h-2">
        <div className="absolute inset-0 flex justify-between items-center">
          {/* 45% marker */}
          <div 
            className="flex flex-col items-center"
            style={{ 
              left: `${((45 - basePercentage) / progressRange) * 100}%`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="w-1 h-2 bg-orange-400 rounded-full" />
            <span className="text-xs text-gray-400 mt-1">45%</span>
          </div>
          
          {/* 50% marker */}
          <div 
            className="flex flex-col items-center"
            style={{ 
              left: `${((50 - basePercentage) / progressRange) * 100}%`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="w-1 h-2 bg-yellow-400 rounded-full" />
            <span className="text-xs text-gray-400 mt-1">50%</span>
          </div>
          
          {/* 55% marker */}
          <div 
            className="flex flex-col items-center"
            style={{ 
              left: `${((55 - basePercentage) / progressRange) * 100}%`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="w-1 h-2 bg-green-400 rounded-full" />
            <span className="text-xs text-gray-400 mt-1">55%</span>
          </div>
        </div>
      </div>
    </div>
  );
}