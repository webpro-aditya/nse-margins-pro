import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

import { ThemeProvider } from '@/Components/ThemeProvider';

const appName = import.meta.env.VITE_APP_NAME || 'NSE Margins Pro';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ) as Promise<any>,
    setup({ el, App, props }) {
        if (el) {
            const root = createRoot(el);
            root.render(
                <ThemeProvider defaultTheme="dark" storageKey="app-theme">
                    <App {...props} />
                </ThemeProvider>
            );
        }
    },
    progress: {
        color: '#3b82f6',
    },
});
