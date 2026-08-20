/**
 * Global type declarations for the NSE Margins Pro application.
 *
 * These types represent the core domain models shared between
 * the backend (via Inertia props) and the frontend.
 */

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    status: UserStatus;
    last_login_at: string | null;
    last_login_ip: string | null;
    created_at: string;
    updated_at: string;
}

export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface FlashMessages {
    success: string | null;
    error: string | null;
}

export interface SharedProps {
    auth: {
        user: User | null;
    };
    flash: FlashMessages;
}

/**
 * Inertia page props always include shared props.
 * Page-specific props extend this.
 */
export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> =
    SharedProps & T;
