'use client';
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp
        fallbackRedirectUrl="/"
        signInUrl="/sign-in"
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
