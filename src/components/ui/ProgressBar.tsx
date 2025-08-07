interface ProgressBarProps {
  current: number;
  max: number;
  className?: string;
  showPercentage?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'indigo';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function ProgressBar({ 
  current, 
  max, 
  className = '',
  showPercentage = false,
  color = 'blue',
  size = 'md',
  animated = false
}: ProgressBarProps) {
  const percentage = Math.min((current / max) * 100, 100);
  
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600', 
    yellow: 'bg-yellow-500',
    red: 'bg-red-600',
    indigo: 'bg-indigo-600'
  };

  const bgColorClasses = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    yellow: 'bg-yellow-100', 
    red: 'bg-red-100',
    indigo: 'bg-indigo-100'
  };

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  return (
    <div className={`w-full ${className}`}>
      <div className={`relative ${sizeClasses[size]} ${bgColorClasses[color]} rounded-full overflow-hidden`}>
        <div 
          className={`
            absolute top-0 left-0 h-full ${colorClasses[color]} rounded-full
            ${animated ? 'transition-all duration-500 ease-out' : ''}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <div className="mt-1 text-sm text-gray-600 text-right">
          {percentage.toFixed(1)}%
        </div>
      )}
    </div>
  );
}