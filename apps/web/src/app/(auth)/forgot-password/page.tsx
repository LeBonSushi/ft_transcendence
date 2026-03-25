"use client";

import { useState } from "react";
import { AuthLayout } from "@/components/ui/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_ROUTES } from "@travel-planner/shared";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                `/api/account/forgot-password`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                }
            );

            if (!response.ok) {
                setError("An error has occurred");
                return;
            }

            setSuccess(true);
        } catch {
            setError("An error has occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            backgroundImage="/images/auth-bg.jpg"
            tagline="Explore the world"
            title={
                <>
                Welcome to <span className="text-primary">Travel Planner</span>
                </>
            }
            description="Plan your trips, share your experiences and discover new destinations with our community"
            mobileTitle="Password forgotten"
            mobileSubtitle="Recovery options"
            desktopTitle="Forgot your password?"
            desktopSubtitle="Here are your recovery options"
            footerText="Back to "
            footerLinkText="Sign in"
            footerLinkHref="/signin"
        >
            {success ? (
                <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                    If this email is registered, you will receive a reset link shortly.
                </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {error}
                    </div>
                )}
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input
                    id="email"
                    type="email"
                    placeholder="johndoe@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending..." : "Send reset link"}
                </Button>
                </form>
            )}
        </AuthLayout>
    );
}