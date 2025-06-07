
import { cn } from '@/lib/utils';

type TrustLevelBadgeProps = {
  level: 1 | 2 | 3 | 4 | 5;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const trustLevelLabels = {
  1: 'Basic',
  2: 'Standard',
  3: 'Trusted',
  4: 'Premium', 
  5: 'Elite'
};

const trustLevelClasses = {
  1: 'bg-gray-100 text-gray-800',
  2: 'bg-blue-100 text-blue-800',
  3: 'bg-green-100 text-green-800',
  4: 'bg-purple-100 text-purple-800',
  5: 'bg-amber-100 text-amber-800'
};

const TrustLevelBadge = ({ level, size = 'md', className }: TrustLevelBadgeProps) => {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };
  
  return (
    <span 
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        sizeClasses[size],
        trustLevelClasses[level],
        className
      )}
    >
      {trustLevelLabels[level]}
    </span>
  );
};

export default TrustLevelBadge;
