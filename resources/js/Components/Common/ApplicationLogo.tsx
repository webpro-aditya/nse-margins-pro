import { cn } from '@/lib/utils';

interface ApplicationLogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

/**
 * Application logo/branding component.
 * Renders the app name with a styled icon mark.
 * Replace the SVG with your actual logo when available.
 */
export function ApplicationLogo({ className, size = 'md' }: ApplicationLogoProps) {
    const sizes = {
        sm: { icon: 'h-6 w-6', text: 'text-base' },
        md: { icon: 'h-8 w-8', text: 'text-xl' },
        lg: { icon: 'h-10 w-10', text: 'text-2xl' },
    };

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <div
                className={cn(
                    'rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center',
                    sizes[size].icon,
                )}
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4 text-primary"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M3 3v18h18" />
                    <path d="M7 16l4-8 4 4 4-12" />
                </svg>
            </div>
            <span
                className={cn(
                    'font-semibold tracking-tight text-foreground',
                    sizes[size].text,
                )}
            >
                NSE Margins
            </span>
        </div>
    );
}
