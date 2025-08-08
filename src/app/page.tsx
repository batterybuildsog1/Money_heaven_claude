"use client";
import { useAuthActions, useAuthToken } from "@convex-dev/auth/react";
import Link from 'next/link';
import Image from 'next/image';
import { Calculator, TrendingUp, Shield, Home as HomeIcon, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { AuthDebug } from '../components/AuthDebug';

export default function Home() {
  const token = useAuthToken();
  // Important: undefined means loading, null means not authenticated
  // typeof null === 'object' in JavaScript, so we must check explicitly
  const isLoading = token === undefined;
  const isAuthenticated = token !== null && token !== undefined && typeof token === 'string';
  const { signIn, signOut } = useAuthActions();
  
  // Debug logging
  console.log('🏠 HOME PAGE AUTH STATE:', {
    token: token ? `${token.substring(0, 20)}...` : token,
    isLoading,
    isAuthenticated,
    tokenType: typeof token,
    timestamp: new Date().toISOString()
  });
  
  return (
    <div className="min-h-screen gradient-dark">
      <AuthDebug />
      {/* Header */}
      <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 gradient-purple rounded-lg">
                <HomeIcon className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">MoneyBucket</h1>
            </div>
            <div className="flex items-center space-x-4">
              {isLoading ? (
                // Show loading state or nothing while checking auth
                <div className="text-slate-400">Loading...</div>
              ) : !isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    className="text-slate-300 hover:text-white"
                    onClick={() => {
                      console.log('🔑 Sign In clicked');
                      void signIn("google", { redirectTo: "/calculator" }).then(() => {
                        console.log('✅ Sign in promise resolved');
                      }).catch((err) => {
                        console.error('❌ Sign in error:', err);
                      });
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="gradient-purple hover:opacity-90 text-white"
                    onClick={() => {
                      console.log('🔑 Sign Up clicked');
                      void signIn("google", { redirectTo: "/calculator" }).then(() => {
                        console.log('✅ Sign up promise resolved');
                      }).catch((err) => {
                        console.error('❌ Sign up error:', err);
                      });
                    }}
                  >
                    Sign Up
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/calculator">
                    <Button className="gradient-purple hover:opacity-90 text-white mr-4">Go to Calculator</Button>
                  </Link>
                  <Button variant="outline" onClick={() => {
                    console.log('🚪 Sign Out clicked');
                    void signOut().then(() => {
                      console.log('✅ Sign out complete');
                    }).catch((err) => {
                      console.error('❌ Sign out error:', err);
                    });
                  }}>Sign out</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        {/* Background Image Effect */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900/80" />
          <Image 
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&h=1080&fit=crop" 
            alt="Modern house"
            fill
            className="object-cover opacity-30 lg:object-right"
            priority
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-white">Buy the house </span>
              <span className="gradient-purple-text">they said<br />you couldn&apos;t.</span>
            </h2>
            <p className="text-xl lg:text-2xl text-slate-300 mb-8 leading-relaxed">
              Our FHA calculator helps you achieve homeownership, even when others say it&apos;s impossible.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              {isLoading ? null : !isAuthenticated ? (
                <Button
                  size="lg"
                  className="gradient-purple hover:opacity-90 text-white text-lg px-8 py-4 shadow-dark-xl glow-purple"
                  onClick={() => void signIn("google", { redirectTo: "/calculator" })}
                >
                  Sign Up for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <Link href="/calculator">
                  <Button size="lg" className="gradient-purple hover:opacity-90 text-white text-lg px-8 py-4 shadow-dark-xl glow-purple">
                    Start Calculating
                    <Calculator className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>

            {/* Key Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-purple-400" />
                </div>
                <span className="text-slate-300">Maximize your mortgage approval up to 56.99% DTI</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-purple-400" />
                </div>
                <span className="text-slate-300">Find compensating factors that boost your borrowing power</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-purple-400" />
                </div>
                <span className="text-slate-300">Get approved when traditional lenders say no</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              See how much <span className="gradient-purple-text">more house</span> you can afford
            </h3>
          </div>
          
          {/* Interactive Comparison */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-800 rounded-2xl p-8 shadow-dark-xl border border-slate-700">
              <div className="text-center mb-8">
                <p className="text-slate-400 mb-4">Based on $100,000 annual income</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="text-center p-6 bg-slate-900/50 rounded-xl">
                  <p className="text-slate-400 mb-2">Standard Lenders</p>
                  <p className="text-4xl font-bold text-slate-500">$326,077</p>
                  <p className="text-sm text-slate-500 mt-2">Max home price</p>
                </div>
                
                <div className="text-center p-6 bg-purple-900/20 rounded-xl border border-purple-800/30">
                  <p className="text-purple-400 mb-2">With MoneyBucket</p>
                  <p className="text-4xl font-bold gradient-purple-text">$417,481</p>
                  <p className="text-sm text-green-400 mt-2">↑ 28% more buying power</p>
                </div>
              </div>
              
              <div className="mt-8 flex justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-green-400">Standard mortgage approval</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 bg-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Why Choose Our Calculator?
            </h3>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Unlike basic calculators, we factor in real FHA guidelines and compensating factors to give you the most accurate borrowing power estimate.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="p-8 text-center bg-slate-900 border-slate-700 hover:border-purple-800 transition-all hover:shadow-dark-xl">
              <div className="w-16 h-16 gradient-purple rounded-full flex items-center justify-center mx-auto mb-6">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold mb-4 text-white">Advanced FHA Calculations</h4>
              <p className="text-slate-400 mb-4">
                Real FHA loan limits, MIP calculations, and DTI ratios based on current lending standards.
              </p>
              <ul className="text-sm text-slate-500 space-y-1">
                <li>✓ County-specific FHA limits</li>
                <li>✓ Accurate MIP calculations</li>
                <li>✓ Property tax estimates</li>
                <li>✓ Insurance estimates</li>
              </ul>
            </Card>

            {/* Feature 2 */}
            <Card className="p-8 text-center bg-slate-900 border-slate-700 hover:border-green-800 transition-all hover:shadow-dark-xl">
              <div className="w-16 h-16 gradient-green rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold mb-4 text-white">DTI Enhancement</h4>
              <p className="text-slate-400 mb-4">
                Boost your DTI from 43% to 56.99% with compensating factors that other calculators ignore.
              </p>
              <ul className="text-sm text-slate-500 space-y-1">
                <li>✓ Cash reserves evaluation</li>
                <li>✓ Credit score bonuses</li>
                <li>✓ Employment stability factors</li>
                <li>✓ Down payment benefits</li>
              </ul>
            </Card>

            {/* Feature 3 */}
            <Card className="p-8 text-center bg-slate-900 border-slate-700 hover:border-blue-800 transition-all hover:shadow-dark-xl">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold mb-4 text-white">Save & Compare</h4>
              <p className="text-slate-400 mb-4">
                Save multiple scenarios and compare different down payments, locations, and income levels.
              </p>
              <ul className="text-sm text-slate-500 space-y-1">
                <li>✓ Multiple saved scenarios</li>
                <li>✓ Quick comparison tools</li>
                <li>✓ Export calculations</li>
                <li>✓ Secure cloud storage</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              How It Works
            </h3>
            <p className="text-xl text-slate-400">
              Get your results in 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 gradient-purple text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold shadow-dark-lg">
                1
              </div>
              <h4 className="text-xl font-semibold mb-2 text-white">Enter Your Information</h4>
              <p className="text-slate-400">
                Income, credit score, location, down payment, and monthly debts
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 gradient-green text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold shadow-dark-lg">
                2
              </div>
              <h4 className="text-xl font-semibold mb-2 text-white">Optimize Your DTI</h4>
              <p className="text-slate-400">
                Add compensating factors to increase your borrowing capacity
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold shadow-dark-lg">
                3
              </div>
              <h4 className="text-xl font-semibold mb-2 text-white">Get Your Results</h4>
              <p className="text-slate-400">
                See your maximum loan amount, monthly payments, and save scenarios
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-purple text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Discover Your True Borrowing Power?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of home buyers who have used our calculator to maximize their loan amount.
          </p>
          
            {isLoading ? null : !isAuthenticated ? (
              <Button size="lg" className="bg-white text-purple-600 hover:bg-slate-100 text-lg px-8 py-4 shadow-dark-xl" onClick={() => void signIn("google", { redirectTo: "/calculator" })}>
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <Link href="/calculator">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-slate-100 text-lg px-8 py-4 shadow-dark-xl">
                Start Calculating Now
                <Calculator className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="p-2 gradient-purple rounded-lg">
                <HomeIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold">MoneyBucket</span>
            </div>
            <div className="text-sm text-slate-400">
              <p>© 2025 MoneyBucket. Educational tool only.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
