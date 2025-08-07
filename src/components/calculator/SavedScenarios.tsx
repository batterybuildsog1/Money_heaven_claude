"use client";

import { useScenarios } from "../../hooks/useScenarios";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { formatCurrency } from "../../lib/utils";
import { Trash2, Calendar, MapPin, DollarSign } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { UserInputs, CompensatingFactors, CalculationResults } from "../../types";

interface SavedScenariosProps {
  onLoadScenario: (scenario: { inputs: UserInputs; compensatingFactors: CompensatingFactors; results?: CalculationResults }) => void;
  className?: string;
}

export function SavedScenarios({ onLoadScenario, className = "" }: SavedScenariosProps) {
  const { scenarios, remove, isLoading } = useScenarios();

  const handleLoadScenario = (scenario: { inputs: UserInputs; compensatingFactors?: CompensatingFactors; results?: CalculationResults }) => {
    onLoadScenario({
      inputs: scenario.inputs,
      compensatingFactors: scenario.compensatingFactors || {},
      results: scenario.results || {},
    });
  };

  const handleDeleteScenario = async (id: Id<"scenarios">) => {
    if (confirm("Are you sure you want to delete this scenario?")) {
      await remove(id);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!scenarios || scenarios.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-gray-500">
          <DollarSign className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">No saved scenarios</p>
          <p className="text-sm text-gray-500">
            Save your first calculation to see it here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Saved Scenarios ({scenarios.length})
        </h3>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {scenarios.map((scenario) => (
          <Card key={scenario._id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {/* Scenario Name/Title */}
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-gray-900 truncate">
                    {scenario.name || `Scenario ${scenario._id.slice(-4)}`}
                  </h4>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(scenario._creationTime)}
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Max Loan:</span>
                    <div className="font-semibold text-green-600">
                      {scenario.results?.maxLoanAmount 
                        ? formatCurrency(scenario.results.maxLoanAmount)
                        : "N/A"
                      }
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Income:</span>
                    <div className="font-medium">
                      {scenario.inputs?.income 
                        ? formatCurrency(scenario.inputs.income)
                        : "N/A"
                      }
                    </div>
                  </div>
                  {scenario.inputs?.location && (
                    <div className="col-span-2">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="text-xs">{scenario.inputs.location}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* DTI Info */}
                {scenario.results?.debtToIncomeRatio && (
                  <div className="mt-2 text-xs">
                    <span className="text-gray-500">DTI: </span>
                    <span className="font-medium text-blue-600">
                      {scenario.results.debtToIncomeRatio.toFixed(1)}%
                    </span>
                    {scenario.results.maxAllowedDTI && (
                      <span className="text-gray-500">
                        {" "} / {(scenario.results.maxAllowedDTI * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                )}

                {/* Notes */}
                {scenario.notes && (
                  <div className="mt-2 text-xs text-gray-600 italic truncate">
                    &ldquo;{scenario.notes}&rdquo;
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleLoadScenario(scenario)}
                  className="text-xs"
                >
                  Load
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteScenario(scenario._id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {scenarios.length > 5 && (
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Showing {Math.min(scenarios.length, 10)} of {scenarios.length} scenarios
          </p>
        </div>
      )}
    </div>
  );
}