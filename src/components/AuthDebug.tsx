"use client";

import { useAuthToken, useAuthActions } from "@convex-dev/auth/react";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function AuthDebug() {
  const token = useAuthToken();
  const { signIn, signOut } = useAuthActions();
  const serverAuth = useQuery(api.authDebug.checkAuth);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [signInAttempts, setSignInAttempts] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    const info = {
      tokenValue: token,
      tokenType: typeof token,
      isUndefined: token === undefined,
      isNull: token === null,
      isString: typeof token === 'string',
      tokenLength: typeof token === 'string' ? token.length : 'N/A',
      tokenPreview: typeof token === 'string' ? token.substring(0, 20) + '...' : 'N/A',
      timestamp: new Date().toISOString(),
      convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL,
      currentUrl: typeof window !== 'undefined' ? window.location.href : 'N/A',
      cookies: typeof document !== 'undefined' ? document.cookie : 'N/A',
      localStorage: typeof window !== 'undefined' ? {
        hasConvexAuth: !!localStorage.getItem('convexAuthToken'),
        keys: Object.keys(localStorage).filter(k => k.includes('convex') || k.includes('auth'))
      } : 'N/A',
      serverAuth: serverAuth || 'Loading...'
    };
    
    setDebugInfo(info);
    console.log('🔍 AUTH DEBUG:', info);
    console.log('🖥️ SERVER AUTH:', serverAuth);
  }, [token, serverAuth]);

  const handleSignIn = async () => {
    console.log('🚀 Starting sign in...');
    setSignInAttempts(prev => prev + 1);
    setLastError(null);
    
    try {
      await signIn("google", {
        redirectTo: window.location.href
      });
      console.log('✅ Sign in initiated');
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      setLastError(error?.message || 'Unknown error');
    }
  };

  const handleSignOut = async () => {
    console.log('🚪 Starting sign out...');
    try {
      await signOut();
      console.log('✅ Sign out complete');
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      setLastError(error?.message || 'Unknown error');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/90 text-white p-4 rounded-lg max-w-md text-xs font-mono">
      <div className="mb-2 font-bold text-yellow-400">🔍 AUTH DEBUG PANEL</div>
      
      <div className="space-y-1">
        <div>Token State: {
          token === undefined ? '⏳ LOADING' : 
          token === null ? '❌ NOT AUTHENTICATED' : 
          '✅ AUTHENTICATED'
        }</div>
        <div>Token Type: {typeof token}</div>
        <div>Token Length: {debugInfo.tokenLength}</div>
        <div>Token Preview: {debugInfo.tokenPreview}</div>
        <div>Sign In Attempts: {signInAttempts}</div>
        {lastError && <div className="text-red-400">Last Error: {lastError}</div>}
        <div>Convex URL: {debugInfo.convexUrl?.substring(0, 40)}...</div>
        <div>Current URL: {debugInfo.currentUrl?.substring(0, 40)}...</div>
        <div>Has Cookies: {debugInfo.cookies ? 'Yes' : 'No'}</div>
        <div>LocalStorage Keys: {JSON.stringify(debugInfo.localStorage?.keys || [])}</div>
        <div className="mt-2 border-t pt-2">
          <div className="text-yellow-400">Server Auth Check:</div>
          <div>Server Authenticated: {serverAuth?.isAuthenticated ? '✅ YES' : '❌ NO'}</div>
          <div>Server User ID: {serverAuth?.userId || 'None'}</div>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button 
          onClick={handleSignIn}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
        >
          Test Sign In
        </button>
        <button 
          onClick={handleSignOut}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white"
        >
          Test Sign Out
        </button>
        <button 
          onClick={() => window.location.reload()}
          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-white"
        >
          Reload
        </button>
      </div>

      <div className="mt-2 text-[10px] text-gray-400">
        Check console for detailed logs
      </div>
    </div>
  );
}