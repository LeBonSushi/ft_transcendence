"use client";

import { AuthLayout } from "@/components/ui/auth/auth-layout";

export default function ForgotPasswordPage() {
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
            <div className="space-y-4 text-center">
                <p className="test-sm text-muted-doreground">
                    If you created your account with email and password, please contact an administrator to reset your password.
                </p>
                <p className="text-sem text-muted-doreground">
                    If you signed up with Google or GitHub, use the same provider to sign in — no password needed.
                </p>
            </div>
        </AuthLayout>
    );
}