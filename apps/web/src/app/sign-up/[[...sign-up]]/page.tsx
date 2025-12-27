'use client';
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp
        fallbackRedirectUrl="/"
        signInUrl="/sign-in"
        appearance={{
          variables: {
            colorPrimary: '#6c47ff',
            colorText: '#1f2937',
            colorBackground: '#ffffff',
            colorInputBackground: '#ffffff',
            colorInputText: '#1f2937',
          },
          elements: {
            formButtonPrimary: {
              backgroundColor: '#6c47ff',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: '#5a3dd9',
              },
            },
            footerActionLink: {
              color: '#6c47ff',
              '&:hover': {
                color: '#5a3dd9',
              },
            },
          },
        }}
      />
    </div>
  );
}
