import React from 'react';
import NotFound from '@/Pages/Errors/NotFound';

interface ErrorProps {
    status?: number;
    message?: string;
}

export default function Error({ status = 404, message }: ErrorProps) {
    return <NotFound status={status} message={message} />;
}
