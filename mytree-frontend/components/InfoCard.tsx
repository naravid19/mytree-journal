import React from 'react';

interface InfoCardProps {
  /** Title of the card */
  title: string;
  /** Icon component to display */
  icon: React.ReactNode;
  /** Gradient classes for icon background */
  iconGradient: string;
  /** Card content */
  children: React.ReactNode;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * InfoCard - Reusable card component for displaying tree information
 * Uses clay-card-sm styling with gradient icon header
 */
export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  icon,
  iconGradient,
  children,
  className = '',
}) => {
  return (
    <div className={`clay-card-sm p-6 ${className}`}>
      <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${iconGradient}`}
          aria-hidden="true"
        >
          {icon}
        </div>
        {title}
      </h3>
      {children}
    </div>
  );
};

interface InfoListItemProps {
  /** Label text */
  label: string;
  /** Value to display */
  value: React.ReactNode;
  /** Whether to show bottom border */
  showBorder?: boolean;
  /** Optional custom value styling */
  valueClassName?: string;
}

/**
 * InfoListItem - Reusable list item for InfoCard content
 */
export const InfoListItem: React.FC<InfoListItemProps> = ({
  label,
  value,
  showBorder = true,
  valueClassName = 'font-medium text-slate-800 dark:text-slate-200',
}) => {
  return (
    <li
      className={`flex justify-between ${
        showBorder ? 'border-b border-gray-100 dark:border-gray-700 pb-2' : ''
      }`}
    >
      <span className="text-text-muted">{label}</span>
      <span className={valueClassName}>{value || '-'}</span>
    </li>
  );
};

export default InfoCard;
