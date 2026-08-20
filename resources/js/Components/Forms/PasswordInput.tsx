import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { FormMessage } from '@/Components/Forms/FormMessage';
import { cn } from '@/lib/utils';

interface PasswordInputProps extends Omit<React.ComponentProps<'input'>, 'type'> {
    label: string;
    error?: string;
    inputId?: string;
}

/**
 * Password input with visibility toggle button.
 * Wraps shadcn Input + Label + FormMessage with an eye/eye-off toggle.
 *
 * The toggle button uses type="button" to prevent form submission
 * and aria-label for screen readers.
 */
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ label, error, inputId, name, className, ...props }, ref) => {
        const [showPassword, setShowPassword] = React.useState(false);
        const id = inputId ?? name ?? '';

        return (
            <div className="space-y-2">
                <Label
                    htmlFor={id}
                    className={cn(error && 'text-destructive')}
                >
                    {label}
                </Label>
                <div className="relative">
                    <Input
                        ref={ref}
                        id={id}
                        name={name}
                        type={showPassword ? 'text' : 'password'}
                        className={cn(
                            'pr-10',
                            error && 'border-destructive focus-visible:ring-destructive',
                            className,
                        )}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${id}-error` : undefined}
                        {...props}
                    />
                    <button
                        type="button"
                        className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>
                <FormMessage message={error} id={`${id}-error`} />
            </div>
        );
    },
);
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
