"use client";

import { useState } from "react";
import { useCalculatorStore } from "../../store/calculator";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card } from "../../components/ui/card";
import { Slider } from "../../components/ui/slider";
import { WizardStep } from "../../components/calculator/WizardStep";
import { CalculationSidebar } from "../../components/calculator/CalculationSidebar";
import { ComparisonCard } from "../../components/calculator/ComparisonCard";
import { DTIEnhancement } from "../../components/calculator/DTIEnhancement";
import { SavedScenarios } from "../../components/calculator/SavedScenarios";
import { BorrowingPowerNotificationContainer } from "../../components/calculator/BorrowingPowerNotification";
import { AnimatedCurrency } from "../../components/calculator/AnimatedCurrency";
import { RateDisplay } from "../../components/calculator/RateDisplay";
import { useScenarios } from "../../hooks/useScenarios";
import { MapPin, DollarSign, CreditCard, TrendingUp, FileText, Home } from "lucide-react";
import { getRegionFromStateAbbr } from "../../lib/regions";
import { useToast } from "../../components/ui/toast";
import { useAuthToken } from "@convex-dev/auth/react";
import { useMemo } from "react";

export default function CalculatorPage() {
  const token = useAuthToken();
  const isAuthenticated = useMemo(() => token !== null && token !== undefined, [token]);
  const { create: createScenario } = useScenarios();
  const {
    userInputs,
    updateUserInputs,
    results,
    previousResults,
    uiState,
    setUIState,
    calculateFHABorrowingPower,
    dtiProgressData,
    updateCompensatingFactors,
    compensatingFactors,
  } = useCalculatorStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [scenarioName, setScenarioName] = useState("");
  const [monthlyDebtsBreakdown, setMonthlyDebtsBreakdown] = useState({
    carPayment: 0,
    creditCard: 0,
    studentLoan: 0,
    rentPayment: 0,
    other: 0
  });
  const totalSteps = 4;
  const { success, error } = useToast();

  // Handle step navigation
  const handleNext = async () => {
    if (currentStep === totalSteps) {
      // Calculate on final step
      await calculateBorrowingPower();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateBorrowingPower = async () => {
    setIsCalculating(true);
    setUIState({ isCalculating: true });

    try {
      // First calculate FHA borrowing power to get max home price
      calculateFHABorrowingPower();
      
      // Then use calculated max home price for property tax and insurance
      const state = useCalculatorStore.getState();
      if (userInputs.location && state.results.maxHomePrice) {
        // Update homeValue with calculated max home price
        updateUserInputs({ homeValue: state.results.maxHomePrice });
        
        // Now calculate property tax and insurance
        await state.calculatePropertyTax();
        await state.calculateInsurance();
        
        // Recalculate with updated property tax and insurance
        calculateFHABorrowingPower();
      }
      
      setUIState({ showResults: true });
      success("Calculation complete");
    } finally {
      setIsCalculating(false);
      setUIState({ isCalculating: false });
    }
  };

  const handleLoadScenario = (scenario: any) => {
    updateUserInputs(scenario.inputs);
    updateCompensatingFactors(scenario.compensatingFactors);
    if (scenario.results) {
      setUIState({ showResults: true });
    }
  };

  // Validation for each step
  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return !!(userInputs.zipCode && userInputs.income && userInputs.fico);
      case 2:
        return userInputs.monthlyDebts !== undefined;
      case 3:
        return !!userInputs.downPaymentPercent;
      case 4:
        return true; // DTI enhancement is optional
      default:
        return false;
    }
  };

  const hasResults = !!(uiState.showResults && results.maxLoanAmount);

  if (token === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <p className="text-muted-foreground">Loading calculator...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Save Scenario Modal */}
      {showSaveModal && isAuthenticated && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-labelledby="save-scenario-title" aria-describedby="save-scenario-desc">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowSaveModal(false)}
            aria-hidden
          />
          <div
            className="absolute left-1/2 top-1/2 w-[92%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-4 shadow-xl"
            tabIndex={-1}
            onKeyDown={(e) => { if (e.key === 'Escape') setShowSaveModal(false); }}
          >
            <h3 id="save-scenario-title" className="mb-2 text-lg font-semibold">Save Scenario</h3>
            <p id="save-scenario-desc" className="mb-3 text-sm text-muted-foreground">Give this scenario a short name.</p>
            <Input
              autoFocus
              placeholder="e.g., Seattle 2025-06"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSaveModal(false)}>Cancel</Button>
              <Button
                disabled={!scenarioName.trim()}
                onClick={async () => {
                  try {
                    await createScenario({
                      inputs: userInputs,
                      compensatingFactors,
                      results,
                      name: scenarioName.trim(),
                    });
                    setShowSaveModal(false);
                    setScenarioName("");
                    success("Scenario saved");
                  } catch (err) {
                    console.error("Failed to save scenario:", err);
                    error("Save failed");
                  }
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Borrowing Power Notifications */}
      <BorrowingPowerNotificationContainer />
      
      {/* Header removed; using global NavBar */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Hero Section */}
        {!hasResults && (
              <div className="text-center mb-10 animate-fade-in">
             <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
               Calculate Your <span className="gradient-steel-text">FHA Borrowing Power</span>
            </h1>
            <p className="text-xl lg:text-2xl text-slate-300 max-w-3xl mx-auto">
              Discover how much home you can really afford with FHA loans and compensating factors
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="xl:col-span-8">
            {!hasResults ? (
              <>
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <WizardStep
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                    stepTitle="Basic Information"
                    stepDescription="Let's start with some basic details about you and your location"
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    isValid={isStepValid(1)}
                  >
                    <div className="space-y-8">
                      <div>
                        <label className="block text-base font-medium mb-3 text-slate-200">
                          <MapPin className="inline h-4 w-4 mr-2 text-sky-400" />
                          ZIP Code
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g., 90210"
                          value={userInputs.zipCode || ""}
                          onChange={(e) => updateUserInputs({ zipCode: e.target.value })}
                           className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 text-white text-lg px-4 py-3 rounded-xl hover:border-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
                           aria-invalid={!userInputs.zipCode ? true : undefined}
                           aria-describedby={!userInputs.zipCode ? 'zip-hint' : undefined}
                        />
                        {!userInputs.zipCode && (
                          <p id="zip-hint" className="mt-2 text-sm text-amber-400">ZIP code is required.</p>
                        )}
                        <p className="text-sm text-slate-400 mt-2">We&apos;ll use this to determine property taxes and insurance for your area</p>
                      </div>
                      
                      <div>
                        <label className="block text-base font-medium mb-3 text-slate-200">
                          <DollarSign className="inline h-4 w-4 mr-2 text-sky-400" />
                          Annual Income
                        </label>
                        <Input
                          type="number"
                          placeholder="e.g., 75000"
                          value={userInputs.income || ""}
                          onChange={(e) => updateUserInputs({ income: parseFloat(e.target.value) || 0 })}
                           className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 text-white text-lg px-4 py-3 rounded-xl hover:border-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
                           aria-invalid={!userInputs.income ? true : undefined}
                           aria-describedby={!userInputs.income ? 'income-hint' : undefined}
                        />
                        {!userInputs.income && (
                          <p id="income-hint" className="mt-2 text-sm text-amber-400">Annual income is required.</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-base font-medium mb-3 text-slate-200">
                          <CreditCard className="inline h-4 w-4 mr-2 text-sky-400" />
                          Credit Score (FICO)
                        </label>
                        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                          <div className="flex items-center justify-between mb-4">
                            <Input
                              type="number"
                              placeholder="e.g., 680"
                              min="300"
                              max="850"
                              value={userInputs.fico || ""}
                              onChange={(e) => updateUserInputs({ fico: parseFloat(e.target.value) || 0 })}
                              className="w-32 bg-slate-900/50 border-slate-700 text-white text-xl font-semibold px-4 py-2 rounded-lg"
                              aria-invalid={!userInputs.fico ? true : undefined}
                              aria-describedby={!userInputs.fico ? 'fico-hint' : undefined}
                            />
                             <span className={`text-base font-medium px-3 py-1 rounded-lg ${
                              (userInputs.fico || 0) >= 740 ? 'bg-green-500/20 text-green-400' :
                              (userInputs.fico || 0) >= 670 ? 'bg-yellow-500/20 text-yellow-400' :
                              (userInputs.fico || 0) >= 580 ? 'bg-orange-500/20 text-orange-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {(userInputs.fico || 0) >= 740 ? 'Excellent' :
                               (userInputs.fico || 0) >= 670 ? 'Good' :
                               (userInputs.fico || 0) >= 580 ? 'FHA Eligible' :
                               'Needs 10% Down'}
                            </span>
                          </div>
                          <Slider
                            value={[userInputs.fico || 580]}
                            onValueChange={(value) => updateUserInputs({ fico: value[0] })}
                            min={300}
                            max={850}
                            step={10}
                            className="w-full"
                          />
                          <div className="flex justify-between mt-2 text-xs text-slate-500">
                            <span>300</span>
                            <span>580</span>
                            <span>670</span>
                            <span>740</span>
                            <span>850</span>
                          </div>
                          {!userInputs.fico && (
                            <p id="fico-hint" className="mt-3 text-sm text-amber-400">FICO score is required.</p>
                          )}
                        </div>
                      </div>

                    {/* Current Rent */}
                    <div>
                      <label className="block text-base font-medium mb-3 text-slate-200">
                        <Home className="inline h-4 w-4 mr-2 text-sky-400" />
                        Current Monthly Rent
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g., 1200"
                        value={monthlyDebtsBreakdown.rentPayment}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          setMonthlyDebtsBreakdown(prev => ({ ...prev, rentPayment: value }));
                          updateUserInputs({ currentHousingPayment: value });
                        }}
                         className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 text-white text-lg px-4 py-3 rounded-xl hover:border-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
                      />
                      <p className="text-sm text-slate-400 mt-2">We&apos;ll compare this to your potential mortgage payment</p>
                    </div>
                    </div>
                  </WizardStep>
                )}

                {/* Step 2: Monthly Debts */}
                {currentStep === 2 && (
                  <WizardStep
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                    stepTitle="Monthly Debt Payments"
                    stepDescription="Tell us about your current monthly obligations"
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    isValid={isStepValid(2)}
                  >
                    <div className="space-y-8">
                      <div>
                        <label className="block text-base font-medium mb-3 text-slate-200">
                           <CreditCard className="inline h-4 w-4 mr-2 text-sky-400" />
                          Monthly Debt Payments
                        </label>
                        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <label className="text-sm text-slate-300">Car Payment</label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={monthlyDebtsBreakdown.carPayment}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 0;
                                  setMonthlyDebtsBreakdown(prev => ({ ...prev, carPayment: value }));
                                  const total = value + monthlyDebtsBreakdown.creditCard + monthlyDebtsBreakdown.studentLoan + monthlyDebtsBreakdown.other;
                                  updateUserInputs({ monthlyDebts: total });
                                }}
                                className="w-32 bg-slate-900/50 border-slate-700 text-white text-base px-3 py-2 rounded-lg"
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <label className="text-sm text-slate-300">Credit Cards</label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={monthlyDebtsBreakdown.creditCard}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 0;
                                  setMonthlyDebtsBreakdown(prev => ({ ...prev, creditCard: value }));
                                  const total = monthlyDebtsBreakdown.carPayment + value + monthlyDebtsBreakdown.studentLoan + monthlyDebtsBreakdown.other;
                                  updateUserInputs({ monthlyDebts: total });
                                }}
                                className="w-32 bg-slate-900/50 border-slate-700 text-white text-base px-3 py-2 rounded-lg"
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <label className="text-sm text-slate-300">Student Loans</label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={monthlyDebtsBreakdown.studentLoan}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 0;
                                  setMonthlyDebtsBreakdown(prev => ({ ...prev, studentLoan: value }));
                                  const total = monthlyDebtsBreakdown.carPayment + monthlyDebtsBreakdown.creditCard + value + monthlyDebtsBreakdown.other;
                                  updateUserInputs({ monthlyDebts: total });
                                }}
                                className="w-32 bg-slate-900/50 border-slate-700 text-white text-base px-3 py-2 rounded-lg"
                              />
                            </div>
                            
<div className="flex items-center justify-between">
                              <label className="text-sm text-slate-300">Other Debts</label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={monthlyDebtsBreakdown.other}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 0;
                                  setMonthlyDebtsBreakdown(prev => ({ ...prev, other: value }));
                                  const total = monthlyDebtsBreakdown.carPayment + monthlyDebtsBreakdown.creditCard + monthlyDebtsBreakdown.studentLoan + value;
                                  updateUserInputs({ monthlyDebts: total });
                                }}
                                className="w-32 bg-slate-900/50 border-slate-700 text-white text-base px-3 py-2 rounded-lg"
                              />
                            </div>
                            
                            <div className="pt-3 border-t border-slate-700/50">
                              <div className="flex items-center justify-between">
                                <label className="text-base font-medium text-slate-200">Total Monthly Debts</label>
                                 <span className="text-lg font-semibold text-sky-400">
                                  ${(userInputs.monthlyDebts || 0).toLocaleString()}
                                </span>
                              </div>
                               {userInputs.monthlyDebts === undefined && (
                                 <p id="debts-hint" className="mt-2 text-sm text-amber-400">Please enter any monthly debts or 0 if none.</p>
                               )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </WizardStep>
                )}

                {/* Step 3: Down Payment */}
                {currentStep === 3 && (
                  <WizardStep
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                    stepTitle="Down Payment"
                    stepDescription="Choose your down payment percentage"
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    isValid={isStepValid(3)}
                  >
                    <div className="space-y-8">
                      <div>
                        <label className="block text-base font-medium mb-3 text-slate-200">
                          <DollarSign className="inline h-4 w-4 mr-2 text-sky-400" />
                          Down Payment Percentage
                        </label>
                        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                          <div className="flex items-center justify-between mb-4">
                            <div className="text-3xl font-bold text-white">
                              {(userInputs.downPaymentPercent || 3.5).toFixed(1)}%
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-slate-400">FHA Minimum</p>
                              <p className="text-lg font-semibold text-sky-400">3.5%</p>
                            </div>
                          </div>
                          <Slider
                            value={[userInputs.downPaymentPercent || 3.5]}
                            onValueChange={(value) => updateUserInputs({ downPaymentPercent: value[0] })}
                            min={3.5}
                            max={30}
                            step={0.5}
                             className="w-full [&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-sky-500 [&_[role=slider]]:to-blue-500 [&_[role=slider]]:shadow-lg [&_[role=slider]]:ring-2 [&_[role=slider]]:ring-sky-500/20"
                          />
                          <div className="flex justify-between mt-2 text-xs text-slate-500">
                            <span>3.5%</span>
                            <span>10%</span>
                            <span>15%</span>
                            <span>20%</span>
                            <span>30%</span>
                          </div>
                          <div className="mt-4 p-3 bg-slate-900/50 rounded-lg">
                            <p className="text-sm text-slate-400">
                              {(userInputs.downPaymentPercent || 3.5) >= 20 ? 
                                "✨ Excellent! No PMI required with 20%+ down" :
                                (userInputs.downPaymentPercent || 3.5) >= 10 ?
                                "💪 Great! Lower MIP rates with 10%+ down" :
                                (userInputs.downPaymentPercent || 3.5) >= 5 ?
                                "👍 Good! Competitive rates available" :
                                "✓ FHA minimum down payment - perfect for first-time buyers"
                              }
                            </p>
                          </div>
                          {!userInputs.downPaymentPercent && (
                            <p id="down-hint" className="mt-3 text-sm text-amber-400">Please choose a down payment percentage.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </WizardStep>
                )}

                {/* Step 4: DTI Enhancement */}
                {currentStep === 4 && (
                  <WizardStep
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                    stepTitle="Optimize Your DTI"
                    stepDescription="Add compensating factors to increase your borrowing power"
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    isValid={true}
                    showResults={isCalculating}
                  >
                      {dtiProgressData ? (
                      <DTIEnhancement
                        currentDTI={dtiProgressData.currentDTI}
                        maxAllowedDTI={dtiProgressData.maxDTI}
                        activeFactors={dtiProgressData.activeFactors}
                        compensatingFactors={{
                          ...compensatingFactors,
                          projectedMonthlyPayment: results.totalMonthlyPayment || 0
                        }}
                        onUpdateFactors={updateCompensatingFactors}
                          onUpdateUserInputs={updateUserInputs}
                          grossMonthlyIncome={(userInputs.income || 0) / 12}
                          regionLabel={(() => {
                            // Prefer parsing state from the enriched location string (zip, county, ST)
                            const abbr = userInputs.location?.match(/\b([A-Z]{2})\b/)
                            return getRegionFromStateAbbr(abbr?.[1] || undefined)
                          })() || undefined}
                          dollarsPerDtiPercent={dtiProgressData?.dollarsPerDtiPercent}
                      />
                    ) : (
                      <div className="text-center py-8 text-slate-400">
                        <TrendingUp className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                        <p>Complete previous steps to see DTI enhancement options</p>
                      </div>
                    )}
                     {/* AUS advisory banner when DTI > 50% */}
                     {results.debtToIncomeRatio && results.debtToIncomeRatio > 50 && (
                       <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-amber-300">
                         Above 50% DTI typically requires AUS approval. Our 50–56.99% DTI is an estimate; consult a loan officer for exact limits.
                       </div>
                     )}
                  </WizardStep>
                )}
              </>
            ) : (
              /* Results Display */
              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-slate-900 via-slate-800/90 to-slate-900 border-slate-700/50 p-8 shadow-2xl backdrop-blur-sm rounded-2xl">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                      Your FHA Borrowing Power
                    </h2>
                    <div className="mb-4">
                       <AnimatedCurrency
                        value={results.maxLoanAmount || 0}
                        previousValue={previousResults?.maxLoanAmount}
                         className="text-6xl lg:text-7xl font-bold gradient-steel-text"
                        showFloatingChange={true}
                        animationDuration={1000}
                      />
                    </div>
                    <p className="text-xl lg:text-2xl text-slate-300">
                      Maximum Loan Amount
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 border border-slate-700/50">
                      <p className="text-base text-slate-400 mb-2">Max Home Price</p>
                      <AnimatedCurrency
                        value={results.maxHomePrice || 0}
                        previousValue={previousResults?.maxHomePrice}
                        className="text-3xl font-bold text-white"
                        showFloatingChange={false}
                        animationDuration={600}
                      />
                    </div>
                    
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 border border-slate-700/50">
                      <p className="text-base text-slate-400 mb-2">Monthly Payment</p>
                      <AnimatedCurrency
                        value={results.totalMonthlyPayment || 0}
                        previousValue={previousResults?.totalMonthlyPayment}
                        className="text-3xl font-bold text-white"
                        showFloatingChange={false}
                        animationDuration={600}
                      />
                    </div>
                    
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 border border-slate-700/50">
                      <p className="text-base text-slate-400 mb-2">DTI Used</p>
                       <p className="text-3xl font-bold text-sky-400">
                        {(results.debtToIncomeRatio || 0).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-center gap-4">
                    <Button
                      onClick={() => {
                        setCurrentStep(1);
                        setUIState({ showResults: false });
                      }}
                      variant="outline"
                      className="bg-slate-800/50 border-slate-700/50 text-white hover:bg-slate-700/50 px-6 py-3 text-base rounded-xl transition-all duration-200"
                    >
                      Adjust Inputs
                    </Button>
                    
                    <Button
                      onClick={() => {
                        setScenarioName(`${userInputs.location || 'Scenario'} - ${new Date().toLocaleDateString()}`);
                        setShowSaveModal(true);
                      }}
                      className="bg-primary text-primary-foreground hover:opacity-90 px-6 py-3 text-base rounded-xl shadow transition-all duration-200"
                    >
                      Save Scenario
                    </Button>
                  </div>
                </Card>
                
                {/* Comparison Card - Standard Lenders (45% DTI) vs MoneyBucket (achieved DTI) */}
                <ComparisonCard
                  standardAmount={Math.round((results.maxHomePrice || 0) * (45 / (results.debtToIncomeRatio || 50)))}
                  enhancedAmount={results.maxHomePrice || 0}
                  income={userInputs.income}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-4 space-y-4">
            {/* Always show rate display */}
            <RateDisplay />
            
            {/* Show calculation sidebar when we have inputs */}
            {userInputs.income && userInputs.fico ? (
              <CalculationSidebar />
            ) : (
              /* Saved Scenarios */
              isAuthenticated ? (
                <Card className="bg-gradient-to-br from-slate-900 via-slate-800/90 to-slate-900 border-slate-700/50 p-6 shadow-2xl backdrop-blur-sm rounded-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-sky-500/20 rounded-lg">
                      <FileText className="h-5 w-5 text-sky-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Saved Scenarios</h3>
                  </div>
                  <SavedScenarios onLoadScenario={handleLoadScenario} />
                </Card>
              ) : (
                <Card className="bg-gradient-to-br from-slate-900 via-slate-800/90 to-slate-900 border-slate-700/50 p-6 shadow-2xl backdrop-blur-sm rounded-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-sky-500/20 rounded-lg">
                      <FileText className="h-5 w-5 text-sky-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Log In to View Scenarios</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Log in to load and manage your saved calculations.</p>
                </Card>
              )
            )}
          </div>
        </div>
      </div>

      {/* Sticky mobile CTA */}
      {!hasResults && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-slate-900/80 backdrop-blur md:hidden" role="region" aria-label="Step actions">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="bg-slate-800 border-slate-700 text-white"
              aria-disabled={currentStep === 1}
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={!isStepValid(currentStep) || isCalculating}
              className={`${isStepValid(currentStep) ? 'gradient-steel' : 'bg-slate-700 text-slate-400'} text-white`}
              aria-disabled={!isStepValid(currentStep) || isCalculating}
            >
              {currentStep === totalSteps ? (isCalculating ? 'Calculating…' : 'View Results') : 'Next'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}