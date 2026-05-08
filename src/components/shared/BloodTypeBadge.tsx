'use client';

import { cn } from '@/lib/utils';

interface BloodTypeBadgeProps {
  bloodType?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const bgColors: Record<string, string> = {
  'A+': 'bg-red-100 text-red-700 border-red-200',
  'A-': 'bg-orange-100 text-orange-700 border-orange-200',
  'B+': 'bg-amber-100 text-amber-700 border-amber-200',
  'B-': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'AB+': 'bg-pink-100 text-pink-700 border-pink-200',
  'AB-': 'bg-rose-100 text-rose-700 border-rose-200',
  'O+': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'O-': 'bg-teal-100 text-teal-700 border-teal-200',
};

export default function BloodTypeBadge({ bloodType, size = 'md', className }: BloodTypeBadgeProps) {
  if (!bloodType) return null;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-bold rounded-md border',
        sizeClasses[size],
        bgColors[bloodType] || 'bg-gray-100 text-gray-700 border-gray-200',
        className
      )}
    >
      {bloodType}
    </span>
  );
}
