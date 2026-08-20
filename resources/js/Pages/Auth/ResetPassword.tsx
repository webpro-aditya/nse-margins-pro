import { type FormEventHandler } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { TextInput } from '@/Components/Forms/TextInput';
import { PasswordInput } from '@/Components/Forms/PasswordInput';
import { LoadingSpinner } from '@/Components/Common/LoadingSpinner';
import GuestLayout from '@/Layouts/GuestLayout';
import { ROUTES } from '@/Constants/routes';
import type { PageProps } from '@/types';

interface ResetPasswordProps extends PageProps {
    email: string;
    token: string;
}

function ResetPassword({ email, token }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(ROUTES.RESET_PASSWORD, {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Reset Password" />

            <Card>
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-semibold tracking-tight">
                        Reset password
                    </CardTitle>
                    <CardDescription>
                        Enter your new password below.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={submit} className="space-y-4">
                        <TextInput
                            label="Email"
                            name="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            error={errors.email}
                            autoComplete="email"
                            required
                        />

                        <PasswordInput
                            label="New Password"
                            name="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            error={errors.password}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            autoFocus
                            required
                        />

                        <PasswordInput
                            label="Confirm Password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            error={errors.password_confirmation}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            required
                        />

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <LoadingSpinner size="sm" className="text-primary-foreground" />
                                    Resetting...
                                </>
                            ) : (
                                'Reset password'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </>
    );
}

ResetPassword.layout = (page: React.ReactNode) => <GuestLayout>{page}</GuestLayout>;

export default ResetPassword;
