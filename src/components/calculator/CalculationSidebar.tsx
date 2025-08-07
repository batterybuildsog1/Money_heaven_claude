"use client";

import { useCalculatorStore } from "../../store/calculator";
import { Card } from "../ui/card";
import { AnimatedCurrency } from "./AnimatedCurrency";
import { TrendingUp, Home, DollarSign, Calculator } from "lucide-react";

export function CalculationSidebar() {
  const { results, previousResults, dtiProgressData, userInputs } = useCalculatorStore();
  
  // Calculate standard lender amount based on conventional DTI limits (28% front-end, 36% back-end)
  // FHA allows up to 31% front-end and 43% back-end (or 56.99% with compensating factors)
  const conventionalMaxDTI = 36; // 36% back-end ratio for conventional loans
  const fhaBaseDTI = 43; // 43% base FHA DTI
  const currentDTI = results.debtToIncomeRatio || fhaBaseDTI; // This is already in percentage form (e.g., 45.0 for 45%)
  
  // Calculate what a conventional lender would offer (limited by 36% DTI)
  // Since both values are in percentage form, we can compare directly
  const dtiRatio = Math.min(conventionalMaxDTI, currentDTI) / currentDTI;
  const standardBorrowingPower = (results.maxLoanAmount || 0) * dtiRatio * 0.85; // Additional 15% reduction for conventional
  
  const percentIncrease = results.maxLoanAmount && standardBorrowingPower > 0 
    ? Math.round(((results.maxLoanAmount - standardBorrowingPower) / standardBorrowingPower) * 100)
    : 0;

  return (
    <div className="sticky top-24 space-y-4">
      {/* Main Borrowing Power Display */}
      <Card className="bg-slate-900 border-slate-700 p-6 shadow-dark-xl">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-400">Your Borrowing Power</h3>
            <Home className="h-4 w-4 text-purple-400" />
          </div>
          
          <div className="space-y-2">
            <AnimatedCurrency
              value={results.maxLoanAmount || 0}
              previousValue={previousResults?.maxLoanAmount}
              className="text-4xl font-bold gradient-purple-text"
              showFloatingChange={true}
              animationDuration={800}
            />
            {percentIncrease > 0 && (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-400">
                  ↑ {percentIncrease}% vs standard lenders
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* DTI Progress */}
      {dtiProgressData && (
        <Card className="bg-slate-900 border-slate-700 p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-400">DTI Ratio</h3>
              <span className="text-lg font-bold text-white">
                {(results.debtToIncomeRatio || dtiProgressData.currentDTI * 100).toFixed(1)}%
              </span>
            </div>
            
            <div className="relative">
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full gradient-purple rounded-full transition-all duration-500"
                  style={{ 
                    width: `${((results.debtToIncomeRatio || dtiProgressData.currentDTI * 100) / 56.99) * 100}%` 
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>43%</span>
                <span>56.99%</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Monthly Payment Breakdown */}
      {results.monthlyPayment && (
        <Card className="bg-slate-900 border-slate-700 p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-400">Monthly Payment</h3>
              <DollarSign className="h-4 w-4 text-purple-400" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Principal & Interest</span>
                <span className="text-white font-medium">
                  ${results.principalAndInterest?.toLocaleString() || "0"}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Property Tax</span>
                <span className="text-white font-medium">
                  ${results.monthlyPropertyTax?.toLocaleString() || "0"}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Insurance</span>
                <span className="text-white font-medium">
                  ${results.monthlyInsurance?.toLocaleString() || "0"}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">MIP</span>
                <span className="text-white font-medium">
                  ${results.monthlyMIP?.toLocaleString() || "0"}
                </span>
              </div>
              
              <div className="pt-3 border-t border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-300">Total</span>
                  <AnimatedCurrency
                    value={results.totalMonthlyPayment || 0}
                    previousValue={previousResults?.totalMonthlyPayment}
                    className="text-xl font-bold gradient-purple-text"
                    showFloatingChange={false}
                    animationDuration={600}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Comparison Card */}
      <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-800/30 p-6">
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-purple-300">Why Use Our Calculator?</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>Up to 56.99% DTI with compensating factors</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>Real FHA guidelines applied</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>Accurate tax & insurance estimates</span>
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
}