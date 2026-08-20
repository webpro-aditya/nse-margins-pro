import { Page } from '@inertiajs/core';
import { PageProps as DefaultPageProps } from './index';

declare module '@inertiajs/core' {
    interface PageProps extends DefaultPageProps {}
}

declare module '@inertiajs/react' {
    export function usePage<T extends PageProps = PageProps>(): Page<T>;
}
