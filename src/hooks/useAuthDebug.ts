"use client";

import { useEffect } from "react";
import { useAuthToken } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useAuthDebug() {
  const token = useAuthToken();
  
  // Try to get auth state from Convex
  const isAuthenticated = useQuery(api.auth.isAuthenticated);
  
  useEffect(() => {
    // Log every state change
    console.log('🔐 Auth Debug Hook:', {
      token: token ? 'EXISTS' : token,
      tokenType: typeof token,
      isUndefined: token === undefined,
      isNull: token === null,
      convexIsAuthenticated: isAuthenticated,
      convexAuthType: typeof isAuthenticated,
      timestamp: new Date().toISOString(),
    });
    
    // Check WebSocket connection
    if (typeof window !== 'undefined') {
      const ws = (window as any).__convexWebSocket;
      if (ws) {
        const states: Record<number, string> = {
          0: 'CONNECTING',
          1: 'OPEN',
          2: 'CLOSING',
          3: 'CLOSED'
        };
        console.log('🌐 WebSocket State:', ws.readyState, states[ws.readyState] || 'UNKNOWN');
      }
    }
    
    // Check for auth-related cookies
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';').map(c => c.trim());
      const authCookies = cookies.filter(c => 
        c.includes('auth') || 
        c.includes('convex') || 
        c.includes('session')
      );
      console.log('🍪 Auth Cookies:', authCookies.length > 0 ? authCookies : 'NONE');
    }
    
    // Check localStorage
    if (typeof window !== 'undefined') {
      const authKeys = Object.keys(localStorage).filter(k => 
        k.includes('auth') || 
        k.includes('convex')
      );
      console.log('💾 LocalStorage Auth Keys:', authKeys.length > 0 ? authKeys : 'NONE');
    }
  }, [token, isAuthenticated]);
  
  return { token, isAuthenticated };
}