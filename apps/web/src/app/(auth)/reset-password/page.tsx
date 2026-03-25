"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/ui/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_ROUTES } from "@travel-planner/shared";

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] =  useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 8) {
            setError("The password should contains at least 8 caracteres");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `/api/account/reset-password`,
                {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
                }
            );

            if (!response.ok) {
                setError("Invalid or expired reset link");
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
            desktopTitle="Reset your password"
            desktopSubtitle="Choose a new password"
            mobileTitle="Reset password"
            mobileSubtitle="Choose a new password"
            footerText="Back to "
            footerLinkText="Sign in"
            footerLinkHref="/signin"
        >
            {success ? (
                <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                    Your password has been reset successfully. You can now sign in.
                </p>
                </div>
            ) : !token ? (
                <div className="text-center">
                <p className="text-sm text-destructive">
                    Invalid reset link. Please request a new one.
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
                    <label htmlFor="password" className="text-sm font-medium">New password</label>
                    <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm password</label>
                    <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Resetting..." : "Reset password"}
                </Button>
                </form>
            )}
        </AuthLayout>
    );
}