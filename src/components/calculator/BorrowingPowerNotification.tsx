"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

interface BorrowingPowerNotificationProps {
  amount: number
  factorName: string
  percentChange: number
  direction: 'increase' | 'decrease'
}

export function BorrowingPowerNotification({ 
  amount, 
  factorName, 
  percentChange,
  direction = 'increase'
}: BorrowingPowerNotificationProps) {
  const [isVisible, setIsVisible] = React.useState(true)
  const [isAnimating, setIsAnimating] = React.useState(false)

  React.useEffect(() => {
    // Start animation after mount
    const timeout = setTimeout(() => {
      setIsAnimating(true)
    }, 100)

    // Hide after animation completes
    const hideTimeout = setTimeout(() => {
      setIsVisible(false)
    }, 4500)

    return () => {
      clearTimeout(timeout)
      clearTimeout(hideTimeout)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div
      className={cn(
        "fixed z-50 pointer-events-none transition-all duration-[1500ms] transform",
        isAnimating ? "translate-y-[-120px] opacity-0" : "translate-y-0 opacity-100"
      )}
      style={{
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) ${isAnimating ? 'translateY(-100px)' : ''}`,
      }}
    >
      <div className={cn(
        "text-white px-8 py-4 rounded-2xl shadow-2xl",
        direction === 'increase' 
          ? "bg-gradient-to-r from-green-500 to-emerald-500"
          : "bg-gradient-to-r from-red-500 to-rose-500"
      )}>
        <div className="flex items-center gap-3">
          {direction === 'increase' ? (
            <TrendingUp className="h-8 w-8 animate-pulse" />
          ) : (
            <TrendingDown className="h-8 w-8 animate-pulse" />
          )}
          <div>
            <div className="text-3xl font-bold">
              {direction === 'increase' ? '+' : '-'}${Math.abs(amount).toLocaleString()}
            </div>
            <div className="text-sm opacity-90">
              {factorName} {percentChange > 0 && `(${direction === 'increase' ? '+' : '-'}${percentChange}% DTI)`}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Container to manage multiple notifications
interface NotificationData {
  id: string
  amount: number
  factorName: string
  percentChange: number
  direction: 'increase' | 'decrease'
}

export function BorrowingPowerNotificationContainer() {
  const [notifications, setNotifications] = React.useState<NotificationData[]>([])

  // Subscribe to store changes for compensating factors and input changes
  React.useEffect(() => {
    // Handle compensating factor changes
    const handleFactorActivated = (event: CustomEvent) => {
      const factor = event.detail;
      const notification: NotificationData = {
        id: `${Date.now()}-${Math.random()}`,
        amount: factor.borrowingPowerIncrease,
        factorName: factor.name,
        percentChange: factor.dtiIncrease * 100,
        direction: 'increase'
      }
      
      setNotifications(prev => [...prev, notification])
      
      // Remove notification after animation
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id))
      }, 3500)
    }
    
    // Handle input changes (income, FICO, debt)
    const handleInputChange = (event: CustomEvent) => {
      const change = event.detail;
      const notification: NotificationData = {
        id: `${Date.now()}-${Math.random()}`,
        amount: change.borrowingPowerChange,
        factorName: change.displayName,
        percentChange: 0, // Input changes don't affect DTI percentage directly
        direction: change.direction
      }
      
      setNotifications(prev => [...prev, notification])
      
      // Remove notification after animation
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id))
      }, 3500)
    }

    // Listen for custom events from the store
    window.addEventListener('borrowingPowerIncrease', handleFactorActivated as any)
    window.addEventListener('borrowingPowerChange', handleInputChange as any)
    
    return () => {
      window.removeEventListener('borrowingPowerIncrease', handleFactorActivated as any)
      window.removeEventListener('borrowingPowerChange', handleInputChange as any)
    }
  }, [])

  return (
    <>
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{
            position: 'fixed',
            top: `${50 + index * 120}%`,
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 50 + index
          }}
        >
          <BorrowingPowerNotification
            amount={notification.amount}
            factorName={notification.factorName}
            percentChange={notification.percentChange}
            direction={notification.direction}
          />
        </div>
      ))}
    </>
  )
}