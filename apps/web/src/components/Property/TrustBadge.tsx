import { ShieldCheck, ShieldAlert, ShieldQuestion, ShieldX } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getTrustLevel, getTrustLabel } from '@metriva/shared';

interface TrustBadgeProps {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ICONS = {
  high: ShieldCheck,
  medium: ShieldQuestion,
  low: ShieldAlert,
  critical: ShieldX,
};

const STYLES = {
  high: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400',
  medium: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400',
  low: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400',
  critical: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400',
};

const SIZES = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-2.5 py-1 gap-1.5',
  lg: 'text-base px-3 py-1.5 gap-2',
};

export function TrustBadge({ score, showLabel = true, size = 'md', className }: TrustBadgeProps) {
  const level = getTrustLevel(score);
  const Icon = ICONS[level];
  const label = getTrustLabel(score);

  return (
    <div
      className={cn(
        'inline-flex items-center border rounded-full font-medium',
        STYLES[level],
        SIZES[size],
        className,
      )}
      title={`Trust Score: ${Math.round(score)}/100`}
    >
      <Icon className={cn('shrink-0', size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4')} />
      {showLabel && <span>{label}</span>}
      <span className="font-bold">{Math.round(score)}</span>
    </div>
  );
}

export function TrustScoreBar({ score }: { score: number }) {
  const level = getTrustLevel(score);
  const colors = {
    high: 'bg-green-500',
    medium: 'bg-yellow-500',
    low: 'bg-orange-500',
    critical: 'bg-red-500',
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Trust Score</span>
        <span className="font-semibold">{Math.round(score)}/100</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', colors[level])}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
