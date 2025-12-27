'use client';
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn
        fallbackRedirectUrl="/"
        signUpUrl="/sign-up"
        appearance={{
          elements: {
            formButtonPrimary:
              'bg-[#6c47ff] hover:bg-[#5a3dd9] text-white',
            footerActionLink: 'text-[#6c47ff] hover:text-[#5a3dd9]',
          },
        }}
      />
    </div>
  );
}
