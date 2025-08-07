"use client";

import { useMortgageRates, useRateErrorState } from "../../hooks/useMortgageRates";
import { Clock, AlertTriangle, CheckCircle, Wifi, WifiOff } from "lucide-react";

export function RateDisplay({ className = "" }: { className?: string }) {
  const { rate, source, lastUpdated, wasFallbackUsed, isLoading } = useMortgageRates();
  const { hasError, errorMessage, errorType } = useRateErrorState();
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getSourceDisplayName = (source: string) => {
    switch (source) {
      case 'mortgagenewsdaily':
        return 'Mortgage News Daily';
      case 'xai':
        return 'AI Search (Backup)';
      case 'manual':
        return 'Manual Entry';
      case 'default':
        return 'System Default';
      default:
        return source;
    }
  };
  
  const getStatusIcon = () => {
    if (isLoading) {
      return <div className="animate-spin h-4 w-4 border-2 border-purple-500 rounded-full border-t-transparent" />;
    }
    
    if (wasFallbackUsed) {
      return <WifiOff className="h-4 w-4 text-yellow-500" />;
    }
    
    if (hasError) {
      return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
    }
    
    return <Wifi className="h-4 w-4 text-green-400" />;
  };
  
  return (
    <div className={`bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-400">Current FHA Rate</span>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
        </div>
      </div>
      
      <div className="text-2xl font-bold text-white mb-1">
        {rate.toFixed(3)}%
      </div>
      
      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
        <span>Source: {getSourceDisplayName(source)}</span>
        {!isLoading && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(lastUpdated)}
          </span>
        )}
      </div>
      
      {/* Visible Error Messages */}
      {hasError && errorMessage && (
        <div className={`mt-2 p-2 rounded text-xs border ${
          errorType === 'fallback' 
            ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
            : errorType === 'stale'
            ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
            : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
        }`}>
          <div className="flex items-start gap-2">
            {errorType === 'fallback' && <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />}
            <span>{errorMessage}</span>
          </div>
        </div>
      )}
      
      {/* Additional info for fallback usage */}
      {wasFallbackUsed && (
        <div className="mt-1 text-xs text-slate-500">
          Primary rate source unavailable. Using backup data source.
        </div>
      )}
    </div>
  );
}
