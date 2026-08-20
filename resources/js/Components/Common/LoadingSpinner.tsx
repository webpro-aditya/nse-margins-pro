import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

/**
 * Animated loading spinner using Lucide's Loader2 icon.
 */
export function LoadingSpinner({ className, size = 'md' }: LoadingSpinnerProps) {
    const sizes = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-8 w-8',
    };

    return (
        <Loader2
            className={cn('animate-spin text-muted-foreground', sizes[size], className)}
        />
    );
}
