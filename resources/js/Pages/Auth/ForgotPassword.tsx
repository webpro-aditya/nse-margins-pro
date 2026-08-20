import { type FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { TextInput } from '@/Components/Forms/TextInput';
import { LoadingSpinner } from '@/Components/Common/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import { ROUTES } from '@/Constants/routes';
import type { PageProps } from '@/types';

interface ForgotPasswordProps extends PageProps {
    status?: string;
}

function ForgotPassword({ status }: ForgotPasswordProps) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(ROUTES.FORGOT_PASSWORD);
    };

    return (
        <>
            <Head title="Forgot Password" />

            <Card>
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-semibold tracking-tight">
                        Forgot password?
                    </CardTitle>
                    <CardDescription>
                        Enter your email address and we&apos;ll send you a link to reset
                        your password.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {status && (
                        <div className="mb-4 rounded-md bg-success/10 border border-success/20 px-4 py-3 text-sm text-success">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <TextInput
                            label="Email"
                            name="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            error={errors.email}
                            placeholder="name@company.com"
                            autoComplete="email"
                            autoFocus
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
                                    Sending...
                                </>
                            ) : (
                                'Send reset link'
                            )}
                        </Button>

                        <div className="flex justify-center">
                            <Link
                                href={ROUTES.LOGIN}
                                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                Back to sign in
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </>
    );
}

ForgotPassword.layout = (page: React.ReactNode) => <GuestLayout>{page}</GuestLayout>;

export default ForgotPassword;
