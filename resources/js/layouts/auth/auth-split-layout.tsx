import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    const { name, quote } = usePage<SharedData>().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            {/* Left side - Brand & Decorative Section with Orange Theme */}
            <div className="relative hidden h-full flex-col bg-gradient-to-br from-orange-600 via-orange-500 to-orange-400 p-10 text-white lg:flex dark:border-r">
                {/* Decorative Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]" />
                </div>

                {/* Logo & Branding */}
                <Link
                    href={home()}
                    className="relative z-20 flex items-center text-lg font-semibold transition-transform hover:scale-105"
                >
                    <div className="mr-3 flex size-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                        <AppLogoIcon className="size-6 fill-current text-white" />
                    </div>
                    <span className="text-xl">{name}</span>
                </Link>

                {/* Features Section */}
                <div className="relative z-20 mt-auto space-y-8">
                    {quote ? (
                        <blockquote className="space-y-3 rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
                            <p className="text-lg leading-relaxed">
                                &ldquo;{quote.message}&rdquo;
                            </p>
                            <footer className="text-sm font-medium text-orange-100">
                                {quote.author}
                            </footer>
                        </blockquote>
                    ) : (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-semibold">
                                Welcome to Our Store
                            </h2>
                            <p className="text-lg text-orange-100">
                                Discover amazing products and enjoy a seamless
                                shopping experience.
                            </p>
                            <div className="space-y-3 pt-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-8 items-center justify-center rounded-full bg-white/20">
                                        <svg
                                            className="size-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-orange-50">
                                        Secure Shopping Experience
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex size-8 items-center justify-center rounded-full bg-white/20">
                                        <svg
                                            className="size-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-orange-50">
                                        Fast & Free Delivery
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex size-8 items-center justify-center rounded-full bg-white/20">
                                        <svg
                                            className="size-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-orange-50">
                                        24/7 Customer Support
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right side - Form Section */}
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[420px]">
                    {/* Mobile Logo */}
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center gap-2 lg:hidden"
                    >
                        <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                            <AppLogoIcon className="size-7 fill-current text-primary" />
                        </div>
                        <span className="text-xl font-semibold text-primary">
                            {name}
                        </span>
                    </Link>

                    {/* Form Header */}
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {title}
                        </h1>
                        <p className="text-balance text-sm text-muted-foreground">
                            {description}
                        </p>
                    </div>

                    {/* Form Content */}
                    {children}
                </div>
            </div>
        </div>
    );
}
