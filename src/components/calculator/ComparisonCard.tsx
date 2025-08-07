"use client";

import { Card } from "../ui/card";
import { CheckCircle, TrendingUp } from "lucide-react";

interface ComparisonCardProps {
  standardAmount: number;
  enhancedAmount: number;
  income?: number;
}

export function ComparisonCard({ 
  standardAmount, 
  enhancedAmount,
  income 
}: ComparisonCardProps) {
  const percentIncrease = standardAmount > 0 
    ? Math.round(((enhancedAmount - standardAmount) / standardAmount) * 100)
    : 0;

  return (
    <Card className="bg-slate-800 border-slate-700 p-8 shadow-dark-xl">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">
          Your Borrowing Power Comparison
        </h3>
        {income && (
          <p className="text-slate-400">
            Based on ${income.toLocaleString()} annual income
          </p>
        )}
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Standard Lenders */}
        <div className="text-center p-6 bg-slate-900/50 rounded-xl">
          <p className="text-slate-400 mb-2">Standard Lenders</p>
          <p className="text-4xl font-bold text-slate-500">
            ${standardAmount.toLocaleString()}
          </p>
          <p className="text-sm text-slate-500 mt-2">Max home price</p>
        </div>
        
        {/* With MoneyBucket */}
        <div className="text-center p-6 bg-purple-900/20 rounded-xl border border-purple-800/30">
          <p className="text-purple-400 mb-2">With MoneyBucket</p>
          <p className="text-4xl font-bold gradient-purple-text">
            ${enhancedAmount.toLocaleString()}
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <p className="text-sm text-green-400">
              ↑ {percentIncrease}% more buying power
            </p>
          </div>
        </div>
      </div>
      
      {/* Benefits */}
      <div className="mt-8 flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <span className="text-green-400">FHA approved with compensating factors</span>
        </div>
      </div>
    </Card>
  );
}