"use client";

import { ReactNode } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WizardStepProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  stepDescription?: string;
  children: ReactNode;
  onNext?: () => void;
  onPrevious?: () => void;
  isValid?: boolean;
  showResults?: boolean;
}

export function WizardStep({
  currentStep,
  totalSteps,
  stepTitle,
  stepDescription,
  children,
  onNext,
  onPrevious,
  isValid = true,
  showResults = false,
}: WizardStepProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Progress Indicator */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">{stepTitle}</h2>
          <span className="text-sm text-slate-400">
            Step {currentStep} of {totalSteps}
          </span>
        </div>
        
        {stepDescription && (
          <p className="text-slate-400">{stepDescription}</p>
        )}
        
        {/* Progress Bar */}
        <div className="relative">
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full gradient-purple rounded-full transition-all duration-500"
              style={{ 
                width: `${(currentStep / totalSteps) * 100}%` 
              }}
            />
          </div>
          
          {/* Step Dots */}
          <div className="absolute -top-1 left-0 right-0 flex justify-between">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  i + 1 < currentStep
                    ? "bg-green-500 border-green-500" // Completed
                    : i + 1 === currentStep
                    ? "bg-purple-500 border-purple-500 ring-2 ring-purple-500/30" // Current
                    : "bg-slate-800 border-slate-700" // Future
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <Card className="bg-slate-900 border-slate-700 p-6 lg:p-8 shadow-dark-xl">
        {children}
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          onClick={onPrevious}
          disabled={currentStep === 1}
          variant="outline"
          className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        {showResults ? (
          <Button
            className="gradient-purple hover:opacity-90 text-white px-8"
            onClick={onNext}
          >
            View Results
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={onNext}
            disabled={!isValid}
            className="gradient-purple hover:opacity-90 text-white px-8"
          >
            {currentStep === totalSteps ? "View Results" : "Next"}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}