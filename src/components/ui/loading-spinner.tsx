
import { type LucideProps, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  icon?: React.ReactElement<LucideProps>;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

export default function LoadingSpinner({
  message = "Memuat...",
  icon,
  className,
  iconClassName, // This is for overriding/adding to default icon classes from this component
  textClassName,
}: LoadingSpinnerProps) {
  const defaultIconClasses = "h-12 w-12 animate-pulse text-primary mb-4";
  
  const displayIcon = icon 
    ? React.cloneElement(icon, { 
        className: cn(defaultIconClasses, icon.props.className, iconClassName) 
      }) 
    : <Sparkles className={cn(defaultIconClasses, iconClassName)} />;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center min-h-[calc(100vh-200px)] p-4",
        className
      )}
    >
      {displayIcon}
      {message && (
        <p className={cn("text-xl font-medium text-muted-foreground", textClassName)}>
          {message}
        </p>
      )}
    </div>
  );
}

