"use client";

import { useState, useEffect } from "react";
import { DTIProgressBar } from "./DTIProgressBar";
import { Input } from "../ui/input";
import { formatCurrency } from "../../lib/utils";
import { DTI_CONSTANTS } from "../../lib/dti-factors";
import { Check, X, TrendingUp } from "lucide-react";

interface DTIEnhancementProps {
  currentDTI: number;
  maxAllowedDTI: number;
  activeFactors: Array<{
    id: string;
    name: string;
    dtiIncrease: number;
  }>;
  borrowingPowerChange?: {
    maxLoanAmount: number;
    previousAmount: number;
    difference: number;
  };
  compensatingFactors: {
    cashReserves?: number;
    necessaryDebts?: number;
    projectedMonthlyPayment?: number;
  };
  onUpdateFactors: (factors: Record<string, number>) => void;
  onUpdateUserInputs?: (updates: Record<string, any>) => void;
  grossMonthlyIncome?: number;
  regionLabel?: 'Northeast' | 'Midwest' | 'South' | 'West';
  dollarsPerDtiPercent?: number;
  className?: string;
}

export function DTIEnhancement({
  currentDTI,
  activeFactors,
  borrowingPowerChange,
  compensatingFactors,
  onUpdateFactors,
  onUpdateUserInputs,
  grossMonthlyIncome,
  regionLabel,
  dollarsPerDtiPercent,
  className = ""
}: DTIEnhancementProps) {
  const [localCashReserves, setLocalCashReserves] = useState(compensatingFactors.cashReserves || 0);
  const [showStep2, setShowStep2] = useState(false);
  const [familySizeInput, setFamilySizeInput] = useState<number | undefined>(undefined);
  const [monthlyTaxesInput, setMonthlyTaxesInput] = useState<number | undefined>(undefined);
  const [childcareInput, setChildcareInput] = useState<number | undefined>(undefined);

  // Sync local state with props changes
  useEffect(() => {
    setLocalCashReserves(compensatingFactors.cashReserves || 0);
  }, [compensatingFactors.cashReserves]);

  const currentDTIPercentage = (currentDTI * 100).toFixed(1);
  const dtiIncrease = ((currentDTI - DTI_CONSTANTS.baseDTI) * 100).toFixed(1);

  // Estimate per-factor dollar impact using store-provided $ per 1% DTI if available, else fall back
  const estimatedPerPercentLoanValue = (() => {
    if (typeof dollarsPerDtiPercent === 'number' && dollarsPerDtiPercent > 0) {
      return dollarsPerDtiPercent;
    }
    // Prefer global $ per 1% DTI if available via window event bridge (optional future improvement)
    const payment = compensatingFactors.projectedMonthlyPayment || 0;
    const sixMonths = payment * DTI_CONSTANTS.minCashReserveMonths;
    // Use current results context if available via borrowingPowerChange; fallback to heuristic
    if (borrowingPowerChange && borrowingPowerChange.maxLoanAmount > 0 && parseFloat(dtiIncrease) > 0) {
      return Math.round((borrowingPowerChange.difference / parseFloat(dtiIncrease)) * 100) / 100; // $ per 1% DTI
    }
    return Math.round((sixMonths / 20) || 0); // rough placeholder when no context
  })();

  const handleCashReservesChange = (value: number) => {
    setLocalCashReserves(value);
    onUpdateFactors({ cashReserves: value });
  };

  // Simplified factor checks
  const factorStatus = {
    cashReserves: activeFactors.some(f => f.id === 'cashReserves'),
    highFICO: activeFactors.some(f => f.id === 'highFICO'),
    largeDownPayment: activeFactors.some(f => f.id === 'largeDownPayment'),
    minimalPaymentIncrease: activeFactors.some(f => f.id === 'minimalPaymentIncrease'),
    residualIncome: activeFactors.some(f => f.id === 'residualIncome'),
    noDiscretionaryDebt: activeFactors.some(f => f.id === 'noDiscretionaryDebt')
  };

  if (!showStep2) {
    // Step 1: Main DTI Enhancement View
    return (
      <div className={`bg-gradient-to-br from-slate-900 via-slate-800/90 to-slate-900 border-slate-700/50 rounded-2xl p-8 ${className}`}>
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Boost Your Borrowing Power
            </h3>
            <p className="text-slate-300">
              Your DTI can increase from 43% to {currentDTIPercentage}% with these factors
            </p>
          </div>

          {/* Current DTI Progress */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-slate-400">DTI Capacity Used</span>
              <span className="text-2xl font-bold text-white">{currentDTIPercentage}%</span>
            </div>
            <DTIProgressBar 
              currentDTI={currentDTI}
              baseDTI={DTI_CONSTANTS.baseDTI}
              maxDTI={DTI_CONSTANTS.maxDTIWithFactors}
            />
            <div className="flex justify-between mt-3 text-sm">
              <span className="text-slate-500">Base: 43%</span>
              <span className="text-green-400">+{dtiIncrease}% from factors</span>
              <span className="text-slate-500">Max: 56.99%</span>
            </div>
          </div>

          {/* Active Factors Summary with per-factor $ impact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Automatic Factors */}
            <div className={`backdrop-blur-sm rounded-xl p-4 border transition-all duration-300 ${
              (factorStatus.highFICO || factorStatus.largeDownPayment || factorStatus.minimalPaymentIncrease)
                ? 'bg-gradient-to-br from-green-500/8 to-emerald-600/8 border-green-500/25 shadow-md shadow-green-500/5'
                : 'bg-slate-800/30 border-slate-700/50'
            }`}>
              <h4 className="text-sm font-medium text-slate-300 mb-3">Automatic Factors</h4>
              <div className="space-y-2">
                <div className={`flex items-center justify-between p-2 rounded-lg transition-all duration-200 ${
                  factorStatus.highFICO ? 'bg-green-500/10 border border-green-500/20' : 'hover:bg-slate-700/30'
                }`}>
                  <span className={`text-sm ${factorStatus.highFICO ? 'text-green-300' : 'text-slate-400'}`}>Credit Score 740+</span>
                  {factorStatus.highFICO ? (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-400" />
                      <span className="text-xs text-green-400 font-medium">+2% (~+${Math.round(estimatedPerPercentLoanValue * 2).toLocaleString()})</span>
                    </div>
                  ) : (
                    <X className="h-4 w-4 text-slate-600" />
                  )}
                </div>
                <div className={`flex items-center justify-between p-2 rounded-lg transition-all duration-200 ${
                  factorStatus.largeDownPayment ? 'bg-green-500/10 border border-green-500/20' : 'hover:bg-slate-700/30'
                }`}>
                  <span className={`text-sm ${factorStatus.largeDownPayment ? 'text-green-300' : 'text-slate-400'}`}>Down Payment 10%+</span>
                  {factorStatus.largeDownPayment ? (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-400" />
                      <span className="text-xs text-green-400 font-medium">+2% (~+${Math.round(estimatedPerPercentLoanValue * 2).toLocaleString()})</span>
                    </div>
                  ) : (
                    <X className="h-4 w-4 text-slate-600" />
                  )}
                </div>
                <div className={`flex items-center justify-between p-2 rounded-lg transition-all duration-200 ${
                  factorStatus.minimalPaymentIncrease ? 'bg-green-500/10 border border-green-500/20' : 'hover:bg-slate-700/30'
                }`}>
                  <span className={`text-sm ${factorStatus.minimalPaymentIncrease ? 'text-green-300' : 'text-slate-400'}`}>Low Payment Shock</span>
                  {factorStatus.minimalPaymentIncrease ? (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-400" />
                      <span className="text-xs text-green-400 font-medium">+2% (~+${Math.round(estimatedPerPercentLoanValue * 2).toLocaleString()})</span>
                    </div>
                  ) : (
                    <X className="h-4 w-4 text-slate-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Manual Factors */}
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <h4 className="text-sm font-medium text-slate-300 mb-3">Your Assets</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Cash Reserves</label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={localCashReserves || ""}
                    onChange={(e) => handleCashReservesChange(parseFloat(e.target.value) || 0)}
                    className="bg-slate-900/50 border-slate-700 text-white text-base px-3 py-2 rounded-lg"
                  />
                  {(() => {
                    const payment = compensatingFactors.projectedMonthlyPayment || 0;
                    const threshold = DTI_CONSTANTS.minCashReserveMonths * payment;
                    const months = payment > 0 ? (localCashReserves / payment) : 0;
                    const additionalNeeded = Math.max(0, threshold - (localCashReserves || 0));
                    return (
                      <div className="mt-2 space-y-1 text-xs">
                        <p className="text-slate-400">
                          Payment: <span className="text-slate-300">${payment.toLocaleString()}</span> · 6 months: <span className="text-slate-300">${Math.round(threshold).toLocaleString()}</span>
                        </p>
                        <p className="text-slate-400">
                          You have: <span className="text-slate-300">${(localCashReserves || 0).toLocaleString()}</span> (~{months.toFixed(1)} months)
                        </p>
                        {factorStatus.cashReserves ? (
                          <p className="text-green-400">✓ 6+ months achieved — +3% DTI (~+${Math.round(estimatedPerPercentLoanValue * 3).toLocaleString()})</p>
                        ) : (
                          <p className="text-amber-400">Add ${Math.round(additionalNeeded).toLocaleString()} to reach 6 months</p>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Residual Income Helper */}
                <div className="pt-2 border-t border-slate-700/40">
                  <label className="text-sm text-slate-400 mb-2 block">Monthly cash left after all bills</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Input
                      type="number"
                      placeholder="Household size"
                      value={familySizeInput ?? ''}
                      onChange={(e) => {
                        const v = parseInt(e.target.value || '0', 10) || 0
                        setFamilySizeInput(v)
                        onUpdateUserInputs?.({ familySize: v })
                      }}
                      className="bg-slate-900/50 border-slate-700 text-white text-base px-3 py-2 rounded-lg"
                    />
                    <Input
                      type="number"
                      placeholder="Monthly taxes (withholding)"
                      value={monthlyTaxesInput ?? ''}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value || '0') || 0
                        setMonthlyTaxesInput(v)
                        onUpdateUserInputs?.({ monthlyTaxes: v })
                      }}
                      className="bg-slate-900/50 border-slate-700 text-white text-base px-3 py-2 rounded-lg"
                    />
                    <Input
                      type="number"
                      placeholder="Childcare (optional)"
                      value={childcareInput ?? ''}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value || '0') || 0
                        setChildcareInput(v)
                        onUpdateUserInputs?.({ childcareExpense: v })
                      }}
                      className="bg-slate-900/50 border-slate-700 text-white text-base px-3 py-2 rounded-lg"
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                    <span>Region: <span className="text-slate-300">{regionLabel || 'Auto'}</span></span>
                    <button
                      type="button"
                      onClick={() => {
                        if (!grossMonthlyIncome) return
                        const est = Math.round(grossMonthlyIncome * 0.20)
                        setMonthlyTaxesInput(est)
                        onUpdateUserInputs?.({ monthlyTaxes: est })
                      }}
                      className="px-2 py-1 rounded-md bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 text-slate-300"
                    >
                      Quick estimate taxes
                    </button>
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    Use this to help qualify for the Residual Income factor.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Impact Summary */}
          {borrowingPowerChange && borrowingPowerChange.difference > 0 && (
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-6 border border-purple-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300 mb-1">DTI Factors Impact</p>
                  <p className="text-2xl font-bold text-white">
                    +{formatCurrency(borrowingPowerChange.difference)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-400" />
              </div>
            </div>
          )}

          {/* Quick Summary and clarity for discretionary debt note */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-xs text-slate-500 mb-1">Active Factors</p>
                <p className="text-xl font-bold text-white">{activeFactors.length} of 6</p>
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500 mb-1">DTI Boost</p>
                <p className="text-xl font-bold text-green-400">+{dtiIncrease}%</p>
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500 mb-1">Remaining</p>
                <p className="text-xl font-bold text-purple-400">
                  {((DTI_CONSTANTS.maxDTIWithFactors - currentDTI) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-400">
              Tip: Keeping revolving balances under 10% can increase borrowing power by roughly
              <span className="text-green-400"> ${Math.round(estimatedPerPercentLoanValue * 2).toLocaleString()}</span>.
            </div>
            {/* Top next steps */}
            {(() => {
              const activeIds = new Set(activeFactors.map(f => f.id))
              const allCandidates: Array<{id: string; name: string; dtiInc: number}> = [
                { id: 'cashReserves', name: 'Reach 6 months reserves', dtiInc: 3 },
                { id: 'residualIncome', name: 'Meet residual income', dtiInc: 2 },
                { id: 'minimalPaymentIncrease', name: 'Low payment shock', dtiInc: 2 },
                { id: 'noDiscretionaryDebt', name: 'Low revolving balances', dtiInc: 2 },
                { id: 'highFICO', name: 'Credit 740+', dtiInc: 2 },
                { id: 'largeDownPayment', name: '10%+ down', dtiInc: 2 },
              ]
              const missing = allCandidates.filter(c => !activeIds.has(c.id))
              const scored = missing.map(c => ({ ...c, dollars: Math.round(c.dtiInc * estimatedPerPercentLoanValue) }))
                .sort((a,b) => b.dollars - a.dollars)
                .slice(0,3)
              if (scored.length === 0) return null
              return (
                <div className="mt-3">
                  <p className="text-xs text-slate-500 mb-1">Most impactful next steps</p>
                  <ul className="text-sm text-slate-300 space-y-1">
                    {scored.map(s => (
                      <li key={s.id} className="flex items-center justify-between">
                        <span>• {s.name}</span>
                        <span className="text-green-400 font-medium">~+${s.dollars.toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })()}
          </div>

          {/* View Details Button */}
          <button
            onClick={() => setShowStep2(true)}
            className="w-full bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 py-3 rounded-xl transition-all duration-200 text-sm"
          >
            View All Factor Details →
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Detailed Factor View
  return (
    <div className={`bg-gradient-to-br from-slate-900 via-slate-800/90 to-slate-900 border-slate-700/50 rounded-2xl p-8 ${className}`}>
      <div className="space-y-6">
        {/* Header with Back */}
        <div>
          <button
            onClick={() => setShowStep2(false)}
            className="text-purple-400 hover:text-purple-300 text-sm mb-4 transition-colors"
          >
            ← Back to Summary
          </button>
          <h3 className="text-2xl font-bold text-white">
            All Compensating Factors
          </h3>
        </div>

        {/* Factor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              id: 'cashReserves',
              name: 'Cash Reserves',
              requirement: '6+ months of payments',
              active: factorStatus.cashReserves,
              boost: '+3%'
            },
            {
              id: 'highFICO',
              name: 'Excellent Credit',
              requirement: 'FICO score 740+',
              active: factorStatus.highFICO,
              boost: '+2%'
            },
            {
              id: 'largeDownPayment',
              name: 'Large Down Payment',
              requirement: '10% or more down',
              active: factorStatus.largeDownPayment,
              boost: '+2%'
            },
            {
              id: 'minimalPaymentIncrease',
              name: 'Low Payment Shock',
              requirement: 'New payment ≤ 5% above current housing cost',
              active: factorStatus.minimalPaymentIncrease,
              boost: '+2%'
            },
            {
              id: 'residualIncome',
              name: 'Residual Income',
              requirement: 'Sufficient after expenses',
              active: factorStatus.residualIncome,
              boost: '+2%'
            },
            {
              id: 'noDiscretionaryDebt',
              name: 'Limited Discretionary Debt',
              requirement: 'Mostly necessary debts',
              active: factorStatus.noDiscretionaryDebt,
              boost: '+2%'
            }
          ].map((factor) => (
            <div
              key={factor.id}
              className={`rounded-xl p-4 border transition-all duration-300 transform ${
                factor.active 
                  ? 'bg-gradient-to-br from-green-500/15 to-emerald-600/15 border-green-400/40 shadow-lg shadow-green-500/10 scale-[1.02]' 
                  : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/40 hover:border-slate-600/50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-white">{factor.name}</h4>
                <span className={`text-sm font-semibold ${
                  factor.active ? 'text-green-400' : 'text-slate-500'
                }`}>
                  {factor.boost}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">{factor.requirement}</p>
              <div className="flex items-center gap-2">
                {factor.active ? (
                  <>
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-green-400">Active</span>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 text-slate-600" />
                    <span className="text-xs text-slate-500">Not Met</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
          <p className="text-sm text-slate-300">
            <span className="font-medium text-white">How it works:</span> Each compensating factor that you meet 
            adds to your maximum allowed DTI ratio. With all factors, you can qualify with up to 56.99% DTI 
            instead of the standard 43%.
          </p>
        </div>
      </div>
    </div>
  );
}