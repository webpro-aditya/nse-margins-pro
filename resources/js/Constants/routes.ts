/**
 * Route name constants to avoid magic strings throughout the frontend.
 * Mirror the named routes defined in routes/web.php.
 */
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    LOGOUT: '/logout',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    CHANGE_PASSWORD: '/change-password',
    DASHBOARD: '/dashboard',
    CM_MARGIN: '/cm-margin',
} as const;

export type RouteName = (typeof ROUTES)[keyof typeof ROUTES];
