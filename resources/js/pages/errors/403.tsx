import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { ShieldX, Home, ArrowLeft } from 'lucide-react';

interface Error403Props {
    message?: string;
}

export default function Error403({ message }: Error403Props) {
    return (
        <>
            <Head title="403 - Forbidden" />
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-destructive/10">
                            <ShieldX className="size-10 text-destructive" />
                        </div>
                        <CardTitle className="text-3xl font-bold">Access Denied</CardTitle>
                        <CardDescription className="text-base">
                            {message || 'You do not have permission to access this resource.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
                            <p className="mb-2 font-medium">Why am I seeing this?</p>
                            <p>
                                Your account doesn't have the required permissions to view this page. Please
                                contact your administrator if you believe this is an error.
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => window.history.back()}
                            >
                                <ArrowLeft className="mr-2 size-4" />
                                Go Back
                            </Button>
                            <Link href="/" className="flex-1">
                                <Button className="w-full">
                                    <Home className="mr-2 size-4" />
                                    Home
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
