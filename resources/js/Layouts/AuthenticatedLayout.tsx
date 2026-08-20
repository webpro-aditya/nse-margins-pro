import { type PropsWithChildren } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { LogOut, User as UserIcon } from 'lucide-react';
import { Toaster } from '@/Components/ui/sonner';
import { ApplicationLogo } from '@/Components/Common/ApplicationLogo';
import { Button } from '@/Components/ui/button';
import { ModeToggle } from '@/Components/ui/mode-toggle';
import { useFlashMessages } from '@/Hooks/useFlashMessages';
import { ROUTES } from '@/Constants/routes';
import type { SharedProps } from '@/types';

/**
 * Layout for authenticated pages.
 *
 * Provides a minimal top navigation bar with user info and logout button.
 * This is a scaffold — future modules will extend this with a sidebar,
 * breadcrumbs, notifications, etc.
 */
export default function AuthenticatedLayout({ children }: PropsWithChildren) {
    useFlashMessages();
    const { auth } = usePage<SharedProps>().props;

    const handleLogout = () => {
        router.post(ROUTES.LOGOUT);
    };

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            {/* Top navigation */}
            <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
                <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link href={ROUTES.DASHBOARD} className="transition-opacity hover:opacity-80">
                        <ApplicationLogo size="sm" />
                    </Link>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground mr-2">
                            <UserIcon className="h-4 w-4" />
                            <span>{auth.user?.name}</span>
                        </div>

                        <ModeToggle />

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {children}
            </main>

            <Toaster position="top-right" />
        </div>
    );
}
