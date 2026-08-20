import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import type { FlashMessages } from '@/types';

/**
 * Hook that listens for flash messages from Laravel and displays them as toasts.
 * Should be called once in the root layout.
 *
 * Flash messages are set in controllers via:
 *   return redirect()->with('success', 'Message here');
 *   return redirect()->with('error', 'Error message');
 */
export function useFlashMessages() {
    const { flash } = usePage<{ flash: FlashMessages }>().props;

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash.success, flash.error]);
}
