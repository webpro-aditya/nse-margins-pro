import { type FormEventHandler } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { PasswordInput } from '@/Components/Forms/PasswordInput';
import { LoadingSpinner } from '@/Components/Common/LoadingSpinner';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type { PageProps } from '@/types';

function ChangePassword(_props: PageProps) {
    const { data, setData, put, processing, errors, reset, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put('/change-password', {
            onSuccess: () => reset(),
        });
    };

    return (
        <>
            <Head title="Change Password" />

            <div className="max-w-lg">
                <Card>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-xl font-semibold tracking-tight">
                            Change password
                        </CardTitle>
                        <CardDescription>
                            Ensure your account is using a strong, unique password.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {recentlySuccessful && (
                            <div className="mb-4 rounded-md bg-success/10 border border-success/20 px-4 py-3 text-sm text-success">
                                Password updated successfully.
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            <PasswordInput
                                label="Current Password"
                                name="current_password"
                                value={data.current_password}
                                onChange={(e) => setData('current_password', e.target.value)}
                                error={errors.current_password}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                autoFocus
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
                                required
                            />

                            <PasswordInput
                                label="Confirm New Password"
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
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <LoadingSpinner size="sm" className="text-primary-foreground" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update password'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ChangePassword.layout = (page: React.ReactNode) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;

export default ChangePassword;
