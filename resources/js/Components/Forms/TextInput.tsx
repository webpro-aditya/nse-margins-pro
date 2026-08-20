import * as React from 'react';

import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { FormMessage } from '@/Components/Forms/FormMessage';
import { cn } from '@/lib/utils';

interface TextInputProps extends React.ComponentProps<'input'> {
    label: string;
    error?: string;
    /** HTML id — also used for label's htmlFor. Defaults to name prop. */
    inputId?: string;
}

/**
 * Reusable text input with integrated label and error message.
 * Wraps shadcn Input + Label + FormMessage into a single component.
 *
 * @example
 * <TextInput
 *     label="Email Address"
 *     name="email"
 *     type="email"
 *     value={data.email}
 *     onChange={(e) => setData('email', e.target.value)}
 *     error={errors.email}
 * />
 */
const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
    ({ label, error, inputId, name, className, ...props }, ref) => {
        const id = inputId ?? name ?? '';

        return (
            <div className="space-y-2">
                <Label
                    htmlFor={id}
                    className={cn(error && 'text-destructive')}
                >
                    {label}
                </Label>
                <Input
                    ref={ref}
                    id={id}
                    name={name}
                    className={cn(
                        error && 'border-destructive focus-visible:ring-destructive',
                        className,
                    )}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${id}-error` : undefined}
                    {...props}
                />
                <FormMessage message={error} id={`${id}-error`} />
            </div>
        );
    },
);
TextInput.displayName = 'TextInput';

export { TextInput };
