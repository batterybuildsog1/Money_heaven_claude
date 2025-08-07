import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency values
export function formatCurrency(amount: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options,
  }).format(amount);
}

// Format percentage values
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Format large numbers with abbreviations (K, M, B)
export function formatNumber(num: number): string {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + 'B';
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M';
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K';
  }
  return num.toString();
}

// Validation utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

export function validateZipCode(zipCode: string): boolean {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zipCode);
}

// Financial calculation utilities
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  years: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;
  
  if (monthlyRate === 0) return principal / numberOfPayments;
  
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  );
}

export function calculatePMI(loanAmount: number, homeValue: number, ficoScore: number): number {
  const ltv = (loanAmount / homeValue) * 100;
  
  // No PMI if LTV is 80% or less
  if (ltv <= 80) return 0;
  
  // PMI rates based on credit score and LTV
  let pmiRate = 0.005; // Default 0.5%
  
  if (ficoScore >= 760) {
    pmiRate = 0.003; // 0.3%
  } else if (ficoScore >= 740) {
    pmiRate = 0.0035; // 0.35%
  } else if (ficoScore >= 720) {
    pmiRate = 0.004; // 0.4%
  } else if (ficoScore >= 700) {
    pmiRate = 0.0045; // 0.45%
  } else if (ficoScore >= 680) {
    pmiRate = 0.005; // 0.5%
  } else if (ficoScore >= 660) {
    pmiRate = 0.006; // 0.6%
  } else {
    pmiRate = 0.007; // 0.7%
  }
  
  return (loanAmount * pmiRate) / 12; // Monthly PMI
}

export function calculateDebtToIncomeRatio(
  monthlyDebt: number,
  monthlyIncome: number
): number {
  return (monthlyDebt / monthlyIncome) * 100;
}

export function calculateMaxLoanAmount(
  monthlyIncome: number,
  monthlyDebts: number,
  interestRate: number,
  loanTermYears: number = 30,
  maxDTI: number = 43
): number {
  const maxMonthlyPayment = (monthlyIncome * (maxDTI / 100)) - monthlyDebts;
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTermYears * 12;
  
  if (monthlyRate === 0) return maxMonthlyPayment * numberOfPayments;
  
  return (
    maxMonthlyPayment *
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1) /
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))
  );
}

// Interest rate estimation based on credit score
export function estimateInterestRate(ficoScore: number, loanType: string = 'conventional'): number {
  let baseRate = 7.0; // Current market average
  
  // Adjust based on credit score
  if (ficoScore >= 760) {
    baseRate -= 0.5;
  } else if (ficoScore >= 740) {
    baseRate -= 0.25;
  } else if (ficoScore >= 720) {
    baseRate += 0;
  } else if (ficoScore >= 700) {
    baseRate += 0.25;
  } else if (ficoScore >= 680) {
    baseRate += 0.5;
  } else if (ficoScore >= 660) {
    baseRate += 0.75;
  } else {
    baseRate += 1.0;
  }
  
  // Adjust based on loan type
  switch (loanType.toLowerCase()) {
    case 'fha':
      baseRate += 0.25;
      break;
    case 'va':
      baseRate -= 0.25;
      break;
    case 'usda':
      baseRate -= 0.125;
      break;
    default: // conventional
      break;
  }
  
  return Math.max(baseRate, 3.0); // Minimum rate floor
}

// Date utilities
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  
  return formatDate(timestamp);
}

// Debounce utility for search/input
export function debounce<T extends (...args: unknown[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Generate unique IDs
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Local storage utilities with error handling
export function setStorageItem(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}

export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn('Failed to read from localStorage:', error);
    return defaultValue;
  }
}

export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to remove from localStorage:', error);
  }
}
