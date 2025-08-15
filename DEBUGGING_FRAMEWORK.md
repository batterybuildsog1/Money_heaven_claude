# Systematic Debugging Framework for Web Applications

This framework provides a comprehensive, systematic approach to debugging web applications, specifically designed for deploying debugging agents and conducting thorough bug investigations.

## Table of Contents

1. [Overview](#overview)
2. [Debugging Philosophy](#debugging-philosophy)
3. [Pre-Investigation Setup](#pre-investigation-setup)
4. [Systematic Bug Investigation Process](#systematic-bug-investigation-process)
5. [Root Cause Analysis Framework](#root-cause-analysis-framework)
6. [Agent Deployment Templates](#agent-deployment-templates)
7. [Debugging Tools and Techniques](#debugging-tools-and-techniques)
8. [Common Bug Categories](#common-bug-categories)
9. [Prevention and Continuous Improvement](#prevention-and-continuous-improvement)
10. [Documentation Templates](#documentation-templates)

## Overview

This framework is based on 2025 best practices for systematic debugging, emphasizing root cause analysis over symptom treatment, and providing structured approaches for both human debuggers and automated debugging agents.

### Key Principles

- **Understand First, Fix Second**: Focus on root causes rather than symptoms
- **Systematic Over Random**: Follow structured processes rather than ad-hoc debugging
- **Document Everything**: Maintain detailed records of findings and processes
- **Prevent Future Occurrences**: Learn from bugs to improve overall system quality

## Debugging Philosophy

### The Cost of Poor Debugging

- Developers spend 50% of their time debugging with random approaches
- Defects found in testing are 15x more costly than those found in design
- 90% of app users abandon applications due to poor performance
- Random debugging wastes significant development time and resources

### Modern Debugging Approach

1. **Systematic Investigation**: Follow structured methodologies
2. **Data-Driven Analysis**: Use logs, metrics, and observability tools
3. **Cross-Functional Collaboration**: Involve relevant stakeholders
4. **Continuous Learning**: Apply lessons learned to prevent future issues

## Pre-Investigation Setup

### Environment Preparation Checklist

- [ ] **Access Verification**
  - [ ] Development environment access
  - [ ] Staging environment access
  - [ ] Production logs access (if applicable)
  - [ ] Database access (read-only for production)
  - [ ] Monitoring dashboards access

- [ ] **Tool Setup**
  - [ ] Browser DevTools configured
  - [ ] React DevTools extension installed
  - [ ] React Scan for performance debugging
  - [ ] Network monitoring tools ready
  - [ ] Console logging framework established

- [ ] **Documentation Ready**
  - [ ] Bug report template prepared
  - [ ] Investigation log template ready
  - [ ] Code change tracking system accessible
  - [ ] Team communication channels established

### Initial Data Collection

Before starting investigation, gather:

1. **Bug Manifestation Data**
   - Exact error messages
   - Screenshots/screen recordings
   - Browser/device information
   - Steps to reproduce
   - Frequency of occurrence

2. **System State Information**
   - Recent deployments
   - Configuration changes
   - Environment variables
   - Database migration status
   - External service status

3. **User Context**
   - User roles/permissions
   - Authentication state
   - Session information
   - User journey/flow

## Systematic Bug Investigation Process

### Phase 1: Problem Definition and Scope

#### Step 1: Define the Problem
```
WHAT exactly is happening?
- Specific error messages
- Unexpected behavior description
- Impact on user experience
- Affected functionality

WHEN does it happen?
- Specific conditions
- Time patterns
- User actions that trigger it
- Environmental factors

WHERE does it happen?
- Specific components/pages
- Browser/device combinations
- Environment (dev/staging/prod)
- Geographic or network conditions

WHO is affected?
- All users or specific groups
- Permission levels
- Device/browser combinations
- Network conditions
```

#### Step 2: Scope Assessment
- [ ] Determine severity (Critical/High/Medium/Low)
- [ ] Identify affected user base percentage
- [ ] Assess business impact
- [ ] Set investigation timeline
- [ ] Assign resources and roles

### Phase 2: Reproduction and Isolation

#### Step 3: Reproduce the Bug
- [ ] Follow exact reproduction steps
- [ ] Test in different environments
- [ ] Vary conditions systematically
- [ ] Document what consistently reproduces the bug
- [ ] Note any conditions where bug doesn't occur

#### Step 4: Isolate the Problem
- [ ] Use binary search to narrow down affected code
- [ ] Comment out suspicious code sections
- [ ] Test with minimal reproduction case
- [ ] Identify exact triggering conditions
- [ ] Rule out environmental factors

### Phase 3: Investigation and Analysis

#### Step 5: Gather Diagnostic Information

**Console Logs Analysis**
```javascript
// Strategic logging for debugging
console.group('🔍 Bug Investigation: [Component Name]');
console.log('Input Parameters:', JSON.stringify(params, null, 2));
console.log('Current State:', JSON.stringify(state, null, 2));
console.log('Environment:', process.env.NODE_ENV);
console.log('Timestamp:', new Date().toISOString());
console.groupEnd();
```

**Network Analysis**
- [ ] Check Network tab for failed requests
- [ ] Analyze response codes and timing
- [ ] Verify request payloads
- [ ] Check for CORS issues
- [ ] Monitor WebSocket connections

**React-Specific Investigation**
- [ ] Use React DevTools to inspect component tree
- [ ] Check component state and props
- [ ] Identify unnecessary re-renders
- [ ] Verify hook dependencies
- [ ] Check for memory leaks

#### Step 6: Code Analysis
- [ ] Review recent commits using `git log --oneline -10`
- [ ] Check file history: `git log --follow -- path/to/file`
- [ ] Use `git bisect` to find problematic commits
- [ ] Analyze code complexity and dependencies
- [ ] Review related test cases

### Phase 4: Root Cause Analysis

#### Step 7: Apply RCA Techniques

**5 Whys Method**
```
Problem: User login fails with 500 error

Why 1: Why does login fail?
Answer: Server returns 500 error

Why 2: Why does server return 500 error?
Answer: Database query fails

Why 3: Why does database query fail?
Answer: Connection timeout occurs

Why 4: Why does connection timeout occur?
Answer: Database connection pool exhausted

Why 5: Why is connection pool exhausted?
Answer: Connections not properly released after use

ROOT CAUSE: Connection leak in authentication middleware
```

**Fishbone Diagram Categories**
- **Code Issues**: Logic errors, syntax issues, algorithm problems
- **Environment**: Configuration, dependencies, infrastructure
- **Process**: Development workflow, testing gaps, deployment issues
- **People**: Communication gaps, knowledge gaps, training needs
- **Tools**: Inadequate debugging tools, monitoring gaps

#### Step 8: Hypothesis Formation and Testing
- [ ] Form specific hypotheses about root cause
- [ ] Design tests to validate/invalidate hypotheses
- [ ] Test hypotheses systematically
- [ ] Document results for each test
- [ ] Refine hypotheses based on results

## Root Cause Analysis Framework

### Common Root Cause Categories

1. **Requirements Issues**
   - Incomplete specifications
   - Misunderstood requirements
   - Changing requirements
   - Missing edge cases

2. **Design Problems**
   - Architecture limitations
   - Poor component design
   - Inadequate error handling
   - Performance bottlenecks

3. **Implementation Defects**
   - Logic errors
   - Syntax mistakes
   - API misuse
   - Race conditions

4. **Environment Issues**
   - Configuration problems
   - Dependency conflicts
   - Infrastructure limitations
   - External service failures

5. **Process Failures**
   - Inadequate testing
   - Poor code review
   - Deployment errors
   - Communication gaps

### RCA Documentation Template

```markdown
## Root Cause Analysis Report

**Bug ID**: [Unique identifier]
**Date**: [Investigation date]
**Investigator**: [Name/team]

### Problem Summary
[Brief description of the issue]

### Investigation Timeline
- **Reported**: [Date/time]
- **Investigation Started**: [Date/time]
- **Root Cause Identified**: [Date/time]
- **Resolution Implemented**: [Date/time]

### Root Cause
[Detailed explanation of the underlying cause]

### Contributing Factors
- [Factor 1]
- [Factor 2]
- [Factor 3]

### Evidence
- [Log entries]
- [Code analysis]
- [Test results]
- [Screenshots]

### Fix Description
[What was changed to resolve the issue]

### Prevention Actions
- [Process improvements]
- [Code improvements]
- [Tool improvements]
- [Training needs]

### Lessons Learned
[Key takeaways for future development]
```

## Agent Deployment Templates

### Debugging Agent Prompt Template

```markdown
You are a systematic debugging agent tasked with investigating a web application bug. Follow this structured approach:

## Context
- Application: [Application name and description]
- Technology Stack: [React, Next.js, etc.]
- Environment: [Development/Staging/Production]
- Bug Report: [Detailed bug description]

## Your Systematic Investigation Process

### Phase 1: Initial Assessment
1. Analyze the bug report for:
   - Exact symptoms
   - Reproduction steps
   - Environment details
   - User impact

### Phase 2: Data Collection
1. Request and analyze:
   - Console logs
   - Network logs
   - Error stack traces
   - Recent code changes
   - Configuration changes

### Phase 3: Hypothesis Formation
1. Based on collected data, form hypotheses about:
   - Potential root causes
   - Contributing factors
   - Related components

### Phase 4: Systematic Testing
1. Design tests to validate/invalidate each hypothesis
2. Execute tests in logical order
3. Document results

### Phase 5: Root Cause Analysis
1. Apply the 5 Whys technique
2. Consider all contributing factors
3. Identify the fundamental cause

### Phase 6: Solution Design
1. Propose specific fixes
2. Consider impact and risks
3. Suggest prevention measures

## Required Outputs
- Detailed investigation log
- Root cause analysis
- Proposed solution
- Prevention recommendations

Begin your investigation now.
```

### Bug Investigation Checklist Agent

```markdown
You are a debugging checklist agent. Use this comprehensive checklist to ensure thorough investigation:

## Pre-Investigation Setup
- [ ] Environment access verified
- [ ] Debugging tools configured
- [ ] Documentation templates ready
- [ ] Team stakeholders identified

## Problem Definition
- [ ] Bug symptoms clearly documented
- [ ] Reproduction steps verified
- [ ] Impact assessment completed
- [ ] Severity level assigned

## Data Collection
- [ ] Console logs captured
- [ ] Network activity analyzed
- [ ] Error messages documented
- [ ] Stack traces obtained
- [ ] Recent changes reviewed

## Component Analysis
- [ ] React components inspected
- [ ] State management reviewed
- [ ] Props flow analyzed
- [ ] Hook dependencies checked
- [ ] Event handlers examined

## System Analysis
- [ ] API endpoints tested
- [ ] Database queries verified
- [ ] Authentication flow checked
- [ ] Authorization logic reviewed
- [ ] External services status confirmed

## Root Cause Analysis
- [ ] 5 Whys technique applied
- [ ] Contributing factors identified
- [ ] Timeline of events established
- [ ] System interactions mapped

## Solution Development
- [ ] Fix strategy designed
- [ ] Impact assessment completed
- [ ] Testing plan created
- [ ] Rollback plan prepared

## Documentation
- [ ] Investigation log completed
- [ ] Root cause documented
- [ ] Solution documented
- [ ] Prevention measures identified

Ensure each item is thoroughly addressed before proceeding to the next phase.
```

## Debugging Tools and Techniques

### React/Next.js Specific Tools

#### React DevTools Usage
```javascript
// Enable debugging features
if (process.env.NODE_ENV === 'development') {
  window.React = React; // Enable React DevTools
}

// Component debugging helper
const useDebugValue = (value, formatter) => {
  React.useDebugValue(value, formatter);
};

// Example usage in custom hook
function useCustomHook(value) {
  useDebugValue(value, val => `Value: ${val}`);
  // hook logic
}
```

#### React Scan Integration
```bash
# Install React Scan for performance debugging
npm install react-scan

# Use CLI for quick analysis
npx react-scan@latest http://localhost:3000
```

#### Next.js Debugging Configuration
```javascript
// next.config.js
module.exports = {
  experimental: {
    // Enable source maps in production for debugging
    productionBrowserSourceMaps: true,
  },
  // Enable debugging output
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.devtool = 'eval-source-map';
    }
    return config;
  },
};
```

### Console Logging Strategy

#### Structured Logging Template
```javascript
class DebugLogger {
  static levels = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
  };

  static log(level, component, message, data = {}) {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      const logData = {
        timestamp,
        level,
        component,
        message,
        ...data
      };
      
      console.group(`🔍 ${level}: ${component}`);
      console.log('Message:', message);
      console.log('Data:', JSON.stringify(logData, null, 2));
      console.log('Stack:', new Error().stack);
      console.groupEnd();
    }
  }

  static error(component, message, data) {
    this.log('ERROR', component, message, data);
  }

  static warn(component, message, data) {
    this.log('WARN', component, message, data);
  }

  static info(component, message, data) {
    this.log('INFO', component, message, data);
  }

  static debug(component, message, data) {
    this.log('DEBUG', component, message, data);
  }
}

// Usage examples
DebugLogger.error('UserLogin', 'Authentication failed', { 
  userId, 
  timestamp: Date.now(),
  errorCode: 'AUTH_FAILED'
});

DebugLogger.debug('Calculator', 'State updated', { 
  previousState, 
  newState, 
  action 
});
```

### Performance Debugging

#### Memory Leak Detection
```javascript
// Memory usage monitoring
const monitorMemory = () => {
  if (performance.memory) {
    console.table({
      'Used JS Heap Size': `${(performance.memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
      'Total JS Heap Size': `${(performance.memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
      'JS Heap Size Limit': `${(performance.memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
    });
  }
};

// Check for memory leaks periodically
setInterval(monitorMemory, 10000);
```

#### React Performance Profiling
```javascript
// Wrap components for performance monitoring
import { Profiler } from 'react';

function onRenderCallback(id, phase, actualDuration, baseDuration, startTime, commitTime) {
  console.log('Performance Profile:', {
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime
  });
}

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <Router>
        <Routes>
          {/* your routes */}
        </Routes>
      </Router>
    </Profiler>
  );
}
```

## Common Bug Categories

### 1. Hydration Issues

**Symptoms**:
- Mismatched server/client rendering
- Console warnings about hydration
- Unexpected UI flashing

**Investigation Approach**:
```javascript
// Debug hydration mismatches
useEffect(() => {
  console.log('Client-side render detected');
}, []);

// Check for browser-only code in SSR
const [isClient, setIsClient] = useState(false);
useEffect(() => {
  setIsClient(true);
}, []);

if (!isClient) {
  return <div>Loading...</div>; // Prevent hydration mismatches
}
```

### 2. State Management Issues

**Symptoms**:
- Stale state values
- Unexpected re-renders
- State not updating

**Investigation Approach**:
```javascript
// Debug state updates with useEffect
useEffect(() => {
  console.log('State updated:', { oldState: prevState, newState: currentState });
}, [currentState]);

// Check for closure issues
const debugRef = useRef();
debugRef.current = { state, props };

// Verify state updates in callbacks
const handleClick = useCallback(() => {
  console.log('Click handler state:', debugRef.current);
  updateState(newValue);
}, [updateState]);
```

### 3. API Integration Problems

**Symptoms**:
- Failed network requests
- Unexpected response formats
- Authentication errors

**Investigation Approach**:
```javascript
// Comprehensive API debugging
const apiDebugger = {
  async request(url, options = {}) {
    console.group(`🌐 API Request: ${url}`);
    console.log('Options:', options);
    console.log('Headers:', options.headers);
    
    const startTime = performance.now();
    
    try {
      const response = await fetch(url, options);
      const endTime = performance.now();
      
      console.log('Response Status:', response.status);
      console.log('Response Headers:', Object.fromEntries(response.headers));
      console.log('Duration:', `${(endTime - startTime).toFixed(2)}ms`);
      
      const data = await response.json();
      console.log('Response Data:', data);
      console.groupEnd();
      
      return { success: true, data, response };
    } catch (error) {
      const endTime = performance.now();
      console.error('Request Failed:', error);
      console.log('Duration:', `${(endTime - startTime).toFixed(2)}ms`);
      console.groupEnd();
      
      return { success: false, error };
    }
  }
};
```

### 4. Performance Bottlenecks

**Investigation Tools**:
```javascript
// Performance monitoring utilities
const PerformanceMonitor = {
  measureRender: (componentName, renderFn) => {
    const start = performance.now();
    const result = renderFn();
    const end = performance.now();
    
    if (end - start > 16) { // Slower than 60fps
      console.warn(`Slow render detected in ${componentName}: ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  },

  measureAsync: async (operationName, asyncFn) => {
    const start = performance.now();
    const result = await asyncFn();
    const end = performance.now();
    
    console.log(`${operationName} completed in ${(end - start).toFixed(2)}ms`);
    return result;
  }
};
```

## Prevention and Continuous Improvement

### Code Quality Measures

#### ESLint Configuration for Bug Prevention
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:react-hooks/recommended'
  ],
  rules: {
    // Prevent common React bugs
    'react-hooks/exhaustive-deps': 'error',
    'react/no-array-index-key': 'error',
    'react/no-direct-mutation-state': 'error',
    
    // Prevent JavaScript bugs
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-unused-vars': 'error',
    'prefer-const': 'error',
    
    // TypeScript specific
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'error'
  }
};
```

#### Type Safety with TypeScript
```typescript
// Strict type definitions to prevent bugs
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// Use discriminated unions for better error handling
type LoadingState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: any }
  | { status: 'error'; error: string };

// Ensure exhaustive case handling
function handleLoadingState(state: LoadingState) {
  switch (state.status) {
    case 'idle':
      return 'Ready to load';
    case 'loading':
      return 'Loading...';
    case 'success':
      return `Loaded: ${state.data}`;
    case 'error':
      return `Error: ${state.error}`;
    default:
      // TypeScript will catch missing cases
      const exhaustiveCheck: never = state;
      return exhaustiveCheck;
  }
}
```

### Testing Strategy

#### Unit Tests for Bug Prevention
```javascript
// Example test for common bug scenarios
describe('UserLogin Component', () => {
  it('should handle authentication errors gracefully', async () => {
    // Mock API failure
    const mockApi = jest.fn().mockRejectedValue(new Error('Auth failed'));
    
    render(<UserLogin api={mockApi} />);
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
    });
  });

  it('should prevent multiple simultaneous login attempts', async () => {
    const mockApi = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 1000))
    );
    
    render(<UserLogin api={mockApi} />);
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    // Rapid clicks
    fireEvent.click(loginButton);
    fireEvent.click(loginButton);
    fireEvent.click(loginButton);
    
    // Should only call API once
    expect(mockApi).toHaveBeenCalledTimes(1);
  });
});
```

### Monitoring and Alerting

#### Error Boundary Implementation
```typescript
// Production-ready error boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ComponentType<ErrorInfo> },
  { hasError: boolean; error?: Error; errorInfo?: ErrorInfo }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to monitoring service
    console.error('Error Boundary caught an error:', { error, errorInfo });
    
    // Report to error tracking service
    if (typeof window !== 'undefined') {
      // Send to monitoring service (Sentry, LogRocket, etc.)
      this.reportError(error, errorInfo);
    }
  }

  private reportError(error: Error, errorInfo: ErrorInfo) {
    // Implement error reporting logic
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // Send to monitoring service
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorReport)
    });
  }

  render() {
    if (this.state.hasError) {
      return <this.props.fallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

## Documentation Templates

### Bug Report Template

```markdown
# Bug Report

**Bug ID**: [AUTO-GENERATED]
**Date Reported**: [DATE]
**Reporter**: [NAME]
**Severity**: [Critical/High/Medium/Low]

## Summary
[Brief description of the bug]

## Environment
- **Browser**: [Chrome 91.0, Firefox 89.0, etc.]
- **Device**: [Desktop/Mobile/Tablet]
- **Operating System**: [Windows 10, macOS Big Sur, etc.]
- **Screen Resolution**: [1920x1080, etc.]
- **Environment**: [Development/Staging/Production]

## Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Screenshots/Videos
[Attach relevant media]

## Console Logs
```
[Paste relevant console output]
```

## Additional Information
- **Frequency**: [Always/Sometimes/Rarely]
- **User Impact**: [Number/percentage of affected users]
- **Workaround Available**: [Yes/No - describe if yes]
- **Related Issues**: [Links to related bugs]

## Technical Details
- **Component**: [Affected component/page]
- **API Endpoint**: [If API-related]
- **Database Queries**: [If data-related]
- **Third-party Services**: [If external service-related]
```

### Investigation Log Template

```markdown
# Bug Investigation Log

**Bug ID**: [REFERENCE]
**Investigator**: [NAME]
**Investigation Date**: [DATE]
**Status**: [In Progress/Completed/Blocked]

## Investigation Timeline

### [TIME] - Initial Assessment
- [Finding 1]
- [Finding 2]
- [Next steps]

### [TIME] - Data Collection
- [Data collected]
- [Tools used]
- [Key observations]

### [TIME] - Hypothesis Formation
- **Hypothesis 1**: [Description]
  - Evidence: [Supporting evidence]
  - Test: [How to validate]
  
- **Hypothesis 2**: [Description]
  - Evidence: [Supporting evidence]
  - Test: [How to validate]

### [TIME] - Testing Results
- **Hypothesis 1**: [Confirmed/Rejected]
  - Evidence: [Test results]
  
- **Hypothesis 2**: [Confirmed/Rejected]
  - Evidence: [Test results]

## Root Cause Analysis

### Primary Cause
[Detailed explanation of the root cause]

### Contributing Factors
1. [Factor 1]
2. [Factor 2]
3. [Factor 3]

### 5 Whys Analysis
1. **Why did [initial problem] occur?**
   Answer: [Answer 1]

2. **Why did [answer 1] happen?**
   Answer: [Answer 2]

3. **Why did [answer 2] happen?**
   Answer: [Answer 3]

4. **Why did [answer 3] happen?**
   Answer: [Answer 4]

5. **Why did [answer 4] happen?**
   Answer: [Root cause]

## Resolution Plan

### Immediate Fix
- [What will be changed]
- [Timeline]
- [Risk assessment]

### Testing Plan
- [How the fix will be tested]
- [Regression testing scope]
- [Acceptance criteria]

### Prevention Measures
- [Process improvements]
- [Code improvements]
- [Monitoring improvements]

## Lessons Learned
- [Key insight 1]
- [Key insight 2]
- [Key insight 3]

## Follow-up Actions
- [ ] [Action 1] - [Owner] - [Due date]
- [ ] [Action 2] - [Owner] - [Due date]
- [ ] [Action 3] - [Owner] - [Due date]
```

## Conclusion

This systematic debugging framework provides a comprehensive approach to investigating and resolving bugs in web applications. By following these structured methodologies, teams can:

- Reduce debugging time by 50% through systematic approaches
- Identify root causes rather than just symptoms
- Prevent similar bugs through improved processes
- Maintain comprehensive documentation for future reference
- Deploy debugging agents with consistent, effective prompts

Remember: **The goal is not just to fix the current bug, but to understand why it occurred and prevent similar issues in the future.**

---

*This framework should be regularly updated based on new tools, techniques, and lessons learned from debugging experiences.*