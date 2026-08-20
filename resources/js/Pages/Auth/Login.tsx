import { type FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Checkbox } from '@/Components/ui/checkbox';
import { Label } from '@/Components/ui/label';
import { TextInput } from '@/Components/Forms/TextInput';
import { PasswordInput } from '@/Components/Forms/PasswordInput';
import { LoadingSpinner } from '@/Components/Common/LoadingSpinner';
import GuestLayout from '@/Layouts/GuestLayout';
import { ROUTES } from '@/Constants/routes';
import type { PageProps } from '@/types';

interface LoginProps extends PageProps {
    status?: string;
}

function Login({ status }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(ROUTES.LOGIN, {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Sign In" />

            <Card>
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-semibold tracking-tight">
                        Sign in
                    </CardTitle>
                    <CardDescription>
                        Enter your credentials to access your account
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {/* Status message (e.g., from password reset) */}
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

                        <PasswordInput
                            label="Password"
                            name="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            error={errors.password}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            required
                        />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="remember"
                                    checked={data.remember}
                                    onCheckedChange={(checked) =>
                                        setData('remember', checked === true)
                                    }
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-sm font-normal text-muted-foreground cursor-pointer"
                                >
                                    Remember me
                                </Label>
                            </div>

                            <Link
                                href={ROUTES.FORGOT_PASSWORD}
                                className="text-sm text-primary hover:text-primary/80 transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <LoadingSpinner size="sm" className="text-primary-foreground" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign in'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </>
    );
}

Login.layout = (page: React.ReactNode) => <GuestLayout>{page}</GuestLayout>;

export default Login;
