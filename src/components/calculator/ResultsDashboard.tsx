"use client";

import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { formatCurrency } from "../../lib/utils";
import { useScenarios } from "../../hooks/useScenarios";
import { Home, ExternalLink, Save, Edit3, Check, X } from "lucide-react";
import { UserInputs, CalculationResults, CompensatingFactors } from "../../types";

interface ResultsDashboardProps {
  results: CalculationResults;
  userInputs: UserInputs;
  compensatingFactors: CompensatingFactors;
  onUpdateInputs?: (inputs: Partial<UserInputs>) => void;
  className?: string;
}

export function ResultsDashboard({
  results,
  userInputs,
  compensatingFactors,
  onUpdateInputs,
  className = ""
}: ResultsDashboardProps) {
  const { create: createScenario } = useScenarios();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  // Save scenario functionality
  const handleSaveScenario = async () => {
    setIsSaving(true);
    try {
      const scenarioName = `${userInputs.location || 'Location'} - ${formatCurrency(results.maxLoanAmount || 0)}`;
      
      await createScenario({
        inputs: userInputs,
        compensatingFactors,
        results,
        name: scenarioName,
        notes: `DTI: ${results.debtToIncomeRatio?.toFixed(1)}% | ${new Date().toLocaleDateString()}`
      });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save scenario:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Inline editing functionality
  const startEditing = (field: string, currentValue: number | undefined) => {
    setEditingField(field);
    setEditValues({ ...editValues, [field]: currentValue?.toString() || '0' });
  };

  const saveEdit = (field: string) => {
    if (onUpdateInputs) {
      const value = parseFloat(editValues[field]) || 0;
      onUpdateInputs({ [field]: value });
    }
    setEditingField(null);
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValues({});
  };

  const renderEditableValue = (
    field: string,
    value: number | undefined,
    label: string,
    isCurrency: boolean = true
  ) => {
    const isEditing = editingField === field;
    
    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={editValues[field] || ''}
            onChange={(e) => setEditValues({ ...editValues, [field]: e.target.value })}
            className="h-8 text-sm"
            autoFocus
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => saveEdit(field)}
            className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={cancelEdit}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <span className="font-medium">
          {isCurrency ? formatCurrency(value || 0) : value}
        </span>
        {onUpdateInputs && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => startEditing(field, value)}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
          >
            <Edit3 className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  };

  // Calculate additional metrics
  const monthlyPaymentComponents = {
    principalAndInterest: results.principalAndInterest || 0,
    propertyTax: results.propertyTax || 0,
    homeInsurance: results.homeInsurance || 0,
    mip: results.mip || 0,
  };

  const totalMonthlyPayment = Object.values(monthlyPaymentComponents).reduce((sum, val) => sum + val, 0);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Save Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Your Results</h2>
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Scenario Saved!
            </Badge>
          )}
          <Button
            onClick={handleSaveScenario}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Scenario"}
          </Button>
        </div>
      </div>

      {/* Large Loan Amount Display */}
      <Card className="p-8 bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Home className="h-8 w-8 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-700">Maximum Loan Amount</h3>
          </div>
          <div className="text-5xl font-bold text-green-600 mb-4">
            {formatCurrency(results.maxLoanAmount || 0)}
          </div>
          <div className="text-lg text-gray-600">
            Maximum Home Price: {formatCurrency(results.maxHomePrice || 0)}
          </div>
          {results.loanProgram && (
            <Badge variant="outline" className="mt-2 bg-blue-50 text-blue-700 border-blue-200">
              {results.loanProgram} Loan
            </Badge>
          )}
        </div>
      </Card>

      {/* Monthly Payment Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Monthly Payment Breakdown (PITI + MIP)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Principal & Interest:</span>
              {renderEditableValue('principalAndInterest', monthlyPaymentComponents.principalAndInterest, 'P&I')}
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Property Tax:</span>
              {renderEditableValue('propertyTax', monthlyPaymentComponents.propertyTax, 'Property Tax')}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Home Insurance:</span>
              {renderEditableValue('homeInsurance', monthlyPaymentComponents.homeInsurance, 'Insurance')}
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">MIP (Mortgage Insurance):</span>
              <span className="font-medium">{formatCurrency(monthlyPaymentComponents.mip)}</span>
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold text-gray-900">Total Monthly Payment:</span>
            <span className="font-bold text-blue-600">
              {formatCurrency(totalMonthlyPayment)}
            </span>
          </div>
        </div>
      </Card>

      {/* Property Tax Display */}
      {results.propertyTaxInfo && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Tax Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600">Headline Rate:</span>
              <div className="font-medium">
                {(results.propertyTaxInfo.headlineRate * 100).toFixed(2)}%
              </div>
            </div>
            <div>
              <span className="text-gray-600">Applicable Rate:</span>
              <div className="font-medium text-green-600">
                {(results.propertyTaxInfo.applicableRate * 100).toFixed(2)}%
              </div>
            </div>
            <div>
              <span className="text-gray-600">Annual Payment:</span>
              <div className="font-medium">
                {formatCurrency(results.propertyTaxInfo.annualPayment)}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Confidence:</span>
              <div className="font-medium">
                {results.propertyTaxInfo.confidence}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Insurance Estimate with Zebra Link */}
      {results.insuranceInfo && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Insurance Estimate</h3>
            {results.insuranceInfo.zebraQuoteUrl && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <a
                  href={results.insuranceInfo.zebraQuoteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  Get Quote from Zebra
                </a>
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600">Monthly Premium:</span>
              <div className="font-medium">
                {formatCurrency(results.insuranceInfo.monthlyPremium)}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Annual Premium:</span>
              <div className="font-medium">
                {formatCurrency(results.insuranceInfo.annualPremium)}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Dwelling Coverage:</span>
              <div className="font-medium">
                {formatCurrency(results.insuranceInfo.dwellingCoverage)}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Confidence:</span>
              <div className="font-medium capitalize">
                {results.insuranceInfo.confidence}
              </div>
            </div>
          </div>
          
          {/* Enhanced Insurance Data */}
          {results.insuranceInfo.county && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Location Details</h4>
              <p className="text-sm text-gray-600">
                {results.insuranceInfo.county.fullName}
              </p>
            </div>
          )}
          
          {results.insuranceInfo.riskAssessment && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Risk Assessment</h4>
              <div className="space-y-1">
                {results.insuranceInfo.riskAssessment.floodZone && (
                  <p className="text-sm text-orange-600">• Flood zone - higher risk</p>
                )}
                {results.insuranceInfo.riskAssessment.coastalCounty && (
                  <p className="text-sm text-orange-600">• Coastal location - hurricane risk</p>
                )}
                {results.insuranceInfo.riskAssessment.wildfireRisk !== 'low' && (
                  <p className="text-sm text-orange-600">
                    • {results.insuranceInfo.riskAssessment.wildfireRisk === 'high' ? 'High' : 'Moderate'} wildfire risk
                  </p>
                )}
                {results.insuranceInfo.riskAssessment.severeWeatherRisk !== 'low' && (
                  <p className="text-sm text-orange-600">
                    • {results.insuranceInfo.riskAssessment.severeWeatherRisk === 'high' ? 'High' : 'Moderate'} severe weather risk
                  </p>
                )}
                {results.insuranceInfo.riskAssessment.earthquakeRisk !== 'low' && (
                  <p className="text-sm text-orange-600">
                    • {results.insuranceInfo.riskAssessment.earthquakeRisk === 'high' ? 'High' : 'Moderate'} earthquake risk
                  </p>
                )}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* DTI Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Debt-to-Income Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {results.debtToIncomeRatio?.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Current DTI</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {results.maxAllowedDTI ? (results.maxAllowedDTI * 100).toFixed(1) : '43.0'}%
            </div>
            <div className="text-sm text-gray-600">Max Allowed DTI</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {results.maxAllowedDTI && results.debtToIncomeRatio 
                ? ((results.maxAllowedDTI * 100) - results.debtToIncomeRatio).toFixed(1)
                : '0.0'
              }%
            </div>
            <div className="text-sm text-gray-600">Remaining Capacity</div>
          </div>
        </div>
      </Card>

      {/* Warnings and Recommendations */}
      {(results.warnings?.length || results.recommendations?.length) && (
        <div className="space-y-4">
          {results.warnings && results.warnings.length > 0 && (
            <Card className="p-6 bg-yellow-50 border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-3">Important Notes:</h4>
              <ul className="space-y-2">
                {results.warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-yellow-700 flex items-start">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    {warning}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {results.recommendations && results.recommendations.length > 0 && (
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-3">Recommendations to Improve:</h4>
              <ul className="space-y-2">
                {results.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-blue-700 flex items-start">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    {rec}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}