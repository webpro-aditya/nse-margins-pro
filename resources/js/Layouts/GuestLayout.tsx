import { type PropsWithChildren } from 'react';
import { Toaster } from '@/Components/ui/sonner';
import { ApplicationLogo } from '@/Components/Common/ApplicationLogo';
import { useFlashMessages } from '@/Hooks/useFlashMessages';

import { ModeToggle } from '@/Components/ui/mode-toggle';

/**
 * Layout for guest (unauthenticated) pages: Login, Forgot Password, Reset Password.
 *
 * Renders a full-screen centered layout with subtle background pattern,
 * the application logo, and a content area for auth forms.
 *
 * Uses Inertia persistent layouts to avoid re-mounting on page transitions
 * between auth pages.
 */
export default function GuestLayout({ children }: PropsWithChildren) {
    useFlashMessages();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden bg-background text-foreground transition-colors duration-300">
            {/* Theme Toggle */}
            <div className="absolute top-4 right-4 z-50">
                <ModeToggle />
            </div>

            {/* Subtle background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 pointer-events-none" />

            {/* Subtle grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '64px 64px',
                }}
            />

            {/* Content */}
            <div className="relative z-10 w-full max-w-[420px] animate-fade-in">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <ApplicationLogo size="lg" />
                </div>

                {/* Form card */}
                {children}
            </div>

            {/* Footer */}
            <p className="relative z-10 mt-8 text-xs text-muted-foreground">
                © {new Date().getFullYear()} NSE Margins Pro. All rights reserved.
            </p>

            <Toaster position="top-right" />
        </div>
    );
}
