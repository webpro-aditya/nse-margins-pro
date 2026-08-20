import * as React from 'react';

import { cn } from '@/lib/utils';

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
    message?: string;
}

/**
 * Displays a form validation error message.
 * Renders nothing if no message is provided.
 */
const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
    ({ className, message, ...props }, ref) => {
        if (!message) {
            return null;
        }

        return (
            <p
                ref={ref}
                className={cn('text-[0.8rem] font-medium text-destructive', className)}
                {...props}
            >
                {message}
            </p>
        );
    },
);
FormMessage.displayName = 'FormMessage';

export { FormMessage };
