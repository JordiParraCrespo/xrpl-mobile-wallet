import { createFileRoute, Link } from '@tanstack/react-router';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Button,
    Input,
    Field,
    FieldGroup,
    FieldLabel,
} from '@flama/design-system-web';
import { useState } from 'react';

export const Route = createFileRoute('/_auth/forgot-password')({
    component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
    const [submitted, setSubmitted] = useState(false);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        // TODO: wire up forgot password mutation
        setSubmitted(true);
    }

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Forgot password</CardTitle>
                    <CardDescription>
                        Enter your email and we&apos;ll send you a reset link
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {submitted ? (
                        <div className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
                            If an account exists with that email, you will receive a reset link shortly.
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="email">Email</FieldLabel>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        required
                                    />
                                </Field>
                                <Field>
                                    <Button type="submit">Send reset link</Button>
                                </Field>
                            </FieldGroup>
                        </form>
                    )}
                </CardContent>
            </Card>
            <div className="text-center text-sm">
                <Link to="/login" className="underline underline-offset-4 hover:text-primary">
                    Back to sign in
                </Link>
            </div>
        </div>
    );
}
