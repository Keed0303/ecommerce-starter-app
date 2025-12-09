import { useState, useEffect } from 'react';
import { login } from '@/routes';
import { store } from '@/routes/register';
import { Form, Head } from '@inertiajs/react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import AuthLayout from '@/layouts/auth-layout';
import { Eye, EyeOff, Check, X, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrength {
    score: number;
    label: string;
    color: string;
}

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
        score: 0,
        label: '',
        color: '',
    });
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const requirements = [
        {
            id: 'length',
            label: 'At least 8 characters',
            test: (pwd: string) => pwd.length >= 8,
        },
        {
            id: 'uppercase',
            label: 'One uppercase letter',
            test: (pwd: string) => /[A-Z]/.test(pwd),
        },
        {
            id: 'lowercase',
            label: 'One lowercase letter',
            test: (pwd: string) => /[a-z]/.test(pwd),
        },
        {
            id: 'number',
            label: 'One number',
            test: (pwd: string) => /\d/.test(pwd),
        },
    ];

    useEffect(() => {
        if (!password) {
            setPasswordStrength({ score: 0, label: '', color: '' });
            return;
        }

        const metRequirements = requirements.filter((req) =>
            req.test(password),
        ).length;
        const score = (metRequirements / requirements.length) * 100;

        let label = '';
        let color = '';

        if (score <= 25) {
            label = 'Weak';
            color = 'bg-red-500';
        } else if (score <= 50) {
            label = 'Fair';
            color = 'bg-orange-500';
        } else if (score <= 75) {
            label = 'Good';
            color = 'bg-yellow-500';
        } else {
            label = 'Strong';
            color = 'bg-green-500';
        }

        setPasswordStrength({ score, label, color });
    }, [password]);

    return (
        <AuthLayout
            title="Create your account"
            description="Join us today and start shopping!"
        >
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        {/* Social Registration Buttons */}
                        <div className="grid gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                disabled={processing}
                            >
                                <svg
                                    className="mr-2 size-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Continue with Google
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                disabled={processing}
                            >
                                <svg
                                    className="mr-2 size-4"
                                    viewBox="0 0 24 24"
                                    fill="#1877F2"
                                >
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                Continue with Facebook
                            </Button>
                        </div>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <Separator />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    or
                                </span>
                            </div>
                        </div>

                        {/* Registration Form */}
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Enter your full name"
                                    className="h-11"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                    className="h-11"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        tabIndex={3}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="Create a password"
                                        className="h-11 pr-10"
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        aria-label={
                                            showPassword
                                                ? 'Hide password'
                                                : 'Show password'
                                        }
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="size-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="size-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>

                                {/* Password Strength Indicator */}
                                {password && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className={cn(
                                                        'h-full transition-all duration-300',
                                                        passwordStrength.color,
                                                    )}
                                                    style={{
                                                        width: `${passwordStrength.score}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium text-muted-foreground">
                                                {passwordStrength.label}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Password Requirements */}
                                {password && (
                                    <div className="rounded-lg border bg-muted/50 p-3">
                                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                                            Password must contain:
                                        </p>
                                        <ul className="space-y-1.5">
                                            {requirements.map((req) => {
                                                const isMet = req.test(password);
                                                return (
                                                    <li
                                                        key={req.id}
                                                        className="flex items-center gap-2 text-xs"
                                                    >
                                                        {isMet ? (
                                                            <Check className="size-3.5 text-green-600" />
                                                        ) : (
                                                            <X className="size-3.5 text-muted-foreground/50" />
                                                        )}
                                                        <span
                                                            className={cn(
                                                                isMet
                                                                    ? 'text-foreground'
                                                                    : 'text-muted-foreground',
                                                            )}
                                                        >
                                                            {req.label}
                                                        </span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password_confirmation"
                                        type={
                                            showConfirmPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="Confirm your password"
                                        className="h-11 pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword,
                                            )
                                        }
                                        aria-label={
                                            showConfirmPassword
                                                ? 'Hide password'
                                                : 'Show password'
                                        }
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="size-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="size-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            {/* Terms & Conditions */}
                            <div className="space-y-2">
                                <div className="flex items-start space-x-2">
                                    <Checkbox
                                        id="terms"
                                        name="terms"
                                        tabIndex={5}
                                        checked={acceptedTerms}
                                        onCheckedChange={(checked) =>
                                            setAcceptedTerms(!!checked)
                                        }
                                        required
                                    />
                                    <Label
                                        htmlFor="terms"
                                        className="text-sm font-normal leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        I agree to the{' '}
                                        <a
                                            href="#"
                                            className="font-medium text-primary hover:underline"
                                        >
                                            Terms & Conditions
                                        </a>{' '}
                                        and{' '}
                                        <a
                                            href="#"
                                            className="font-medium text-primary hover:underline"
                                        >
                                            Privacy Policy
                                        </a>
                                    </Label>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 h-11 w-full"
                                tabIndex={6}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                {processing
                                    ? 'Creating account...'
                                    : 'Create account'}
                            </Button>

                            {/* Email Verification Notice */}
                            <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
                                <Info className="mt-0.5 size-4 shrink-0" />
                                <p className="text-xs">
                                    You'll receive a verification email after
                                    registration
                                </p>
                            </div>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <TextLink
                                href={login()}
                                tabIndex={7}
                                className="font-medium text-primary hover:text-primary/80"
                            >
                                Sign in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
